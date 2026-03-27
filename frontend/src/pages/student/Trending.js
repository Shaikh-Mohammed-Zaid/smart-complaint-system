import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import ComplaintCard3D from '../../components/common/ComplaintCard3D';
import LoadingScreen from '../../components/common/LoadingScreen';
import { staggerContainer, fadeInUp } from '../../utils/animations';
import { Flame, Activity } from 'lucide-react';

const Trending = () => {
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
      
      // Update local state without full refetch for snappiness
      const updateList = (list) => list.map(c => 
        c._id === complaintId 
          ? { ...c, votes: data.votes, hasVoted: data.hasVoted }
          : c
      );

      setFeed(updateList(feed));
      setTrending(updateList(trending));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingScreen text="Calculating Trending Algorithms..." />;

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-12 pb-20">
      
      {/* Top Trending Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-orange-400 to-rose-600 rounded-2xl shadow-lg shadow-orange-500/20">
            <Flame size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Top Trending Issues</h2>
            <p className="text-white/50 text-sm mt-1">Calculated via recency x vote velocity algorithms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {trending.map((c, i) => (
            <motion.div key={c._id} variants={fadeInUp} custom={i}>
              <ComplaintCard3D complaint={c} onVote={handleVote} isTrending={true} rank={i + 1} />
            </motion.div>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />

      {/* Global Campus Feed */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-xl">
              <Activity size={24} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Live Campus Feed</h2>
          </div>
          
          <span className="text-sm font-medium text-white/40 flex items-center bg-white/5 px-4 py-2 rounded-lg border border-white/5">
            Auto-sorted by relevance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {feed.map((c, i) => (
              <motion.div key={c._id} layout variants={fadeInUp} initial="initial" animate="animate" exit={{ opacity: 0, scale: 0.9 }}>
                <ComplaintCard3D complaint={c} onVote={handleVote} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {feed.length === 0 && (
          <div className="text-center py-20 text-white/40">No active complaints in the system right now.</div>
        )}
      </section>

    </motion.div>
  );
};

export default Trending;
