const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ 
    userId: req.user.id, 
    isRead: false 
  });

  res.status(200).json({ success: true, notifications, unreadCount });
};

const markAllRead = async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({ success: true });
};

const markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.status(200).json({ success: true, notification });
};

const deleteNotification = async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.status(200).json({ success: true, message: 'Deleted successfully' });
};

module.exports = {
  getNotifications,
  markAllRead,
  markAsRead,
  deleteNotification
};
