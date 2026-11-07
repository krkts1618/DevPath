import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  CheckCircle2,
  Flame,
  Clock,
  Layers,
  Sparkles,
  RotateCcw,
  BookOpen,
  Calendar,
  X,
  FolderGit2,
  FileText,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

export default function WeeklyEngineeringReport({
  weekStartDate = null,
  onClose = null,
}) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [weekStartDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getWeeklyReport(weekStartDate);
      setReport(res);
    } catch (err) {
      console.error('Failed to load weekly report:', err);
      setError(err.message || 'Unable to retrieve weekly engineering report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#FFFFFF] dark:bg-[#1D232B] rounded-2xl border border-[#E4E7E0] dark:border-[#303945] animate-pulse space-y-4">
        <div className="h-6 bg-[#E4E7E0] dark:bg-[#252C35] rounded-md w-1/3" />
        <div className="h-32 bg-[#E4E7E0] dark:bg-[#252C35] rounded-xl" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-6 bg-[#FFFFFF] dark:bg-[#1D232B] rounded-2xl border border-red-500/20 text-center space-y-3">
        <p className="text-sm text-red-500 font-semibold">{error || 'Report unavailable'}</p>
        <button
          onClick={fetchReport}
          className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    weekStartDate: start,
    weekEndDate: end,
    learningDaysAchieved,
    totalWeekdayTargets,
    weekdayCompletionRatePercent,
    weekdayBreakdown,
    totalTasksCompleted,
    tasksByRoadmap,
    uniqueTopicsCount,
    topicsCovered,
    focusTime,
    weekendRevision,
    streakFreezesUsedThisWeek,
    weakTopicsFlagged,
    notesUpdatedCount,
    projectsActiveCount,
  } = report;

  return (
    <div className="space-y-6">
      {/* Report Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[var(--accent-primary)] flex items-center justify-center font-bold">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#F0F2ED] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2]">
                  Weekly Synthesis
                </span>
                <span className="text-xs font-mono text-[#858D82] dark:text-[#7F8996]">
                  {start} → {end}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#202620] dark:text-[#F3F4F6] mt-0.5">
                Weekly Engineering Growth Report
              </h2>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 4 Summary Highlight Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Weekday Learning Days Achieved */}
          <div className="p-4 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[10px] uppercase font-bold text-[#858D82] dark:text-[#7F8996] font-mono block">
              Weekday Target
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-0.5">
              {learningDaysAchieved} / {totalWeekdayTargets} Days
            </div>
            <span className="text-xs font-mono text-[var(--accent-primary)] font-semibold mt-0.5 block">
              {weekdayCompletionRatePercent}% consistency
            </span>
          </div>

          {/* 2. Total Tasks Completed */}
          <div className="p-4 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[10px] uppercase font-bold text-[#858D82] dark:text-[#7F8996] font-mono block">
              Tasks Executed
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-0.5">
              {totalTasksCompleted}
            </div>
            <span className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5 block">
              Across {tasksByRoadmap.length} tracks
            </span>
          </div>

          {/* 3. Deep Work Focus Time */}
          <div className="p-4 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[10px] uppercase font-bold text-[#858D82] dark:text-[#7F8996] font-mono block">
              Focus Logged
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-0.5">
              {focusTime?.formatted || '0h 0m'}
            </div>
            <span className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5 block">
              {focusTime?.sessionsCount || 0} deep sessions
            </span>
          </div>

          {/* 4. Streak Freezes Used */}
          <div className="p-4 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[10px] uppercase font-bold text-[#858D82] dark:text-[#7F8996] font-mono block">
              Freezes Consumed
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-0.5">
              {streakFreezesUsedThisWeek} Freezes
            </div>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mt-0.5 block">
              {streakFreezesUsedThisWeek === 0 ? 'Clean run! No freezes used' : 'Protected streak automatically'}
            </span>
          </div>
        </div>
      </div>

      {/* Weekday Target Progress Breakdown (Mon–Fri) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Five-Day Learning Week Execution (Target: 5 Tasks / Day)</span>
          </h3>
          <span className="text-xs font-mono text-[#858D82] dark:text-[#7F8996]">
            Mon–Fri Learning • Sat/Sun Revision
          </span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {weekdayBreakdown.map((day) => (
            <div
              key={day.date}
              className={`p-3.5 rounded-xl border text-center transition ${
                day.targetReached
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : day.freezeConsumed
                  ? 'bg-cyan-500/10 border-cyan-500/30'
                  : 'bg-[#F8F9F6] dark:bg-[#171B21] border-[#E4E7E0] dark:border-[#303945]'
              }`}
            >
              <span className="text-xs font-bold font-mono block text-[#202620] dark:text-[#F3F4F6]">
                {day.dayName}
              </span>
              <span className="text-[10px] text-[#858D82] dark:text-[#7F8996] font-mono block mb-1">
                {day.date.slice(5)}
              </span>
              <div className="text-lg font-bold font-mono">
                {day.completedTasks} / {day.target}
              </div>
              <span className="text-[10px] font-mono font-semibold block mt-1">
                {day.targetReached ? (
                  <span className="text-emerald-600 dark:text-emerald-400">✓ Qualified</span>
                ) : day.freezeConsumed ? (
                  <span className="text-cyan-600 dark:text-cyan-400">❄️ Frozen</span>
                ) : (
                  <span className="text-[#858D82] dark:text-[#7F8996]">Pending</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Roadmap Breakdown & Weekend Revision Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tasks by Roadmap */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Tasks Executed By Curriculum Roadmap</span>
          </h3>

          <div className="space-y-3">
            {tasksByRoadmap.length === 0 ? (
              <p className="text-xs text-[#858D82] dark:text-[#7F8996]">No tasks completed this week.</p>
            ) : (
              tasksByRoadmap.map((rm) => (
                <div
                  key={rm.roadmapId}
                  className="p-3.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] flex items-center justify-between"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] truncate">
                      {rm.title}
                    </h4>
                    <span className="text-[10px] text-[#858D82] dark:text-[#7F8996] font-mono">
                      {rm.count} {rm.count === 1 ? 'task completed' : 'tasks completed'}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-[var(--accent-primary)] shrink-0">
                    {Math.round((rm.count / (totalTasksCompleted || 1)) * 100)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Weekend Revision Status & Momentum */}
        <div className="lg:col-span-5 space-y-4">
          {/* Weekend Revision Status Card */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Weekend Revision Status</span>
            </h3>

            <div className="space-y-2.5">
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  weekendRevision.saturdayRecollectionCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-[#F8F9F6] dark:bg-[#171B21] border-[#E4E7E0] dark:border-[#303945] text-[#858D82] dark:text-[#7F8996]'
                }`}
              >
                <div className="text-xs font-medium">Saturday Recollection</div>
                <span className="text-[11px] font-mono font-bold">
                  {weekendRevision.saturdayRecollectionCompleted ? '✓ Completed' : 'Pending'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  weekendRevision.sundayAssessmentCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-[#F8F9F6] dark:bg-[#171B21] border-[#E4E7E0] dark:border-[#303945] text-[#858D82] dark:text-[#7F8996]'
                }`}
              >
                <div className="text-xs font-medium">Sunday Self-Assessment</div>
                <span className="text-[11px] font-mono font-bold">
                  {weekendRevision.sundayAssessmentCompleted ? '✓ Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Projects Momentum */}
          <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6]">
              Knowledge & Projects Activity
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
                <div className="flex items-center gap-1.5 text-[#858D82] dark:text-[#7F8996] mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notes Active</span>
                </div>
                <span className="text-base font-bold text-[#202620] dark:text-[#F3F4F6]">{notesUpdatedCount} Docs</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
                <div className="flex items-center gap-1.5 text-[#858D82] dark:text-[#7F8996] mb-1">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Projects Active</span>
                </div>
                <span className="text-base font-bold text-[#202620] dark:text-[#F3F4F6]">{projectsActiveCount} Projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Topics Flagged for Reinforcement */}
      {weakTopicsFlagged.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>Weak Topics Flagged for Priority Revision ({weakTopicsFlagged.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {weakTopicsFlagged.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-red-500/30 text-xs"
              >
                <span className="text-[10px] font-mono text-[#858D82] dark:text-[#7F8996] block truncate">
                  {item.roadmapTitle}
                </span>
                <h4 className="font-bold text-[#202620] dark:text-[#F3F4F6] mt-0.5 truncate">
                  {item.topic}
                </h4>
                <span className="text-[10px] font-mono uppercase text-red-500 font-semibold block mt-1">
                  {item.understanding.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
