const Vote = require('../models/Vote');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityLogger');

const toggleVote = async (req, res) => {
  const { complaintId } = req.params;
  const userId = req.user.id;
  const io = req.app.get('io');

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  if (complaint.createdBy.toString() === userId) {
    return res.status(400).json({ success: false, message: 'Cannot vote for your own complaint' });
  }

  // Find existing vote
  const existingVote = await Vote.findOne({ userId, complaintId });

  let votesChange = 0;
  let hasVoted = false;

  if (existingVote) {
    await Vote.findByIdAndDelete(existingVote._id);
    votesChange = -1;
    await logActivity(userId, 'vote_removed', 'vote', complaintId);
  } else {
    await Vote.create({ userId, complaintId });
    votesChange = 1;
    hasVoted = true;
    await logActivity(userId, 'vote_added', 'vote', complaintId);
  }

  // Atomic update for complaint votes
  const updatedComplaint = await Complaint.findByIdAndUpdate(
    complaintId,
    { $inc: { votes: votesChange } },
    { new: true }
  );

  // Recalculate trendingScore: votes * (1 / (hoursOld + 2)^1.5)
  const hoursOld = (Date.now() - updatedComplaint.createdAt.getTime()) / (1000 * 60 * 60);
  const timeFactor = 1 / Math.pow(Math.max(0, hoursOld) + 2, 1.5);
  updatedComplaint.trendingScore = Math.max(0, updatedComplaint.votes * timeFactor);
  await updatedComplaint.save();

  // Threshold notifications
  const milestones = [10, 25, 50, 100];
  if (milestones.includes(updatedComplaint.votes) && votesChange > 0) {
    // Notify complaint owner
    if (updatedComplaint.createdBy.toString() !== userId) {
      await Notification.create({
        userId: updatedComplaint.createdBy,
        type: 'vote_milestone',
        title: 'Popular Complaint!',
        message: `Your complaint "${updatedComplaint.title}" just reached ${updatedComplaint.votes} votes.`,
        complaintId: updatedComplaint._id
      });
      // Ping the user
      io.to(`user_${updatedComplaint.createdBy}`).emit('notification');
    }
  }

  // Real-time vote update event
  io.emit('vote_update', {
    complaintId,
    votes: updatedComplaint.votes,
    hasVoted
  });

  res.status(200).json({
    success: true,
    votes: updatedComplaint.votes,
    hasVoted
  });
};

const getVoteStatus = async (req, res) => {
  const { complaintId } = req.params;
  
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  const vote = await Vote.findOne({ userId: req.user.id, complaintId });

  res.status(200).json({
    success: true,
    votes: complaint.votes,
    hasVoted: !!vote
  });
};

module.exports = { toggleVote, getVoteStatus };
