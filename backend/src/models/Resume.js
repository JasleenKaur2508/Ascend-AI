const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  candidateName: {
    type: String
  },
  ocrApplied: {
    type: Boolean,
    default: false
  },
  rawText: {
    type: String,
    required: true
  },
  predictedCategory: {
    type: String,
    required: true
  },
  predictionConfidence: {
    type: Number,
    required: true
  },
  topPredictions: [{
    category: String,
    confidence: Number
  }],
  extractedSkills: [{
    skill: String,
    canonical: String,
    category: String,
    frequency: Number
  }],
  skillCount: {
    type: Number,
    default: 0
  },
  statistics: {
    character_count: Number,
    word_count: Number,
    line_count: Number,
    average_word_length: Number
  },
  contactInfo: {
    email: String,
    phone: String,
    linkedin: String,
    github: String
  },
  education: [{
    degree: String,
    degree_type: String
  }],
  experienceHighlights: [{
    type: String
  }],
  strengths: [{
    type: String
  }],
  areasForImprovement: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
