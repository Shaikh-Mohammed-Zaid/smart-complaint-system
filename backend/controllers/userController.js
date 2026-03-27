const User = require('../models/User');
const Complaint = require('../models/Complaint');

exports.getUsers = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.query.role) query.role = req.query.role;
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { department: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const users = await User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

  // Compute complaint resolved / total counts efficiently
  const results = [];
  for (let u of users) {
    const total = await Complaint.countDocuments({ createdBy: u._id });
    const resolved = await Complaint.countDocuments({ createdBy: u._id, status: 'Resolved' });
    const pending = await Complaint.countDocuments({ createdBy: u._id, status: 'Pending' });

    results.push({
      ...u.toJSON(),
      complaintCount: total,
      resolvedCount: resolved,
      pendingCount: pending
    });
  }

  const total = await User.countDocuments(query);

  res.status(200).json({ success: true, count: results.length, total, pages: Math.ceil(total/limit), page, data: results });
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, data: user });
};

exports.updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  if (req.body.role && req.user.role === 'admin') user.role = req.body.role;
  if (req.body.department) user.department = req.body.department;

  await user.save();
  res.status(200).json({ success: true, data: user });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });
  }

  await user.deleteOne();
  res.status(200).json({ success: true, data: {} });
};
