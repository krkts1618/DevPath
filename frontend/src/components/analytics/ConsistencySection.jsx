import React from 'react';
import {
  Flame,
  Award,
  Target,
  Calendar,
  CheckCircle2,
  Coffee,
  Info,
  Clock,
  Shield,
} from 'lucide-react';
import ActivityHeatmap from './ActivityHeatmap';

export default function ConsistencySection({ consistency }) {
  if (!consistency) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6]">
            Learning Consistency & Streak Analytics
          </h2>
          <p className="text-xs text-[#858D82] dark:text-[#7F8996] mt-0.5">
            5-task daily overall qualification target & 1-task roadmap streaks in Asia/Kolkata
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Target: {consistency.streakTarget || 5} tasks/day
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 text-xs font-mono font-bold flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Freezes: {consistency.monthlyFreezesRemaining ?? 4} left
          </span>
        </div>
      </div>

      {/* 5 Consistency Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Current Streak</div>
          <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-1 flex items-center gap-1.5">
            <span>{consistency.currentOverallStreak}d</span>
            {consistency.qualifiedToday && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Qualified today" />
            )}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            {consistency.qualifiedToday
              ? 'Qualified today (5+ tasks)'
              : consistency.completedToday > 0
              ? `${consistency.remainingToday} more needed today`
              : 'Complete 5 tasks to qualify today'}
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Best Streak</div>
          <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-1">
            {consistency.bestOverallStreak}d
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            All-time longest continuous streak
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Qualifying Days</div>
          <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-1">
            {consistency.overallQualifyingDays}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Days with 5+ completed tasks
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Planned Rest Days</div>
          <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-1 flex items-center gap-1.5">
            <span>{consistency.plannedRestDaysInPeriod || 0}</span>
            <Coffee className="w-4 h-4 text-[#858D82] dark:text-[#7F8996]" />
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Streak-neutral recovery days
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Monthly Freezes</div>
          <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-1 flex items-center gap-1.5">
            <span>{consistency.monthlyFreezesRemaining ?? 4}</span>
            <Shield className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            {consistency.monthlyFreezesUsed || 0} used of 4 allowance
          </p>
        </div>
      </div>

      {/* GitHub-style Activity Heatmap */}
      <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--accent-primary)] dark:text-[#F3F4F6]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6]">
              Yearly Activity Heatmap
            </h3>
          </div>
          <span className="text-[11px] text-[#858D82] dark:text-[#7F8996]">
            Hover day for task completions & study hours
          </span>
        </div>

        <ActivityHeatmap data={consistency.heatmap} />
      </div>

      {/* Roadmap-specific Streaks Grid */}
      <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6] mb-3">
          Roadmap-Specific Streak Performance (Threshold: &ge; 1 Task/Day)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(consistency.roadmapStreaks || []).map((rm) => (
            <div
              key={rm.roadmapId}
              className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] truncate max-w-[170px]">
                  {rm.title}
                </div>
                <div className="text-[10px] text-[#858D82] dark:text-[#7F8996]">
                  {rm.categoryName} &bull; Best: {rm.bestStreak}d
                </div>
              </div>

              <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold">
                <Flame className="w-3.5 h-3.5" />
                <span>{rm.currentStreak}d</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
