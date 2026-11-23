import React from 'react';
import { Sparkles, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/70 bg-white/45 backdrop-blur-2xl text-[#7E7C94] py-12 px-4 sm:px-6 lg:px-8 mt-auto z-10 relative shadow-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7765E8] to-[#9BB9FF] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-[#25243A] tracking-tight">
              ASCEND <span className="text-[#7765E8]">AI</span>
            </span>
          </div>
          <p className="text-sm text-[#858397] max-w-md leading-relaxed">
            AI-Powered Career Intelligence and Advancement Platform. Genuinely trained machine learning models,
            multiclass resume classification across 25 professional domains, explainable ATS compatibility scoring,
            and semantic job matching.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg text-xs bg-white border border-[#EAE7F6] text-[#25243A] font-mono shadow-xs">React 18 + Vite</span>
            <span className="px-2.5 py-1 rounded-lg text-xs bg-white border border-[#EAE7F6] text-[#25243A] font-mono shadow-xs">Node / Express</span>
            <span className="px-2.5 py-1 rounded-lg text-xs bg-white border border-[#EAE7F6] text-[#25243A] font-mono shadow-xs">MongoDB</span>
            <span className="px-2.5 py-1 rounded-lg text-xs bg-white border border-[#EAE7F6] text-[#25243A] font-mono shadow-xs">Python FastAPI</span>
            <span className="px-2.5 py-1 rounded-lg text-xs bg-white border border-[#EAE7F6] text-[#25243A] font-mono shadow-xs">Scikit-Learn ML</span>
          </div>
        </div>

        {/* Career Tools */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#25243A] mb-3">Intelligence Modules</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/resume-analysis" className="hover:text-[#7765E8] transition-colors">Resume Classification</Link></li>
            <li><Link to="/job-matching" className="hover:text-[#7765E8] transition-colors">Explainable ATS Scoring</Link></li>
            <li><Link to="/skill-gap" className="hover:text-[#7765E8] transition-colors">Skill Gap Discovery</Link></li>
            <li><Link to="/courses" className="hover:text-[#7765E8] transition-colors">Verified Course Matcher</Link></li>
            <li><Link to="/interview" className="hover:text-[#7765E8] transition-colors">Role Interview Prep</Link></li>
            <li><Link to="/roadmap" className="hover:text-[#7765E8] transition-colors">Actionable Career Roadmap</Link></li>
          </ul>
        </div>

        {/* Research & University Context */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#25243A] mb-3">Academic Evaluation</h4>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/ml-analytics" className="hover:text-[#7765E8] transition-colors">Supervised Model Comparison</Link></li>
            <li><Link to="/ml-analytics" className="hover:text-[#7765E8] transition-colors">Confusion Matrix Heatmap</Link></li>
            <li><Link to="/ml-analytics" className="hover:text-[#7765E8] transition-colors">Dual-Corpus Verification</Link></li>
            <li><Link to="/recruiter" className="hover:text-[#7765E8] transition-colors">Recruiter Batch Screening</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#EAE7F6] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#858397] gap-4">
        <p>© 2026 ASCEND AI — 5th Semester Artificial Intelligence & Machine Learning Project.</p>
        <p className="flex items-center gap-1.5 font-medium">
          <Award className="w-3.5 h-3.5 text-[#7765E8]" />
          <span>Genuinely trained with Scikit-learn on 25 Resume Categories</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
