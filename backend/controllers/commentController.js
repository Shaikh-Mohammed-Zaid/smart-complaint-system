const Comment = require('../models/Comment');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityLogger');

const addComment = async (req, res) => {
  const { complaintId } = req.params;
  const { comment } = req.body;
  const io = req.app.get('io');

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const isAdmin = req.user.role === 'admin';

  const newComment = await Comment.create({
    complaintId,
    userId: req.user.id,
    comment,
    isAdminComment: isAdmin
  });

  const populatedComment = await Comment.findById(newComment._id).populate('userId', 'name avatar role');

  await logActivity(req.user.id, 'comment_added', 'comment', newComment._id, { complaintId });

  // Notify Complaint owner if someone else commented
  if (complaint.createdBy.toString() !== req.user.id) {
    await Notification.create({
      userId: complaint.createdBy,
      type: 'new_comment',
      title: 'New Comment',
      message: `${req.user.name} commented on your complaint.`,
      complaintId
    });
    io.to(`user_${complaint.createdBy}`).emit('notification');
  }

  // Real-time emit to anyone looking at this complaint
  io.to(`complaint_${complaintId}`).emit('new_comment', populatedComment);

  res.status(201).json({ success: true, data: populatedComment });
};

const getComments = async (req, res) => {
  const { complaintId } = req.params;
  const comments = await Comment.find({ complaintId })
    .populate('userId', 'name role avatar')
    .sort({ createdAt: 1 });

  res.status(200).json({ success: true, count: comments.length, data: comments });
};

const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  // Admin or Owner
  if (comment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
  }

  await comment.deleteOne();
  await logActivity(req.user.id, 'comment_deleted', 'comment', comment._id);

  res.status(200).json({ success: true, data: {} });
};

module.exports = {
  addComment,
  getComments,
  deleteComment
};
