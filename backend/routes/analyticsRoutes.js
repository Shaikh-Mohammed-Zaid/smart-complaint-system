const express = require('express');
const router = express.Router();
const { getAnalytics, getStudentAnalytics } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAnalytics);
router.get('/student', protect, getStudentAnalytics);

module.exports = router;
