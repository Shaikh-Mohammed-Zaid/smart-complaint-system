import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ThumbsUp, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { getInitials, timeAgo, getCategoryEmoji, getImageUrl } from '../../utils/helpers';
import { StatusBadge, PriorityBadge } from './Badges';
import { Link } from 'react-router-dom';
import { useTrendingScore } from '../../hooks/useTrendingScore';

const ComplaintCard3D = ({ complaint, onVote, isTrending = false, rank = 0 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Compute trend score live from votes + age so it's never stale (DB value starts at 0)
  const liveTrendScore = useTrendingScore(
    complaint.votes || 0,
    complaint.createdAt || complaint.created_at
  );

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const complaintId = complaint._id || complaint.id;

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="h-full"
    >
      <Link to={`/complaints/${complaintId}`} className="block h-full group">
        <div className="relative h-full glass-card hover:glass-card-elevated hover:glow-brand transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden">
          
          {/* Animated Mesh Background specifically inside the card */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mesh-bg pointer-events-none z-0" />
          
          <div className="relative z-10">
            {isTrending && rank > 0 && (
              <div className="absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-bl-full shadow-lg flex items-center justify-center opacity-90 transform group-hover:scale-110 transition-transform">
                <span className="text-xl font-bold text-white pt-1 pl-1">#{rank}</span>
              </div>
            )}

            <div className="flex items-start justify-between mb-4 mt-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
              <span className="text-xs text-white/40 flex items-center bg-white/5 px-2 py-1 rounded-full">
                <Clock size={12} className="mr-1" />
                {timeAgo(complaint.createdAt || complaint.created_at)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
              {complaint.title}
            </h3>
            
            <p className="text-sm text-white/60 mb-4 line-clamp-3">
              {complaint.description}
            </p>

            {(complaint.imageUrl || complaint.image) && (
              <div className="w-full h-32 rounded-lg overflow-hidden mb-4 border border-white/5 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src={getImageUrl(complaint.imageUrl || complaint.image)} 
                  alt="Complaint" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/70 border border-white/5 flex items-center">
                <span className="mr-1.5">{getCategoryEmoji(complaint.category)}</span>
                {complaint.category}
              </span>
              {complaint.tags?.map(tag => (
                <span key={tag} className="text-xs text-white/40 px-2 py-1">#{tag}</span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold ring-2 ring-white/10 shrink-0">
                  {getInitials(complaint.createdBy?.name)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white/80 font-medium truncate max-w-[100px]">
                    {complaint.createdBy?.name || 'Unknown'}
                  </span>
                  {complaint.createdBy?.department && (
                    <span className="text-xs text-white/40 truncate max-w-[100px]">{complaint.createdBy.department}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isTrending ? (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-white/50 mb-0.5">Trend Score</span>
                    <span className="flex items-center text-sm font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                      <TrendingUp size={14} className="mr-1" />
                      ↑ {Math.min(100, Math.round((liveTrendScore / 17.68) * 100))}%
                    </span>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={(e) => { e.preventDefault(); onVote && onVote(complaintId); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                        complaint.hasVoted 
                          ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 glow-brand' 
                          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <ThumbsUp size={16} className={complaint.hasVoted ? 'fill-indigo-400' : ''} />
                      <span className="font-medium text-sm">{complaint.votes || 0}</span>
                    </button>
                    {complaint.commentCount !== undefined && (
                      <div className="flex items-center gap-1.5 text-white/50">
                        <MessageSquare size={16} />
                        <span className="text-sm">{complaint.commentCount}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  );
};

export default ComplaintCard3D;
