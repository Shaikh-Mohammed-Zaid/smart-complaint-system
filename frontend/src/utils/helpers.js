import { format, formatDistanceToNow } from 'date-fns';

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '';
  return format(new Date(dateString), formatStr);
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const getCategoryEmoji = (category) => {
  const map = {
    'Classroom Issues': '🏫',
    'Lab Equipment Problems': '🔬',
    'WiFi / Network Issues': '📶',
    'Hostel Complaints': '🏠',
    'Library Issues': '📚',
    'Cleanliness Issues': '🧹',
    'Other': '📋'
  };
  return map[category] || '📋';
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  const base = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000';
  return `${base}${imagePath}`;
};
