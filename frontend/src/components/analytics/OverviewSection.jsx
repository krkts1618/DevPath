import React from 'react';
import {
  Flame,
  CheckCircle2,
  Clock,
  Compass,
  RotateCcw,
  FolderGit2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

function ComparisonBadge({ comparison }) {
  if (!comparison || comparison.status === 'insufficient_data') {
    return (
      <span className="text-[10px] font-medium text-[#737C74] dark:text-[#948979] italic">
        Insufficient historical data
      </span>
    );
  }

  if (comparison.status === 'improvement') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
        <ArrowUpRight className="w-3 h-3" />
        {comparison.text}
      </span>
    );
  }

  if (comparison.status === 'decline') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
        <ArrowDownRight className="w-3 h-3" />
        {comparison.text}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#737C74] dark:text-[#948979] bg-[#F0F0EB] dark:bg-[#393E46] px-1.5 py-0.5 rounded">
      <Minus className="w-3 h-3" />
      No change
    </span>
  );
}

export default function OverviewSection({ overview }) {
  if (!overview) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
          Overall Learning Performance Overview
        </h2>
        <span className="text-xs text-[#737C74] dark:text-[#948979]">
          Real-time database metrics
        </span>
      </div>

      {/* Primary KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Daily Streak */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#737C74] dark:text-[#948979]">
              Overall Daily Streak
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8]">
              {overview.currentOverallStreak}d
            </span>
            {overview.bestOverallStreak > 0 && (
              <span className="text-xs text-[#737C74] dark:text-[#948979] font-mono">
                (Best: {overview.bestOverallStreak}d)
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#737C74] dark:text-[#948979] mt-1">
            {overview.totalQualifyingStreakDays} qualifying days (5+ tasks) logged
          </p>
        </div>

        {/* 2. Curriculum Progress */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#737C74] dark:text-[#948979]">
              Curriculum Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8]">
              {overview.totalCompletionPercentage}%
            </span>
            <span className="text-xs text-[#737C74] dark:text-[#948979] font-mono">
              {overview.totalCompletedCurriculumTasks} / {overview.totalCurriculumTasks} tasks
            </span>
          </div>
          <div className="mt-2">
            <ComparisonBadge comparison={overview.comparisons?.tasks} />
          </div>
        </div>

        {/* 3. Focused Study Time */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#737C74] dark:text-[#948979]">
              Focused Study Time
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8]">
              {overview.totalFocusedStudyHours}h
            </span>
            <span className="text-xs text-[#737C74] dark:text-[#948979] font-mono">
              ({overview.totalCompletedFocusSessions} sessions)
            </span>
          </div>
          <div className="mt-2">
            <ComparisonBadge comparison={overview.comparisons?.studyTime} />
          </div>
        </div>

        {/* 4. Spaced Recall & Projects */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#737C74] dark:text-[#948979]">
              Revisions & Projects
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8]">
              {overview.totalRevisionsCompleted}
            </span>
            <span className="text-xs text-[#737C74] dark:text-[#948979]">
              revised &bull; {overview.activeProjectsCount} active projects
            </span>
          </div>
          <p className="text-[11px] text-[#737C74] dark:text-[#948979] mt-1">
            Spaced repetition mastery & portfolio delivery
          </p>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46]">
          <div className="text-[11px] text-[#737C74] dark:text-[#948979]">Active Tracks</div>
          <div className="text-lg font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
            {overview.activeRoadmapsCount}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46]">
          <div className="text-[11px] text-[#737C74] dark:text-[#948979]">Archived Tracks</div>
          <div className="text-lg font-bold font-mono text-[#737C74] dark:text-[#948979] mt-0.5">
            {overview.archivedRoadmapsCount}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46]">
          <div className="text-[11px] text-[#737C74] dark:text-[#948979]">Pending Tasks</div>
          <div className="text-lg font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
            {overview.pendingTasks}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46]">
          <div className="text-[11px] text-[#737C74] dark:text-[#948979]">Carried Forward</div>
          <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
            {overview.carriedForwardTasks}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46]">
          <div className="text-[11px] text-[#737C74] dark:text-[#948979]">All-Time Focus Hours</div>
          <div className="text-lg font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
            {overview.allTimeFocusedStudyHours}h
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46]">
          <div className="text-[11px] text-[#737C74] dark:text-[#948979]">Total Sessions</div>
          <div className="text-lg font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-0.5">
            {overview.allTimeFocusSessionsCount}
          </div>
        </div>
      </div>
    </div>
  );
}
