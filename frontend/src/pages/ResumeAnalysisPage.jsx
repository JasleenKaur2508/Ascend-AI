import React, { useState } from 'react';
import { resumeAPI } from '../services/api';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Layers,
  BarChart3,
  Copy,
  Check,
  RefreshCw,
  Mail,
  Phone,
  Linkedin,
  Github,
  User,
  Eye,
  EyeOff
} from 'lucide-react';

const SAMPLE_RESUMES = {
  data_science: `Skills * Programming Languages: Python (pandas, numpy, scipy, scikit-learn, matplotlib), R, SQL.
Machine Learning: Supervised learning, regression, classification, clustering, natural language processing (NLP), time series forecasting.
Databases: MySQL, PostgreSQL, MongoDB.
Tools: Git, Docker, Jupyter Notebook, Tableau, Power BI.
Education: Bachelor of Technology in Computer Science and Engineering, GPA: 8.9/10.
Experience: Data Scientist at TechCorp (2 years).
- Developed predictive classification models using scikit-learn achieving 94% accuracy.
- Built end-to-end data processing pipelines using Pandas and NumPy for customer retention analytics.
- Deployed ML inference services with Docker and FastAPI.`,

  java_developer: `Skills * Core Java, J2EE, Spring Boot, Spring MVC, Hibernate, Microservices, RESTful Web Services.
Databases: Oracle, MySQL, PostgreSQL.
Tools: Maven, Jenkins, Git, Docker, Kubernetes, Kafka, JUnit.
Education: Bachelor of Engineering in Information Technology.
Experience: Senior Java Developer at Global Enterprise (3 years).
- Architected and developed decoupled Spring Boot microservices handling 50k requests per minute.
- Optimized database queries and Hibernate ORM mappings reducing response latency by 35%.
- Implemented asynchronous event streaming with Apache Kafka and Dockerized production deployments.`,

  web_designing: `Skills * HTML5, CSS3, JavaScript, TypeScript, React.js, Tailwind CSS, Next.js, Redux, Responsive Web Design.
UI/UX Design: Figma, Adobe XD, Wireframing, User Interface Prototyping.
Tools: Webpack, Vite, Git, GitHub, Vercel, npm.
Education: Bachelor of Science in Multimedia and Web Development.
Experience: Frontend Developer and UI Designer at CreativeStudio (2 years).
- Designed and built responsive web applications with React, Tailwind CSS, and Figma mockups.
- Improved accessibility (WCAG 2.1) compliance and achieved 98+ Google Lighthouse scores across 15 production web apps.
- Engineered reusable UI component systems and animations using Framer Motion.`
};

const ResumeAnalysisPage = () => {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRawTextPreview, setShowRawTextPreview] = useState(true);

  const handleFileUpload = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) {
      if (dropped.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }
      setFile(dropped);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAnalyze = async () => {
    setError('');
    setLoading(true);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        res = await resumeAPI.uploadResume(formData);
      } else if (rawText.trim()) {
        const formData = new FormData();
        formData.append('raw_text', rawText);
        res = await resumeAPI.uploadResume(formData);
      } else {
        setError('Please select a file or paste resume text.');
        setLoading(false);
        return;
      }

      setAnalysisResult(res.data.data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || 'Failed to analyze resume. Verify that the ML service is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sampleKey) => {
    setFile(null);
    setRawText(SAMPLE_RESUMES[sampleKey]);
    setError('');
  };

  const handleCopySummary = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[#25243A] tracking-tight flex items-center gap-2.5">
          <FileText className="w-8 h-8 text-[#7765E8]" />
          <span>Intelligent Resume Analysis & Classification</span>
        </h1>
        <p className="text-sm text-[#858397] max-w-3xl leading-relaxed">
          Upload any PDF or DOCX resume. ASCEND AI extracts structured text using PyMuPDF, parses technical competencies via our 13,893 ESCO skill dictionary, and classifies the professional domain using our calibrated machine learning model.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: File Upload & Text Input */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-8 rounded-3xl glass-card border border-white/90 space-y-4 shadow-liquid">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#212032] uppercase tracking-wider">
                Method 1: Upload Resume Document
              </span>
              <span className="text-xs text-[#7E7C94]">PDF, DOCX, TXT (Max 10MB)</span>
            </div>

            <label
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-white/95 hover:border-[#7765E8] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white/45 hover:bg-white/70 backdrop-blur-md transition-all group shadow-xs"
            >
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-[#7765E8]/12 border border-[#7765E8]/20 flex items-center justify-center text-[#7765E8] group-hover:scale-110 transition-transform mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#212032]">
                {file ? file.name : 'Click to upload or drag & drop your resume'}
              </p>
              <p className="text-xs text-[#7E7C94] mt-1 font-medium">
                {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'Scanned & digital PDF formats supported'}
              </p>
            </label>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#EAE7F6]"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-[#7E7C94] uppercase">OR Method 2: Paste Raw Text</span>
              <div className="flex-grow border-t border-[#EAE7F6]"></div>
            </div>

            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setFile(null);
              }}
              placeholder="Paste raw resume text directly here..."
              className="w-full p-4 rounded-2xl bg-white/60 border border-white/90 text-[#212032] placeholder-[#7E7C94] text-xs font-mono focus:outline-none focus:border-[#7765E8] focus:bg-white focus:ring-2 focus:ring-[#7765E8]/10 backdrop-blur-sm"
            />

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || (!file && !rawText.trim())}
              className="w-full py-3.5 rounded-xl font-bold bg-[#7765E8] hover:bg-[#6451D8] text-white text-sm shadow-md shadow-[#7765E8]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing through ML Microservice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Machine Learning Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Sample Resumes for Evaluators */}
        <div className="space-y-4">
          <div className="p-7 rounded-3xl glass-card border border-[#EAE7F6] space-y-4 shadow-card">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7765E8]">
              <Sparkles className="w-4 h-4" />
              <span>1-Click Evaluator Samples</span>
            </div>
            <p className="text-xs text-[#858397] leading-relaxed">
              Instantly test the model with verified resume profiles across distinct professional categories:
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => loadSample('data_science')}
                className="w-full p-3.5 rounded-2xl bg-[#FAFAFC] hover:bg-white border border-[#EAE7F6] hover:border-[#7765E8]/30 text-left transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#25243A] group-hover:text-[#7765E8] transition-colors">
                    Data Scientist Profile
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7765E8]/10 text-[#7765E8] font-bold">
                    Data Science
                  </span>
                </div>
                <div className="text-[11px] text-[#858397] truncate mt-1">
                  Python, scikit-learn, Pandas, NLP, TensorFlow, SQL
                </div>
              </button>

              <button
                type="button"
                onClick={() => loadSample('java_developer')}
                className="w-full p-3.5 rounded-2xl bg-[#FAFAFC] hover:bg-white border border-[#EAE7F6] hover:border-[#7765E8]/30 text-left transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#25243A] group-hover:text-[#7765E8] transition-colors">
                    Java Enterprise Engineer
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                    Java Developer
                  </span>
                </div>
                <div className="text-[11px] text-[#858397] truncate mt-1">
                  Core Java, Spring Boot, Microservices, Kafka, Hibernate
                </div>
              </button>

              <button
                type="button"
                onClick={() => loadSample('web_designing')}
                className="w-full p-3.5 rounded-2xl bg-[#FAFAFC] hover:bg-white border border-[#EAE7F6] hover:border-[#7765E8]/30 text-left transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#25243A] group-hover:text-[#7765E8] transition-colors">
                    Web & UI Designer
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-bold">
                    Web Designing
                  </span>
                </div>
                <div className="text-[11px] text-[#858397] truncate mt-1">
                  HTML5, CSS3, React, Tailwind, Figma, Responsive UI
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7F6] pb-3">
            <div>
              <h2 className="text-xl font-bold text-[#25243A] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Resume Analysis & Extraction Results</span>
              </h2>
              {analysisResult.filename && (
                <p className="text-xs text-[#858397] mt-0.5">
                  Source: <span className="text-[#25243A] font-mono font-medium">{analysisResult.filename}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRawTextPreview(!showRawTextPreview)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-[#EAE7F6] hover:bg-[#F3F0FF] text-[#25243A] flex items-center gap-1.5 transition-all shadow-xs"
              >
                {showRawTextPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showRawTextPreview ? 'Hide Text' : 'View Text'}</span>
              </button>
              <button
                onClick={handleCopySummary}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#7765E8] hover:bg-[#6451D8] text-white flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Candidate Profile & Contact Info Card */}
          {(analysisResult.candidateName || analysisResult.contactInfo?.email || analysisResult.contactInfo?.phone || analysisResult.ocrApplied) && (
            <div className="p-6 rounded-3xl glass-card border border-white/90 flex flex-wrap items-center justify-between gap-4 shadow-liquid">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7765E8] to-[#8FA9FE] flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {analysisResult.candidateName ? (
                    analysisResult.candidateName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-base font-bold text-[#212032] flex items-center gap-2">
                    <span>{analysisResult.candidateName || 'Verified Candidate'}</span>
                    {analysisResult.ocrApplied && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        OCR Processed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#7765E8] font-bold">
                    {analysisResult.predictedCategory} Specialist
                  </div>
                </div>
              </div>

              {/* Contact Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {analysisResult.contactInfo?.email && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/60 border border-white/80 text-[#212032] font-semibold flex items-center gap-1.5 backdrop-blur-sm shadow-xs">
                    <Mail className="w-3.5 h-3.5 text-[#7765E8]" />
                    <span>{analysisResult.contactInfo.email}</span>
                  </span>
                )}
                {analysisResult.contactInfo?.phone && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/60 border border-white/80 text-[#212032] font-semibold flex items-center gap-1.5 backdrop-blur-sm shadow-xs">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{analysisResult.contactInfo.phone}</span>
                  </span>
                )}
                {analysisResult.contactInfo?.linkedin && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/60 border border-white/80 text-[#212032] font-semibold flex items-center gap-1.5 backdrop-blur-sm shadow-xs">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{analysisResult.contactInfo.linkedin}</span>
                  </span>
                )}
                {analysisResult.contactInfo?.github && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-white/60 border border-white/80 text-[#212032] font-semibold flex items-center gap-1.5 backdrop-blur-sm shadow-xs">
                    <Github className="w-3.5 h-3.5 text-[#212032]" />
                    <span>{analysisResult.contactInfo.github}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Extracted Resume Text Preview Card */}
          {showRawTextPreview && analysisResult.rawText && (
            <div className="p-6 rounded-3xl glass-card border border-white/90 space-y-3 shadow-liquid">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7765E8]" />
                  <span className="text-xs font-bold text-[#212032] uppercase tracking-wider">
                    Extracted Resume Text Preview
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#7E7C94] font-medium">
                  <span>{analysisResult.statistics?.word_count || analysisResult.rawText.split(/\s+/).length} Words</span>
                  <span>•</span>
                  <span>{analysisResult.statistics?.character_count || analysisResult.rawText.length} Characters</span>
                </div>
              </div>
              <div className="relative">
                <pre className="max-h-56 overflow-y-auto p-4 rounded-2xl bg-white/50 border border-white/80 text-[#212032] font-mono text-[11px] whitespace-pre-wrap leading-relaxed selection:bg-[#7765E8]/20 backdrop-blur-sm">
                  {analysisResult.rawText}
                </pre>
              </div>
            </div>
          )}

          {/* Predicted Category Card */}
          <div className="p-8 rounded-3xl glass-card border border-white/95 space-y-4 shadow-liquid">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#7765E8] uppercase tracking-wider">
                  Supervised ML Prediction Result
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#25243A]">
                  {analysisResult.predictedCategory}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs text-[#858397] font-medium">Model Confidence</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                  {analysisResult.predictionConfidence}%
                </div>
              </div>
            </div>

            {/* Top 3 Class Probabilities */}
            {analysisResult.topPredictions && (
              <div className="space-y-2 pt-3 border-t border-[#EAE7F6]">
                <div className="text-xs text-[#858397] font-medium">Class Probabilities (Calibrated Linear SVM / Logistic Regression):</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {analysisResult.topPredictions.map((pred, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6] flex items-center justify-between">
                      <span className="text-xs text-[#25243A] font-bold">{pred.category}</span>
                      <span className="text-xs font-black font-mono text-[#7765E8]">{pred.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metrics & Extracted Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Extracted Skills */}
            <div className="lg:col-span-2 p-7 rounded-3xl glass-card border border-[#EAE7F6] space-y-4 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#25243A] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#7765E8]" />
                  <span>Extracted Skills ({analysisResult.skillCount})</span>
                </h3>
                <span className="text-xs text-[#858397] font-medium">Categorized by Domain</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {analysisResult.extractedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#F3F0FF] border border-[#EAE7F6] text-[#25243A] flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{s.canonical}</span>
                    <span className="text-[10px] text-[#7765E8] font-bold px-1.5 py-0.5 rounded-full bg-white">
                      {s.category}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="p-7 rounded-3xl glass-card border border-[#EAE7F6] space-y-4 shadow-card">
              <h3 className="text-base font-bold text-[#25243A] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#7765E8]" />
                <span>Text Characteristics</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#EAE7F6] text-xs">
                  <span className="text-[#858397] font-medium">Total Word Count</span>
                  <span className="text-[#25243A] font-mono font-black">{analysisResult.statistics?.word_count}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#EAE7F6] text-xs">
                  <span className="text-[#858397] font-medium">Character Length</span>
                  <span className="text-[#25243A] font-mono font-black">{analysisResult.statistics?.character_count}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#EAE7F6] text-xs">
                  <span className="text-[#858397] font-medium">Line Count</span>
                  <span className="text-[#25243A] font-mono font-black">{analysisResult.statistics?.line_count}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <span className="text-[#858397] font-medium">Average Word Length</span>
                  <span className="text-[#25243A] font-mono font-black">{analysisResult.statistics?.average_word_length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Education & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-7 rounded-3xl glass-card border border-[#EAE7F6] space-y-3 shadow-card">
              <h3 className="text-base font-bold text-[#25243A] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>Detected Education</span>
              </h3>
              {analysisResult.education?.length > 0 ? (
                <div className="space-y-2">
                  {analysisResult.education.map((edu, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6]">
                      <div className="text-xs font-bold text-[#25243A]">{edu.degree}</div>
                      <div className="text-[11px] text-emerald-600 font-medium">{edu.degree_type}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#858397]">No explicit degree heading found. Standardize Education section formatting.</p>
              )}
            </div>

            <div className="p-7 rounded-3xl glass-card border border-[#EAE7F6] space-y-3 shadow-card">
              <h3 className="text-base font-bold text-[#25243A] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <span>Experience Highlights</span>
              </h3>
              {analysisResult.experienceHighlights?.length > 0 ? (
                <div className="space-y-2">
                  {analysisResult.experienceHighlights.map((exp, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6] text-xs text-[#25243A] font-medium">
                      • {exp}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#858397]">No action verb project bullet points identified.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysisPage;
