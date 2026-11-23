require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { seedDemoUsers } = require('./config/seed');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const careerRoutes = require('./routes/careerRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

let dbReady = false;

// Connect to MongoDB and seed demo accounts
connectDB().then(async () => {
  await seedDemoUsers();
  dbReady = true;
}).catch(err => {
  console.error('Fatal DB initialization failure:', err);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure DB is ready before serving API requests
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  if (dbReady) return next();

  const startTime = Date.now();
  const interval = setInterval(() => {
    if (dbReady) {
      clearInterval(interval);
      return next();
    }
    if (Date.now() - startTime > 4000) {
      clearInterval(interval);
      return res.status(503).json({
        status: 'error',
        message: 'ASCEND AI database is initializing. Please retry in a moment.'
      });
    }
  }, 100);
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'ASCEND AI Express Backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const server = app.listen(PORT, () => {
  console.log(`ASCEND AI Backend running on port ${PORT}`);
});

module.exports = { app, server };
