const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  isAdminComment: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Sort queries by created date for UI list timeline
commentSchema.index({ complaintId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
