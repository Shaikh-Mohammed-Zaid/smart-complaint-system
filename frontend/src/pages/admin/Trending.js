import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ComplaintCard3D from '../../components/common/ComplaintCard3D';
import LoadingScreen from '../../components/common/LoadingScreen';
import { staggerContainer, fadeInUp } from '../../utils/animations';
import { Flame, Activity, Trash2 } from 'lucide-react';

const AdminTrending = () => {
  const [feed, setFeed] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [feedRes, trendingRes] = await Promise.all([
        api.get('/complaints/feed'),
        api.get('/complaints/trending')
      ]);
      setFeed(feedRes.data.data);
      setTrending(trendingRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVote = async (complaintId) => {
    try {
      const { data } = await api.post(`/votes/${complaintId}`);
      const updateList = (list) => list.map(c => 
        c._id === complaintId ? { ...c, votes: data.votes, hasVoted: data.hasVoted } : c
      );
      setFeed(updateList(feed));
      setTrending(updateList(trending));
    } catch (err) {}
  };

  const handleDelete = async (complaintId) => {
    if(window.confirm("Admin Action: Permanently delete this complaint?")) {
      try {
        await api.delete(`/complaints/${complaintId}`);
        toast.success("Complaint eradicated");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  if (loading) return <LoadingScreen text="Monitoring Network Activity..." />;

  const renderCard = (c, i, isTrending) => (
    <div className="relative group/admin" key={c._id}>
      <ComplaintCard3D complaint={c} onVote={handleVote} isTrending={isTrending} rank={isTrending ? i + 1 : null} />
      <button 
        onClick={() => handleDelete(c._id)}
        className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover/admin:opacity-100 transition-opacity shadow-lg shadow-rose-500/30 z-20 hover:scale-110 active:scale-95"
        title="Delete Complaint"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-12 pb-20">
      
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-rose-600 rounded-2xl shadow-lg shadow-orange-500/20">
              <Flame size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Global Trending</h2>
              <span className="text-amber-500/80 text-xs font-bold uppercase tracking-wider">ADMINISTRATOR OVERRIDE ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {trending.map((c, i) => (
            <motion.div key={c._id} variants={fadeInUp} custom={i}>
              {renderCard(c, i, true)}
            </motion.div>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />

      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl">
            <Activity size={24} className="text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Live Campus Feed</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {feed.map((c, i) => (
              <motion.div key={c._id} layout variants={fadeInUp} initial="initial" animate="animate" exit={{ opacity: 0, scale: 0.9 }}>
                 {renderCard(c, i, false)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
};

export default AdminTrending;
