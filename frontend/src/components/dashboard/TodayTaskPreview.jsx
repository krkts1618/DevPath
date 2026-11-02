import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
} from 'lucide-react';
import TaskItem from '../tasks/TaskItem';

export default function TodayTaskPreview({
  learningQueue = [],
  onTaskUpdated,
  totalTasksInQueue = 0,
}) {
  const [collapsedRoadmaps, setCollapsedRoadmaps] = useState({});

  const toggleCollapse = (roadmapId) => {
    setCollapsedRoadmaps((prev) => ({
      ...prev,
      [roadmapId]: !prev[roadmapId],
    }));
  };

  const hasTasks = learningQueue.length > 0 && totalTasksInQueue > 0;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
          <h2 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
            Today's Learning Queue
          </h2>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8] border border-[#C5D9CB] dark:border-[#4F5561]">
            {totalTasksInQueue} pending
          </span>
        </div>

        <Link
          to="/planner"
          className="text-xs font-medium text-[#244C3B] dark:text-[#DFD0B8] hover:text-[#1A3B2C] dark:hover:text-[#ECE3D4] flex items-center gap-1 group"
        >
          <span>Open Full Planner</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Adaptive Queue Content */}
      {hasTasks ? (
        <div className="space-y-4">
          {learningQueue.map((group) => {
            const isCollapsed = collapsedRoadmaps[group.roadmapId];
            const activeTasks = group.activeTasks || [];
            const dayPercent =
              group.dayTotalTasks > 0
                ? Math.round((group.dayCompletedTasks / group.dayTotalTasks) * 100)
                : 0;

            return (
              <div
                key={group.roadmapId}
                className="rounded-lg border border-[#E8E8DF] dark:border-[#393E46] bg-[#F7F7F2] dark:bg-[#222831] overflow-hidden"
              >
                {/* Roadmap Track Header */}
                <div
                  onClick={() => toggleCollapse(group.roadmapId)}
                  className="px-4 py-3 bg-[#F0F0EB] dark:bg-[#2A303A] flex items-center justify-between cursor-pointer hover:bg-[#E8E8DF] dark:hover:bg-[#393E46] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[#244C3B] dark:bg-[#DFD0B8] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/roadmaps/${group.roadmapId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] hover:text-[#244C3B] dark:hover:text-[#ECE3D4] transition-colors truncate"
                        >
                          {group.title}
                        </Link>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white dark:bg-[#393E46] text-[#737C74] dark:text-[#948979] border border-[#E8E8DF] dark:border-[#4F5561]">
                          {group.categoryName}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#737C74] dark:text-[#948979] flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-[#244C3B] dark:text-[#DFD0B8]">
                          Day {group.currentDayNumber}
                        </span>
                        <span>•</span>
                        <span className="truncate">
                          {group.currentDayTitle?.replace(new RegExp(`^Day\\s+${group.currentDayNumber}:?\\s*`, 'i'), '') || group.currentDayTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Header Stats & Toggle */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] font-mono text-[#737C74] dark:text-[#948979]">
                        {group.dayCompletedTasks}/{group.dayTotalTasks} done
                      </div>
                      <div className="w-16 h-1 bg-[#E8E8DF] dark:bg-[#222831] rounded-full overflow-hidden mt-0.5">
                        <div
                          className="h-full bg-[#244C3B] dark:bg-[#DFD0B8] rounded-full"
                          style={{ width: `${dayPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-1 text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8]"
                      aria-label="Toggle group collapse"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tasks List */}
                {!isCollapsed && (
                  <div className="p-3 space-y-2">
                    {activeTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        showRoadmapContext={false}
                        onTaskUpdated={onTaskUpdated}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
            Learning Queue Complete!
          </h4>
          <p className="text-xs text-[#737C74] dark:text-[#948979] max-w-sm mx-auto leading-relaxed">
            All active roadmap frontier tasks are checked off. Explore your roadmaps to review completed milestones or jump into practice projects.
          </p>
          <div className="mt-4">
            <Link
              to="/roadmaps"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F0F0EB] hover:bg-[#E8E8DF] dark:bg-[#393E46] dark:hover:bg-[#454B54] text-[#4A5749] dark:text-[#C8BFB0] transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#244C3B] dark:text-[#DFD0B8]" />
              <span>Browse All Roadmaps</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
