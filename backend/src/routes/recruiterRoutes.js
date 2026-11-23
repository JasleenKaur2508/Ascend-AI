const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/jobs', protect, restrictTo('recruiter'), recruiterController.createJob);
router.get('/jobs', protect, restrictTo('recruiter'), recruiterController.getRecruiterJobs);
router.post('/screen', protect, restrictTo('recruiter'), recruiterController.batchScreenCandidates);
router.get('/candidates', protect, restrictTo('recruiter'), recruiterController.getCandidates);
router.patch('/candidates/:id', protect, restrictTo('recruiter'), recruiterController.updateCandidateStatus);
router.get('/export-csv', protect, restrictTo('recruiter'), recruiterController.exportCandidatesCSV);

module.exports = router;
