import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { formatDate, getInitials } from '../../utils/helpers';
import Pagination from '../../components/common/Pagination';
import SmartSearchBar from '../../components/common/SmartSearchBar';
import GlassCard from '../../components/common/GlassCard';
import Modal from '../../components/common/Modal';
import { Edit2, ShieldAlert, Check } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../utils/animations';

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', priority: '', adminNote: '' });
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/complaints', {
        params: { page, limit: 12, search, status: statusFilter }
      });
      setComplaints(data.data);
      setPages(data.pages);
      setPage(data.page);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line
  }, [page, search, statusFilter]);

  const openUpdateModal = (c) => {
    setSelectedComplaint(c);
    setUpdateData({ status: c.status, priority: c.priority, adminNote: c.adminNote || '' });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/complaints/${selectedComplaint._id}`, updateData);
      toast.success('Complaint updated successfully');
      setIsModalOpen(false);
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  const IMAGE_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || '';

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6 pb-20">
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
        <SmartSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search IDs, Users, Keywords..." />
        <select 
          className="input-glass w-full md:w-auto [&>option]:bg-[#16162a]"
          value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-white/50 tracking-wider">
                <th className="px-6 py-4 font-medium">Issue Detail</th>
                <th className="px-6 py-4 font-medium">Reporter</th>
                <th className="px-6 py-4 font-medium">Status & Priority</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {complaints.map((c) => (
                <motion.tr variants={fadeInUp} key={c._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate font-semibold text-white mb-1" title={c.title}>
                      {c.title}
                    </div>
                    <div className="text-xs text-white/40">{c.category} • {formatDate(c.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                        {getInitials(c.createdBy?.name)}
                      </div>
                      <div className="truncate w-32">
                        <span className="text-white block truncate">{c.createdBy?.name}</span>
                        <span className="text-white/40 text-xs truncate">{c.createdBy?.rollNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-2">
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    <div className="flex items-center gap-4">
                      <span>👍 {c.votes}</span>
                      {c.trendingScore > 0 && <span className="text-amber-400/80">🔥 {c.trendingScore.toFixed(0)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openUpdateModal(c)} className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {complaints.length === 0 && !loading && (
                <tr><td colSpan="5" className="text-center py-10 text-white/40">No complaints match criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Pagination page={page} pages={pages} onPageChange={setPage} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Moderate Complaint">
        <form onSubmit={handleUpdate} className="space-y-4">
          {selectedComplaint?.imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
              <img 
                src={selectedComplaint.imageUrl.startsWith('http') ? selectedComplaint.imageUrl : `${IMAGE_BASE}${selectedComplaint.imageUrl}`} 
                alt="Complaint attachment" 
                className="w-full h-48 object-cover" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
            <h4 className="font-bold text-white mb-1">{selectedComplaint?.title}</h4>
            <p className="text-sm text-white/50 line-clamp-2">{selectedComplaint?.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-glass">Status</label>
              <select className="input-glass [&>option]:bg-[#16162a]" 
                value={updateData.status} onChange={e => setUpdateData({...updateData, status: e.target.value})}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="label-glass">Priority</label>
              <select className="input-glass [&>option]:bg-[#16162a]" 
                value={updateData.priority} onChange={e => setUpdateData({...updateData, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-glass">Admin Resolution Note</label>
            <textarea className="input-glass h-24 resize-none" placeholder="Provide reason for resolution/rejection (Optional)"
              value={updateData.adminNote} onChange={e => setUpdateData({...updateData, adminNote: e.target.value})}
            />
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start mt-4">
            <ShieldAlert size={20} className="text-amber-500 shrink-0 mr-3 mt-0.5" />
            <p className="text-xs text-amber-500/80">Updating this complaint will trigger a real-time notification to the issuer and log this action globally.</p>
          </div>

          <button type="submit" disabled={updating} className="btn-primary w-full mt-4 flex justify-center py-2.5">
            {updating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} className="mr-2"/> Update Ticket</>}
          </button>
        </form>
      </Modal>

    </motion.div>
  );
};

export default ManageComplaints;
