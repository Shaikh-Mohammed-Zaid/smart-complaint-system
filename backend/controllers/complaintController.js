const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const Vote = require('../models/Vote');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');
const supabase = require('../config/supabase');

const extractTags = (text) => {
  if (!text) return [];
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  const filtered = words.filter(w => w.length > 4);
  return [...new Set(filtered)].slice(0, 5);
};

exports.getComplaintFeed = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = { status: { $ne: 'Rejected' } };
  
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Recalculate trending offline in bulk or on fetch is expensive at scale,
  // but for the spec we'll fetch then sort or simply rely on the background calculated fields
  // "Recalculate trendingScore on fetch: votes * (1 / (hoursOld + 2)^1.5)"
  const complaints = await Complaint.find(query);
  
  // Recalculate dynamically
  for (let c of complaints) {
    const hoursOld = (Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60);
    const timeFactor = 1 / Math.pow(Math.max(0, hoursOld) + 2, 1.5);
    c.trendingScore = Math.max(0, c.votes * timeFactor);
    await c.save({ validateBeforeSave: false }); // Save the new score quietly
  }

  const sortedComplaints = await Complaint.find(query)
    .populate('createdBy', 'name department avatar')
    .sort({ trendingScore: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Complaint.countDocuments(query);
  
  // Attach hasVoted 
  const userVotes = await Vote.find({ userId: req.user.id });
  const votedIds = new Set(userVotes.map(v => v.complaintId.toString()));

  const data = sortedComplaints.map(c => ({
    ...c.toJSON(),
    hasVoted: votedIds.has(c._id.toString())
  }));

  res.status(200).json({ success: true, count: data.length, total, pages: Math.ceil(total/limit), page, data });
};

exports.getComplaintTrending = async (req, res) => {
  const complaints = await Complaint.find({ status: { $ne: 'Rejected' } })
    .populate('createdBy', 'name')
    .sort({ trendingScore: -1 })
    .limit(5);

  const userVotes = await Vote.find({ userId: req.user.id });
  const votedIds = new Set(userVotes.map(v => v.complaintId.toString()));

  const data = complaints.map((c, i) => ({
    ...c.toJSON(),
    rank: i + 1,
    hasVoted: votedIds.has(c._id.toString())
  }));

  res.status(200).json({ success: true, data });
};

exports.getComplaints = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  
  // Filters
  if (req.user.role === 'student') query.createdBy = req.user.id;
  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.category) query.category = req.query.category;
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { location: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const sortValue = req.query.sort === 'votes' ? { votes: -1 } : 
                    req.query.sort === 'priority' ? { priority: -1 } : 
                    { createdAt: -1 };

  const complaints = await Complaint.find(query)
    .populate('createdBy', 'name department email rollNumber')
    .sort(sortValue)
    .skip(skip)
    .limit(limit);

  const total = await Complaint.countDocuments(query);

  const userVotes = await Vote.find({ userId: req.user.id });
  const votedIds = new Set(userVotes.map(v => v.complaintId.toString()));

  const data = complaints.map(c => ({
    ...c.toJSON(),
    hasVoted: votedIds.has(c._id.toString())
  }));

  res.status(200).json({ success: true, count: data.length, total, pages: Math.ceil(total/limit), page, data });
};

exports.createComplaint = async (req, res) => {
  const { title, description, category, location } = req.body;
  const io = req.app.get('io');

  let suggestedPriority = 'Medium';
  if (category === 'WiFi / Network Issues') {
    suggestedPriority = 'High';
  } else {
    // See if similar complaints have over 10 votes
    const similar = await Complaint.find({ category, status: 'Pending' });
    if (similar.some(s => s.votes > 10)) {
      suggestedPriority = 'Critical';
    }
  }

  const tags = extractTags(`${title} ${description}`);

  let imagePath = '';
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  }

  const complaint = await Complaint.create({
    title, description, category, location, image: imagePath,
    createdBy: req.user.id,
    suggestedPriority,
    tags
  });

  await logActivity(req.user.id, 'complaint_created', 'complaint', complaint._id, { title });

  // Sync to Supabase
  try {
    const { error: sbError } = await supabase.from('complaints').insert([
      {
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        status: complaint.status,
        priority: complaint.priority,
        image_url: complaint.image,
        created_at: complaint.createdAt
      }
    ]);
    if (sbError) console.error('Supabase Sync Error:', sbError);
  } catch (err) {
    console.error('Supabase Connection Error:', err);
  }

  // Notify Admin Room
  io.to('admin_room').emit('new_complaint', complaint);

  res.status(201).json({ success: true, data: complaint });
};

exports.getComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('createdBy', 'name department email rollNumber avatar avatar');

  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  // Access check
  if (req.user.role === 'student' && complaint.createdBy._id.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  complaint.viewCount += 1;
  await complaint.save({ validateBeforeSave: false });

  const vote = await Vote.findOne({ userId: req.user.id, complaintId: complaint._id });
  
  const data = {
    ...complaint.toJSON(),
    hasVoted: !!vote
  };

  res.status(200).json({ success: true, data });
};

exports.updateComplaint = async (req, res) => {
  // adminOnly route
  const io = req.app.get('io');
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  const oldStatus = complaint.status;
  
  if (req.body.status) complaint.status = req.body.status;
  if (req.body.priority) complaint.priority = req.body.priority;
  if (req.body.adminNote) complaint.adminNote = req.body.adminNote;
  if (req.body.assignedTo) complaint.assignedTo = req.body.assignedTo;

  if (complaint.status === 'Resolved' && !complaint.resolvedAt) {
    complaint.resolvedAt = Date.now();
  }

  await complaint.save();

  if (oldStatus !== complaint.status) {
    await logActivity(req.user.id, 'status_updated', 'complaint', complaint._id, { from: oldStatus, to: complaint.status });
    
    // Notification to owner
    await Notification.create({
      userId: complaint.createdBy,
      type: 'status_update',
      title: 'Status Updated',
      message: `Your complaint "${complaint.title}" is now ${complaint.status}.`,
      complaintId: complaint._id
    });
    io.to(`user_${complaint.createdBy}`).emit('notification');
  }

  io.to(`complaint_${complaint._id}`).emit('complaint_updated', complaint);
  io.to(`user_${complaint.createdBy}`).emit('complaint_updated', complaint);

  res.status(200).json({ success: true, data: complaint });
};

exports.deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  if (req.user.role === 'student') {
    if (complaint.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (complaint.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Can only delete Pending complaints' });
    }
  }

  if (complaint.image) {
    const filename = complaint.image.split('/uploads/')[1];
    const fp = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }

  await Vote.deleteMany({ complaintId: complaint._id });
  
  await complaint.deleteOne();
  await logActivity(req.user.id, 'complaint_deleted', 'complaint', complaint._id);

  res.status(200).json({ success: true, data: {} });
};
