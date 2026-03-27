import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { getInitials, formatDate } from '../../utils/helpers';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'Physics', 'Mathematics', 'MBA', 'Other'];

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', rollNumber: user?.rollNumber || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePwChange = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await API.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar & basic info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </span>
              {user?.department && <span className="text-xs text-gray-400">{user.department}</span>}
            </div>
          </div>
        </div>

        {/* Details grid */}
        {!editMode ? (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                ['Full Name', user?.name],
                ['Email', user?.email],
                ['Department', user?.department || '—'],
                ['Roll Number', user?.rollNumber || '—'],
                ['Phone', user?.phone || '—'],
                ['Member Since', formatDate(user?.createdAt)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-sm text-gray-900 mt-0.5 font-medium">{value}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setEditMode(true)} className="btn-primary text-sm">Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="label">Department</label>
                <select name="department" value={form.department} onChange={handleChange} className="input">
                  <option value="">Select</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Roll Number</label>
                <input name="rollNumber" value={form.rollNumber} onChange={handleChange} className="input" />
              </div>
              <div className="col-span-2">
                <label className="label">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditMode(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-5">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" name="currentPassword" value={pwForm.currentPassword} onChange={handlePwChange} className="input" placeholder="••••••••" required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} className="input" placeholder="Min. 6 characters" required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" name="confirmPassword" value={pwForm.confirmPassword} onChange={handlePwChange} className="input" placeholder="Repeat new password" required />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary">{pwLoading ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  );
}
