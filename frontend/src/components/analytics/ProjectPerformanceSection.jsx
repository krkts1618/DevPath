import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertCircle,
  Flag,
} from 'lucide-react';

export default function ProjectPerformanceSection({ projectPerformance }) {
  const navigate = useNavigate();

  if (!projectPerformance) return null;

  const projects = projectPerformance.projects || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6]">
            Engineering Project Performance
          </h2>
          <p className="text-xs text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Milestone delivery, architectural implementation, and deadline tracking
          </p>
        </div>

        <button
          onClick={() => navigate('/projects')}
          className="text-xs font-semibold text-[var(--accent-primary)] dark:text-[#F3F4F6] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Open Projects Portfolio</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Total Projects</div>
          <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-1">
            {projectPerformance.totalProjects}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            {projectPerformance.activeProjects} active &bull; {projectPerformance.completedProjects} completed
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Completed Milestones</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {projectPerformance.completedMilestones}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Delivered across projects
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Pending Milestones</div>
          <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-1">
            {projectPerformance.pendingMilestones}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Active milestone work
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Overdue Milestones</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {projectPerformance.overdueMilestones}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Passed target due date
          </p>
        </div>
      </div>

      {/* Projects List with 50/50 Progress */}
      <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6] mb-4">
          Project-Wise Weighted Progress (50% Milestones + 50% Tasks)
        </h3>

        {projects.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#858D82] dark:text-[#7F8996]">
            No projects found in the portfolio.
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate('/projects')}
                className="p-4 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] hover:border-[var(--accent-primary)]/40 transition cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#202620] dark:text-[#F3F4F6]">
                      {p.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E8F0EB] dark:bg-[#303945] text-[var(--accent-primary)] dark:text-[#F3F4F6]">
                      {p.status}
                    </span>
                    {p.priority && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.priority}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-[#858D82] dark:text-[#7F8996]">
                    <span>
                      Milestones: {p.completedMilestones} / {p.totalMilestones}
                    </span>
                    <span>
                      Tasks: {p.completedTasks} / {p.totalTasks}
                    </span>
                    <span className="font-bold text-[var(--accent-primary)] dark:text-[#F3F4F6]">
                      {p.progressPercent}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#E4E7E0] dark:bg-[#303945] rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className="bg-[var(--accent-primary)] dark:bg-[#91A88E] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${p.progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#858D82] dark:text-[#7F8996]">
                  <span>Track: {p.roadmapTitle || 'Independent Systems Project'}</span>
                  <span>
                    {p.targetDate ? `Target: ${new Date(p.targetDate).toLocaleDateString()}` : 'No target date'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
