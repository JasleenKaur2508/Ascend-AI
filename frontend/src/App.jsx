import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import InteractiveNeuralBackground from './components/InteractiveNeuralBackground';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import JobMatchingPage from './pages/JobMatchingPage';
import SkillGapPage from './pages/SkillGapPage';
import CoursesPage from './pages/CoursesPage';
import ResumeEnhancerPage from './pages/ResumeEnhancerPage';
import InterviewPage from './pages/InterviewPage';
import RoadmapPage from './pages/RoadmapPage';
import RecruiterPage from './pages/RecruiterPage';
import MLAnalyticsPage from './pages/MLAnalyticsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-violet/20 border-t-accent-violet rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col text-[#212032] selection:bg-[#7765E8] selection:text-white relative overflow-x-hidden">
          <CustomCursor />
          <ScrollProgress />
          <InteractiveNeuralBackground />
          <Navbar />
          <main className="flex-grow z-10">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/ml-analytics" element={<MLAnalyticsPage />} />

              {/* Job Seeker Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['jobseeker']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-analysis"
                element={
                  <ProtectedRoute>
                    <ResumeAnalysisPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job-matching"
                element={
                  <ProtectedRoute>
                    <JobMatchingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skill-gap"
                element={
                  <ProtectedRoute>
                    <SkillGapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <CoursesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enhancer"
                element={
                  <ProtectedRoute>
                    <ResumeEnhancerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview"
                element={
                  <ProtectedRoute>
                    <InterviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/roadmap"
                element={
                  <ProtectedRoute>
                    <RoadmapPage />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
