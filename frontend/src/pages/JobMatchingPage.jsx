import React, { useState, useEffect } from 'react';
import { jobAPI, resumeAPI } from '../services/api';
import {
  Briefcase,
  Search,
  Filter,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const JobMatchingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [latestResume, setLatestResume] = useState(null);
  const [error, setError] = useState('');

  // Fetch jobs and user resume
  useEffect(() => {
    const init = async () => {
      try {
        const [jobsRes, resumeRes] = await Promise.allSettled([
          jobAPI.getJobs({ limit: 30 }),
          resumeAPI.getLatest()
        ]);

        if (jobsRes.status === 'fulfilled') {
          setJobs(jobsRes.value.data.jobs || []);
          if (jobsRes.value.data.jobs?.length > 0) {
            setSelectedJob(jobsRes.value.data.jobs[0]);
          }
        }

        if (resumeRes.status === 'fulfilled') {
          setLatestResume(resumeRes.value.data.data);
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };

    init();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoadingJobs(true);
    try {
      const res = await jobAPI.getJobs({ query: searchQuery, category: categoryFilter, limit: 30 });
      setJobs(res.data.jobs || []);
      if (res.data.jobs?.length > 0) {
        setSelectedJob(res.data.jobs[0]);
      }
    } catch (err) {
      console.error('Job search error:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleRunMatch = async (jobToMatch) => {
    const target = jobToMatch || selectedJob;
    if (!target) return;

    if (!latestResume) {
      setError('Please upload a resume first under "Resume AI" before matching.');
      return;
    }

    setMatchingLoading(true);
    setError('');

    try {
      const res = await jobAPI.matchJob({
        jobId: target.job_id,
        jobTitle: target.title,
        jobDescription: target.description
      });
      setMatchResult(res.data.atsDetails || res.data.data);
    } catch (err) {
      console.error('Error matching job:', err);
      setError(err.response?.data?.message || 'Failed to calculate job compatibility.');
    } finally {
      setMatchingLoading(false);
    }
  };

  const categories = [
    'All',
    'JavaScript Developer',
    'Java Developer',
    'Machine Learning',
    'DevOps Engineer',
    'Node js developer',
    'Full Stack Developer',
    'Flutter Developer',
    'Backend Developer'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[#25243A] tracking-tight flex items-center gap-2.5">
          <Briefcase className="w-8 h-8 text-[#7765E8]" />
          <span>Semantic Job Matching & Explainable ATS Scoring</span>
        </h1>
        <p className="text-sm text-[#858397] max-w-3xl leading-relaxed">
          Search across 2,277 active job postings from the benchmark dataset. Select any role to execute real-time TF-IDF semantic alignment and explainable ATS compatibility breakdown.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <form onSubmit={handleSearch} className="p-4 rounded-3xl glass-card border border-white/90 flex flex-col md:flex-row gap-3 shadow-liquid">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-[#7E7C94] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job title, skills (e.g. React, Python, Kafka)..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/60 border border-white/90 text-[#212032] placeholder-[#7E7C94] text-xs font-medium focus:outline-none focus:border-[#7765E8] focus:bg-white backdrop-blur-sm"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-white/60 border border-white/90 text-[#212032] text-xs font-bold focus:outline-none focus:border-[#7765E8] backdrop-blur-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c === 'All' ? '' : c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-[#7765E8] hover:bg-[#6451D8] text-white text-xs font-bold shadow-md shadow-[#7765E8]/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Jobs</span>
          </button>
        </div>
      </form>

      {/* Main Matching Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Job Postings List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#858397] px-1">
            <span>Available Postings ({jobs.length})</span>
            <span>Click to Select & Match</span>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto custom-scrollbar pr-1">
            {loadingJobs ? (
              <div className="p-8 text-center text-xs text-[#858397] font-medium">Loading jobs from dataset...</div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#858397] font-medium">No jobs matched your query.</div>
            ) : (
              jobs.map((job) => {
                const isSelected = selectedJob?.job_id === job.job_id;
                return (
                  <div
                    key={job.job_id}
                    onClick={() => {
                      setSelectedJob(job);
                      setMatchResult(null);
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-[#7765E8] shadow-md shadow-[#7765E8]/10 ring-2 ring-[#7765E8]/20'
                        : 'glass-card border-[#EAE7F6] hover:border-[#7765E8]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#25243A]">{job.title}</h4>
                        <span className="text-[10px] text-[#7765E8] font-bold">Benchmark Requisition #{job.job_id}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#7765E8] translate-x-1' : 'text-[#858397]'}`} />
                    </div>

                    <p className="text-xs text-[#858397] line-clamp-2 mt-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.required_skills?.slice(0, 4).map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#F3F0FF] text-[#25243A] border border-[#EAE7F6]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Job & Real-time ATS Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedJob ? (
            <div className="p-8 rounded-3xl glass-card border border-white/90 space-y-6 shadow-liquid">
              {/* Job Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EAE7F6] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#212032]">{selectedJob.title}</h3>
                  <div className="text-xs text-[#7E7C94] mt-0.5 font-medium">
                    Benchmark Requisition #{selectedJob.job_id} • 2,277 Dataset Catalog
                  </div>
                </div>

                <button
                  onClick={() => handleRunMatch()}
                  disabled={matchingLoading}
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#7765E8] hover:bg-[#6451D8] text-white text-xs shadow-md shadow-[#7765E8]/20 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0 hover:shadow-lg"
                >
                  {matchingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Computing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Calculate ATS Match</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Match Result Display */}
              {matchResult ? (
                <div className="space-y-6 pt-2">
                  {/* Overall Compatibility Score Box */}
                  <div className="p-7 rounded-3xl glass-card border border-white/95 space-y-3 shadow-liquid">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#7765E8] uppercase tracking-wider">
                        Educational ATS Compatibility Score
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-[#25243A] font-mono">
                        {matchResult.overall_ats_score}%
                      </span>
                    </div>

                    <div className="w-full bg-[#EAE7F6] rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#7765E8] to-[#9BB9FF] h-3 rounded-full transition-all duration-700"
                        style={{ width: `${matchResult.overall_ats_score}%` }}
                      />
                    </div>

                    <p className="text-xs text-[#858397] leading-relaxed italic pt-1 font-medium">
                      "{matchResult.disclaimer || 'Explainable compatibility score based on skills, text similarity, and keywords.'}"
                    </p>
                  </div>

                  {/* 5-Dimension Heuristic Breakdown */}
                  {matchResult.breakdown && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#25243A]">
                        Score Dimension Breakdown
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6]">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#858397] font-medium">Required Skills Coverage (40%)</span>
                            <span className="text-[#25243A] font-bold font-mono">{matchResult.breakdown.skill_match}%</span>
                          </div>
                          <div className="w-full bg-[#F3F0FF] rounded-full h-2">
                            <div className="bg-[#7765E8] h-2 rounded-full" style={{ width: `${matchResult.breakdown.skill_match}%` }} />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6]">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#858397] font-medium">Semantic Relevance (25%)</span>
                            <span className="text-[#25243A] font-bold font-mono">{matchResult.breakdown.semantic_relevance}%</span>
                          </div>
                          <div className="w-full bg-[#F3F0FF] rounded-full h-2">
                            <div className="bg-[#9BB9FF] h-2 rounded-full" style={{ width: `${matchResult.breakdown.semantic_relevance}%` }} />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6]">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#858397] font-medium">Keyword Overlap (15%)</span>
                            <span className="text-[#25243A] font-bold font-mono">{matchResult.breakdown.keyword_overlap}%</span>
                          </div>
                          <div className="w-full bg-[#F3F0FF] rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${matchResult.breakdown.keyword_overlap}%` }} />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6]">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-[#858397] font-medium">Education & Experience (20%)</span>
                            <span className="text-[#25243A] font-bold font-mono">{matchResult.breakdown.qualification_relevance}%</span>
                          </div>
                          <div className="w-full bg-[#F3F0FF] rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${matchResult.breakdown.qualification_relevance}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Matched vs Missing Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Matched Skills ({matchResult.matched_skills?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matched_skills?.length > 0 ? (
                          matchResult.matched_skills.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-200 shadow-xs">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#858397]">No overlapping skills found.</span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
                      <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Missing Requirements ({matchResult.missing_skills?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missing_skills?.length > 0 ? (
                          matchResult.missing_skills.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-rose-800 border border-rose-200 shadow-xs">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-700 font-bold">Full skill coverage achieved!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {matchResult.recommendations?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#25243A]">
                        Actionable ATS Recommendations
                      </h4>
                      <div className="space-y-2">
                        {matchResult.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6] text-xs text-[#25243A] font-medium flex items-start gap-2">
                            <span className="text-[#7765E8] font-bold">•</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Full Job Description View */
                <div className="space-y-4">
                  <div className="text-xs font-bold text-[#25243A] uppercase tracking-wider">
                    Job Description Content
                  </div>
                  <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-[#EAE7F6] text-xs text-[#25243A] leading-relaxed max-h-[380px] overflow-y-auto whitespace-pre-line custom-scrollbar">
                    {selectedJob.description}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F3F0FF] border border-[#EAE7F6] flex items-center justify-between">
                    <div className="text-xs text-[#25243A] font-medium">
                      Click <strong className="text-[#7765E8]">Calculate ATS Match</strong> above to evaluate your resume against this requisition.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-[#858397] glass-card rounded-3xl">
              Select a job from the list on the left to inspect and run matching.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatchingPage;
