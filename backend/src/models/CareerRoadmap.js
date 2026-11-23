const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task_id: String,
  name: String,
  description: String,
  completed: {
    type: Boolean,
    default: false
  }
});

const stageSchema = new mongoose.Schema({
  stage: Number,
  title: String,
  duration: String,
  priority: String,
  objective: String,
  tasks: [taskSchema],
  recommended_resource: String
});

const careerRoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  targetRole: {
    type: String,
    default: 'Software Engineer'
  },
  stages: [stageSchema],
  overallProgress: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CareerRoadmap', careerRoadmapSchema);
