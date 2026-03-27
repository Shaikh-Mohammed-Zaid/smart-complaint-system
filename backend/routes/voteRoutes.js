const express = require('express');
const router = express.Router();
const { toggleVote, getVoteStatus } = require('../controllers/voteController');
const { protect } = require('../middleware/auth');

router.post('/:complaintId', protect, toggleVote);
router.get('/:complaintId', protect, getVoteStatus);

module.exports = router;
