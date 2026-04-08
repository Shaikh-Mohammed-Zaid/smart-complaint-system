import React, { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ComplaintDetailModal from '../../components/common/ComplaintDetailModal';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// ─── Category icon map ─────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  'Classroom Issues':       '🏫',
  'Lab Equipment Problems': '🔬',
  'WiFi / Network Issues':  '📶',
  'Hostel Complaints':      '🏠',
  'Library Issues':         '📚',
  'Cleanliness Issues':     '🧹',
  'Other':                  '📋',
};

// ─── Individual complaint card — READ ONLY ─────────────────────────────────────
function ComplaintViewCard({ complaint, onView }) {
  const IMAGE_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || '';
  const imageUrl   = complaint.imageUrl || complaint.image;

  return (
    <div className="glass-card hover:glass-card-elevated rounded-xl transition-all duration-300 overflow-hidden flex flex-col group">

      {/* Thumbnail image */}
      {imageUrl && (
        <div className="h-40 overflow-hidden bg-white/5 flex-shrink-0">
          <img
            src={`${IMAGE_BASE}${imageUrl}`}
            alt={complaint.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">

        {/* Category + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-white/50">
            <span className="text-base">{CATEGORY_ICONS[complaint.category] || '📋'}</span>
            <span className="truncate max-w-[120px]">{complaint.category}</span>
          </span>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white text-sm leading-tight mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {complaint.title}
        </h3>

        {/* Description preview */}
        <p className="text-xs text-white/50 leading-relaxed mb-3 line-clamp-2 flex-1">
          {complaint.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{complaint.location || 'Not specified'}</span>
        </div>

        {/* Footer: priority + votes + date + view button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            {/* Votes — displayed read-only, no click handler */}
            <span className="flex items-center gap-1 text-xs text-white/40">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {complaint.votes || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 hidden sm:block">
              {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
            </span>
            {/* View Details — the ONLY action button on this page */}
            <button
              onClick={onView}
              className="text-xs text-indigo-400 hover:text-white font-medium px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/20 hover:border-indigo-500 transition-all"
            >
              View →
            </button>
          </div>
        </div>

        {/* Reporter (subtle, bottom) */}
        {complaint.reporterName && complaint.reporterName !== 'Anonymous' && (
          <p className="text-xs text-white/30 mt-2 pt-2 border-t border-white/5 truncate">
            By{' '}
            <span className="font-medium text-white/50">{complaint.reporterName}</span>
            {complaint.department && ` · ${complaint.department}`}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────────────
export default function PublicComplaints() {
  const [complaints,        setComplaints]  = useState([]);
  const [pagination,        setPagination]  = useState(null);
  const [loading,           setLoading]     = useState(true);
  const [selectedComplaint, setSelected]    = useState(null);

  const [filters, setFilters] = useState({
    status:   '',
    category: '',
    priority: '',
    search:   '',
    sort:     '-createdAt',
    page:     1,
  });

  // Stable fetch function — re-runs only when filters change
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status)   params.set('status',   filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.search)   params.set('search',   filters.search);
      params.set('sort',  filters.sort);
      params.set('page',  String(filters.page));
      params.set('limit', '10');

      const { data } = await API.get(`/complaints/public?${params}`);
      setComplaints(data.complaints || []);
      setPagination(data.pagination || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // Filter helpers — always reset to page 1 on filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearAllFilters = () => {
    setFilters({ status: '', category: '', priority: '', search: '', sort: '-createdAt', page: 1 });
  };

  const hasActiveFilters = !!(filters.status || filters.category || filters.priority || filters.search);

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">All Complaints</h1>
          <p className="text-sm text-white/50 mt-1">
            {pagination
              ? `${pagination.total} complaint${pagination.total !== 1 ? 's' : ''} reported across campus`
              : 'Browse all reported campus issues'}
          </p>
        </div>
        {/* Read-only notice */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/50 text-xs font-medium rounded-full border border-white/10">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View only
        </span>
      </div>

      {/* ── Filter bar ── */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">

          {/* Search */}
          <div className="flex-1 relative min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search title, description, location..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-glass w-full pl-9 text-sm"
            />
          </div>

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input-glass sm:w-36 text-sm [&>option]:bg-[#16162a]"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input-glass sm:w-44 text-sm [&>option]:bg-[#16162a]"
          >
            <option value="">All Categories</option>
            <option value="Classroom Issues">Classroom Issues</option>
            <option value="Lab Equipment Problems">Lab Equipment</option>
            <option value="WiFi / Network Issues">WiFi / Network</option>
            <option value="Hostel Complaints">Hostel</option>
            <option value="Library Issues">Library</option>
            <option value="Cleanliness Issues">Cleanliness</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority */}
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="input-glass sm:w-36 text-sm [&>option]:bg-[#16162a]"
          >
            <option value="">All Priority</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="input-glass sm:w-40 text-sm [&>option]:bg-[#16162a]"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-votes">Most Voted</option>
            <option value="title">A → Z</option>
          </select>

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                Status: {filters.status}
                <button onClick={() => handleFilterChange('status', '')} className="hover:text-blue-200 ml-0.5">✕</button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                {filters.category}
                <button onClick={() => handleFilterChange('category', '')} className="hover:text-purple-200 ml-0.5">✕</button>
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full border border-orange-500/30">
                {filters.priority} Priority
                <button onClick={() => handleFilterChange('priority', '')} className="hover:text-orange-200 ml-0.5">✕</button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 text-white/60 text-xs font-medium rounded-full border border-white/20">
                "{filters.search}"
                <button onClick={() => handleFilterChange('search', '')} className="hover:text-white ml-0.5">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="Loading complaints..." />
        </div>
      ) : complaints.length === 0 ? (
        /* Empty state */
        <div className="glass-card rounded-xl p-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-semibold text-white text-lg mb-1">No complaints found</h3>
          <p className="text-white/50 text-sm">
            {hasActiveFilters ? 'Try adjusting or clearing your filters' : 'No complaints have been reported yet'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="mt-4 px-4 py-2 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        /* Complaints grid */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((complaint) => (
            <ComplaintViewCard
              key={complaint._id}
              complaint={complaint}
              onView={() => setSelected(complaint)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && pagination && pagination.pages > 1 && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        />
      )}

      {/* ── Detail modal ── */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelected(null)}
        />
      )}

    </div>
  );
}
