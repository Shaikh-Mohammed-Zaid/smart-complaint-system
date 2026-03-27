import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';
import { getInitials, formatDate, timeAgo, getImageUrl } from '../../utils/helpers';
import LoadingScreen from '../../components/common/LoadingScreen';
import GlassCard from '../../components/common/GlassCard';
import { ArrowLeft, Send, Trash2, Clock, MapPin, Tag, AlertTriangle } from 'lucide-react';
import { pageVariants, fadeInUp } from '../../utils/animations';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComplaintAndComments = async () => {
    try {
      const [compRes, commRes] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get(`/comments/${id}`)
      ]);
      setComplaint(compRes.data.data);
      setComments(commRes.data.data);
    } catch (err) {
      toast.error('Complaint not found or unauthorized');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintAndComments();

    if (socket) {
      socket.emit('join_complaint', id);

      socket.on('new_comment', (comment) => {
        setComments((prev) => [...prev, comment]);
      });

      socket.on('complaint_updated', (updated) => {
        setComplaint(prev => ({ ...prev, ...updated }));
      });
      
      socket.on('vote_update', (data) => {
        if(data.complaintId === id) {
           setComplaint(prev => ({ ...prev, votes: data.votes }));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new_comment');
        socket.off('complaint_updated');
        socket.off('vote_update');
      }
    };
    // eslint-disable-next-line
  }, [id, socket]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/comments/${id}`, { comment: newComment });
      setNewComment('');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if(window.confirm("Are you sure you want to delete this complaint? This cannot be undone.")) {
      try {
        await api.delete(`/complaints/${id}`);
        toast.success("Complaint deleted successfully");
        navigate('/student/dashboard');
      } catch (err) {
        toast.error("Failed to delete complaint");
      }
    }
  };

  if (loading) return <LoadingScreen text="Loading details..." />;
  if (!complaint) return null;

  const isOwner = user._id === complaint.createdBy?._id;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto pb-20">
      
      <button onClick={() => navigate(-1)} className="flex items-center text-white/60 hover:text-white mb-6 group transition-colors">
        <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8" elevated>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative">
              <div className="flex items-center gap-3">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
              
              {isOwner && complaint.status === 'Pending' && (
                <button onClick={handleDelete} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20 absolute top-0 right-0 lg:static">
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">{complaint.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center"><MapPin size={16} className="mr-2 text-cyan-400" /> {complaint.location}</div>
              <div className="flex items-center"><Clock size={16} className="mr-2 text-indigo-400" /> {formatDate(complaint.createdAt, 'PPp')}</div>
              <div className="flex items-center"><Tag size={16} className="mr-2 text-purple-400" /> {complaint.category}</div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 leading-relaxed text-lg whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {complaint.image && (
              <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 cursor-pointer group">
                <img 
                  src={getImageUrl(complaint.image)} 
                  alt="Attachment" 
                  className="w-full max-h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" 
                  onClick={() => window.open(getImageUrl(complaint.image), '_blank')}
                />
              </div>
            )}
          </GlassCard>

          {/* Comments Section */}
          <GlassCard className="p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center">
              Discussion 
              <span className="ml-3 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">{comments.length}</span>
            </h3>

            <div className="space-y-6 mb-8 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {comments.map((comment) => {
                const isMe = comment.userId._id === user._id;
                const isAdmin = comment.isAdminComment;

                return (
                  <motion.div key={comment._id} variants={fadeInUp} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border
                      ${isAdmin ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 
                        isMe ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/10 text-white/70 border-white/20'}`}
                    >
                      {getInitials(comment.userId.name)}
                    </div>
                    
                    <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white/80">{comment.userId.name}</span>
                        {isAdmin && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest font-bold">Admin</span>}
                        <span className="text-xs text-white/40">{timeAgo(comment.createdAt)}</span>
                      </div>
                      
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isAdmin ? 'bg-amber-500/10 border border-amber-500/20 text-white/90 rounded-tl-none' :
                        isMe ? 'bg-indigo-500 text-white rounded-tr-none shadow-lg glow-brand' : 
                        'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                      }`}>
                        {comment.comment}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {comments.length === 0 && (
                <div className="text-center py-10 text-white/40">No comments yet. Be the first to start the discussion!</div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative mt-auto">
              <input
                type="text"
                placeholder="Write a comment..."
                className="input-glass w-full pr-14 py-4 rounded-2xl bg-[#0f0f1a]/50"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className="-ml-0.5 mt-0.5" />
              </button>
            </form>
          </GlassCard>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-t-4 border-t-indigo-500">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-6">Reporter Details</h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                 {getInitials(complaint.createdBy?.name)}
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{complaint.createdBy?.name}</h4>
                <p className="text-xs text-white/60">{complaint.createdBy?.department} • {complaint.createdBy?.rollNumber}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <span className="text-xs text-white/40 block mb-1">Email via University Portal</span>
                <span className="text-sm text-indigo-300 font-mono truncate block">{complaint.createdBy?.email}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-sm text-white/60">Total Views</span>
                <span className="font-bold text-white">{complaint.viewCount}</span>
              </div>
            </div>
          </GlassCard>

          {complaint.adminNote && (
            <GlassCard className="p-6 border-t-4 border-t-amber-500 bg-amber-500/5">
              <h3 className="text-sm font-semibold text-amber-500/80 uppercase tracking-wider mb-4 flex items-center">
                <AlertTriangle size={16} className="mr-2" /> Admin Resolution Note
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">{complaint.adminNote}</p>
              {complaint.resolvedAt && (
                <span className="block mt-4 text-xs text-white/40">Resolved on {formatDate(complaint.resolvedAt)}</span>
              )}
            </GlassCard>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default ComplaintDetail;
