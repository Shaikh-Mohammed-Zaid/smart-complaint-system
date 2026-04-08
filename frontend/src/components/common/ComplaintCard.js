import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './Badges';
import { getCategoryIcon, timeAgo, truncate } from '../../utils/helpers';

export default function ComplaintCard({ complaint, linkPrefix = '/complaint', showActions, onVote, currentUserId }) {
  const complaintId = complaint._id || complaint.id;
  const canVote = complaint.createdBy?._id !== currentUserId;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {(complaint.imageUrl || complaint.image) && (
        <div className="h-40 overflow-hidden bg-gray-100">
          <img
            src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || ''}${complaint.imageUrl || complaint.image}`}
            alt="Complaint"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{getCategoryIcon(complaint.category)}</span>
            <div className="min-w-0">
              <Link
                to={`${linkPrefix}/${complaintId}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm leading-tight block truncate"
              >
                {complaint.title}
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">{complaint.category}</p>
            </div>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
          {truncate(complaint.description, 120)}
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{complaint.location}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={complaint.priority} />
            <span className="text-xs text-gray-400">{timeAgo(complaint.createdAt || complaint.created_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            {onVote && canVote && (
              <button
                onClick={() => onVote(complaintId)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  complaint.hasVoted
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill={complaint.hasVoted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {complaint.votes}
              </button>
            )}
            {!onVote && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                {complaint.votes}
              </div>
            )}
            <Link
              to={`${linkPrefix}/${complaintId}`}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
