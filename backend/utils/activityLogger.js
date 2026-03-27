const supabase = require('../config/supabase');

const logActivity = async (userId, action, entityType, entityId, metadata = {}) => {
  try {
    await supabase.from('activity_logs').insert([{
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      metadata
    }]);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logging activity:', error.message);
    }
  }
};

module.exports = { logActivity };
