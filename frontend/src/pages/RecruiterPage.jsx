import React, { useState, useEffect } from 'react';
import { recruiterAPI } from '../services/api';
import {
  Users,
  Briefcase,
  Layers,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  PlusCircle,
  FileText
} from 'lucide-react';

const SAMPLE_CANDIDATES = [
  {
    candidate_id: 'c-01',
    candidate_name: 'Priya Sharma',
    resume_text: `Data Scientist with 3 years of production experience in Python, Scikit-learn, Pandas, PyTorch, SQL, and Docker.
    Built automated predictive models and customer churn algorithms with 92% precision. Bachelor of Technology in Computer Science.`
  },
  {
    candidate_id: 'c-02',
    candidate_name: 'Rahul Verma',
    resume_text: `Java Backend Developer proficient in Core Java, Spring Boot, Microservices, Hibernate, Kafka, and PostgreSQL.
    Architected decoupled banking APIs handling high transaction volume. Bachelor of Engineering in IT.`
  },
  {
    candidate_id: 'c-03',
    candidate_name: 'Ananya Gupta',
    resume_text: `Full Stack Web Developer with experience in React, JavaScript, Node.js, Express, MongoDB, and Tailwind CSS.
    Developed 10+ responsive modern web applications with REST APIs. Bachelor of Science in Computer Applications.`
  },
  {
    candidate_id: 'c-04',
    candidate_name: 'Devansh Patel',
    resume_text: `DevOps & Cloud Engineer specializing in Docker, Kubernetes, AWS, Linux, Terraform, and CI/CD pipelines.
    Automated zero-downtime deployment pipelines for microservice clusters. B.Tech in Computer Engineering.`
  }
];

const RecruiterPage = () => {
  const [activeTab, setActiveTab] = useState('screening');
  const [targetJobTitle, setTargetJobTitle] = useState('Machine Learning Engineer');
  const [targetJobDescription, setTargetJobDescription] = useState(
    'Seeking an experienced Machine Learning Engineer with strong proficiency in Python, Scikit-learn, Pandas, PyTorch, Docker, and SQL to develop scalable predictive algorithms.'
  );

  const [candidatesToScreen, setCandidatesToScreen] = useState(SAMPLE_CANDIDATES);
  const [rankedResults, setRankedResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [error, setError] = useState('');

  // Status Filter
  const [categoryFilter, setCategoryFilter] = useState('All');

  const handleRunBatchScreening = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await recruiterAPI.batchScreen({
        jobTitle: targetJobTitle,
        jobDescription: targetJobDescription,
        candidates: candidatesToScreen
      });
      setRankedResults(res.data);
    } catch (err) {
      console.error('Batch screening error:', err);
      setError(err.response?.data?.message || 'Failed to complete batch screening.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setDownloadingCSV(true);
    try {
      const res = await recruiterAPI.exportCSV();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `ascend_screened_candidates_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Authenticated CSV export failed:', err);
      setError('Failed to download candidate CSV. Please check your credentials.');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const filteredRanked = rankedResults
    ? categoryFilter === 'All'
      ? rankedResults.rankedCandidates
      : rankedResults.rankedCandidates.filter(c => c.predicted_category === categoryFilter)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[#25243A] tracking-tight flex items-center gap-2.5">
          <Users className="w-8 h-8 text-[#7765E8]" />
          <span>Recruiter Candidate Screening & Ranking Portal</span>
        </h1>
        <p className="text-sm text-[#858397] max-w-3xl leading-relaxed">
          Batch screen multiple candidate resumes against job requisitions. Calculates genuine compatibility scores using our Python ML pipeline, with fair hiring transparency and direct CSV export.
        </p>
      </div>

      {/* Fair Hiring Transparency Safeguard Banner */}
      <div className="p-5 rounded-3xl bg-[#F1EEFD]/80 border border-white/80 flex items-start gap-3.5 shadow-liquid backdrop-blur-md">
        <ShieldCheck className="w-5 h-5 text-[#7765E8] shrink-0 mt-0.5" />
        <div className="text-xs text-[#212032] leading-relaxed font-medium">
          <strong className="text-[#7765E8] font-bold">Fair Hiring Safeguard & Compliance: </strong>
          ASCEND AI strictly scores candidates on extracted skills, semantic relevance, and keyword coverage.
          No scoring is inferred from age, gender, caste, religion, or protected personal traits. Final hiring determinations should always combine human review with holistic interview evaluation.
        </div>
      </div>

      {/* Main Grid: Requisition Settings vs Candidate Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requisition Configuration (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-7 rounded-3xl glass-card border border-white/80 space-y-4 shadow-liquid">
            <h3 className="text-xs font-bold text-[#212032] uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#7765E8]" />
              <span>Job Requisition Profile</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#212032] mb-1.5">Target Job Title</label>
              <input
                type="text"
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                placeholder="e.g. Machine Learning Engineer"
                className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-white/80 text-[#212032] text-xs font-medium focus:outline-none focus:border-[#7765E8] focus:bg-white shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#212032] mb-1.5">Job Requirements & Description</label>
              <textarea
                rows={6}
                value={targetJobDescription}
                onChange={(e) => setTargetJobDescription(e.target.value)}
                placeholder="Describe key responsibilities and required stack..."
                className="w-full p-4 rounded-2xl bg-white/70 border border-white/80 text-[#212032] text-xs font-medium focus:outline-none focus:border-[#7765E8] focus:bg-white leading-relaxed shadow-xs"
              />
            </div>

            <div className="pt-2">
              <div className="text-xs text-[#7E7C94] mb-2 font-medium">Candidates Staged for Screening: <strong className="text-[#212032] font-bold font-mono">{candidatesToScreen.length}</strong></div>
              <button
                onClick={handleRunBatchScreening}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold bg-[#7765E8] hover:bg-[#6451D8] text-white text-xs shadow-md shadow-[#7765E8]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Execute Batch Candidate Screening</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Ranked Candidates Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-7 rounded-3xl glass-card border border-white/80 space-y-4 shadow-liquid">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#212032] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#7765E8]" />
                  <span>Ranked Candidates Leaderboard</span>
                </h3>
                <span className="text-xs text-[#7E7C94] font-medium">
                  {rankedResults ? `Screened ${rankedResults.totalScreened} candidates against requirements` : 'Awaiting batch execution'}
                </span>
              </div>

              {rankedResults && (
                <button
                  onClick={handleExportCSV}
                  disabled={downloadingCSV}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/70 hover:bg-white text-[#212032] border border-white/80 flex items-center gap-1.5 transition-all self-end shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#7765E8]" />
                  <span>{downloadingCSV ? 'Exporting...' : 'Export CSV'}</span>
                </button>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {rankedResults ? (
              <div className="space-y-4">
                {/* Ranking Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/80 text-[#7E7C94] font-bold">
                        <th className="py-3 px-3">Rank</th>
                        <th className="py-3 px-3">Candidate</th>
                        <th className="py-3 px-3">Predicted Domain</th>
                        <th className="py-3 px-3">ATS Score</th>
                        <th className="py-3 px-3">Matched Skills</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/80">
                      {rankedResults.rankedCandidates.map((c, idx) => (
                        <tr key={c.candidate_id} className="hover:bg-white/60 transition-colors">
                          <td className="py-3.5 px-3 font-mono font-black text-[#7765E8]">
                            #{idx + 1}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-[#212032]">{c.candidate_name}</div>
                            <div className="text-[10px] text-[#7E7C94] font-medium">{c.candidate_id}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7765E8]/10 text-[#7765E8] border border-[#7765E8]/20">
                              {c.predicted_category}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono font-black text-emerald-600 text-sm">
                            {c.ats_score}%
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {c.matched_skills.slice(0, 3).map((sk, sidx) => (
                                <span key={sidx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F1EEFD] text-[#212032] border border-white/80">
                                  {sk}
                                </span>
                              ))}
                              {c.matched_skills.length > 3 && (
                                <span className="text-[10px] text-[#7E7C94] font-bold">+{c.matched_skills.length - 3}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[#7E7C94] space-y-3">
                <p className="text-xs font-medium">
                  Click <strong className="text-[#7765E8]">Execute Batch Candidate Screening</strong> to run all 4 staged candidate resumes through the Python ML parser and rank them by compatibility.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterPage;
