const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintFeed,
  getComplaintTrending,
  getComplaint,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getPublicComplaints } = require('../controllers/publicComplaintController');

// Important order: /public, /feed and /trending must precede /:id
router.get('/public', protect, getPublicComplaints);
router.get('/feed', protect, getComplaintFeed);
router.get('/trending', protect, getComplaintTrending);

router.post('/', protect, upload.single('image'), createComplaint);
router.get('/', protect, getComplaints);

router.get('/:id', protect, getComplaint);
router.put('/:id', protect, adminOnly, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
