import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import ComplaintCard3D from '../../components/common/ComplaintCard3D';
import LoadingScreen from '../../components/common/LoadingScreen';
import Pagination from '../../components/common/Pagination';
import SmartSearchBar from '../../components/common/SmartSearchBar';
import { staggerContainer, fadeInUp } from '../../utils/animations';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints', {
        params: { page, limit: 9, status, search }
      });
      setComplaints(data.data);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line
  }, [page, status, search]);

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
        <SmartSearchBar 
          value={search} 
          onChange={(val) => { setSearch(val); setPage(1); }} 
        />
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s === 'All' ? '' : s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                (status === s) || (status === '' && s === 'All')
                  ? 'bg-indigo-500 text-white shadow-lg glow-brand'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && complaints.length === 0 ? (
        <LoadingScreen text="Loading complaints..." />
      ) : complaints.length === 0 ? (
        <div className="text-center text-white/50 py-20 px-4 glass-card">
          <p className="text-lg">No complaints found matching your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {complaints.map(c => (
              <motion.div key={c._id} variants={fadeInUp}>
                 <ComplaintCard3D complaint={c} />
              </motion.div>
            ))}
          </div>
          
          {pages > 1 && (
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          )}
        </>
      )}

    </motion.div>
  );
};

export default MyComplaints;
