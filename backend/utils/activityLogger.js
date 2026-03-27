const ActivityLog = require('../models/ActivityLog');

/**
 * Helper to log an activity action
 * @param {ObjectId} userId - ID of the user performing the action
 * @param {String} action - Action string (e.g. 'complaint_created')
 * @param {String} entityType - Type of entity (e.g. 'complaint')
 * @param {ObjectId} entityId - ID of the entity affected
 * @param {Object} metadata - Useful extra properties (e.g. { from: 'Pending', to: 'InProgress' })
 */
const logActivity = async (userId, action, entityType, entityId, metadata = {}) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entityType,
      entityId,
      metadata
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logging activity:', error.message);
    }
  }
};

module.exports = { logActivity };
