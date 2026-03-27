const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Classroom Issues',
      'Lab Equipment Problems',
      'WiFi / Network Issues',
      'Hostel Complaints',
      'Library Issues',
      'Cleanliness Issues',
      'Other'
    ]
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  suggestedPriority: {
    type: String,
    default: ''
  },
  votes: {
    type: Number,
    default: 0
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  adminNote: {
    type: String,
    default: '',
    maxlength: [500, 'Admin note cannot exceed 500 characters']
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Indexes for query optimization
complaintSchema.index({ createdBy: 1, status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ trendingScore: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
