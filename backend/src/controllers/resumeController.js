const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Resume = require('../models/Resume');
const User = require('../models/User');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

exports.uploadAndAnalyze = async (req, res) => {
  try {
    let mlResponse;

    if (req.file) {
      if (!fs.existsSync(req.file.path) || req.file.size === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'The uploaded resume file is empty (0 bytes). Please upload a valid document.'
        });
      }

      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const form = new FormData();
        form.append('file', fileBuffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype || 'application/octet-stream'
        });

        mlResponse = await axios.post(`${ML_SERVICE_URL}/api/ml/analyze-resume`, form, {
          headers: {
            ...form.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 90000
        });
      } finally {
        try {
          if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (cleanupErr) {
          // ignore cleanup warning
        }
      }
    } else if (req.body.raw_text) {
      const form = new FormData();
      form.append('raw_text', req.body.raw_text);

      mlResponse = await axios.post(`${ML_SERVICE_URL}/api/ml/analyze-resume`, form, {
        headers: {
          ...form.getHeaders()
        },
        timeout: 30000
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload a PDF/DOCX resume file or provide resume text.'
      });
    }

    const mlData = mlResponse.data.data;

    // Save to MongoDB
    const resumeDoc = await Resume.create({
      userId: req.user._id,
      filename: req.file ? req.file.originalname : 'Pasted Text Resume',
      candidateName: mlData.candidate_name,
      ocrApplied: mlData.ocr_applied || false,
      rawText: mlData.raw_text,
      predictedCategory: mlData.predicted_category,
      predictionConfidence: mlData.prediction_confidence,
      topPredictions: mlData.top_predictions,
      extractedSkills: mlData.extracted_skills,
      skillCount: mlData.skill_count,
      statistics: mlData.statistics,
      contactInfo: mlData.contact_info,
      education: mlData.education,
      experienceHighlights: mlData.experience_highlights,
      strengths: mlData.strengths,
      areasForImprovement: mlData.areas_for_improvement
    });

    // Update user's profile with latest extracted skills & category
    const extractedSkillNames = mlData.extracted_skills.map(s => s.canonical);
    await User.findByIdAndUpdate(req.user._id, {
      headline: `${mlData.predicted_category} Specialist`,
      skills: extractedSkillNames.slice(0, 15),
      profileCompleted: true
    });

    return res.status(201).json({
      status: 'success',
      resumeId: resumeDoc._id,
      data: resumeDoc
    });
  } catch (error) {
    console.error('Error analyzing resume:', error.response?.data || error.message);
    const detailMsg = error.response?.data?.detail || error.response?.data?.message;
    return res.status(error.response?.status || 500).json({
      status: 'error',
      message: detailMsg || 'Failed to process and analyze resume. Verify that the Python ML service is running.'
    });
  }
};

exports.getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getLatestResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'No resume found for this user. Please upload a resume first.'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: resume
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ status: 'error', message: 'Resume not found.' });
    }
    return res.status(200).json({ status: 'success', data: resume });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
