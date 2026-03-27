import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { FileText, Clock, CheckCircle, Users } from 'lucide-react';
import AnimatedStatCard from '../../components/common/AnimatedStatCard';
import LoadingScreen from '../../components/common/LoadingScreen';
import GlassCard from '../../components/common/GlassCard';
import ActivityFeed from '../../components/common/ActivityFeed';
import api from '../../utils/api';
import { staggerContainer, fadeInUp } from '../../utils/animations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) return <LoadingScreen text="Loading Global Analytics..." />;

  const { overview, categoryStats, priorityStats, monthlyStats, recentActivity } = data;

  const statCards = [
    { title: "Total Users", value: overview.totalStudents, icon: Users, color: "blue" },
    { title: "Complaints", value: overview.totalComplaints, icon: FileText, color: "indigo" },
    { title: "Pending", value: overview.pendingComplaints, icon: Clock, color: "yellow" },
    { title: "Resolved", value: overview.resolvedComplaints, icon: CheckCircle, color: "green", subtitle: `${overview.resolutionRate}% Rate`, trend: 'up' }
  ];

  // Chart configs
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'rgba(255,255,255,0.7)' } } },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } }
    }
  };

  const donutOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.7)' } } },
    cutout: '75%'
  };

  const categoryChartData = {
    labels: categoryStats.map(c => c._id),
    datasets: [{
      label: 'Complaints',
      data: categoryStats.map(c => c.count),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 6
    }]
  };

  const trendChartData = {
    labels: monthlyStats.map(m => `${m.month}/${m.year.toString().slice(2)}`),
    datasets: [
      {
        label: 'Filed',
        data: monthlyStats.map(m => m.count),
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        fill: true, tension: 0.4
      },
      {
        label: 'Resolved',
        data: monthlyStats.map(m => m.resolved),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true, tension: 0.4
      }
    ]
  };

  const priorityData = {
    labels: priorityStats.map(p => p._id),
    datasets: [{
      data: priorityStats.map(p => p.count),
      backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
      borderWidth: 0
    }]
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8 pb-20">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <AnimatedStatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Filing vs Resolution Trends</h3>
          <div className="h-[300px]">
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-6">Priority Distribution</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={priorityData} options={donutOptions} />
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Category Breakdown</h3>
          <div className="h-[300px]">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </GlassCard>

        <div className="lg:col-span-1">
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>

    </motion.div>
  );
};

export default AdminDashboard;
