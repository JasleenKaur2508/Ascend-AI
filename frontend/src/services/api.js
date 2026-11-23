import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ascend_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('ascend_token');
      localStorage.removeItem('ascend_user');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Resume APIs
export const resumeAPI = {
  uploadResume: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => api.get('/resumes/history'),
  getLatest: () => api.get('/resumes/latest'),
  getById: (id) => api.get(`/resumes/${id}`)
};

// Job APIs
export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  matchJob: (data) => api.post('/jobs/match', data),
  getMatches: () => api.get('/jobs/matches'),
  getMatchById: (id) => api.get(`/jobs/matches/${id}`)
};

// Career Intelligence APIs
export const careerAPI = {
  getCourses: (data) => api.post('/career/courses', data),
  toggleCourse: (id) => api.patch(`/career/courses/${id}/toggle`),
  getRoadmap: () => api.get('/career/roadmap'),
  toggleRoadmapTask: (data) => api.patch('/career/roadmap/toggle-task', data),
  getInterviewQuestions: (data) => api.post('/career/interview/questions', data),
  toggleInterviewPractice: (data) => api.patch('/career/interview/toggle-practice', data),
  enhanceSummary: (data) => api.post('/career/enhance-summary', data)
};

// Recruiter APIs
export const recruiterAPI = {
  createJob: (data) => api.post('/recruiter/jobs', data),
  getJobs: () => api.get('/recruiter/jobs'),
  batchScreen: (data) => api.post('/recruiter/screen', data),
  getCandidates: (params) => api.get('/recruiter/candidates', { params }),
  updateCandidate: (id, data) => api.patch(`/recruiter/candidates/${id}`, data),
  getExportCSVUrl: () => `${API_BASE}/recruiter/export-csv`,
  exportCSV: () => api.get('/recruiter/export-csv', { responseType: 'blob' })
};

// ML Analytics APIs
export const analyticsAPI = {
  getColabMetrics: () => api.get('/analytics/colab-metrics'),
  getMetrics: () => api.get('/analytics/metrics'),
  getEDA: () => api.get('/analytics/eda'),
  getVisualizationUrl: (filename) => `${API_BASE}/analytics/visualizations/${filename}`
};

export default api;
