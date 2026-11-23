import React, { useState, useEffect } from 'react';
import { careerAPI, resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { resolveTargetRole, computeRoleSkillGap } from '../utils/roleStandards';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';

const CoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const resumeRes = await resumeAPI.getLatest().catch(() => null);
        const resume = resumeRes?.data?.data;

        const targetRole = resolveTargetRole(user?.targetRole, resume?.predictedCategory);
        const { missingSkills: actualMissing } = computeRoleSkillGap(
          targetRole,
          resume?.extractedSkills || []
        );

        const missingSkillsToSend = actualMissing.length > 0
          ? actualMissing
          : ['Docker', 'Kubernetes', 'System Design', 'Microservices', 'AWS'];

        const res = await careerAPI.getCourses({
          missingSkills: missingSkillsToSend,
          targetRole: targetRole
        });

        // Strict deduplication by courseId, normalized title, URL, and skill
        const rawCourses = res.data.data || [];
        const seenIds = new Set();
        const seenTitles = new Set();
        const seenUrls = new Set();
        const deduplicated = [];

        for (const c of rawCourses) {
          const cid = (c.courseId || c.course_id || '').trim().toLowerCase();
          const ctitle = (c.title || '').trim().toLowerCase();
          const curl = (c.url || '').trim().toLowerCase();

          if (
            (cid && seenIds.has(cid)) ||
            (ctitle && seenTitles.has(ctitle)) ||
            (curl && seenUrls.has(curl))
          ) {
            continue;
          }
          if (cid) seenIds.add(cid);
          if (ctitle) seenTitles.add(ctitle);
          if (curl) seenUrls.add(curl);
          deduplicated.push(c);
        }

        setCourses(deduplicated);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load course recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user?.targetRole]);

  const handleToggleCompletion = async (courseId) => {
    try {
      const res = await careerAPI.toggleCourse(courseId);
      setCourses(prev =>
        prev.map(c => (c._id === courseId ? { ...c, completed: res.data.data.completed } : c))
      );
    } catch (err) {
      console.error('Error updating course completion:', err);
    }
  };

  const filteredCourses = filter === 'All'
    ? courses
    : filter === 'Completed'
    ? courses.filter(c => c.completed)
    : courses.filter(c => !c.completed);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[#25243A] tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-8 h-8 text-[#7765E8]" />
          <span>Curated Course Recommendations</span>
        </h1>
        <p className="text-sm text-[#858397] max-w-3xl leading-relaxed">
          High-yield, verified learning pathways targeted specifically at your identified skill gaps. Sourced strictly from official documentation and accredited institutions with direct resource links.
        </p>
      </div>

      {/* Filter Tabs & Completed Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl glass-card border border-white/90 shadow-liquid">
        <div className="flex gap-2">
          {['All', 'In Progress', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-[#7765E8] text-white shadow-sm'
                  : 'bg-white/60 hover:bg-white text-[#212032] border border-white/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#858397] flex items-center gap-2 font-medium">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>
            <strong className="text-emerald-600 font-bold font-mono">
              {courses.filter(c => c.completed).length}
            </strong> of <strong className="text-[#25243A] font-bold font-mono">{courses.length}</strong> courses completed
          </span>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#858397] font-medium">Loading course recommendations...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#858397] glass-card rounded-3xl">No courses found for this filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id || course.courseId}
              className={`p-7 rounded-3xl border transition-all flex flex-col justify-between ${
                course.completed
                  ? 'bg-emerald-50/60 border-emerald-200 shadow-sm'
                  : 'glass-card border-[#EAE7F6] hover:border-[#7765E8]/40 shadow-card'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#7765E8]/10 text-[#7765E8] border border-[#7765E8]/20">
                      {course.skill}
                    </span>
                    <h3 className="text-lg font-bold text-[#25243A] pt-1 leading-snug">{course.title}</h3>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold shrink-0 ${
                    course.difficulty === 'Beginner'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : course.difficulty === 'Advanced'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  }`}>
                    {course.difficulty}
                  </span>
                </div>

                <div className="text-xs text-[#858397] flex items-center gap-1.5 font-medium">
                  <span>Provider:</span>
                  <span className="text-[#25243A] font-bold">{course.provider}</span>
                </div>

                <p className="text-xs text-[#25243A] bg-[#FAFAFC] p-3.5 rounded-2xl border border-[#EAE7F6] leading-relaxed font-medium">
                  <strong className="text-[#7765E8]">Recommendation Rationale: </strong>
                  {course.reason}
                </p>
              </div>

              <div className="pt-6 border-t border-[#EAE7F6] mt-6 flex items-center justify-between gap-3">
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7765E8] hover:underline transition-colors"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleToggleCompletion(course._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    course.completed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#F3F0FF] text-[#25243A] hover:bg-[#EAE7F6]'
                  }`}
                >
                  {course.completed ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <span>Mark as Done</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
