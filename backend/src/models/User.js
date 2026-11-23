const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['jobseeker', 'recruiter'],
    default: 'jobseeker'
  },
  headline: {
    type: String,
    default: ''
  },
  targetRole: {
    type: String,
    default: 'Software Engineer'
  },
  skills: [{
    type: String
  }],
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
