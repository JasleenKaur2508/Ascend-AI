const mongoose = require('mongoose');

const courseRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  provider: String,
  difficulty: String,
  url: String,
  reason: String,
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CourseRecommendation', courseRecommendationSchema);
