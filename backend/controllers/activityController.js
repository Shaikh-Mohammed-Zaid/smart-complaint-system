const supabase = require('../config/supabase');

const getActivities = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('activity_logs')
    .select('*, profiles:user_id(name, email, avatar, role)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (req.query.userId) query = query.eq('user_id', req.query.userId);
  if (req.query.entityType) query = query.eq('entity_type', req.query.entityType);

  const { data: activities, count, error } = await query;

  if (error) return res.status(500).json({ success: false, message: error.message });

  res.status(200).json({
    success: true,
    count: activities.length,
    total: count,
    page,
    pages: Math.ceil(count / limit),
    data: activities
  });
};

module.exports = { getActivities };
