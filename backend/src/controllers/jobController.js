const axios = require('axios');
const JobMatch = require('../models/JobMatch');
const Resume = require('../models/Resume');
const Job = require('../models/Job');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

exports.getJobs = async (req, res) => {
  try {
    const { query = '', category = '', limit = 25 } = req.query;
    const response = await axios.get(`${ML_SERVICE_URL}/api/ml/jobs`, {
      params: { query, category, limit }
    });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch jobs from ML service.' });
  }
};

exports.matchResumeToJob = async (req, res) => {
  try {
    const { resumeId, jobId, jobTitle, jobDescription, customWeights } = req.body;

    let resume;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } else {
      resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'No resume found. Please upload a resume before matching against jobs.'
      });
    }

    const resumeSkills = resume.extractedSkills.map(s => s.canonical);

    // Call ML Service to calculate match and ATS score
    const atsResponse = await axios.post(`${ML_SERVICE_URL}/api/ml/ats-score`, {
      resume_text: resume.rawText,
      job_description: jobDescription,
      resume_skills: resumeSkills,
      job_required_skills: [],
      custom_weights: customWeights || null
    });

    const atsData = atsResponse.data.data;

    // Save match result in MongoDB
    const jobMatch = await JobMatch.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobId: String(jobId || 'custom-job'),
      jobTitle: jobTitle || 'Target Position',
      compatibilityScore: atsData.overall_ats_score,
      semanticScore: atsData.breakdown.semantic_relevance,
      skillCoverageScore: atsData.breakdown.skill_match,
      matchedSkills: atsData.matched_skills,
      missingSkills: atsData.missing_skills,
      atsBreakdown: atsData.breakdown,
      recommendations: atsData.recommendations
    });

    return res.status(200).json({
      status: 'success',
      data: jobMatch,
      atsDetails: atsData
    });
  } catch (error) {
    console.error('Error matching resume to job:', error.response?.data || error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to compute job match.' });
  }
};

exports.getUserMatches = async (req, res) => {
  try {
    const matches = await JobMatch.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({
      status: 'success',
      count: matches.length,
      data: matches
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getMatchById = async (req, res) => {
  try {
    const match = await JobMatch.findOne({ _id: req.params.id, userId: req.user._id });
    if (!match) {
      return res.status(404).json({ status: 'error', message: 'Match record not found.' });
    }
    return res.status(200).json({ status: 'success', data: match });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
