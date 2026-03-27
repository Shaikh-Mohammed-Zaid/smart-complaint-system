const ActivityLog = require('../models/ActivityLog');

const getActivities = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = {};
  
  if (req.query.userId) {
    query.userId = req.query.userId;
  }
  if (req.query.entityType) {
    query.entityType = req.query.entityType;
  }

  const activities = await ActivityLog.find(query)
    .populate('userId', 'name email avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ActivityLog.countDocuments(query);

  res.status(200).json({
    success: true,
    count: activities.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: activities
  });
};

module.exports = { getActivities };
