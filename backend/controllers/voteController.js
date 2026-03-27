const supabase = require('../config/supabase');
const { logActivity } = require('../utils/activityLogger');

const toggleVote = async (req, res) => {
  const { complaintId } = req.params;
  const userId = req.user.id;
  const io = req.app.get('io');

  const { data: complaint } = await supabase.from('complaints').select('*').eq('id', complaintId).single();
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  if (complaint.created_by === userId) {
    return res.status(400).json({ success: false, message: 'Cannot vote for your own complaint' });
  }

  const { data: existingVote } = await supabase.from('votes').select('id').eq('user_id', userId).eq('complaint_id', complaintId).single();

  let votesChange = 0;
  let hasVoted = false;

  if (existingVote) {
    await supabase.from('votes').delete().eq('id', existingVote.id);
    votesChange = -1;
    await logActivity(userId, 'vote_removed', 'vote', complaintId);
  } else {
    await supabase.from('votes').insert([{ user_id: userId, complaint_id: complaintId }]);
    votesChange = 1;
    hasVoted = true;
    await logActivity(userId, 'vote_added', 'vote', complaintId);
  }

  const newVotes = (complaint.votes || 0) + votesChange;
  const hoursOld = (Date.now() - new Date(complaint.created_at).getTime()) / (1000 * 60 * 60);
  const timeFactor = 1 / Math.pow(Math.max(0, hoursOld) + 2, 1.5);
  const trendingScore = Math.max(0, newVotes * timeFactor);

  await supabase.from('complaints').update({ votes: newVotes, trending_score: trendingScore }).eq('id', complaintId);

  const milestones = [10, 25, 50, 100];
  if (milestones.includes(newVotes) && votesChange > 0 && complaint.created_by !== userId) {
    await supabase.from('notifications').insert([{
      user_id: complaint.created_by,
      type: 'vote_milestone',
      title: 'Popular Complaint!',
      message: `Your complaint "${complaint.title}" just reached ${newVotes} votes.`,
      complaint_id: complaintId
    }]);
    io.to(`user_${complaint.created_by}`).emit('notification');
  }

  io.emit('vote_update', { complaintId, votes: newVotes, hasVoted });
  res.status(200).json({ success: true, votes: newVotes, hasVoted });
};

const getVoteStatus = async (req, res) => {
  const { complaintId } = req.params;
  const { data: complaint } = await supabase.from('complaints').select('votes').eq('id', complaintId).single();
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  const { data: vote } = await supabase.from('votes').select('id').eq('user_id', req.user.id).eq('complaint_id', complaintId).single();
  res.status(200).json({ success: true, votes: complaint.votes, hasVoted: !!vote });
};

module.exports = { toggleVote, getVoteStatus };
