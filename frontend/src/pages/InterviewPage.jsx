import React, { useState, useEffect } from 'react';
import { careerAPI, resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { resolveTargetRole } from '../utils/roleStandards';
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  BookOpen
} from 'lucide-react';

const InterviewPage = () => {
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState(resolveTargetRole(user?.targetRole));
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchQuestions = async (title) => {
    setLoading(true);
    try {
      const res = await careerAPI.getInterviewQuestions({
        jobTitle: title || jobTitle
      });
      setSession(res.data.data);
    } catch (err) {
      console.error('Error fetching interview questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeRole = resolveTargetRole(user?.targetRole);
    setJobTitle(activeRole);
    fetchQuestions(activeRole);
  }, [user?.targetRole]);

  const handleTogglePracticed = async (idx) => {
    if (!session) return;
    try {
      const res = await careerAPI.toggleInterviewPractice({
        sessionId: session._id,
        questionIndex: idx
      });
      setSession(res.data.data);
    } catch (err) {
      console.error('Error toggling practice:', err);
    }
  };

  const questions = session?.questions || [];
  const practicedCount = questions.filter(q => q.practiced).length;

  const categories = ['All', 'Technical', 'Conceptual', 'Scenario-based', 'Skill-gap-focused', 'HR & Behavioral'];

  const filteredQuestions = selectedCategory === 'All'
    ? questions
    : questions.filter(q => q.category === selectedCategory || (selectedCategory === 'HR & Behavioral' && q.category.includes('HR')));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[#25243A] tracking-tight flex items-center gap-2.5">
          <MessageSquare className="w-8 h-8 text-[#7765E8]" />
          <span>Role-Specific Interview Preparation Engine</span>
        </h1>
        <p className="text-sm text-[#858397] max-w-3xl leading-relaxed">
          Dynamic interview questions generated for your target role and identified skill gaps. Includes structured answer guides using the STAR method (Situation, Task, Action, Result) and actionable preparation tips.
        </p>
      </div>

      {/* Target Role Selector & Refresh Bar */}
      <div className="p-5 rounded-3xl glass-card border border-white/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-liquid">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#212032] uppercase tracking-wider shrink-0">Role:</span>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Target Job Title (e.g. Node js developer)"
            className="w-full sm:w-64 px-4 py-2.5 rounded-2xl bg-white/70 border border-white/80 text-[#212032] text-xs font-medium focus:outline-none focus:border-[#7765E8] focus:bg-white shadow-xs"
          />
          <button
            type="button"
            onClick={() => fetchQuestions(jobTitle)}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-[#7765E8] hover:bg-[#6451D8] text-white text-xs font-bold shadow-md shadow-[#7765E8]/20 transition-all shrink-0 hover:shadow-lg"
          >
            {loading ? 'Synthesizing...' : 'Generate Drill'}
          </button>
        </div>

        <div className="text-xs text-[#7E7C94] flex items-center gap-2 font-medium">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>
            <strong className="text-emerald-600 font-bold font-mono">{practicedCount}</strong> of{' '}
            <strong className="text-[#212032] font-bold font-mono">{questions.length}</strong> questions mastered
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-[#7765E8] text-white shadow-sm'
                : 'bg-white/70 text-[#212032] hover:bg-white/95 border border-white/70 shadow-xs'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#7E7C94] font-medium">Synthesizing role questions...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7E7C94] glass-card rounded-3xl border border-white/80 shadow-liquid">No questions in this category.</div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className={`p-7 rounded-3xl border transition-all ${
                  q.practiced
                    ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs backdrop-blur-md'
                    : 'glass-card border-white/80 hover:border-[#7765E8]/40 shadow-liquid'
                }`}
              >
                <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}>
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        q.category === 'Technical'
                          ? 'bg-[#7765E8]/10 text-[#7765E8] border border-[#7765E8]/20'
                          : q.category === 'Skill-gap-focused'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-purple-50 text-purple-600 border border-purple-200'
                      }`}>
                        {q.category}
                      </span>
                      <span className="text-xs text-[#7E7C94] font-medium">• {q.topic}</span>
                      <span className="text-[10px] text-[#7E7C94] font-mono">({q.difficulty})</span>
                    </div>

                    <h3 className="text-base font-bold text-[#212032] pt-1">{q.question}</h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePracticed(idx);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        q.practiced
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/80 text-[#212032] hover:bg-white border border-white/80'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{q.practiced ? 'Mastered' : 'Mark Practiced'}</span>
                    </button>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#7E7C94]" /> : <ChevronDown className="w-4 h-4 text-[#7E7C94]" />}
                  </div>
                </div>

                {/* Expanded Answer Structure and Tips */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-white/80 space-y-4">
                    <div className="p-4 rounded-2xl bg-white/70 border border-white/80 space-y-1.5 backdrop-blur-md">
                      <div className="text-xs font-bold text-[#7765E8] uppercase tracking-wider">
                        Suggested Answer Structure (STAR / Engineering Breakdown)
                      </div>
                      <p className="text-xs text-[#212032] leading-relaxed whitespace-pre-line font-medium">
                        {q.answer_structure}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F1EEFD]/70 border border-white/80 space-y-1 backdrop-blur-md">
                      <div className="text-xs font-bold text-[#212032] uppercase tracking-wider">
                        Preparation Tip
                      </div>
                      <p className="text-xs text-[#7E7C94] leading-relaxed font-medium">
                        {q.prep_tips}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
