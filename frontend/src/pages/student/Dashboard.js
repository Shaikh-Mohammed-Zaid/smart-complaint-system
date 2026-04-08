import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import AnimatedStatCard from '../../components/common/AnimatedStatCard';
import ComplaintCard3D from '../../components/common/ComplaintCard3D';
import FloatingActionButton from '../../components/common/FloatingActionButton';
import Modal from '../../components/common/Modal';
import LoadingScreen from '../../components/common/LoadingScreen';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { staggerContainer, fadeInUp } from '../../utils/animations';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Other', location: '' });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/analytics/student');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => fd.append(key, formData[key]));
      if (image) fd.append('image', image);

      await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast.success('Complaint submitted successfully!');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: 'Other', location: '' });
      setImage(null);
      fetchDashboardData(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen text="Loading Dashboard..." />;

  const statCards = [
    { title: "Total Complaints", value: stats?.total || 0, icon: FileText, color: "blue" },
    { title: "Pending", value: stats?.pending || 0, icon: Clock, color: "yellow" },
    { title: "In Progress", value: stats?.inProgress || 0, icon: AlertTriangle, color: "indigo" },
    { title: "Resolved", value: stats?.resolved || 0, icon: CheckCircle, color: "green" }
  ];

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8 pb-20">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <AnimatedStatCard {...s} />
          </motion.div>
        ))}
      </div>

      <motion.div variants={fadeInUp} className="mt-10">
        <h3 className="text-xl font-bold mb-6 flex items-center text-white">
          <Clock className="mr-2 text-indigo-400" size={24} /> Recent Activity
        </h3>
        
        {stats?.recentComplaints?.length === 0 ? (
          <div className="text-center text-white/50 py-10 glass-card">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>You haven't submitted any complaints yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {stats?.recentComplaints.map(c => (
              <ComplaintCard3D key={c.id || c._id} complaint={c} />
            ))}
          </div>
        )}
      </motion.div>

      <FloatingActionButton onClick={() => setIsModalOpen(true)} tooltip="Report Issue" />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report an Issue">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-glass">Title</label>
            <input type="text" required maxLength={100} className="input-glass" 
              placeholder="e.g. Projector not working"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label-glass">Category</label>
              <select className="input-glass [&>option]:bg-[#16162a]" 
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>Classroom Issues</option>
                <option>Lab Equipment Problems</option>
                <option>WiFi / Network Issues</option>
                <option>Hostel Complaints</option>
                <option>Library Issues</option>
                <option>Cleanliness Issues</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label-glass">Location</label>
              <input type="text" required className="input-glass" placeholder="e.g. Room 302"
                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="label-glass">Description</label>
            <textarea required rows={4} className="input-glass resize-none" placeholder="Provide detailed information..."
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="label-glass">Attach Image (Optional)</label>
            <input type="file" accept="image/jpeg,image/jpg,image/png" 
              className="w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 transition-all cursor-pointer"
              onChange={e => setImage(e.target.files[0])}
            />
          </div>

          <button  type="submit" disabled={submitting} className="btn-primary w-full mt-6 flex justify-center py-3">
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Complaint'}
          </button>
        </form>
      </Modal>

    </motion.div>
  );
};

export default StudentDashboard;
