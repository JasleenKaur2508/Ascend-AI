import React, { useState, useEffect } from 'react';
import { careerAPI, resumeAPI } from '../services/api';
import {
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  AlertCircle,
  RefreshCw,
  Edit3
} from 'lucide-react';

const ResumeEnhancerPage = () => {
  const [targetJobTitle, setTargetJobTitle] = useState('Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [enhancedData, setEnhancedData] = useState(null);
  const [activeTab, setActiveTab] = useState('executive');
  const [editableText, setEditableText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await careerAPI.enhanceSummary({
        targetJobTitle,
        jobDescription
      });
      const data = res.data.data;
      setEnhancedData(data);
      setEditableText(data.executive_summary);
      setActiveTab('executive');
    } catch (err) {
      console.error('Error enhancing summary:', err);
      setError(err.response?.data?.message || 'Upload a resume first under "Resume AI" to generate summaries.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (!enhancedData) return;
    if (tab === 'executive') setEditableText(enhancedData.executive_summary);
    if (tab === 'technical') setEditableText(enhancedData.technical_summary);
    if (tab === 'concise') setEditableText(enhancedData.concise_summary);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[#25243A] tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-8 h-8 text-[#7765E8]" />
          <span>Factual AI Resume Summary Enhancer</span>
        </h1>
        <p className="text-sm text-[#858397] max-w-3xl leading-relaxed">
          Synthesizes tailored, role-specific professional resume summaries strictly grounded in your verified competencies. Strictly avoids hallucination or invented credentials.
        </p>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Settings */}
        <div className="p-7 rounded-3xl glass-card border border-white/80 space-y-4 shadow-liquid">
          <h3 className="text-xs font-bold text-[#212032] uppercase tracking-wider">
            Tailor Target Role
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#212032] mb-1.5">Target Job Title</label>
            <input
              type="text"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              placeholder="e.g. Senior Data Scientist"
              className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-white/80 text-[#212032] text-xs font-medium focus:outline-none focus:border-[#7765E8] focus:bg-white shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212032] mb-1.5">Target Job Description (Optional)</label>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job posting snippet to harmonize terminology..."
              className="w-full p-4 rounded-2xl bg-white/70 border border-white/80 text-[#212032] text-xs font-medium focus:outline-none focus:border-[#7765E8] focus:bg-white shadow-xs"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold bg-[#7765E8] hover:bg-[#6451D8] text-white text-xs shadow-md shadow-[#7765E8]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Professional Summary</span>
              </>
            )}
          </button>
        </div>

        {/* Right 2 Columns: Enhanced Output & Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-7 rounded-3xl glass-card border border-white/80 space-y-4 shadow-liquid">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/80 pb-3">
              {/* Variant Tabs */}
              <div className="flex gap-1.5 bg-[#F1EEFD]/80 p-1 rounded-2xl border border-white/80">
                <button
                  type="button"
                  onClick={() => switchTab('executive')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'executive' ? 'bg-[#7765E8] text-white shadow-xs' : 'text-[#7E7C94] hover:text-[#212032]'
                  }`}
                >
                  Executive Variant
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('technical')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'technical' ? 'bg-[#7765E8] text-white shadow-xs' : 'text-[#7E7C94] hover:text-[#212032]'
                  }`}
                >
                  Technical Stack
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('concise')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'concise' ? 'bg-[#7765E8] text-white shadow-xs' : 'text-[#7E7C94] hover:text-[#212032]'
                  }`}
                >
                  Concise ATS
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!editableText}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/70 hover:bg-white text-[#212032] border border-white/80 flex items-center gap-1.5 transition-all self-end disabled:opacity-50 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#7E7C94]" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
              </button>
            </div>

            {/* Editable Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#7E7C94] font-medium">
                <span className="flex items-center gap-1.5">
                  <Edit3 className="w-3 h-3 text-[#7765E8]" />
                  <span>Editable Summary Preview</span>
                </span>
                <span>{editableText.length} characters</span>
              </div>

              <textarea
                rows={6}
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                placeholder="Click 'Generate Professional Summary' to synthesize tailored variants..."
                className="w-full p-4 rounded-2xl bg-white/70 border border-white/80 text-[#212032] text-sm leading-relaxed focus:outline-none focus:border-[#7765E8] focus:bg-white custom-scrollbar font-sans shadow-xs"
              />
            </div>

            {/* Factual Integrity Safeguard Note */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-[#212032] leading-relaxed font-medium">
                <strong className="text-emerald-700">Factual Integrity Guarantee: </strong>
                {enhancedData?.factual_integrity_note ||
                  'All summaries are constructed algorithmically from verified resume tokens and skills. No fictitious employers, certifications, or false claims are generated.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEnhancerPage;
