const supabase = require('../config/supabase');

exports.getAnalytics = async (req, res) => {
  try {
    const { count: totalComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
    const { count: pendingComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
    const { count: inProgressComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'In Progress');
    const { count: resolvedComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Resolved');
    const { count: rejectedComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Rejected');
    const { count: totalStudents } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    const { count: totalVotes } = await supabase.from('votes').select('*', { count: 'exact', head: true });
    const { count: totalNotifications } = await supabase.from('notifications').select('*', { count: 'exact', head: true });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsersThisWeek } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_login', oneWeekAgo);

    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

    // Avg resolution time
    const { data: resolved } = await supabase.from('complaints').select('created_at, resolved_at').eq('status', 'Resolved').not('resolved_at', 'is', null);
    let totalHrs = 0;
    (resolved || []).forEach(c => {
      totalHrs += (new Date(c.resolved_at) - new Date(c.created_at)) / (1000 * 60 * 60);
    });
    const avgResolutionHours = resolved && resolved.length > 0 ? (totalHrs / resolved.length).toFixed(1) : 0;

    // Category stats
    const { data: allComplaints } = await supabase.from('complaints').select('category, status, department, priority, created_at, votes, title, id');
    const categoryMap = {};
    (allComplaints || []).forEach(c => {
      if (!categoryMap[c.category]) categoryMap[c.category] = { _id: c.category, count: 0, resolvedCount: 0 };
      categoryMap[c.category].count++;
      if (c.status === 'Resolved') categoryMap[c.category].resolvedCount++;
    });
    const categoryStats = Object.values(categoryMap).sort((a, b) => b.count - a.count);

    // Priority stats
    const priorityMap = {};
    (allComplaints || []).forEach(c => {
      priorityMap[c.priority] = (priorityMap[c.priority] || 0) + 1;
    });
    const priorityStats = Object.entries(priorityMap).map(([_id, count]) => ({ _id, count }));

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const recent = (allComplaints || []).filter(c => new Date(c.created_at) >= sixMonthsAgo);
    const monthMap = {};
    recent.forEach(c => {
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthMap[key]) monthMap[key] = { year: d.getFullYear(), month: d.getMonth() + 1, count: 0, resolved: 0 };
      monthMap[key].count++;
      if (c.status === 'Resolved') monthMap[key].resolved++;
    });
    const monthlyStats = Object.values(monthMap).sort((a, b) => a.year - b.year || a.month - b.month);

    // Top complaints
    const topComplaints = (allComplaints || []).filter(c => c.status !== 'Rejected').sort((a, b) => b.votes - a.votes).slice(0, 5);

    // Recent activity
    const { data: recentActivity } = await supabase
      .from('activity_logs')
      .select('*, profiles:user_id(name, avatar, role)')
      .order('created_at', { ascending: false })
      .limit(10);

    // Department stats
    const { data: students } = await supabase.from('profiles').select('id, department').eq('role', 'student').not('department', 'eq', '');
    const deptMap = {};
    (students || []).forEach(s => {
      if (!s.department) return;
      if (!deptMap[s.department]) deptMap[s.department] = { _id: s.department, count: 0, resolved: 0, userIds: [] };
      deptMap[s.department].userIds.push(s.id);
    });
    const departmentStats = await Promise.all(Object.values(deptMap).map(async (d) => {
      const deptComplaints = (allComplaints || []).filter(c => d.userIds.includes(c.created_by));
      return { _id: d._id, count: deptComplaints.length, resolved: deptComplaints.filter(c => c.status === 'Resolved').length };
    }));

    // Heatmap
    const categoriesList = ['Classroom Issues', 'Lab Equipment Problems', 'WiFi / Network Issues', 'Hostel Complaints', 'Library Issues', 'Cleanliness Issues', 'Other'];
    let heatmapData = { rows: categoriesList, cols: [1,2,3,4,5,6,7], matrix: {} };
    categoriesList.forEach(c => { heatmapData.matrix[c] = {1:0,2:0,3:0,4:0,5:0,6:0,7:0}; });
    (allComplaints || []).forEach(c => {
      const day = new Date(c.created_at).getDay() + 1;
      if (heatmapData.matrix[c.category]) heatmapData.matrix[c.category][day]++;
    });

    res.status(200).json({
      success: true,
      overview: { totalComplaints, pendingComplaints, inProgressComplaints, resolvedComplaints, rejectedComplaints, totalStudents, totalVotes, totalNotifications, activeUsersThisWeek, resolutionRate, avgResolutionHours },
      categoryStats, priorityStats, monthlyStats, departmentStats, topComplaints, recentActivity: recentActivity || [], heatmapData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  const userId = req.user.id;

  const { data: complaints } = await supabase.from('complaints').select('status, category, created_at, title, id').eq('created_by', userId);
  const all = complaints || [];

  const total = all.length;
  const pending = all.filter(c => c.status === 'Pending').length;
  const inProgress = all.filter(c => c.status === 'In Progress').length;
  const resolved = all.filter(c => c.status === 'Resolved').length;

  const catMap = {};
  all.forEach(c => { catMap[c.category] = (catMap[c.category] || 0) + 1; });
  const categoryStats = Object.entries(catMap).map(([_id, count]) => ({ _id, count }));

  const recentComplaints = all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);

  const { count: votesGiven } = await supabase.from('votes').select('*', { count: 'exact', head: true }).eq('user_id', userId);

  res.status(200).json({ success: true, total, pending, inProgress, resolved, categoryStats, recentComplaints, votesGiven: votesGiven || 0 });
};
