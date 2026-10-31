import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Target,
  Clock,
  ChevronUp,
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
  allRoadmapDays = [],
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [openDays, setOpenDays] = useState({});

  const toggleDay = (dayId) => {
    setOpenDays((prev) => ({
      ...prev,
      [dayId]: !prev[dayId],
    }));
  };

  // Compute module progress
  let moduleTotalTasks = 0;
  let moduleCompletedTasks = 0;

  days.forEach((d) => {
    (d.tasks || []).forEach((t) => {
      moduleTotalTasks++;
      if (t.completions?.some((c) => c.completed)) {
        moduleCompletedTasks++;
      }
    });
  });

  const progressPercent =
    moduleTotalTasks > 0
      ? Math.round((moduleCompletedTasks / moduleTotalTasks) * 100)
      : 0;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl overflow-hidden mb-4 shadow-2xs">
      {/* Module Header */}
      <div className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#F7F7F2] dark:hover:bg-[#393E46]/40 transition-colors border-b border-transparent">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3.5 flex-1 min-w-0 pr-4 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-[#F0F0EB] dark:bg-[#393E46] text-[#737C74] dark:text-[#948979] flex items-center justify-center flex-shrink-0">
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-[#244C3B] dark:text-[#DFD0B8] uppercase tracking-wide">
                Days {module.startingDay}–{module.endingDay}
              </span>
              <span className="text-[#D4D4CA] dark:text-[#4F5561]">•</span>
              <span className="text-xs text-[#737C74] dark:text-[#948979] font-mono">
                {days.length} days • {moduleCompletedTasks}/{moduleTotalTasks} completed
              </span>
            </div>
            <h4 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8] truncate">
              {module.title}
            </h4>
          </div>
        </div>

        {/* Progress Bar & Module Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-3 w-40">
            <ProgressBar
              value={progressPercent}
              size="sm"
              color={progressPercent === 100 ? 'emerald' : 'green'}
            />
            <span className="text-xs font-mono font-semibold text-[#202A23] dark:text-[#DFD0B8] w-9 text-right">
              {progressPercent}%
            </span>
          </div>

          {/* Module Action Buttons */}
          <div className="flex items-center gap-1 border-l border-[#E8E8DF] dark:border-[#393E46] pl-3">
            {onAddDayToModule && (
              <button
                type="button"
                onClick={() => onAddDayToModule(module)}
                className="p-1.5 rounded-lg text-[#737C74] hover:text-[#244C3B] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                title="Add Day to Module"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            {onEditModule && (
              <button
                type="button"
                onClick={() => onEditModule(module)}
                className="p-1.5 rounded-lg text-[#737C74] hover:text-[#202A23] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                title="Edit Module"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDeleteModule && (
              <button
                type="button"
                onClick={() => onDeleteModule(module)}
                className="p-1.5 rounded-lg text-[#737C74] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                title="Delete Module"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Module Body */}
      {isOpen && (
        <div className="px-5 pb-5 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46] space-y-4">
          {module.description && (
            <p className="text-xs text-[#737C74] dark:text-[#948979] leading-relaxed">
              {module.description}
            </p>
          )}

          {/* Days inside this module */}
          <div className="space-y-4">
            {days.map((day) => {
              const dayTasks = day.tasks || [];
              const dayCompletedCount = dayTasks.filter((t) =>
                t.completions?.some((c) => c.completed)
              ).length;
              const isDayAllDone = dayTasks.length > 0 && dayCompletedCount === dayTasks.length;
              const isActiveFrontier = day.progressionStatus === 'active';
              const isDayExpanded = openDays[day.id] ?? (isActiveFrontier || true);

              // Calculate scheduled date in Asia/Kolkata
              let formattedDate = null;
              if (roadmapStartDate) {
                try {
                  const base = new Date(roadmapStartDate);
                  const scheduled = new Date(base);
                  scheduled.setUTCDate(scheduled.getUTCDate() + (day.dayNumber - 1));
                  formattedDate = new Intl.DateTimeFormat('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  }).format(scheduled);
                } catch {
                  formattedDate = null;
                }
              }

              return (
                <div
                  key={day.id}
                  className={`rounded-xl border transition-all ${
                    isActiveFrontier
                      ? 'bg-[#E8F0EB]/50 dark:bg-[#393E46]/50 border-[#244C3B] dark:border-[#DFD0B8] ring-1 ring-[#244C3B]/20 shadow-xs'
                      : isDayAllDone
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/30'
                      : 'bg-[#F7F7F2]/60 dark:bg-[#222831]/50 border-[#E8E8DF] dark:border-[#393E46]'
                  }`}
                >
                  {/* Day Header */}
                  <div className="p-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E8DF]/60 dark:border-[#393E46]/60">
                    <div
                      onClick={() => toggleDay(day.id)}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <button type="button" className="text-[#737C74]">
                        {isDayExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                        isActiveFrontier
                          ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831] shadow-2xs'
                          : isDayAllDone
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-[#E8F0EB] dark:bg-[#393E46] text-[#244C3B] dark:text-[#DFD0B8]'
                      }`}>
                        Day {day.dayNumber}
                      </span>

                      <h5 className="text-xs sm:text-sm font-semibold text-[#202A23] dark:text-[#DFD0B8] truncate">
                        {day.title}
                      </h5>

                      {isActiveFrontier && (
                        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8] uppercase tracking-wider">
                          Active Frontier
                        </span>
                      )}

                      {isDayAllDone && (
                        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-[#737C74] dark:text-[#948979]">
                        ({dayCompletedCount}/{dayTasks.length})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Badge type={day.dayType} size="xs">
                        {day.dayType}
                      </Badge>

                      {formattedDate && (
                        <span className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-[#737C74] dark:text-[#948979]">
                          <Calendar className="w-3 h-3 text-[#91A88E]" />
                          {formattedDate}
                        </span>
                      )}

                      {day.estimatedStudyTime && (
                        <span className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-[#737C74] dark:text-[#948979]">
                          <Clock className="w-3 h-3 text-[#91A88E]" />
                          {day.estimatedStudyTime}m
                        </span>
                      )}

                      {/* Day Action Buttons */}
                      <div className="flex items-center gap-1 border-l border-[#E8E8DF] dark:border-[#393E46] pl-2">
                        {onAddTask && (
                          <button
                            type="button"
                            onClick={() => onAddTask(day)}
                            className="p-1 rounded text-[#737C74] hover:text-[#244C3B] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                            title="Add Task to Day"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onEditDay && (
                          <button
                            type="button"
                            onClick={() => onEditDay(day)}
                            className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                            title="Edit Day"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}

                        {onDeleteDay && (
                          <button
                            type="button"
                            onClick={() => onDeleteDay(day)}
                            className="p-1 rounded text-[#737C74] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                            title="Delete Day"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Day Objective */}
                  {day.objective && (
                    <div className="px-4 pt-2.5 flex items-start gap-1.5 text-xs text-[#4A5749] dark:text-[#C8BFB0] italic">
                      <Target className="w-3.5 h-3.5 text-[#244C3B] dark:text-[#DFD0B8] flex-shrink-0 mt-0.5" />
                      <span>{day.objective}</span>
                    </div>
                  )}

                  {/* Tasks List inside Day */}
                  {isDayExpanded && (
                    <div className="p-3.5 space-y-2">
                      {dayTasks.length > 0 ? (
                        dayTasks.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            allowEdit={true}
                            onTaskUpdated={onTaskUpdated}
                            onViewDetails={onViewTaskDetails}
                            onEditClick={onEditTask}
                            onDeleteClick={onDeleteTask}
                            onReassignClick={
                              onReassignTask
                                ? () => onReassignTask(task, allRoadmapDays)
                                : undefined
                            }
                          />
                        ))
                      ) : (
                        <div className="text-xs text-[#737C74] dark:text-[#948979] italic py-2 flex items-center justify-between">
                          <span>No tasks in this day yet.</span>
                          {onAddTask && (
                            <button
                              type="button"
                              onClick={() => onAddTask(day)}
                              className="text-[#244C3B] dark:text-[#DFD0B8] hover:underline font-medium"
                            >
                              + Add first task
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
