const mongoose = require('mongoose');

const recruiterCandidateSchema = new mongoose.Schema({
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: false
  },
  jobTitle: {
    type: String,
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: String,
  predictedCategory: String,
  predictionConfidence: Number,
  atsScore: {
    type: Number,
    required: true
  },
  skillMatchPct: Number,
  semanticScore: Number,
  matchedSkills: [String],
  missingSkills: [String],
  status: {
    type: String,
    enum: ['Screened', 'Shortlisted', 'Interviewing', 'Rejected', 'Hired'],
    default: 'Screened'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RecruiterCandidate', recruiterCandidateSchema);
