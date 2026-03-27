import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';
import SmartSearchBar from '../../components/common/SmartSearchBar';
import GlassCard from '../../components/common/GlassCard';
import { getInitials, formatDate } from '../../utils/helpers';
import { Shield, XCircle, CheckCircle } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../../utils/animations';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', {
        params: { page, limit: 10, search, role: roleFilter }
      });
      setUsers(data.data);
      setPages(data.pages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, search, roleFilter]);

  const toggleStatus = async (user) => {
    if(user.role === 'admin') return toast.error("Cannot disable admin accounts");
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'disabled' : 'enabled'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const promoteAdmin = async (user) => {
    if(window.confirm(`Elevate ${user.name} to Administrator?`)) {
      try {
        await api.put(`/users/${user._id}`, { role: 'admin' });
        toast.success(`User promoted`);
        fetchUsers();
      } catch (err) {
        toast.error('Operation failed');
      }
    }
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
        <SmartSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search names, emails, depts..." />
        <select 
          className="input-glass w-full md:w-auto [&>option]:bg-[#16162a]"
          value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <motion.div key={u._id} variants={fadeInUp} layout>
            <GlassCard className={`p-6 border-t-2 ${!u.isActive ? 'border-t-rose-500 opacity-60' : u.role === 'admin' ? 'border-t-amber-500' : 'border-t-transparent'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                    ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {getInitials(u.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white line-clamp-1 break-all" title={u.name}>{u.name}</h3>
                    <span className="text-xs text-white/40 block mt-0.5">{u.role.toUpperCase()}</span>
                  </div>
                </div>
                {!u.isActive && <span className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Disabled</span>}
              </div>

              <div className="space-y-2 text-sm mb-6 border-b border-white/10 pb-6">
                <div className="text-white/70 truncate"><span className="text-white/40 mr-2">✉</span> {u.email}</div>
                {u.department && <div className="text-white/70 truncate"><span className="text-white/40 mr-2">🏢</span> {u.department}</div>}
                {u.rollNumber && <div className="text-white/70"><span className="text-white/40 mr-2">#️⃣</span> {u.rollNumber}</div>}
                <div className="text-xs text-white/30 pt-2 block mt-2">Joined {formatDate(u.createdAt)}</div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-white">{u.complaintCount || 0}</span>
                  <span className="text-white/40">Filed</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-green-400">{u.resolvedCount || 0}</span>
                  <span className="text-white/40">Resolved</span>
                </div>
                
                <div className="flex gap-2">
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleStatus(u)} className={`p-2 rounded-lg transition-colors border ${u.isActive ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500 hover:text-white'}`} title={u.isActive ? 'Deactivate User' : 'Activate User'}>
                      {u.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                  )}
                  {u.role !== 'admin' && (
                    <button onClick={() => promoteAdmin(u)} className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-colors" title="Promote to Admin">
                      <Shield size={16} />
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {users.length === 0 && !loading && (
          <div className="col-span-full text-center py-20 text-white/40">No users found.</div>
        )}
      </div>

      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </motion.div>
  );
};

export default ManageUsers;
