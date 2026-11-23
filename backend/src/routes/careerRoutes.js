const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { protect } = require('../middleware/auth');

router.post('/courses', protect, careerController.getCourseRecommendations);
router.patch('/courses/:id/toggle', protect, careerController.toggleCourseCompletion);

router.get('/roadmap', protect, careerController.getCareerRoadmap);
router.patch('/roadmap/toggle-task', protect, careerController.toggleRoadmapTask);

router.post('/interview/questions', protect, careerController.getInterviewQuestions);
router.patch('/interview/toggle-practice', protect, careerController.toggleInterviewPractice);

router.post('/enhance-summary', protect, careerController.enhanceResumeSummary);

module.exports = router;
