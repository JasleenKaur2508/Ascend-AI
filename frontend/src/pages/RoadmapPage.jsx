import React, { useState, useEffect } from 'react';
import { careerAPI } from '../services/api';
import {
  Map,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Target,
  ArrowRight
} from 'lucide-react';

const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRoadmap = async () => {
    try {
      const res = await careerAPI.getRoadmap();
      setRoadmap(res.data.data);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setError('Failed to load career roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleTask = async (stageNumber, taskId) => {
    try {
      const res = await careerAPI.toggleRoadmapTask({ stageNumber, taskId });
      setRoadmap(res.data.data);
    } catch (err) {
      console.error('Error toggling roadmap task:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[#25243A] tracking-tight flex items-center gap-2.5">
          <Map className="w-8 h-8 text-[#7765E8]" />
          <span>Personalized 6-Stage Career Preparation Roadmap</span>
        </h1>
        <p className="text-sm text-[#858397] max-w-3xl leading-relaxed">
          An actionable, milestone-driven preparation plan generated from your resume analysis and target role requisitions. Track individual tasks across all six phases of career advancement.
        </p>
      </div>

      {/* Overall Progress Banner */}
      {roadmap && (
        <div className="p-7 rounded-3xl glass-card border border-white/80 space-y-4 shadow-liquid">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-[#7765E8] uppercase tracking-wider">
                Overall Career Readiness Progress
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#212032] font-mono mt-1">
                {roadmap.overallProgress}% Completed
              </div>
            </div>
            <div className="text-xs text-[#7E7C94] font-medium">
              Target Position: <strong className="text-[#212032] font-bold">{roadmap.targetRole}</strong>
            </div>
          </div>

          <div className="w-full bg-[#F1EEFD]/80 rounded-full h-3 overflow-hidden border border-white/60">
            <div
              className="bg-gradient-to-r from-[#7765E8] to-[#9BB9FF] h-3 rounded-full transition-all duration-700"
              style={{ width: `${roadmap.overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 6 Stages Timeline / Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#7E7C94] font-medium">Generating career roadmap...</div>
      ) : !roadmap ? (
        <div className="p-12 text-center text-xs text-[#7E7C94] glass-card rounded-3xl border border-white/80 shadow-liquid">{error || 'Roadmap unavailable.'}</div>
      ) : (
        <div className="space-y-6">
          {roadmap.stages.map((stage) => {
            const completedCount = stage.tasks.filter(t => t.completed).length;
            const isStageDone = completedCount === stage.tasks.length && stage.tasks.length > 0;

            return (
              <div
                key={stage.stage}
                className={`p-7 rounded-3xl border transition-all ${
                  isStageDone
                    ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs backdrop-blur-md'
                    : 'glass-card border-white/80 shadow-liquid'
                }`}
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-[#7765E8]/10 text-[#7765E8] flex items-center justify-center text-xs font-black font-mono shadow-xs border border-[#7765E8]/20">
                        {stage.stage}
                      </span>
                      <h3 className="text-lg font-bold text-[#212032]">{stage.title}</h3>
                    </div>
                    <p className="text-xs text-[#7E7C94] max-w-2xl font-medium">{stage.objective}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1.5 text-xs text-[#7E7C94] font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{stage.duration}</span>
                    </span>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                      stage.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-white/80 text-[#212032] border border-white/80'
                    }`}>
                      {stage.priority}
                    </span>

                    <span className="text-xs font-mono font-black text-[#7765E8]">
                      {completedCount}/{stage.tasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 pt-4">
                  {stage.tasks.map((task) => (
                    <div
                      key={task.task_id}
                      onClick={() => handleToggleTask(stage.stage, task.task_id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        task.completed
                          ? 'bg-emerald-50/70 border-emerald-100/90 text-[#212032] backdrop-blur-sm'
                          : 'bg-white/70 border-white/80 hover:border-[#7765E8]/30 hover:bg-white text-[#212032] shadow-xs backdrop-blur-md'
                      }`}
                    >
                      <div className="pt-0.5">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-white/80 bg-white hover:border-[#7765E8]'
                        }`}>
                          {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>

                      <div className="space-y-0.5 flex-grow">
                        <div className={`text-xs font-bold ${task.completed ? 'line-through text-[#7E7C94]' : 'text-[#212032]'}`}>
                          {task.name}
                        </div>
                        <div className="text-[11px] text-[#7E7C94] leading-relaxed font-medium">
                          {task.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resource Footnote */}
                {stage.recommended_resource && (
                  <div className="mt-4 pt-3 border-t border-white/80 flex items-center justify-between text-xs text-[#7E7C94] font-medium">
                    <span>Resource:</span>
                    <span className="text-[#7765E8] font-bold">{stage.recommended_resource}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
