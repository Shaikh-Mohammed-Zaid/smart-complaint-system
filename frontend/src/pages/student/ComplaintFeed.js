import React, { useEffect, useState, useCallback } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ComplaintCard from '../../components/common/ComplaintCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CATEGORIES } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ComplaintFeed() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', sort: '-votes', page: 1 });

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      params.set('sort', filters.sort);
      params.set('page', filters.page);
      params.set('limit', 9);
      const { data } = await API.get(`/complaints/feed?${params}`);
      setComplaints(data.complaints);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const handleVote = async (complaintId) => {
    try {
      const { data } = await API.post(`/votes/${complaintId}`);
      setComplaints(prev => prev.map(c =>
        c._id === complaintId ? { ...c, votes: data.votes, hasVoted: data.hasVoted } : c
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Vote failed');
    }
  };

  const handleFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Community Feed</h1>
        <p className="text-gray-500 text-sm mt-1">Browse campus complaints and upvote the ones that affect you too</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={filters.category} onChange={e => handleFilter('category', e.target.value)} className="input sm:w-48">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.sort} onChange={e => handleFilter('sort', e.target.value)} className="input sm:w-40">
            <option value="-votes">Most Voted</option>
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Upvote complaints that affect you too. High-voted complaints get prioritized by the admin team for faster resolution.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner text="Loading feed..." /></div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-semibold text-gray-900 mb-1">No complaints in the feed</h3>
          <p className="text-gray-500 text-sm">Try changing your filters</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map(c => (
              <ComplaintCard
                key={c._id}
                complaint={c}
                linkPrefix="/complaint"
                onVote={handleVote}
                currentUserId={user?._id}
              />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => setFilters(f => ({ ...f, page: p }))} />
        </>
      )}
    </div>
  );
}
