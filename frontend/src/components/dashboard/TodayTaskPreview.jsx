import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import TaskItem from '../tasks/TaskItem';

export default function TodayTaskPreview({
  learningQueue = [],
  onTaskUpdated,
  totalTasksInQueue = 0,
}) {
  const hasTasks = learningQueue.length > 0 && totalTasksInQueue > 0;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono">
            Today's Learning Queue
          </h2>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            {totalTasksInQueue} tasks
          </span>
        </div>

        <Link
          to="/planner"
          className="text-xs font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] flex items-center gap-1 group font-mono"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Task Queue Content */}
      {hasTasks ? (
        <div className="space-y-3">
          {learningQueue.map((group) => {
            const activeTasks = group.activeTasks || [];
            if (activeTasks.length === 0) return null;

            return (
              <div
                key={group.roadmapId}
                className="rounded-xl border border-[#E4E7E0] dark:border-[#303945] bg-[#F8F9F6] dark:bg-[#171B21] overflow-hidden"
              >
                {/* Roadmap Track Header */}
                <div className="px-4 py-2.5 bg-[#F0F2ED] dark:bg-[#252C35] flex items-center justify-between border-b border-[#E4E7E0] dark:border-[#303945]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] flex-shrink-0" />
                    <Link
                      to={`/roadmaps/${group.roadmapId}`}
                      className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] hover:text-[var(--accent-primary)] transition-colors truncate"
                    >
                      {group.title}
                    </Link>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white dark:bg-[#1D232B] text-[#858D82] dark:text-[#7F8996] border border-[#E4E7E0] dark:border-[#303945]">
                      Day {group.currentDayNumber}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#858D82] dark:text-[#7F8996]">
                    {group.dayCompletedTasks || 0}/{group.dayTotalTasks || activeTasks.length} done
                  </span>
                </div>

                {/* Tasks List */}
                <div className="p-3 space-y-2">
                  {activeTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onTaskUpdated={onTaskUpdated}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[var(--accent-primary)] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#202620] dark:text-[#F3F4F6] mb-1">
            All Tasks Complete for Today!
          </h3>
          <p className="text-xs text-[#858D82] dark:text-[#7F8996] max-w-sm mx-auto mb-4">
            You've executed all scheduled learning tasks. Check your Daily Planner to review completed items or plan ahead.
          </p>
          <Link
            to="/planner"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F0F2ED] hover:bg-[#E4E7E0] dark:bg-[#252C35] dark:hover:bg-[#2B333D] text-[#202620] dark:text-[#F3F4F6] transition-colors"
          >
            Open Daily Planner
          </Link>
        </div>
      )}
    </div>
  );
}
