import React, { useEffect } from 'react';
import { StatusBadge, PriorityBadge } from './Badges';
import { format } from 'date-fns';

export default function ComplaintDetailModal({ complaint, onClose }) {
  const IMAGE_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || '';

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const categoryIcons = {
    'Classroom Issues':       '🏫',
    'Lab Equipment Problems': '🔬',
    'WiFi / Network Issues':  '📶',
    'Hostel Complaints':      '🏠',
    'Library Issues':         '📚',
    'Cleanliness Issues':     '🧹',
    'Other':                  '📋',
  };

  const imageUrl = complaint.imageUrl || complaint.image;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal panel — stop propagation so clicking inside doesn't close */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{categoryIcons[complaint.category] || '📋'}</span>
              <h2 className="text-xl font-bold text-gray-900 leading-tight truncate">
                {complaint.title}
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              {complaint.category} · {complaint.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Status + Priority + Votes + Date */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {complaint.votes || 0} upvotes
            </span>
            <span className="text-sm text-gray-400 ml-auto">
              {format(new Date(complaint.createdAt), 'MMM dd, yyyy · hh:mm a')}
            </span>
          </div>

          {/* Image (conditional) */}
          {imageUrl && (
            <div
              className="rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => window.open(`${IMAGE_BASE}${imageUrl}`, '_blank')}
              title="Click to view full image"
            >
              <img
                src={`${IMAGE_BASE}${imageUrl}`}
                alt="Complaint attachment"
                className="w-full max-h-64 object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Category',    complaint.category],
              ['Location',    complaint.location],
              ['Status',      complaint.status],
              ['Priority',    complaint.priority],
              ['Reported By', complaint.reporterName || 'Anonymous'],
              ['Department',  complaint.department   || '—'],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Footer — Close ONLY, zero action buttons */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Read only
          </span>
          <button onClick={onClose} className="btn-secondary text-sm">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
