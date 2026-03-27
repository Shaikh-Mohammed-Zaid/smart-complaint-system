import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
  Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js';
import API from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' }, beginAtZero: true } }
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics').then(res => setAnalytics(res.data.analytics)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;
  if (!analytics) return null;

  const { overview, categoryStats, priorityStats, monthlyStats } = analytics;

  // Status chart
  const statusData = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    datasets: [{
      data: [overview.pendingComplaints, overview.inProgressComplaints, overview.resolvedComplaints, overview.rejectedComplaints],
      backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#f87171'],
      borderWidth: 0,
    }]
  };

  // Category chart
  const categoryData = {
    labels: categoryStats.map(c => c._id.replace(' Issues', '').replace(' Problems', '').replace(' Complaints', '')),
    datasets: [{
      label: 'Complaints',
      data: categoryStats.map(c => c.count),
      backgroundColor: '#6366f1',
      borderRadius: 6,
    }]
  };

  // Priority chart
  const priorityColors = { Low: '#34d399', Medium: '#fbbf24', High: '#f97316', Critical: '#ef4444' };
  const priorityData = {
    labels: priorityStats.map(p => p._id),
    datasets: [{
      data: priorityStats.map(p => p.count),
      backgroundColor: priorityStats.map(p => priorityColors[p._id] || '#6366f1'),
      borderWidth: 0,
    }]
  };

  // Monthly trend
  const monthlyData = {
    labels: monthlyStats.map(m => `${MONTHS[m._id.month - 1]} ${m._id.year}`),
    datasets: [
      {
        label: 'Total',
        data: monthlyStats.map(m => m.count),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
      },
      {
        label: 'Resolved',
        data: monthlyStats.map(m => m.resolved),
        borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#34d399',
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { font: { size: 12 }, boxWidth: 12 } } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' }, beginAtZero: true } }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12, padding: 12 } } },
    cutout: '65%',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Comprehensive overview of complaint management metrics</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Complaints" value={overview.totalComplaints} color="blue"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
        <StatCard title="Resolution Rate" value={`${overview.resolutionRate}%`} color="green"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Total Students" value={overview.totalStudents} color="purple"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
        <StatCard title="Avg Resolution" value={overview.avgResolutionHours ? `${overview.avgResolutionHours}h` : 'N/A'} color="orange"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      {/* Monthly Trend */}
      {monthlyStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Monthly Trend</h2>
          <p className="text-xs text-gray-400 mb-5">Complaints submitted vs resolved over time</p>
          <div className="h-64">
            <Line data={monthlyData} options={lineOptions} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Status Distribution</h2>
          <p className="text-xs text-gray-400 mb-5">Current state of all complaints</p>
          <div className="h-52">
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: 'Pending', count: overview.pendingComplaints, color: 'bg-yellow-400' },
              { label: 'In Progress', count: overview.inProgressComplaints, color: 'bg-blue-400' },
              { label: 'Resolved', count: overview.resolvedComplaints, color: 'bg-green-400' },
              { label: 'Rejected', count: overview.rejectedComplaints, color: 'bg-red-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-gray-600">{label}: <strong>{count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Priority Breakdown</h2>
          <p className="text-xs text-gray-400 mb-5">Distribution by urgency level</p>
          <div className="h-52">
            <Doughnut data={priorityData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Category chart */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Complaints by Category</h2>
          <p className="text-xs text-gray-400 mb-5">Volume of complaints across different campus areas</p>
          <div className="h-64">
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Summary table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Category Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Count</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Share</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 w-48">Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categoryStats.map(({ _id, count }) => {
                const pct = overview.totalComplaints ? Math.round((count / overview.totalComplaints) * 100) : 0;
                return (
                  <tr key={_id}>
                    <td className="py-3 text-sm text-gray-900">{_id}</td>
                    <td className="py-3 text-sm font-semibold text-gray-900">{count}</td>
                    <td className="py-3 text-sm text-gray-500">{pct}%</td>
                    <td className="py-3">
                      <div className="h-2 bg-gray-100 rounded-full w-full">
                        <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
