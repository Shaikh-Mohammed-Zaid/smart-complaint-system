const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Vote = require('../models/Vote');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

exports.getAnalytics = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const rejectedComplaints = await Complaint.countDocuments({ status: 'Rejected' });
    
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalVotes = await Vote.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersThisWeek = await User.countDocuments({ lastLogin: { $gte: oneWeekAgo } });

    const resolutionRate = totalComplaints > 0 
      ? Math.round((resolvedComplaints / totalComplaints) * 100) 
      : 0;

    // Avg resolution hours
    const resolveds = await Complaint.find({ status: 'Resolved', resolvedAt: { $ne: null } });
    let totalHrs = 0;
    resolveds.forEach(c => {
      totalHrs += (c.resolvedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
    });
    const avgResolutionHours = resolveds.length > 0 ? (totalHrs / resolveds.length).toFixed(1) : 0;

    // Category Stats
    const catStatsRaw = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    // Enrich with resolved counts
    const categoryStats = await Promise.all(catStatsRaw.map(async (cat) => {
      const resolved = await Complaint.countDocuments({ category: cat._id, status: 'Resolved' });
      return { _id: cat._id, count: cat.count, resolvedCount: resolved };
    }));

    // Priority Stats
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Monthly Trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyStatsRaw = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    const monthlyStats = monthlyStatsRaw.map(s => ({
      year: s._id.year, month: s._id.month, count: s.count, resolved: s.resolved
    }));

    // Top complaints
    const topComplaints = await Complaint.find({ status: { $ne: 'Rejected' } })
      .sort({ votes: -1 })
      .limit(5);

    // Recent Activity
    const recentActivity = await ActivityLog.find()
      .populate('userId', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Department Stats
    const usersByDept = await User.aggregate([
      { $match: { role: 'student', department: { $ne: '' } } },
      { $group: { _id: '$department', users: { $push: '$_id' } } }
    ]);

    const departmentStats = [];
    for (let d of usersByDept) {
      if (!d._id) continue;
      const count = await Complaint.countDocuments({ createdBy: { $in: d.users } });
      const resolved = await Complaint.countDocuments({ createdBy: { $in: d.users }, status: 'Resolved' });
      departmentStats.push({ _id: d._id, count, resolved });
    }

    // Heatmap Dummy Generation (Aggregation for purely dayOfWeek requires $dayOfWeek)
    const heatmapRaw = await Complaint.aggregate([
      {
        $group: {
          _id: { category: "$category", dayOfWeek: { $dayOfWeek: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const categoriesList = [
      'Classroom Issues', 'Lab Equipment Problems',
      'WiFi / Network Issues', 'Hostel Complaints',
      'Library Issues', 'Cleanliness Issues', 'Other'
    ];
    let heatmapData = { rows: categoriesList, cols: [1,2,3,4,5,6,7], matrix: {} };
    categoriesList.forEach(c => {
      heatmapData.matrix[c] = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0};
    });
    heatmapRaw.forEach(item => {
      if (heatmapData.matrix[item._id.category]) {
        heatmapData.matrix[item._id.category][item._id.dayOfWeek] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      overview: {
        totalComplaints, pendingComplaints, inProgressComplaints, resolvedComplaints,
        rejectedComplaints, totalStudents, totalVotes, totalNotifications,
        activeUsersThisWeek, resolutionRate, avgResolutionHours
      },
      categoryStats,
      priorityStats,
      monthlyStats,
      departmentStats,
      topComplaints,
      recentActivity,
      heatmapData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  const userId = req.user.id;

  const total = await Complaint.countDocuments({ createdBy: userId });
  const pending = await Complaint.countDocuments({ createdBy: userId, status: 'Pending' });
  const inProgress = await Complaint.countDocuments({ createdBy: userId, status: 'In Progress' });
  const resolved = await Complaint.countDocuments({ createdBy: userId, status: 'Resolved' });

  const categoryStats = await Complaint.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const recentComplaints = await Complaint.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .limit(3);

  const votesGiven = await Vote.countDocuments({ userId });

  res.status(200).json({
    success: true,
    total, pending, inProgress, resolved, categoryStats, recentComplaints, votesGiven
  });
};
