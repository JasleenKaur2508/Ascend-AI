import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resumeAPI, jobAPI, careerAPI, authAPI } from '../services/api';
import { AVAILABLE_ROLES, resolveTargetRole, computeRoleSkillGap } from '../utils/roleStandards';
import {
  Sparkles,
  FileText,
  Briefcase,
  Target,
  BookOpen,
  Map,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [latestResume, setLatestResume] = useState(null);
  const [matches, setMatches] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);

  const currentTargetRole = resolveTargetRole(user?.targetRole, latestResume?.predictedCategory);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [resumeRes, matchesRes, roadmapRes] = await Promise.allSettled([
          resumeAPI.getLatest(),
          jobAPI.getMatches(),
          careerAPI.getRoadmap()
        ]);

        if (resumeRes.status === 'fulfilled') {
          const resData = resumeRes.value.data.data;
          setLatestResume(resData);
          if (user && !AVAILABLE_ROLES.includes(user.targetRole)) {
            const resolved = resolveTargetRole(user.targetRole, resData?.predictedCategory);
            updateUser({ targetRole: resolved });
          }
        }
        if (matchesRes.status === 'fulfilled') {
          setMatches(matchesRes.value.data.data);
        }
        if (roadmapRes.status === 'fulfilled') {
          setRoadmap(roadmapRes.value.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleRoleChange = async (newRole) => {
    if (newRole === currentTargetRole || savingRole) return;
    // Optimistically update context & localStorage immediately so Skill Gap & all pages stay in sync
    updateUser({ targetRole: newRole });
    setSavingRole(true);
    try {
      await authAPI.updateProfile({ targetRole: newRole });
      const roadmapRes = await careerAPI.getRoadmap();
      if (roadmapRes?.data?.data) {
        setRoadmap(roadmapRes.data.data);
      }
    } catch (err) {
      console.error('Failed to update target role:', err);
    } finally {
      setSavingRole(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7765E8]/20 border-t-[#7765E8] rounded-full animate-spin" />
          <p className="text-xs text-[#858397] font-medium">Loading Career Dashboard...</p>
        </div>
      </div>
    );
  }

  const topSkills = latestResume ? latestResume.extractedSkills.slice(0, 8) : [];
  const roleGap = computeRoleSkillGap(currentTargetRole, latestResume?.extractedSkills || []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-3xl glass-card border border-white/90 shadow-liquid">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-[#212032] tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#7765E8]/12 text-[#7765E8] border border-[#7765E8]/25">
              {latestResume ? latestResume.predictedCategory : 'Career Explorer'}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs text-[#7E7C94]">
            <span className="font-semibold">Active Target Role:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVAILABLE_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    currentTargetRole === role
                      ? 'bg-[#7765E8] text-white shadow-sm'
                      : 'bg-white/60 hover:bg-white text-[#212032] border border-white/70'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/resume-analysis"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7765E8] hover:bg-[#6451D8] text-white shadow-md shadow-[#7765E8]/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <FileText className="w-4 h-4" />
            <span>{latestResume ? 'Upload New Resume' : 'Analyze Resume'}</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Predicted Category */}
        <div className="p-6 rounded-3xl glass-card glass-card-hover border border-white/80 space-y-3">
          <div className="flex items-center justify-between text-[#7E7C94]">
            <span className="text-xs font-bold uppercase tracking-wider">Domain Prediction</span>
            <Sparkles className="w-4 h-4 text-[#7765E8]" />
          </div>
          <div className="text-xl font-black text-[#212032] truncate">
            {latestResume ? latestResume.predictedCategory : 'Awaiting Resume'}
          </div>
          <div className="text-xs text-[#7E7C94] flex items-center gap-1.5 font-medium">
            {latestResume ? (
              <>
                <span className="text-emerald-700 font-bold">{latestResume.predictionConfidence}%</span>
                <span>ML model confidence</span>
              </>
            ) : (
              <span>Upload PDF to predict</span>
            )}
          </div>
        </div>

        {/* Card 2: Extracted Skills */}
        <div className="p-6 rounded-3xl glass-card glass-card-hover border border-white/80 space-y-3">
          <div className="flex items-center justify-between text-[#7E7C94]">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Skills</span>
            <Target className="w-4 h-4 text-[#7765E8]" />
          </div>
          <div className="text-xl font-black text-[#212032] font-mono">
            {latestResume ? latestResume.extractedSkills.length : 0}
          </div>
          <div className="text-xs text-[#7E7C94] flex items-center gap-1.5 font-medium">
            <span className="text-[#7765E8] font-bold">{topSkills.length}</span>
            <span>core competencies highlighted</span>
          </div>
        </div>

        {/* Card 3: Target Role Alignment (Consistent with Skill Gap Page) */}
        <Link
          to="/skill-gap"
          className="p-6 rounded-3xl glass-card glass-card-hover border border-white/80 space-y-3 block"
        >
          <div className="flex items-center justify-between text-[#7E7C94]">
            <span className="text-xs font-bold uppercase tracking-wider">Target Role Match</span>
            <Briefcase className="w-4 h-4 text-[#7765E8]" />
          </div>
          <div className="text-xl font-black text-[#212032] font-mono">
            {latestResume ? `${roleGap.matchPct}%` : 'N/A'}
          </div>
          <div className="text-xs text-[#7E7C94] truncate font-medium">
            {currentTargetRole} ({roleGap.possessedSkills.length}/{roleGap.requiredSkills.length} skills)
          </div>
        </Link>

        {/* Card 4: Roadmap Progress */}
        <div className="p-6 rounded-3xl glass-card glass-card-hover border border-white/80 space-y-3">
          <div className="flex items-center justify-between text-[#7E7C94]">
            <span className="text-xs font-bold uppercase tracking-wider">Roadmap Progress</span>
            <Map className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-[#212032] font-mono">
            {roadmap ? `${roadmap.overallProgress}%` : '0%'}
          </div>
          <div className="w-full bg-[#EAE7F6] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#7765E8] h-2 rounded-full transition-all duration-500"
              style={{ width: `${roadmap ? roadmap.overallProgress : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Resume Snapshot & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Resume Analysis Card */}
          <div className="p-8 rounded-3xl glass-card border border-white/90 space-y-6 shadow-liquid">
            <div className="flex items-center justify-between border-b border-[#EAE7F6] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7765E8]/12 border border-[#7765E8]/20 flex items-center justify-center text-[#7765E8]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#212032]">Latest Resume Intelligence</h3>
                  <p className="text-xs text-[#7E7C94]">
                    {latestResume ? `Extracted from ${latestResume.filename}` : 'No resume uploaded yet'}
                  </p>
                </div>
              </div>
              <Link
                to="/resume-analysis"
                className="text-xs font-bold text-[#7765E8] hover:underline flex items-center gap-1"
              >
                <span>Full Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {latestResume ? (
              <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/60 border border-white/80 backdrop-blur-md text-center shadow-xs">
                  <div>
                    <div className="text-xs text-[#7E7C94] font-medium">Word Count</div>
                    <div className="text-base font-black text-[#212032] font-mono mt-0.5">
                      {latestResume.statistics?.word_count || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#7E7C94] font-medium">Character Length</div>
                    <div className="text-base font-black text-[#212032] font-mono mt-0.5">
                      {latestResume.statistics?.character_count || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#7E7C94] font-medium">Avg Word Length</div>
                    <div className="text-base font-black text-[#212032] font-mono mt-0.5">
                      {latestResume.statistics?.average_word_length || 0}
                    </div>
                  </div>
                </div>

                {/* Extracted Skills Pills */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-[#212032] uppercase tracking-wider">
                    Extracted Competencies ({latestResume.extractedSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {latestResume.extractedSkills.slice(0, 14).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/70 border border-white text-[#212032] shadow-xs"
                      >
                        {s.canonical}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Identified Strength</span>
                    </div>
                    <p className="text-xs text-[#25243A] leading-relaxed font-medium">
                      {latestResume.strengths?.[0] || 'Strong domain-specific technical vocabulary detected.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1.5">
                    <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Suggested Optimization</span>
                    </div>
                    <p className="text-xs text-[#25243A] leading-relaxed font-medium">
                      {latestResume.areasForImprovement?.[0] || 'Quantify project achievements with metrics.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-[#858397]">Upload your resume to view AI-extracted skills, statistics, and domain classification.</p>
                <Link
                  to="/resume-analysis"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7765E8] hover:bg-[#6451D8] text-white text-xs font-bold shadow-md shadow-[#7765E8]/20"
                >
                  <FileText className="w-4 h-4" />
                  <span>Upload Resume Now</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/job-matching"
              className="p-6 rounded-2xl glass-card glass-card-hover border border-[#EAE7F6] space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <Briefcase className="w-5 h-5 text-[#7765E8]" />
                <ArrowRight className="w-4 h-4 text-[#858397]" />
              </div>
              <h4 className="font-bold text-[#25243A] text-sm">Semantic Job Matching</h4>
              <p className="text-xs text-[#858397]">
                Match your resume against 2,277 live job descriptions from jobs.csv.
              </p>
            </Link>

            <Link
              to="/interview"
              className="p-6 rounded-2xl glass-card glass-card-hover border border-[#EAE7F6] space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <MessageSquare className="w-5 h-5 text-[#7765E8]" />
                <ArrowRight className="w-4 h-4 text-[#858397]" />
              </div>
              <h4 className="font-bold text-[#25243A] text-sm">Interview Preparation</h4>
              <p className="text-xs text-[#858397]">
                Practice technical, behavioral, and skill-gap questions tailored to your profile.
              </p>
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Roadmap Snapshot */}
        <div className="space-y-6">
          {/* Career Roadmap Progress Card */}
          <div className="p-6 rounded-3xl glass-card border border-[#EAE7F6] space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7F6] pb-3">
              <h3 className="text-sm font-bold text-[#25243A] flex items-center gap-2">
                <Map className="w-4 h-4 text-[#7765E8]" />
                <span>Career Roadmap</span>
              </h3>
              <Link to="/roadmap" className="text-xs font-bold text-[#7765E8] hover:underline">
                View All
              </Link>
            </div>

            {roadmap ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#858397]">Milestone Completion</span>
                  <span className="text-[#7765E8] font-bold font-mono">{roadmap.overallProgress}%</span>
                </div>
                <div className="space-y-2.5">
                  {roadmap.stages.slice(0, 4).map((st) => (
                    <div key={st.stage} className="p-3.5 rounded-xl bg-[#FAFAFC] border border-[#EAE7F6] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#25243A]">{st.title}</div>
                        <div className="text-[11px] text-[#858397] font-medium">{st.duration}</div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        st.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-[#F3F0FF] text-[#25243A]'
                      }`}>
                        {st.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#858397]">Initialize your roadmap to track step-by-step career milestones.</p>
            )}
          </div>

          {/* Academic ML Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-[#F3F0FF] to-white border border-[#EAE7F6] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-[#7765E8] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Machine Learning Core</span>
            </div>
            <h4 className="font-bold text-[#25243A] text-sm">Genuinely Trained Models</h4>
            <p className="text-xs text-[#858397] leading-relaxed">
              Inspect test metrics, confusion matrix, and feature distributions generated directly by the Python pipeline.
            </p>
            <Link
              to="/ml-analytics"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7765E8] hover:underline pt-1"
            >
              <span>Open ML Analytics Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
