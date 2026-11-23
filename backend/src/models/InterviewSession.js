const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: String,
  topic: String,
  difficulty: String,
  question: String,
  answer_structure: String,
  prep_tips: String,
  practiced: {
    type: Boolean,
    default: false
  },
  userNotes: {
    type: String,
    default: ''
  }
});

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  questions: [questionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
