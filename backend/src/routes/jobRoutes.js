const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.get('/', jobController.getJobs);
router.post('/match', protect, jobController.matchResumeToJob);
router.get('/matches', protect, jobController.getUserMatches);
router.get('/matches/:id', protect, jobController.getMatchById);

module.exports = router;
