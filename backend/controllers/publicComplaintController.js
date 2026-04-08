const supabase = require('../config/supabase');

const VALID_STATUSES    = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
const VALID_CATEGORIES  = [
  'Classroom Issues', 'Lab Equipment Problems', 'WiFi / Network Issues',
  'Hostel Complaints', 'Library Issues', 'Cleanliness Issues', 'Other'
];
const VALID_PRIORITIES  = ['Low', 'Medium', 'High', 'Critical'];

const ALLOWED_SORTS = {
  '-createdAt': { field: 'created_at', ascending: false },
  'createdAt':  { field: 'created_at', ascending: true  },
  '-votes':     { field: 'votes',      ascending: false },
  '-priority':  { field: 'priority',   ascending: false },
  'title':      { field: 'title',      ascending: true  },
};

const getPublicComplaints = async (req, res) => {
  const {
    page     = 1,
    limit    = 10,
    status,
    category,
    priority,
    search,
    sort     = '-createdAt',
  } = req.query;

  // Sanitize pagination
  const pageNum  = Math.max(1, parseInt(page)  || 1);
  const limitNum = Math.min(20, Math.max(1, parseInt(limit) || 10));
  const from     = (pageNum - 1) * limitNum;
  const to       = from + limitNum - 1;

  // Validate sort
  const sortOption = ALLOWED_SORTS[sort] || ALLOWED_SORTS['-createdAt'];

  // Build Supabase query — select only safe, public fields
  // profiles join gives us name + department only (no email, no password)
  let query = supabase
    .from('complaints')
    .select(
      'id, title, description, category, location, image_url, status, priority, votes, created_at, profiles:created_by(name, department)',
      { count: 'exact' }
    )
    .order(sortOption.field, { ascending: sortOption.ascending })
    .range(from, to);

  // Apply validated filters — whitelist only, no raw user input injected
  if (status && VALID_STATUSES.includes(status)) {
    query = query.eq('status', status);
  }
  if (category && VALID_CATEGORIES.includes(category)) {
    query = query.eq('category', category);
  }
  if (priority && VALID_PRIORITIES.includes(priority)) {
    query = query.eq('priority', priority);
  }

  // Search across title, description, location (Supabase ilike — safe, no regex injection)
  if (search && search.trim().length > 0) {
    const term = search.trim().substring(0, 100); // cap length
    query = query.or(
      `title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%`
    );
  }

  const { data: complaints, count, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const total = count || 0;
  const pages = Math.ceil(total / limitNum);

  // Sanitize output — expose ONLY safe fields, never internal system data
  const safeComplaints = (complaints || []).map(c => ({
    _id:          c.id,
    title:        c.title,
    description:  c.description,
    category:     c.category,
    location:     c.location,
    status:       c.status,
    priority:     c.priority,
    votes:        c.votes || 0,
    imageUrl:     c.image_url || null,
    createdAt:    c.created_at,
    reporterName: c.profiles?.name       || 'Anonymous',
    department:   c.profiles?.department || '',
    // NEVER include: admin_note, assigned_to, resolved_at, created_by UUID,
    //                email, password, __v, or any internal identifiers
  }));

  res.status(200).json({
    success: true,
    complaints: safeComplaints,
    pagination: {
      total,
      page:        pageNum,
      limit:       limitNum,
      pages,
      hasNextPage: pageNum < pages,
      hasPrevPage: pageNum > 1,
    },
    filters: {
      status:   status   || null,
      category: category || null,
      priority: priority || null,
      search:   search   || null,
      sort,
    },
  });
};

module.exports = { getPublicComplaints };
