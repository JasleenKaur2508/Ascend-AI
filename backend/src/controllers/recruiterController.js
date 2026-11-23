const axios = require('axios');
const Job = require('../models/Job');
const RecruiterCandidate = require('../models/RecruiterCandidate');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

exports.createJob = async (req, res) => {
  try {
    const { title, description, category, requiredSkills, experienceLevel, location } = req.body;
    if (!title || !description) {
      return res.status(400).json({ status: 'error', message: 'Job title and description are required.' });
    }

    const job = await Job.create({
      title,
      description,
      category: category || 'Software Development',
      requiredSkills: requiredSkills || [],
      experienceLevel: experienceLevel || 'Mid-Level',
      location: location || 'Remote / Hybrid',
      postedBy: req.user._id
    });

    return res.status(201).json({ status: 'success', data: job });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', count: jobs.length, data: jobs });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.batchScreenCandidates = async (req, res) => {
  try {
    const { jobId, jobTitle, jobDescription, candidates } = req.body;

    if (!jobDescription || !candidates || candidates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Job description and at least one candidate resume are required.'
      });
    }

    // Call ML Microservice batch screening
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/batch-screening`, {
      job_id: null,
      job_title: jobTitle || 'Target Position',
      job_description: jobDescription,
      candidates: candidates.map((c, i) => ({
        candidate_id: c.candidate_id || `cand-${i+1}`,
        candidate_name: c.candidate_name || `Applicant ${i+1}`,
        resume_text: c.resume_text
      }))
    });

    const rankedData = response.data;

    // Persist ranked candidates in MongoDB
    const savedRecords = [];
    for (const c of rankedData.ranked_candidates) {
      const record = await RecruiterCandidate.create({
        recruiterId: req.user._id,
        jobId: jobId || null,
        jobTitle: jobTitle || 'Target Position',
        candidateName: c.candidate_name,
        predictedCategory: c.predicted_category,
        predictionConfidence: c.prediction_confidence,
        atsScore: c.ats_score,
        skillMatchPct: c.skill_match_pct,
        semanticScore: c.semantic_score,
        matchedSkills: c.matched_skills,
        missingSkills: c.missing_skills,
        status: 'Screened'
      });
      savedRecords.push(record);
    }

    return res.status(200).json({
      status: 'success',
      jobTitle: rankedData.job_title,
      totalScreened: rankedData.total_screened,
      requiredSkills: rankedData.required_skills,
      rankedCandidates: rankedData.ranked_candidates,
      fairHiringSafeguard: "This automated ranking is a decision-support heuristic based on skills and semantic text alignment. Final evaluation should always include holistic human review."
    });
  } catch (error) {
    console.error('Error in batch screening:', error.response?.data || error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to complete candidate batch screening.' });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const { jobId, status, category } = req.query;
    const filter = { recruiterId: req.user._id };
    if (jobId) filter.jobId = jobId;
    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.predictedCategory = category;

    const candidates = await RecruiterCandidate.find(filter).sort({ atsScore: -1 });
    return res.status(200).json({ status: 'success', count: candidates.length, data: candidates });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const candidate = await RecruiterCandidate.findOne({ _id: req.params.id, recruiterId: req.user._id });
    if (!candidate) {
      return res.status(404).json({ status: 'error', message: 'Candidate record not found.' });
    }

    if (status) candidate.status = status;
    if (notes !== undefined) candidate.notes = notes;
    await candidate.save();

    return res.status(200).json({ status: 'success', data: candidate });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.exportCandidatesCSV = async (req, res) => {
  try {
    const candidates = await RecruiterCandidate.find({ recruiterId: req.user._id }).sort({ atsScore: -1 });

    const headers = ["Rank", "Candidate Name", "Predicted Category", "ATS Score", "Skill Match %", "Matched Skills", "Missing Skills", "Status"];
    const rows = candidates.map((c, i) => [
      i + 1,
      `"${c.candidateName}"`,
      `"${c.predictedCategory}"`,
      c.atsScore,
      `${c.skillMatchPct}%`,
      `"${(c.matchedSkills || []).join('; ')}"`,
      `"${(c.missingSkills || []).join('; ')}"`,
      `"${c.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ascend_ranked_candidates.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
