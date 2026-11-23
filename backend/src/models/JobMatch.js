const mongoose = require('mongoose');

const jobMatchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobId: {
    type: String,
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  compatibilityScore: {
    type: Number,
    required: true
  },
  semanticScore: Number,
  skillCoverageScore: Number,
  matchedSkills: [String],
  missingSkills: [String],
  atsBreakdown: {
    skill_match: Number,
    semantic_relevance: Number,
    keyword_overlap: Number,
    qualification_relevance: Number,
    experience_relevance: Number
  },
  recommendations: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('JobMatch', jobMatchSchema);
