const supabase = require('../config/supabase');

exports.getUsers = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('profiles')
    .select('id, name, email, role, department, roll_number, avatar, is_active, last_login, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (req.query.role) query = query.eq('role', req.query.role);
  if (req.query.search) {
    query = query.or(`name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%,department.ilike.%${req.query.search}%`);
  }

  const { data: users, count, error } = await query;
  if (error) return res.status(500).json({ success: false, message: error.message });

  // Get complaint counts for each user
  const results = await Promise.all((users || []).map(async (u) => {
    const { count: total } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('created_by', u.id);
    const { count: resolved } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('created_by', u.id).eq('status', 'Resolved');
    const { count: pending } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('created_by', u.id).eq('status', 'Pending');
    return { ...u, complaintCount: total || 0, resolvedCount: resolved || 0, pendingCount: pending || 0 };
  }));

  res.status(200).json({ success: true, count: results.length, total: count, pages: Math.ceil(count / limit), page, data: results });
};

exports.getUser = async (req, res) => {
  const { data: user, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, department, roll_number, avatar, is_active, last_login, created_at')
    .eq('id', req.params.id)
    .single();

  if (error || !user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, data: user });
};

exports.updateUser = async (req, res) => {
  const updates = {};
  if (req.body.isActive !== undefined) updates.is_active = req.body.isActive;
  if (req.body.role && req.user.role === 'admin') updates.role = req.body.role;
  if (req.body.department) updates.department = req.body.department;
  updates.updated_at = new Date().toISOString();

  const { data: user, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', req.params.id)
    .select('id, name, email, role, department, is_active')
    .single();

  if (error || !user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, data: user });
};

exports.deleteUser = async (req, res) => {
  const { data: user } = await supabase.from('profiles').select('role').eq('id', req.params.id).single();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });

  await supabase.from('profiles').delete().eq('id', req.params.id);
  res.status(200).json({ success: true, data: {} });
};
