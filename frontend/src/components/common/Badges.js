import React from 'react';

export const StatusBadge = ({ status }) => {
  const config = {
    'Pending': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-400' },
    'In Progress': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400', animate: true },
    'Resolved': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-400' },
    'Rejected': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  };

  const style = config[status] || config['Pending'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className="relative flex h-2 w-2 mr-1.5">
        {style.animate && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`}></span>
      </span>
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const config = {
    'Low': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', emoji: '🟢' },
    'Medium': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', emoji: '🟡' },
    'High': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', emoji: '🟠' },
    'Critical': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', emoji: '🔴' },
  };

  const style = config[priority] || config['Medium'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      <span className="mr-1">{style.emoji}</span>
      {priority}
    </span>
  );
};
