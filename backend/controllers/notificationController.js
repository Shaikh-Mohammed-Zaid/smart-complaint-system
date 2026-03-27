const supabase = require('../config/supabase');
const { logActivity } = require('../utils/activityLogger');

const getNotifications = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', req.user.id)
    .eq('is_read', false);

  res.status(200).json({ success: true, notifications: notifications || [], unreadCount: unreadCount || 0 });
};

const markAllRead = async (req, res) => {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', req.user.id)
    .eq('is_read', false);

  res.status(200).json({ success: true });
};

const markAsRead = async (req, res) => {
  const { data: notification, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error || !notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.status(200).json({ success: true, notification });
};

const deleteNotification = async (req, res) => {
  const { data: notification, error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error || !notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.status(200).json({ success: true, message: 'Deleted successfully' });
};

module.exports = { getNotifications, markAllRead, markAsRead, deleteNotification };
