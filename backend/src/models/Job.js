const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Software Development'
  },
  requiredSkills: [{
    type: String
  }],
  experienceLevel: {
    type: String,
    default: 'Mid-Level'
  },
  location: {
    type: String,
    default: 'Remote / Hybrid'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isDatasetJob: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
