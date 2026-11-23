const axios = require('axios');
const CourseRecommendation = require('../models/CourseRecommendation');
const CareerRoadmap = require('../models/CareerRoadmap');
const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

exports.getCourseRecommendations = async (req, res) => {
  try {
    const { missingSkills = [], targetRole = '' } = req.body;

    // Fetch from Python service
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/recommend-courses`, {
      missing_skills: missingSkills,
      target_role: targetRole,
      limit: 8
    });

    const courses = response.data.courses;

    // Upsert / sync into user's CourseRecommendation collection
    for (const c of courses) {
      await CourseRecommendation.findOneAndUpdate(
        { userId: req.user._id, courseId: c.course_id },
        {
          userId: req.user._id,
          courseId: c.course_id,
          title: c.title,
          skill: c.skill,
          provider: c.provider,
          difficulty: c.difficulty,
          url: c.url,
          reason: c.reason
        },
        { upsert: true, new: true }
      );
    }

    const savedCourses = await CourseRecommendation.find({ userId: req.user._id });
    return res.status(200).json({
      status: 'success',
      count: savedCourses.length,
      data: savedCourses
    });
  } catch (error) {
    console.error('Error recommending courses:', error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to generate course recommendations.' });
  }
};

exports.toggleCourseCompletion = async (req, res) => {
  try {
    const course = await CourseRecommendation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!course) {
      return res.status(404).json({ status: 'error', message: 'Course record not found.' });
    }

    course.completed = !course.completed;
    await course.save();

    return res.status(200).json({ status: 'success', data: course });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getCareerRoadmap = async (req, res) => {
  try {
    let roadmap = await CareerRoadmap.findOne({ userId: req.user._id });

    if (!roadmap) {
      // Find candidate's latest resume to extract skills
      const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      const candidateSkills = resume ? resume.extractedSkills.map(s => s.canonical) : [];
      const targetRole = req.user.targetRole || 'Software Engineer';
      const predictedCategory = resume ? resume.predictedCategory : 'Software Engineering';

      const response = await axios.post(`${ML_SERVICE_URL}/api/ml/career-roadmap`, {
        candidate_skills: candidateSkills,
        missing_skills: ['Cloud Architecture', 'Automated Testing', 'Docker'],
        target_role: targetRole,
        predicted_category: predictedCategory
      });

      roadmap = await CareerRoadmap.create({
        userId: req.user._id,
        targetRole,
        stages: response.data.stages,
        overallProgress: 0
      });
    }

    return res.status(200).json({ status: 'success', data: roadmap });
  } catch (error) {
    console.error('Error getting career roadmap:', error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve career roadmap.' });
  }
};

exports.toggleRoadmapTask = async (req, res) => {
  try {
    const { stageNumber, taskId } = req.body;
    const roadmap = await CareerRoadmap.findOne({ userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ status: 'error', message: 'Roadmap not found.' });
    }

    const stage = roadmap.stages.find(s => s.stage === Number(stageNumber));
    if (!stage) {
      return res.status(404).json({ status: 'error', message: 'Stage not found.' });
    }

    const task = stage.tasks.find(t => t.task_id === taskId);
    if (!task) {
      return res.status(404).json({ status: 'error', message: 'Task not found.' });
    }

    task.completed = !task.completed;

    // Recalculate overall progress percentage
    let totalTasks = 0;
    let completedTasks = 0;
    for (const st of roadmap.stages) {
      for (const t of st.tasks) {
        totalTasks += 1;
        if (t.completed) completedTasks += 1;
      }
    }
    roadmap.overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await roadmap.save();
    return res.status(200).json({ status: 'success', data: roadmap });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getInterviewQuestions = async (req, res) => {
  try {
    const { jobTitle = 'Software Engineer' } = req.body;

    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const candidateSkills = resume ? resume.extractedSkills.map(s => s.canonical) : [];

    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/interview-questions`, {
      job_title: jobTitle,
      candidate_skills: candidateSkills,
      missing_skills: ['System Design', 'Testing'],
      predicted_category: resume ? resume.predictedCategory : 'Software Development'
    });

    const questions = response.data.questions.map(q => ({
      ...q,
      practiced: false,
      userNotes: ''
    }));

    const session = await InterviewSession.create({
      userId: req.user._id,
      jobTitle,
      questions
    });

    return res.status(200).json({ status: 'success', data: session });
  } catch (error) {
    console.error('Error fetching interview questions:', error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to generate interview questions.' });
  }
};

exports.toggleInterviewPractice = async (req, res) => {
  try {
    const { sessionId, questionIndex, userNotes } = req.body;
    const session = await InterviewSession.findOne({ _id: sessionId, userId: req.user._id });
    if (!session || !session.questions[questionIndex]) {
      return res.status(404).json({ status: 'error', message: 'Interview session or question not found.' });
    }

    session.questions[questionIndex].practiced = !session.questions[questionIndex].practiced;
    if (userNotes !== undefined) {
      session.questions[questionIndex].userNotes = userNotes;
    }

    await session.save();
    return res.status(200).json({ status: 'success', data: session });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.enhanceResumeSummary = async (req, res) => {
  try {
    const { targetJobTitle, jobDescription } = req.body;
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ status: 'error', message: 'Upload a resume first to enhance summary.' });
    }

    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/enhance-summary`, {
      resume_text: resume.rawText,
      predicted_category: resume.predictedCategory,
      skills: resume.extractedSkills.map(s => s.canonical),
      education: resume.education,
      experience_highlights: resume.experienceHighlights,
      target_job_title: targetJobTitle || resume.predictedCategory,
      job_description: jobDescription || ''
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error enhancing resume summary:', error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to synthesize enhanced summary.' });
  }
};
