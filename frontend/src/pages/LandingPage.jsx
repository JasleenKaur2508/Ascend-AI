import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  FileText,
  Target,
  Briefcase,
  Compass,
  Cpu,
  BarChart2,
  Layers
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-24 pb-24 relative">
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-visible">
        {/* Central Hero Content */}
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-[#212032] tracking-tight leading-[1.08]"
          >
            Your Career.{' '}
            <span className="bg-gradient-to-r from-[#7765E8] via-[#8FA9FE] to-[#6451D8] bg-clip-text text-transparent">
              Your Next Level.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-2xl text-[#5F5D76] max-w-3xl mx-auto leading-relaxed font-medium"
          >
            One intelligent platform to understand your potential, close your skill gaps and prepare for your next opportunity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3"
          >
            <Link
              to={user ? (user.role === 'recruiter' ? '/recruiter' : '/dashboard') : '/register'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-[#7765E8] to-[#6451D8] hover:from-[#6451D8] hover:to-[#533EC4] text-white shadow-xl shadow-[#7765E8]/25 flex items-center justify-center gap-3 transition-all hover:shadow-2xl hover:scale-[1.03] group"
            >
              <span>{user ? 'Enter AI Workspace' : 'Launch Career Assistant'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/ml-analytics"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold glass-card hover:bg-white/90 text-[#212032] border border-white/80 flex items-center justify-center gap-2.5 transition-all shadow-sm hover:border-[#7765E8]/40"
            >
              <BarChart2 className="w-4 h-4 text-[#7765E8]" />
              <span>Explore ML Analytics & EDA</span>
            </Link>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            <div className="p-5 rounded-3xl glass-card glass-card-hover text-left">
              <div className="text-3xl font-black text-[#212032] font-mono">25</div>
              <div className="text-xs font-bold text-[#7E7C94] mt-1">Professional Categories</div>
            </div>
            <div className="p-5 rounded-3xl glass-card glass-card-hover text-left">
              <div className="text-3xl font-black text-[#7765E8] font-mono">99.45%</div>
              <div className="text-xs font-bold text-[#7E7C94] mt-1">Macro F1 (Linear SVM)</div>
            </div>
            <div className="p-5 rounded-3xl glass-card glass-card-hover text-left">
              <div className="text-3xl font-black text-[#212032] font-mono">13,893</div>
              <div className="text-xs font-bold text-[#7E7C94] mt-1">Taxonomy Skills Dict</div>
            </div>
            <div className="p-5 rounded-3xl glass-card glass-card-hover text-left">
              <div className="text-3xl font-black text-emerald-600 font-mono">2,277</div>
              <div className="text-xs font-bold text-[#7E7C94] mt-1">Indexed Job Postings</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.55 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7765E8]/10 text-[#7765E8] text-xs font-bold uppercase tracking-wider border border-[#7765E8]/20">
            End-to-End Capabilities
          </div>
          <p className="text-3xl sm:text-5xl font-black text-[#212032] tracking-tight">
            Comprehensive Career Intelligence Architecture
          </p>
          <p className="text-[#7E7C94] max-w-2xl mx-auto text-base">
            Engineered as an integrated system connecting natural language processing, vector similarity, and predictive analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#7765E8]/12 border border-[#7765E8]/25 flex items-center justify-center text-[#7765E8] shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#212032]">Supervised Resume Classification</h3>
              <p className="text-sm text-[#7E7C94] leading-relaxed">
                Trained TF-IDF n-gram vectorizer paired with calibrated Linear SVM and Logistic Regression models. Accurately predicts professional domains without data leakage.
              </p>
            </div>
            <div className="pt-6 border-t border-white/80 mt-6 flex items-center justify-between text-xs font-bold">
              <span className="text-[#7E7C94]">962 Supervised Resumes</span>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">99.48% Test Acc</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8FA9FE]/20 border border-[#8FA9FE]/35 flex items-center justify-center text-[#7765E8] shadow-xs">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#212032]">Explainable ATS Compatibility</h3>
              <p className="text-sm text-[#7E7C94] leading-relaxed">
                Heuristic educational scoring across 5 weighted dimensions: Skill coverage (40%), Semantic text alignment (25%), Keyword overlap (15%), Education (10%), and Experience (10%).
              </p>
            </div>
            <div className="pt-6 border-t border-white/80 mt-6 flex items-center justify-between text-xs font-bold">
              <span className="text-[#7E7C94]">Transparent Formula</span>
              <span className="text-[#7765E8] bg-[#7765E8]/10 px-3 py-1 rounded-full border border-[#7765E8]/20">5-Metric Weights</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C4B5FD]/25 border border-[#C4B5FD]/40 flex items-center justify-center text-[#7765E8] shadow-xs">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#212032]">Semantic Job Matching</h3>
              <p className="text-sm text-[#7E7C94] leading-relaxed">
                Real-time cosine similarity ranking against 2,277 live job descriptions from the provided dataset with instant skill gap identification and match explanations.
              </p>
            </div>
            <div className="pt-6 border-t border-white/80 mt-6 flex items-center justify-between text-xs font-bold">
              <span className="text-[#7E7C94]">2,277 Tech Postings</span>
              <span className="text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Instant Ranking</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#212032]">Taxonomy Skill Extraction</h3>
              <p className="text-sm text-[#7E7C94] leading-relaxed">
                O(1) n-gram tokenization against 13,893 skills and alternative labels from skills.csv, eliminating partial-word false positives while preserving canonical names.
              </p>
            </div>
            <div className="pt-6 border-t border-white/80 mt-6 flex items-center justify-between text-xs font-bold">
              <span className="text-[#7E7C94]">13,893 Skill Dictionary</span>
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Zero False Positives</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#212032]">Career Roadmap & Courses</h3>
              <p className="text-sm text-[#7E7C94] leading-relaxed">
                A customized 6-stage career roadmap linked with verified, authentic course providers (Coursera, edX, Harvard CS50, freeCodeCamp) targeted to missing competencies.
              </p>
            </div>
            <div className="pt-6 border-t border-white/80 mt-6 flex items-center justify-between text-xs font-bold">
              <span className="text-[#7E7C94]">6-Stage Milestones</span>
              <span className="text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">Verified Providers</span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-7 rounded-3xl glass-card glass-card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#212032]">Recruiter Batch Screening</h3>
              <p className="text-sm text-[#7E7C94] leading-relaxed">
                Multi-candidate batch processing and ranking with explainable compatibility scores, status management, fair hiring safeguards, and direct CSV exporting.
              </p>
            </div>
            <div className="pt-6 border-t border-white/80 mt-6 flex items-center justify-between text-xs font-bold">
              <span className="text-[#7E7C94]">Decision Support</span>
              <span className="text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">Human-in-the-loop</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How it Works 4-Step Journey */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.55 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="p-8 sm:p-14 rounded-3xl glass-card border border-white/90 shadow-liquid">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#7765E8]/10 text-[#7765E8] text-xs font-bold uppercase tracking-wider border border-[#7765E8]/20">
              Intelligent Workflow
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-[#212032]">From Raw Resume to Career Mastery</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#7765E8]/12 text-[#7765E8] flex items-center justify-center font-bold font-mono text-base border border-[#7765E8]/25 shadow-xs">
                01
              </div>
              <h4 className="font-bold text-[#212032] text-lg">Upload & Parse</h4>
              <p className="text-xs text-[#7E7C94] leading-relaxed">
                Upload PDF or DOCX resume. PyMuPDF extracts raw text, contact information, education, and experience.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#8FA9FE]/20 text-[#7765E8] flex items-center justify-center font-bold font-mono text-base border border-[#8FA9FE]/35 shadow-xs">
                02
              </div>
              <h4 className="font-bold text-[#212032] text-lg">ML Classification</h4>
              <p className="text-xs text-[#7E7C94] leading-relaxed">
                Fitted TF-IDF vectorizer extracts features; Linear SVM predicts the professional domain with confidence.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#C4B5FD]/25 text-[#7765E8] flex items-center justify-center font-bold font-mono text-base border border-[#C4B5FD]/40 shadow-xs">
                03
              </div>
              <h4 className="font-bold text-[#212032] text-lg">Match & Score</h4>
              <p className="text-xs text-[#7E7C94] leading-relaxed">
                Cosine similarity matches resume to 2,277 jobs. Explainable ATS breakdown highlights missing skills.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold font-mono text-base border border-emerald-200 shadow-xs">
                04
              </div>
              <h4 className="font-bold text-[#212032] text-lg">Advance & Prepare</h4>
              <p className="text-xs text-[#7E7C94] leading-relaxed">
                Take verified courses, drill role-specific interview questions, and follow the actionable 6-stage roadmap.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Box */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <div className="p-12 rounded-3xl glass-card border border-white/95 shadow-liquid-hover relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-[#212032] tracking-tight">
              Ready to Accelerate Your Career Trajectory?
            </h2>
            <p className="text-[#7E7C94] max-w-xl mx-auto text-base">
              Try ASCEND AI with your own resume or select from our verified test resumes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to={user ? (user.role === 'recruiter' ? '/recruiter' : '/dashboard') : '/register'}
                className="px-8 py-4 rounded-2xl font-bold bg-[#7765E8] hover:bg-[#6451D8] text-white shadow-xl shadow-[#7765E8]/25 transition-all hover:scale-105"
              >
                Get Started Now
              </Link>
              <Link
                to="/ml-analytics"
                className="px-7 py-4 rounded-2xl font-bold glass-card text-[#212032] hover:bg-white/90 border border-white/80 transition-all shadow-sm"
              >
                View ML Evaluation Report
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
