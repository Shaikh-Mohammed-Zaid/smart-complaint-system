const supabase = require('../config/supabase');
const { logActivity } = require('../utils/activityLogger');

const addComment = async (req, res) => {
  const { complaintId } = req.params;
  const { comment } = req.body;
  const io = req.app.get('io');

  const { data: complaint } = await supabase.from('complaints').select('id, created_by, title').eq('id', complaintId).single();
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  const isAdmin = req.user.role === 'admin';

  const { data: newComment, error } = await supabase
    .from('comments')
    .insert([{ complaint_id: complaintId, user_id: req.user.id, comment, is_admin_comment: isAdmin }])
    .select('*, profiles:user_id(name, avatar, role)')
    .single();

  if (error) return res.status(500).json({ success: false, message: error.message });

  await logActivity(req.user.id, 'comment_added', 'comment', newComment.id, { complaintId });

  if (complaint.created_by !== req.user.id) {
    await supabase.from('notifications').insert([{
      user_id: complaint.created_by,
      type: 'new_comment',
      title: 'New Comment',
      message: `${req.user.name} commented on your complaint.`,
      complaint_id: complaintId
    }]);
    io.to(`user_${complaint.created_by}`).emit('notification');
  }

  io.to(`complaint_${complaintId}`).emit('new_comment', newComment);
  res.status(201).json({ success: true, data: newComment });
};

const getComments = async (req, res) => {
  const { complaintId } = req.params;
  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles:user_id(name, role, avatar)')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });

  res.status(200).json({ success: true, count: (comments || []).length, data: comments || [] });
};

const deleteComment = async (req, res) => {
  const { data: comment } = await supabase.from('comments').select('*').eq('id', req.params.id).single();
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

  if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
  }

  await supabase.from('comments').delete().eq('id', req.params.id);
  await logActivity(req.user.id, 'comment_deleted', 'comment', comment.id);
  res.status(200).json({ success: true, data: {} });
};

module.exports = { addComment, getComments, deleteComment };
