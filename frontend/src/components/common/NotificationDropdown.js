import React from 'react';
import { motion } from 'framer-motion';
import { Check, Bell, AlertCircle, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAsRead, markAllRead } = useNotification();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch(type) {
      case 'status_update': return <AlertCircle size={16} className="text-yellow-400" />;
      case 'new_comment': return <MessageSquare size={16} className="text-blue-400" />;
      case 'vote_milestone': return <TrendingUp size={16} className="text-indigo-400" />;
      case 'resolution': return <CheckCircle size={16} className="text-green-400" />;
      default: return <Bell size={16} className="text-white/60" />;
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
    if (n.complaintId) {
      navigate(`/complaints/${n.complaintId}`);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute right-0 mt-3 w-80 sm:w-96 glass-card-elevated shadow-2xl overflow-hidden z-50 origin-top-right"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <h3 className="font-bold text-white flex items-center">
          <Bell size={16} className="mr-2" />
          Notifications
        </h3>
        {notifications.length > 0 && (
          <button 
            onClick={markAllRead} 
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center"
          >
            <Check size={14} className="mr-1" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-white/50 flex flex-col items-center">
            <Bell size={32} className="mb-3 opacity-20" />
            <p>You have no new notifications.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors flex gap-3
                  ${n.isRead ? 'hover:bg-white/5 opacity-60' : 'bg-indigo-500/5 hover:bg-indigo-500/10'}
                `}
              >
                <div className="mt-1 shrink-0 p-2 rounded-full bg-white/5 h-fit">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm mb-1 ${n.isRead ? 'text-white/80 font-medium' : 'text-white font-bold'}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs text-white/60 line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-white/40 mt-2 block">{timeAgo(n.createdAt)}</span>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationDropdown;
