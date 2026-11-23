import React, { useState, useEffect } from 'react';
import { resumeAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SkillGapPage = () => {
  const { user, updateUser } = useAuth();
  const [latestResume, setLatestResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);

  // Default target role skill sets for benchmarking
  const ROLE_STANDARDS = {
    'Full Stack Developer': ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript', 'Docker', 'REST API', 'Git', 'SQL'],
    'Software Engineer': ['Python', 'Java', 'Data Structures', 'Algorithms', 'SQL', 'Git', 'Docker', 'Linux', 'System Design', 'CI/CD'],
    'Data Scientist': ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Deep Learning', 'NLP', 'Data Science', 'Docker'],
    'DevOps Engineer': ['Docker', 'Kubernetes', 'Linux', 'AWS', 'CI/CD', 'Git', 'Jenkins', 'Terraform', 'Bash', 'Microservices'],
    'Java Developer': ['Java', 'Spring Boot', 'Hibernate', 'Microservices', 'SQL', 'Docker', 'REST API', 'Git', 'Kafka', 'Jenkins'],
    'Cloud Architect': ['AWS', 'Cloud Computing', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Microservices', 'Security', 'Python', 'Networking']
  };

  const currentTargetRole = user?.targetRole || 'Full Stack Developer';

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await resumeAPI.getLatest();
        setLatestResume(res.data.data);
      } catch (err) {
        console.error('Error fetching resume for skill gap:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRoleSelect = async (role) => {
    if (role === currentTargetRole || savingRole) return;
    setSavingRole(true);
    try {
      await authAPI.updateProfile({ targetRole: role });
      updateUser({ targetRole: role });
    } catch (err) {
      console.error('Failed to update target role:', err);
    } finally {
      setSavingRole(false);
    }
  };

  const candidateSkills = latestResume ? latestResume.extractedSkills.map(s => s.canonical) : [];
  const candidateSkillsLower = new Set(candidateSkills.map(s => s.toLowerCase()));

  const requiredSkills = ROLE_STANDARDS[currentTargetRole] || ROLE_STANDARDS['Full Stack Developer'];

  const possessedSkills = requiredSkills.filter(s => candidateSkillsLower.has(s.toLowerCase()));
  const missingSkills = requiredSkills.filter(s => !candidateSkillsLower.has(s.toLowerCase()));

  const matchPct = Math.round((possessedSkills.length / requiredSkills.length) * 100);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7765E8]/20 border-t-[#7765E8] rounded-full animate-spin" />
          <p className="text-xs text-[#858397] font-medium">Analyzing Skill Gaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[#25243A] tracking-tight flex items-center gap-2.5">
          <Target className="w-8 h-8 text-[#7765E8]" />
          <span>Skill Gap Analysis & Priority Learning Path</span>
        </h1>
        <p className="text-sm text-[#858397] max-w-3xl leading-relaxed">
          Compare your extracted competencies directly against industry baseline requisitions to uncover high-impact gaps and prioritize your next learning investments.
        </p>
      </div>

      {/* Role Selection Selector */}
      <div className="p-6 rounded-3xl glass-card border border-white/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-liquid">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#212032] uppercase tracking-wider">Benchmark Target Role:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.keys(ROLE_STANDARDS).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTargetRole === role
                  ? 'bg-[#7765E8] text-white shadow-md shadow-[#7765E8]/20 scale-105'
                  : 'bg-white/65 hover:bg-white text-[#212032] border border-white/80'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Metric Banner */}
      <div className="p-7 rounded-3xl glass-card border border-white/90 space-y-4 shadow-liquid">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-[#7765E8] uppercase tracking-wider">
              {currentTargetRole} Benchmark Coverage
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#25243A] mt-1">
              {matchPct}% Baseline Match
            </div>
          </div>
          <div className="text-xs text-[#858397] font-medium">
            Possesses <strong className="text-emerald-600 font-bold">{possessedSkills.length}</strong> of{' '}
            <strong className="text-[#25243A] font-bold">{requiredSkills.length}</strong> core standards
          </div>
        </div>

        <div className="w-full bg-[#F3F0FF] rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#7765E8] to-[#9BB9FF] h-3 rounded-full transition-all duration-700"
            style={{ width: `${matchPct}%` }}
          />
        </div>
      </div>

      {/* Skills Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Possessed Skills Column */}
        <div className="p-7 rounded-3xl glass-card border border-[#EAE7F6] space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-[#EAE7F6] pb-3">
            <h3 className="text-base font-bold text-[#25243A] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Verified Competencies You Possess ({possessedSkills.length})</span>
            </h3>
            <span className="text-xs text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-50">Matched</span>
          </div>

          <p className="text-xs text-[#858397]">
            These skills were verified in your resume text and fulfill target role requisitions:
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {possessedSkills.length > 0 ? (
              possessedSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-2 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{s}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#858397]">No overlapping skills detected. Upload an updated resume.</p>
            )}
          </div>
        </div>

        {/* Missing Skills Column */}
        <div className="p-7 rounded-3xl glass-card border border-[#EAE7F6] space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-[#EAE7F6] pb-3">
            <h3 className="text-base font-bold text-[#25243A] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <span>Prioritized Missing Skills ({missingSkills.length})</span>
            </h3>
            <span className="text-xs text-rose-600 font-bold px-2 py-0.5 rounded-full bg-rose-50">Skill Gap</span>
          </div>

          <p className="text-xs text-[#858397]">
            High-frequency requirements in job postings that are currently absent from your resume:
          </p>

          <div className="space-y-2.5 pt-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((s, idx) => {
                const isHigh = idx < 2;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${isHigh ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span className="text-xs font-bold text-[#25243A]">{s}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        isHigh ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {isHigh ? 'High Priority' : 'Medium Priority'}
                      </span>
                      <Link
                        to="/courses"
                        className="text-[11px] font-bold text-[#7765E8] hover:underline flex items-center gap-1 pl-2"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Find Course</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-emerald-600 font-bold">Congratulations! You meet 100% of benchmark requirements for this role.</p>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Learning Next Steps Box */}
      <div className="p-7 rounded-3xl glass-card border border-[#EAE7F6] space-y-4 shadow-card">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#858397]">
          Recommended Acceleration Pathway
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6] space-y-2">
            <div className="text-xs font-bold text-[#25243A] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-[#7765E8]/10 text-[#7765E8] flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Course Recommendations</span>
            </div>
            <p className="text-xs text-[#858397] leading-relaxed">
              Enroll in verified free and university courses targeting: {missingSkills.slice(0, 2).join(', ') || 'Advanced topics'}.
            </p>
            <Link to="/courses" className="text-xs font-bold text-[#7765E8] hover:underline inline-flex items-center gap-1">
              <span>View Courses</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6] space-y-2">
            <div className="text-xs font-bold text-[#25243A] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-[#9BB9FF]/30 text-[#7765E8] flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Interview Questions</span>
            </div>
            <p className="text-xs text-[#858397] leading-relaxed">
              Prepare for interview technical questions testing your ability to rapidly bridge {missingSkills[0] || 'core tools'}.
            </p>
            <Link to="/interview" className="text-xs font-bold text-[#7765E8] hover:underline inline-flex items-center gap-1">
              <span>Practice Questions</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6] space-y-2">
            <div className="text-xs font-bold text-[#25243A] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Update Career Roadmap</span>
            </div>
            <p className="text-xs text-[#858397] leading-relaxed">
              Track multi-week project milestones that demonstrate real code implementations of these missing skills.
            </p>
            <Link to="/roadmap" className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
              <span>Go to Roadmap</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;
