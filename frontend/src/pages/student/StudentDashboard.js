import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import ComplaintCard from '../../components/common/ComplaintCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, complaintsRes] = await Promise.all([
          API.get('/analytics/student'),
          API.get('/complaints?limit=3&sort=-createdAt'),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setRecentComplaints(complaintsRes.data.complaints);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">{formatDate(new Date())} • {user?.department || 'Student'}</p>
        </div>
        <Link to="/submit-complaint" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Complaint
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={analytics?.total || 0}
          color="blue"
          subtitle="All time"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          title="Pending"
          value={analytics?.pending || 0}
          color="yellow"
          subtitle="Awaiting response"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          title="In Progress"
          value={analytics?.inProgress || 0}
          color="blue"
          subtitle="Being resolved"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
        />
        <StatCard
          title="Resolved"
          value={analytics?.resolved || 0}
          color="green"
          subtitle="Successfully fixed"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Progress bar */}
      {analytics?.total > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Resolution Progress</h3>
            <span className="text-sm font-bold text-green-600">
              {Math.round((analytics.resolved / analytics.total) * 100)}% resolved
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.round((analytics.resolved / analytics.total) * 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-yellow-400 rounded-full" />Pending: {analytics.pending}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-400 rounded-full" />In Progress: {analytics.inProgress}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-400 rounded-full" />Resolved: {analytics.resolved}</span>
          </div>
        </div>
      )}

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Complaints</h2>
          <Link to="/my-complaints" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
        </div>
        {recentComplaints.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="font-semibold text-gray-900 mb-1">No complaints yet</h3>
            <p className="text-gray-500 text-sm mb-4">Submit your first complaint to get started</p>
            <Link to="/submit-complaint" className="btn-primary text-sm">Submit Complaint</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentComplaints.map(c => <ComplaintCard key={c._id} complaint={c} />)}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/feed" className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🗳️</span>
            <h3 className="font-semibold text-gray-900">Community Feed</h3>
          </div>
          <p className="text-sm text-gray-600">Browse and upvote complaints from other students to help prioritize campus issues.</p>
          <p className="text-xs text-purple-600 font-medium mt-3 group-hover:underline">Explore feed →</p>
        </Link>
        <Link to="/submit-complaint" className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📝</span>
            <h3 className="font-semibold text-gray-900">Report an Issue</h3>
          </div>
          <p className="text-sm text-gray-600">Spotted a problem on campus? Report it with photos and get it resolved quickly.</p>
          <p className="text-xs text-blue-600 font-medium mt-3 group-hover:underline">Submit now →</p>
        </Link>
      </div>
    </div>
  );
}
