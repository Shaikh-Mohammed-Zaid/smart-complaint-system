import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { STATUSES, PRIORITIES, getCategoryIcon, formatDateTime, timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ status: '', priority: '', adminNote: '' });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, cmRes] = await Promise.all([
          API.get(`/complaints/${id}`),
          API.get(`/comments/${id}`),
        ]);
        const c = cRes.data.complaint;
        setComplaint(c);
        setForm({ status: c.status, priority: c.priority, adminNote: c.adminNote || '' });
        setComments(cmRes.data.comments);
      } catch {
        toast.error('Failed to load complaint');
        navigate('/admin/complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await API.put(`/complaints/${id}`, form);
      setComplaint(data.complaint);
      toast.success('Complaint updated successfully');
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await API.post(`/comments/${id}`, { comment: newComment });
      setComments(c => [...c, data.comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(c => c.filter(cm => cm._id !== commentId));
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner text="Loading complaint..." />;
  if (!complaint) return null;

  const IMAGE_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || '';

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Complaints
      </button>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: Complaint info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {complaint.image && (
              <img src={`${IMAGE_BASE}${complaint.image}`} alt="" className="w-full h-52 object-cover" onError={e => e.target.style.display='none'} />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getCategoryIcon(complaint.category)}</span>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{complaint.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{complaint.category} • {complaint.location}</p>
                  </div>
                </div>
                <StatusBadge status={complaint.status} />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Submitted By</p>
                  <p className="font-medium text-gray-900">{complaint.createdBy?.name}</p>
                  <p className="text-xs text-gray-500">{complaint.createdBy?.email}</p>
                  <p className="text-xs text-gray-500">{complaint.createdBy?.department} • {complaint.createdBy?.rollNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Details</p>
                  <p className="text-xs text-gray-600">Submitted: {formatDateTime(complaint.createdAt)}</p>
                  {complaint.resolvedAt && <p className="text-xs text-gray-600">Resolved: {formatDateTime(complaint.resolvedAt)}</p>}
                  <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    {complaint.votes} upvotes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Comments ({comments.length})</h2>
            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map(c => (
                  <div key={c._id} className={`flex gap-3 ${c.isAdminComment ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.isAdminComment ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {c.userId?.name?.charAt(0) || '?'}
                    </div>
                    <div className={`flex-1 max-w-sm ${c.isAdminComment ? 'flex flex-col items-end' : ''}`}>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm ${c.isAdminComment ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {c.comment}
                      </div>
                      <div className={`flex items-center gap-2 mt-1 text-xs text-gray-400 ${c.isAdminComment ? 'justify-end' : ''}`}>
                        <span>{c.userId?.name}</span>
                        {c.isAdminComment && <span className="text-indigo-400 font-medium">Admin</span>}
                        <span>{timeAgo(c.createdAt)}</span>
                        <button onClick={() => deleteComment(c._id)} className="text-red-400 hover:text-red-600">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleComment} className="flex gap-3">
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add admin comment..." className="input flex-1" />
              <button type="submit" disabled={!newComment.trim()} className="btn-primary px-4">Post</button>
            </form>
          </div>
        </div>

        {/* Right: Update panel */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
            <h2 className="font-bold text-gray-900 mb-5">Update Complaint</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="label">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input">
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Admin Note</label>
                <textarea
                  value={form.adminNote}
                  onChange={e => setForm(f => ({ ...f, adminNote: e.target.value }))}
                  placeholder="Add a note for the student..."
                  className="input h-24 resize-none"
                  maxLength={500}
                />
              </div>
              <button type="submit" disabled={updating} className="btn-primary w-full">
                {updating ? 'Updating...' : 'Save Changes'}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Current Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <StatusBadge status={complaint.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Priority</span>
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
