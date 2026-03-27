import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import { 
  User, Lock, Save, Briefcase, Hash, Phone, Mail, 
  Pencil, X, Eye, EyeOff, Shield 
} from 'lucide-react';
import { pageVariants } from '../../utils/animations';

/* ═══════════════════════════════════════════════
   InfoRow — display-only row inside the card
   ═══════════════════════════════════════════════ */
const InfoRow = ({ icon: Icon, label, value, iconColor = 'text-indigo-400' }) => (
  <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-b-0">
    <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${iconColor}`}>
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-widest text-white/35 font-medium">{label}</p>
      <p className="text-white/90 font-medium text-sm truncate">{value || '—'}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   ProfileCard — read-only display
   ═══════════════════════════════════════════════ */
const ProfileCard = ({ user, activeSection, setActiveSection }) => (
  <GlassCard className="p-0 overflow-hidden" elevated>
    {/* Gradient banner */}
    <div className="h-28 bg-gradient-to-r from-indigo-600/40 via-purple-600/30 to-cyan-500/20 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(99,102,241,0.3),transparent_70%)]" />
    </div>

    {/* Avatar + name */}
    <div className="px-8 pb-6 -mt-12 relative z-10">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-2xl shadow-indigo-500/30 border-4 border-[#1a1d27] ring-2 ring-white/10">
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-display font-bold text-white">{user?.name}</h1>
        <p className="text-white/40 text-sm font-mono mt-1">{user?.email}</p>
      </div>

      {/* Info rows */}
      <div className="grid sm:grid-cols-2 gap-x-8">
        <InfoRow icon={Briefcase} label="Department" value={user?.department} />
        <InfoRow icon={Hash}      label="Roll Number" value={user?.rollNumber} iconColor="text-cyan-400" />
        <InfoRow icon={Phone}     label="Phone"       value={user?.phone}      iconColor="text-emerald-400" />
        <InfoRow icon={Mail}      label="Email"       value={user?.email}      iconColor="text-purple-400" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => setActiveSection(activeSection === 'edit' ? null : 'edit')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeSection === 'edit'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
          }`}
        >
          <Pencil size={16} /> Edit Profile
        </button>
        <button
          onClick={() => setActiveSection(activeSection === 'password' ? null : 'password')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeSection === 'password'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
          }`}
        >
          <Lock size={16} /> Change Password
        </button>
      </div>
    </div>
  </GlassCard>
);

/* ═══════════════════════════════════════════════
   EditProfileForm — always mounted, toggled via CSS
   ═══════════════════════════════════════════════ */
const EditProfileForm = ({ user, setUser, onClose, isVisible }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: user?.name || '', department: user?.department || '',
    rollNumber: user?.rollNumber || '', phone: user?.phone || ''
  });
  const nameRef = useRef(null);

  // Re-sync form data when user prop changes (e.g. after save)
  useEffect(() => {
    setData({
      name: user?.name || '', department: user?.department || '',
      rollNumber: user?.rollNumber || '', phone: user?.phone || ''
    });
  }, [user]);

  // Auto-focus name field when section opens
  useEffect(() => {
    if (isVisible && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: res } = await api.put('/auth/profile', data);
      setUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
      toast.success('Profile updated successfully');
      onClose();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mt-8 transition-all duration-400 ${isVisible ? 'block' : 'hidden'}`}>
      <GlassCard className="p-8" elevated>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center text-white">
            <User size={20} className="mr-2 text-purple-400" /> Personal Details
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-glass">Full Name</label>
            <input
              ref={nameRef}
              id="edit-name"
              type="text"
              className="input-glass"
              required
              autoComplete="name"
              value={data.name}
              onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-glass"><Briefcase size={14} className="inline mr-1" /> Department</label>
              <input
                id="edit-department"
                type="text"
                className="input-glass"
                autoComplete="organization"
                value={data.department}
                onChange={e => setData(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div>
              <label className="label-glass"><Hash size={14} className="inline mr-1" /> Roll Number</label>
              <input
                id="edit-rollnumber"
                type="text"
                className="input-glass"
                value={data.rollNumber}
                onChange={e => setData(prev => ({ ...prev, rollNumber: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label-glass"><Phone size={14} className="inline mr-1" /> Phone Number</label>
            <input
              id="edit-phone"
              type="text"
              className="input-glass"
              autoComplete="tel"
              value={data.phone}
              onChange={e => setData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-violet-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading 
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Save size={16} /> Save Changes</>}
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   ChangePasswordForm — always mounted, toggled via CSS
   All inputs are plain JSX (NOT inline sub-components)
   ═══════════════════════════════════════════════ */
const ChangePasswordForm = ({ onClose, isVisible }) => {
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const oldPwdRef = useRef(null);

  // Auto-focus first field when section opens
  useEffect(() => {
    if (isVisible && oldPwdRef.current) {
      setTimeout(() => oldPwdRef.current?.focus(), 100);
    }
  }, [isVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords don't match");
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword, newPassword
      });
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mt-8 transition-all duration-400 ${isVisible ? 'block' : 'hidden'}`}>
      <GlassCard className="p-8" elevated>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center text-white">
            <Shield size={20} className="mr-2 text-rose-400" /> Security
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="label-glass">Current Password</label>
            <div className="relative">
              <input
                ref={oldPwdRef}
                id="pwd-current"
                type={showOld ? 'text' : 'password'}
                required
                minLength={6}
                className="input-glass pl-4 pr-10"
                placeholder="••••••••"
                autoComplete="current-password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowOld(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="label-glass">New Password</label>
            <div className="relative">
              <input
                id="pwd-new"
                type={showNew ? 'text' : 'password'}
                required
                minLength={6}
                className="input-glass pl-4 pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowNew(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="label-glass">Confirm New Password</label>
            <div className="relative">
              <input
                id="pwd-confirm"
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={6}
                className="input-glass pl-4 pr-10"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowConfirm(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading 
                ? <div className="w-5 h-5 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                : 'Update Password'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   Profile — main page
   Both sections are always mounted (no unmount/remount).
   Visibility is toggled with CSS hidden/block.
   ═══════════════════════════════════════════════ */
const Profile = () => {
  const { user, setUser } = useAuth();
  const [activeSection, setActiveSection] = useState(null); // null | 'edit' | 'password'

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="max-w-2xl mx-auto pb-20">

      {/* Read-only profile card */}
      <ProfileCard user={user} activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Both sections are always in the DOM — toggled via CSS */}
      <EditProfileForm
        user={user}
        setUser={setUser}
        isVisible={activeSection === 'edit'}
        onClose={() => setActiveSection(null)}
      />

      <ChangePasswordForm
        isVisible={activeSection === 'password'}
        onClose={() => setActiveSection(null)}
      />
    </motion.div>
  );
};

export default Profile;
