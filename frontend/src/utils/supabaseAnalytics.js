import { supabase } from '../supabaseClient';

/**
 * Supabase Analytics Helpers
 * Use these functions to get live stats from your Supabase database.
 */

// Get total complaint count by status
export const getComplaintStats = async () => {
  const { data, error } = await supabase
    .from('complaints')
    .select('status');

  if (error) {
    console.error('Supabase analytics error:', error);
    return null;
  }

  const stats = {
    total: data.length,
    pending: data.filter(c => c.status === 'Pending').length,
    inProgress: data.filter(c => c.status === 'In Progress').length,
    resolved: data.filter(c => c.status === 'Resolved').length,
    rejected: data.filter(c => c.status === 'Rejected').length,
  };

  return stats;
};

// Get complaints grouped by category
export const getComplaintsByCategory = async () => {
  const { data, error } = await supabase
    .from('complaints')
    .select('category');

  if (error) return null;

  return data.reduce((acc, cur) => {
    acc[cur.category] = (acc[cur.category] || 0) + 1;
    return acc;
  }, {});
};

// Get top trending complaints (from Supabase)
export const getTrendingComplaints = async (limit = 5) => {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .neq('status', 'Rejected')
    .order('trending_score', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
};
