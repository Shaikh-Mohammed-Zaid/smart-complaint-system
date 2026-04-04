const path = require('path');
const fs = require('fs');
const supabase = require('../config/supabase');
const { logActivity } = require('../utils/activityLogger');

const extractTags = (text) => {
  if (!text) return [];
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const filtered = words.filter(w => w.length > 4);
  return [...new Set(filtered)].slice(0, 5);
};

// Helper to map Supabase snake_case to Mongoose camelCase expected by frontend
const mapComplaint = (c) => {
  if (!c) return null;
  const mapped = {
    ...c,
    _id: c.id,
    imageUrl: c.image_url,
    suggestedPriority: c.suggested_priority,
    trendingScore: c.trending_score,
    viewCount: c.view_count,
    assignedTo: c.assigned_to,
    resolvedAt: c.resolved_at,
    adminNote: c.admin_note,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    createdBy: c.profiles ? {
      _id: c.created_by,
      ...c.profiles,
      rollNumber: c.profiles.roll_number
    } : c.created_by
  };
  delete mapped.profiles; // cleanup the nested profile object
  return mapped;
};

exports.getComplaintFeed = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('complaints')
    .select('*, profiles:created_by(name, department, avatar)', { count: 'exact' })
    .neq('status', 'Rejected')
    .order('trending_score', { ascending: false })
    .range(from, to);

  if (req.query.category) query = query.eq('category', req.query.category);

  const { data: complaints, count } = await query;

  const { data: userVotes } = await supabase.from('votes').select('complaint_id').eq('user_id', req.user.id);
  const votedIds = new Set((userVotes || []).map(v => v.complaint_id));

  const data = (complaints || []).map(c => ({ ...mapComplaint(c), hasVoted: votedIds.has(c.id) }));
  res.status(200).json({ success: true, count: data.length, total: count, pages: Math.ceil(count / limit), page, data });
};

exports.getComplaintTrending = async (req, res) => {
  const { data: complaints } = await supabase
    .from('complaints')
    .select('*, profiles:created_by(name)')
    .neq('status', 'Rejected')
    .order('trending_score', { ascending: false })
    .limit(5);

  const { data: userVotes } = await supabase.from('votes').select('complaint_id').eq('user_id', req.user.id);
  const votedIds = new Set((userVotes || []).map(v => v.complaint_id));

  const data = (complaints || []).map((c, i) => ({ ...mapComplaint(c), rank: i + 1, hasVoted: votedIds.has(c.id) }));
  res.status(200).json({ success: true, data });
};

exports.getComplaints = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('complaints')
    .select('*, profiles:created_by(name, department, email, roll_number)', { count: 'exact' })
    .range(from, to);

  if (req.user.role === 'student') query = query.eq('created_by', req.user.id);
  if (req.query.status) query = query.eq('status', req.query.status);
  if (req.query.priority) query = query.eq('priority', req.query.priority);
  if (req.query.category) query = query.eq('category', req.query.category);
  if (req.query.search) query = query.or(`title.ilike.%${req.query.search}%,location.ilike.%${req.query.search}%`);

  const sortField = req.query.sort === 'votes' ? 'votes' : req.query.sort === 'priority' ? 'priority' : 'created_at';
  query = query.order(sortField, { ascending: false });

  const { data: complaints, count } = await query;

  const { data: userVotes } = await supabase.from('votes').select('complaint_id').eq('user_id', req.user.id);
  const votedIds = new Set((userVotes || []).map(v => v.complaint_id));

  const data = (complaints || []).map(c => ({ ...mapComplaint(c), hasVoted: votedIds.has(c.id) }));
  res.status(200).json({ success: true, count: data.length, total: count, pages: Math.ceil(count / limit), page, data });
};

exports.createComplaint = async (req, res) => {
  const { title, description, category, location } = req.body;
  const io = req.app.get('io');

  let suggestedPriority = 'Medium';
  if (category === 'WiFi / Network Issues') {
    suggestedPriority = 'High';
  } else {
    const { data: similar } = await supabase.from('complaints').select('votes').eq('category', category).eq('status', 'Pending');
    if (similar && similar.some(s => s.votes > 10)) suggestedPriority = 'Critical';
  }

  const tags = extractTags(`${title} ${description}`);
  let imageUrl = '';
  if (req.file) imageUrl = `/uploads/${req.file.filename}`;

  const { data: complaint, error } = await supabase
    .from('complaints')
    .insert([{
      title, description, category, location,
      image_url: imageUrl,
      created_by: req.user.id,
      suggested_priority: suggestedPriority,
      tags
    }])
    .select('*, profiles:created_by(name, department, email, roll_number)')
    .single();

  if (error) return res.status(500).json({ success: false, message: error.message });

  await logActivity(req.user.id, 'complaint_created', 'complaint', complaint.id, { title });
  const mapped = mapComplaint(complaint);
  io.to('admin_room').emit('new_complaint', mapped);

  res.status(201).json({ success: true, data: mapped });
};

exports.getComplaint = async (req, res) => {
  const { data: complaint, error } = await supabase
    .from('complaints')
    .select('*, profiles:created_by(name, department, email, roll_number, avatar)')
    .eq('id', req.params.id)
    .single();

  if (error || !complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  if (req.user.role === 'student' && complaint.created_by !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Increment view count
  await supabase.from('complaints').update({ view_count: (complaint.view_count || 0) + 1 }).eq('id', complaint.id);

  const { data: vote } = await supabase.from('votes').select('id').eq('user_id', req.user.id).eq('complaint_id', complaint.id).single();

  res.status(200).json({ success: true, data: { ...mapComplaint(complaint), hasVoted: !!vote } });
};

exports.updateComplaint = async (req, res) => {
  const io = req.app.get('io');

  const { data: complaint } = await supabase.from('complaints').select('*').eq('id', req.params.id).single();
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  const oldStatus = complaint.status;
  const updates = {};
  if (req.body.status) updates.status = req.body.status;
  if (req.body.priority) updates.priority = req.body.priority;
  if (req.body.adminNote) updates.admin_note = req.body.adminNote;
  if (req.body.assignedTo) updates.assigned_to = req.body.assignedTo;
  if (updates.status === 'Resolved' && !complaint.resolved_at) updates.resolved_at = new Date().toISOString();
  updates.updated_at = new Date().toISOString();

  const { data: updated } = await supabase.from('complaints').update(updates).eq('id', complaint.id).select('*, profiles:created_by(name, department, email, roll_number)').single();

  if (oldStatus !== updated.status) {
    await logActivity(req.user.id, 'status_updated', 'complaint', complaint.id, { from: oldStatus, to: updated.status });
    await supabase.from('notifications').insert([{
      user_id: complaint.created_by,
      type: 'status_update',
      title: 'Status Updated',
      message: `Your complaint "${complaint.title}" is now ${updated.status}.`,
      complaint_id: complaint.id
    }]);
    io.to(`user_${complaint.created_by}`).emit('notification');
  }

  const mappedUpdate = mapComplaint(updated);
  io.to(`complaint_${complaint.id}`).emit('complaint_updated', mappedUpdate);
  io.to(`user_${complaint.created_by}`).emit('complaint_updated', mappedUpdate);
  res.status(200).json({ success: true, data: mappedUpdate });
};

exports.deleteComplaint = async (req, res) => {
  const { data: complaint } = await supabase.from('complaints').select('*').eq('id', req.params.id).single();
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  if (req.user.role === 'student') {
    if (complaint.created_by !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (complaint.status !== 'Pending') return res.status(400).json({ success: false, message: 'Can only delete Pending complaints' });
  }

  if (complaint.image_url) {
    const filename = complaint.image_url.split('/uploads/')[1];
    if (filename) {
      const fp = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
  }

  await supabase.from('votes').delete().eq('complaint_id', complaint.id);
  await supabase.from('complaints').delete().eq('id', complaint.id);
  await logActivity(req.user.id, 'complaint_deleted', 'complaint', complaint.id);

  res.status(200).json({ success: true, data: {} });
};
