import React, { useState, useEffect } from 'react';
import { recruiterAPI } from '../services/api';
import {
  Users,
  Briefcase,
  Layers,
  Sparkles,
  Download,
  AlertCircle,
  ShieldCheck,
  PlusCircle,
  Trash2
} from 'lucide-react';

const SAMPLE_CANDIDATES = [
  {
    candidate_id: 'c-01',
    candidate_name: 'Priya Sharma',
    resume_text: `Data Scientist with 3 years of production experience in Python, Scikit-learn, Pandas, NumPy, PyTorch, SQL, Machine Learning, and Docker.
    Built automated predictive models and customer churn algorithms with 92% precision. Bachelor of Technology in Computer Science.`
  },
  {
    candidate_id: 'c-02',
    candidate_name: 'Rahul Verma',
    resume_text: `Java Backend Developer proficient in Core Java, Spring Boot, Microservices, Hibernate, Kafka, SQL, Docker, and PostgreSQL.
    Architected decoupled banking APIs handling high transaction volume. Bachelor of Engineering in IT.`
  },
  {
    candidate_id: 'c-03',
    candidate_name: 'Ananya Gupta',
    resume_text: `Full Stack Web Developer with experience in React, JavaScript, TypeScript, Node.js, Express, MongoDB, SQL, and Tailwind CSS.
    Developed 10+ responsive modern web applications with REST APIs. Bachelor of Science in Computer Applications.`
  },
  {
    candidate_id: 'c-04',
    candidate_name: 'Devansh Patel',
    resume_text: `DevOps & Cloud Engineer specializing in Docker, Kubernetes, AWS, Linux, Python, Terraform, Jenkins, and CI/CD pipelines.
    Automated zero-downtime deployment pipelines for microservice clusters. B.Tech in Computer Engineering.`
  }
];

const RecruiterPage = () => {
  const [targetJobTitle, setTargetJobTitle] = useState('Machine Learning Engineer');
  const [targetJobDescription, setTargetJobDescription] = useState(
    'Seeking an experienced Machine Learning Engineer with strong proficiency in Python, Scikit-learn, Pandas, NumPy, PyTorch, Machine Learning, Docker, and SQL to develop scalable predictive algorithms.'
  );

  const [candidatesToScreen, setCandidatesToScreen] = useState(SAMPLE_CANDIDATES);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateText, setNewCandidateText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [rankedResults, setRankedResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [error, setError] = useState('');

  // Domain Filter
  const [categoryFilter, setCategoryFilter] = useState('All');

  const executeBatchScreening = async (candidatesList = candidatesToScreen, title = targetJobTitle, desc = targetJobDescription) => {
    if (!desc.trim() || !candidatesList || candidatesList.length === 0) {
      setError('Please provide a job description and at least one candidate resume.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await recruiterAPI.batchScreen({
        jobTitle: title,
        jobDescription: desc,
        candidates: candidatesList
      });
      setRankedResults(res.data);
    } catch (err) {
      console.error('Batch screening error:', err);
      setError(err.response?.data?.message || 'Failed to complete batch screening. Verify backend and ML services are running.');
    } finally {
      setLoading(false);
    }
  };

  // Automatically execute initial batch screening on page load so rankings are immediately available
  useEffect(() => {
    executeBatchScreening(SAMPLE_CANDIDATES, targetJobTitle, targetJobDescription);
  }, []);

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!newCandidateName.trim() || !newCandidateText.trim()) return;
    const nextId = `c-0${candidatesToScreen.length + 1}`;
    const updated = [
      ...candidatesToScreen,
      {
        candidate_id: nextId,
        candidate_name: newCandidateName.trim(),
        resume_text: newCandidateText.trim()
      }
    ];
    setCandidatesToScreen(updated);
    setNewCandidateName('');
    setNewCandidateText('');
    setShowAddForm(false);
    executeBatchScreening(updated, targetJobTitle, targetJobDescription);
  };

  const handleRemoveCandidate = (id) => {
    if (candidatesToScreen.length <= 1) return;
    const updated = candidatesToScreen.filter((c) => c.candidate_id !== id);
    setCandidatesToScreen(updated);
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

  const availableCategories = rankedResults?.rankedCandidates
    ? ['All', ...Array.from(new Set(rankedResults.rankedCandidates.map((c) => c.predicted_category)))]
    : ['All'];

  const filteredRanked = rankedResults?.rankedCandidates
    ? categoryFilter === 'All'
      ? rankedResults.rankedCandidates
      : rankedResults.rankedCandidates.filter((c) => c.predicted_category === categoryFilter)
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
          ASCEND AI strictly scores candidates on extracted skills, TF-IDF cosine similarity, and keyword coverage.
          No scoring is inferred from age, gender, caste, religion, or protected personal traits. Final hiring determinations should always combine human review with holistic interview evaluation.
        </div>
      </div>

      {/* Main Grid: Requisition Settings vs Candidate Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requisition Configuration & Staged Candidates (5 Cols) */}
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
                rows={4}
                value={targetJobDescription}
                onChange={(e) => setTargetJobDescription(e.target.value)}
                placeholder="Describe key responsibilities and required stack..."
                className="w-full p-4 rounded-2xl bg-white/70 border border-white/80 text-[#212032] text-xs font-medium focus:outline-none focus:border-[#7765E8] focus:bg-white leading-relaxed shadow-xs"
              />
            </div>

            {/* Staged Candidate Pool */}
            <div className="space-y-2.5 pt-2 border-t border-white/80">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7E7C94] font-medium">
                  Candidates Staged for Screening:{' '}
                  <strong className="text-[#212032] font-bold font-mono">{candidatesToScreen.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs font-bold text-[#7765E8] hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{showAddForm ? 'Cancel' : 'Add Candidate'}</span>
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddCandidate} className="p-3.5 rounded-2xl bg-white/80 border border-white space-y-2.5">
                  <input
                    type="text"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    placeholder="Candidate Full Name"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE7F6] text-xs text-[#212032] font-medium focus:outline-none focus:border-[#7765E8]"
                    required
                  />
                  <textarea
                    rows={3}
                    value={newCandidateText}
                    onChange={(e) => setNewCandidateText(e.target.value)}
                    placeholder="Paste candidate resume text and skills..."
                    className="w-full p-3 rounded-xl bg-white border border-[#EAE7F6] text-xs text-[#212032] font-medium focus:outline-none focus:border-[#7765E8]"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-[#7765E8] text-white text-xs font-bold hover:bg-[#6451D8] transition-all"
                  >
                    Add & Screen Candidate
                  </button>
                </form>
              )}

              <div className="max-h-44 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {candidatesToScreen.map((cand) => (
                  <div
                    key={cand.candidate_id}
                    className="p-2.5 rounded-xl bg-white/65 border border-white/80 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[#212032] truncate">
                        {cand.candidate_name}{' '}
                        <span className="text-[10px] font-mono text-[#7E7C94]">({cand.candidate_id})</span>
                      </div>
                      <div className="text-[11px] text-[#7E7C94] truncate">{cand.resume_text}</div>
                    </div>
                    {candidatesToScreen.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCandidate(cand.candidate_id)}
                        className="text-[#7E7C94] hover:text-rose-600 p-1 shrink-0"
                        title="Remove candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => executeBatchScreening(candidatesToScreen, targetJobTitle, targetJobDescription)}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold bg-[#7765E8] hover:bg-[#6451D8] text-white text-xs shadow-md shadow-[#7765E8]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Running ML Batch Evaluation...</span>
                  </>
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
                  {rankedResults
                    ? `Screened ${rankedResults.totalScreened} candidates for "${rankedResults.jobTitle}"`
                    : 'Executing batch evaluation...'}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end">
                {availableCategories.length > 2 && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-white/70 text-[#212032] border border-white/80 focus:outline-none"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? 'All Domains' : cat}
                      </option>
                    ))}
                  </select>
                )}

                {rankedResults && (
                  <button
                    onClick={handleExportCSV}
                    disabled={downloadingCSV}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/70 hover:bg-white text-[#212032] border border-white/80 flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-[#7765E8]" />
                    <span>{downloadingCSV ? 'Exporting...' : 'Export CSV'}</span>
                  </button>
                )}
              </div>
            </div>

            {rankedResults?.requiredSkills?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-bold text-[#7E7C94] mr-1">Extracted Requisition Skills:</span>
                {rankedResults.requiredSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-[#7765E8]/10 text-[#7765E8] font-bold border border-[#7765E8]/20"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading && !rankedResults ? (
              <div className="p-12 text-center text-[#7E7C94] space-y-3">
                <div className="w-8 h-8 border-3 border-[#7765E8]/20 border-t-[#7765E8] rounded-full animate-spin mx-auto" />
                <p className="text-xs font-medium">Ranking candidates through Python ML pipeline...</p>
              </div>
            ) : filteredRanked.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/80 text-[#7E7C94] font-bold">
                        <th className="py-3 px-2.5">Rank</th>
                        <th className="py-3 px-2.5">Candidate</th>
                        <th className="py-3 px-2.5">Predicted Domain</th>
                        <th className="py-3 px-2.5">ATS Score</th>
                        <th className="py-3 px-2.5">Skill / Semantic</th>
                        <th className="py-3 px-2.5">Matched & Missing Skills</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/80">
                      {filteredRanked.map((c, idx) => (
                        <tr key={c.candidate_id} className="hover:bg-white/60 transition-colors">
                          <td className="py-3.5 px-2.5 font-mono font-black text-[#7765E8]">
                            #{idx + 1}
                          </td>
                          <td className="py-3.5 px-2.5">
                            <div className="font-bold text-[#212032]">{c.candidate_name}</div>
                            <div className="text-[10px] text-[#7E7C94] font-medium">{c.candidate_id}</div>
                          </td>
                          <td className="py-3.5 px-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7765E8]/10 text-[#7765E8] border border-[#7765E8]/20">
                              {c.predicted_category}
                            </span>
                          </td>
                          <td className="py-3.5 px-2.5 font-mono font-black text-emerald-600 text-sm">
                            {c.ats_score}%
                          </td>
                          <td className="py-3.5 px-2.5 font-mono text-[11px] text-[#212032]">
                            <div>Skill: <strong>{c.skill_match_pct}%</strong></div>
                            <div className="text-[#7E7C94]">Cosine: {c.semantic_score}%</div>
                          </td>
                          <td className="py-3.5 px-2.5">
                            <div className="flex flex-wrap gap-1 max-w-[230px]">
                              {(c.matched_skills || []).slice(0, 4).map((sk, sidx) => (
                                <span
                                  key={`m-${sidx}`}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                >
                                  ✓ {sk}
                                </span>
                              ))}
                              {(c.missing_skills || []).slice(0, 2).map((sk, sidx) => (
                                <span
                                  key={`x-${sidx}`}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200"
                                >
                                  ✕ {sk}
                                </span>
                              ))}
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
                  Click <strong className="text-[#7765E8]">Execute Batch Candidate Screening</strong> to run all staged candidate resumes through the Python ML parser and rank them by compatibility.
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
