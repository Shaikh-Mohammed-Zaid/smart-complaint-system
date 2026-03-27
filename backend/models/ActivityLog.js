const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  entityType: {
    type: String,
    enum: ['complaint', 'user', 'comment', 'vote'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Required Indexes
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ entityId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
