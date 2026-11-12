import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import TaskItem from '../tasks/TaskItem';

export default function ModuleAccordion({
  module,
  days = [],
  roadmapStartDate = null,
  onTaskUpdated,
  onReassignTask,
  onViewTaskDetails,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onEditDay,
  onDeleteDay,
  onAddDayToModule,
  onEditModule,
  onDeleteModule,
  onLoadDayTasks,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [openDays, setOpenDays] = useState({});
  const [loadingDays, setLoadingDays] = useState({});

  const toggleDay = async (day) => {
    const dayId = day.id;
    const willOpen = !openDays[dayId];
    setOpenDays((prev) => ({
      ...prev,
      [dayId]: willOpen,
    }));

    const totalCount = day.totalTasksCount ?? (day.tasks || []).length;
    if (willOpen && (!day.tasks || day.tasks.length === 0) && totalCount > 0 && onLoadDayTasks) {
      setLoadingDays((prev) => ({ ...prev, [dayId]: true }));
      try {
        await onLoadDayTasks(dayId);
      } finally {
        setLoadingDays((prev) => ({ ...prev, [dayId]: false }));
      }
    }
  };

  // Compute module progress accurately from precomputed counts or loaded tasks
  let moduleTotalTasks = 0;
  let moduleCompletedTasks = 0;

  days.forEach((d) => {
    const dayTotal = d.totalTasksCount ?? (d.tasks || []).length;
    const dayDone =
      d.completedTasksCount ??
      (d.tasks || []).filter((t) => t.completions?.some((c) => c.completed)).length;
    moduleTotalTasks += dayTotal;
    moduleCompletedTasks += dayDone;
  });

  const progressPercent =
    moduleTotalTasks > 0
      ? Math.round((moduleCompletedTasks / moduleTotalTasks) * 100)
      : 0;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl overflow-hidden mb-4 shadow-xs">
      {/* Module Header */}
      <div className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#F8F9F6] dark:hover:bg-[#252C35]/50 transition-colors border-b border-[#E4E7E0] dark:border-[#303945]">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3.5 flex-1 min-w-0 pr-4 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-[#F0F2ED] dark:bg-[#252C35] text-[#858D82] dark:text-[#7F8996] flex items-center justify-center flex-shrink-0">
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-[var(--accent-primary)] font-bold">
                Days {module.startingDay}–{module.endingDay}
              </span>
              <span className="text-xs text-[#858D82] dark:text-[#7F8996] font-mono">
                {days.length} {days.length === 1 ? 'day' : 'days'} • {moduleCompletedTasks}/{moduleTotalTasks} completed
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] truncate">
              {module.title}
            </h3>

            {module.description && (
              <p className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5 line-clamp-1">
                {module.description}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Progress Bar & Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end w-28">
            <span className="text-[11px] font-mono font-bold text-[var(--accent-primary)] mb-1">
              {progressPercent}%
            </span>
            <ProgressBar value={progressPercent} size="xs" showLabel={false} />
          </div>

          <div className="flex items-center gap-1">
            {onAddDayToModule && (
              <button
                type="button"
                onClick={() => onAddDayToModule(module)}
                className="p-2 rounded-xl hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] transition"
                title="Add Day to Module"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            {onEditModule && (
              <button
                type="button"
                onClick={() => onEditModule(module)}
                className="p-2 rounded-xl hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] transition"
                title="Edit Module"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {onDeleteModule && (
              <button
                type="button"
                onClick={() => onDeleteModule(module.id)}
                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition"
                title="Delete Module"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Days List within Module */}
      {isOpen && (
        <div className="p-4 bg-[#F8F9F6] dark:bg-[#171B21] space-y-3">
          {days.length > 0 ? (
            days.map((day) => {
              const isDayOpen = openDays[day.id] ?? false;
              const dayTasks = day.tasks || [];
              const totalCount = day.totalTasksCount ?? dayTasks.length;
              let doneCount = day.completedTasksCount;
              if (doneCount === undefined) {
                doneCount = 0;
                dayTasks.forEach((t) => {
                  if (t.completions?.some((c) => c.completed)) doneCount++;
                });
              }
              const dayIsCompleted =
                day.isDayCompleted ?? (totalCount > 0 && doneCount === totalCount);

              return (
                <div
                  key={day.id}
                  className="rounded-xl border border-[#E4E7E0] dark:border-[#303945] bg-[#FFFFFF] dark:bg-[#1D232B] overflow-hidden"
                >
                  {/* Day Header */}
                  <div
                    onClick={() => toggleDay(day)}
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#F8F9F6] dark:hover:bg-[#252C35] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-[#F0F2ED] dark:bg-[#252C35] text-[#858D82] dark:text-[#7F8996] flex items-center justify-center flex-shrink-0">
                        {isDayOpen ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                            Day {day.dayNumber}
                          </span>
                          <span className="text-xs font-medium text-[#202620] dark:text-[#F3F4F6] truncate">
                            {day.title}
                          </span>
                          {day.progressionStatus === 'active' && (
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              Active Frontier
                            </span>
                          )}
                          {dayIsCompleted && (
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                              Completed
                            </span>
                          )}
                        </div>

                        {day.objective && (
                          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] truncate mt-0.5">
                            {day.objective}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-mono text-[#858D82] dark:text-[#7F8996]">
                        {doneCount}/{totalCount}
                      </span>

                      {onAddTask && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddTask(day.id);
                          }}
                          className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] transition"
                          title="Add Task to Day"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onEditDay && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditDay(day);
                          }}
                          className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] transition"
                          title="Edit Day"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDeleteDay && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDay(day.id);
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          title="Delete Day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Day Tasks List */}
                  {isDayOpen && (
                    <div className="p-3.5 bg-[#F8F9F6] dark:bg-[#171B21] border-t border-[#E4E7E0] dark:border-[#303945] space-y-2">
                      {loadingDays[day.id] ? (
                        <div className="py-4 flex items-center justify-center gap-2 text-xs text-[#858D82] dark:text-[#7F8996]">
                          <div className="w-3.5 h-3.5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                          <span>Loading tasks for Day {day.dayNumber}...</span>
                        </div>
                      ) : dayTasks.length > 0 ? (
                        dayTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            showRoadmapContext={false}
                            allowEdit={true}
                            onTaskUpdated={onTaskUpdated}
                            onViewDetails={onViewTaskDetails}
                            onReassignClick={onReassignTask}
                            onEditClick={onEditTask}
                            onDeleteClick={onDeleteTask}
                          />
                        ))
                      ) : (
                        <div className="py-4 text-center text-xs text-[#858D82] dark:text-[#7F8996]">
                          No tasks configured for Day {day.dayNumber}.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-[#858D82] dark:text-[#7F8996]">
              No days defined for this module yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

