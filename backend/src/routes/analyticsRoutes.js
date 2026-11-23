const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/metrics', analyticsController.getModelMetrics);
router.get('/colab-metrics', analyticsController.getColabMetrics);
router.get('/eda', analyticsController.getEDAData);
router.get('/visualizations/:filename', analyticsController.getVisualization);

module.exports = router;
