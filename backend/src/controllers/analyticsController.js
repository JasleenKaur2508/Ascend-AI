const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

exports.getColabMetrics = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/ml/colab-metrics`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch Colab evaluation metrics.' });
  }
};

exports.getModelMetrics = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/ml/model-metrics`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch model metrics.' });
  }
};

exports.getEDAData = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/api/ml/eda`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch EDA data.' });
  }
};

exports.getVisualization = async (req, res) => {
  try {
    const { filename } = req.params;
    const response = await axios.get(`${ML_SERVICE_URL}/api/ml/visualizations/${filename}`, {
      responseType: 'stream'
    });
    res.setHeader('Content-Type', 'image/png');
    response.data.pipe(res);
  } catch (error) {
    return res.status(404).json({ status: 'error', message: 'Visualization not found.' });
  }
};
