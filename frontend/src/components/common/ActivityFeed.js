import React from 'react';
import { timeAgo } from '../../utils/helpers';
import GlassCard from './GlassCard';
import { MessageSquare, AlertTriangle, UserPlus, ThumbsUp, Activity } from 'lucide-react';

const ActivityFeed = ({ activities = [] }) => {
  const getIcon = (action) => {
    if (action.includes('comment')) return <MessageSquare size={16} className="text-blue-400" />;
    if (action.includes('status')) return <AlertTriangle size={16} className="text-yellow-400" />;
    if (action.includes('user')) return <UserPlus size={16} className="text-green-400" />;
    if (action.includes('vote')) return <ThumbsUp size={16} className="text-indigo-400" />;
    return <Activity size={16} className="text-rose-400" />;
  };

  const getMessage = (a) => {
    switch (a.action) {
      case 'complaint_created': return `Created a new complaint.`;
      case 'status_updated': return `Changed status from ${a.metadata?.from} to ${a.metadata?.to}.`;
      case 'comment_added': return `Commented on a complaint.`;
      case 'vote_added': return `Upvoted a complaint.`;
      case 'user_registered': return `Joined the platform.`;
      default: return `Performed an action.`;
    }
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center">
        <Activity size={20} className="mr-2 text-indigo-400" />
        Live Activity Feed
      </h3>
      
      {activities.length === 0 ? (
        <p className="text-sm text-white/50 text-center py-6">No recent activity.</p>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {activities.map((activity, index) => (
            <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-[#16162a] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
                {getIcon(activity.action)}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-sm text-white">{activity.userId?.name || 'Unknown User'}</div>
                  <div className="text-[10px] sm:text-xs text-white/40">{timeAgo(activity.createdAt)}</div>
                </div>
                <div className="text-xs text-white/60 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {getMessage(activity)}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default ActivityFeed;
