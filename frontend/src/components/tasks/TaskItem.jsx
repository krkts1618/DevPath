import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  MoveRight,
  Edit2,
  Trash2,
  Eye,
  Timer,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { taskService } from '../../services/taskService';

export default function TaskItem({
  task,
  onTaskUpdated,
  onEditClick,
  onDeleteClick,
  onReassignClick,
  onViewDetails,
  showRoadmapContext = false,
  allowEdit = false,
  focusMinutes,
}) {
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(
    task.completed ?? task.completions?.some((c) => c.completed) ?? false
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const finalFocusMinutes = focusMinutes !== undefined ? focusMinutes : task.actualFocusMinutes;

  const handleToggle = async (e) => {
    e.stopPropagation();
    const newStatus = !isCompleted;
    setIsCompleted(newStatus); // Optimistic UI
    setIsUpdating(true);

    try {
      await taskService.toggleCompletion(task.id, newStatus);
      onTaskUpdated?.(task.id, newStatus);
    } catch (err) {
      setIsCompleted(!newStatus); // Rollback on failure
      console.error('Failed to toggle task completion:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-150 p-3 sm:p-3.5 ${
        isCompleted
          ? 'bg-[#F7F7F2]/80 dark:bg-[#222831]/60 border-[#E8E8DF]/80 dark:border-[#393E46]/60'
          : 'bg-[#FFFFFF] dark:bg-[#2A303A] border-[#E8E8DF] dark:border-[#393E46] hover:border-[#D4D4CA] dark:hover:border-[#4F5561] shadow-2xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Custom Checkbox */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleToggle}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-150 flex-shrink-0 cursor-pointer ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
              : 'border-[#D4D4CA] dark:border-[#4F5561] hover:border-[#244C3B] dark:hover:border-[#DFD0B8] bg-transparent'
          }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col flex-1 min-w-0">
              {showRoadmapContext && task.roadmapTitle && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#737C74] dark:text-[#948979] mb-0.5">
                  <span className="font-semibold text-[#244C3B] dark:text-[#DFD0B8]">
                    {task.roadmapTitle}
                  </span>
                  <span>•</span>
                  <span>Day {task.dayNumber}</span>
                  {task.moduleTitle && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">{task.moduleTitle}</span>
                    </>
                  )}
                </div>
              )}

              <span
                onClick={() => onViewDetails?.(task)}
                className={`text-xs sm:text-sm font-medium leading-snug transition-colors cursor-pointer hover:text-[#244C3B] dark:hover:text-[#DFD0B8] ${
                  isCompleted
                    ? 'line-through text-[#737C74] dark:text-[#948979]'
                    : 'text-[#202A23] dark:text-[#DFD0B8]'
                }`}
              >
                {task.title}
              </span>
            </div>

            {/* Badges & Meta */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Status Indicators */}
              {task.isOverdue && !isCompleted && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  Overdue
                </span>
              )}

              {task.rescheduledFrom && !isCompleted && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Carried Forward
                </span>
              )}

              {!isCompleted && finalFocusMinutes > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  In Progress
                </span>
              )}

              {task.priority && task.priority !== 'normal' && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                  task.priority === 'urgent'
                    ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                    : task.priority === 'high'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border border-neutral-500/30'
                }`}>
                  {task.priority}
                </span>
              )}

              <Badge type={task.taskType} size="xs">
                {task.taskType}
              </Badge>

              {task.estimatedDuration && (
                <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#737C74] dark:text-[#948979]">
                  <Clock className="w-3 h-3 text-[#91A88E]" />
                  <span>Est: {task.estimatedDuration}m</span>
                  {finalFocusMinutes > 0 && (
                    <span className="text-[#244C3B] dark:text-[#DFD0B8] font-bold">
                      • Focused: {finalFocusMinutes}m
                    </span>
                  )}
                </span>
              )}

              {/* Quick Focus Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/focus?taskId=${task.id}&title=${encodeURIComponent(task.title)}&roadmapId=${task.roadmapId || ''}`);
                }}
                className="p-1 rounded text-[#737C74] hover:text-[#244C3B] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                title="Start Focus Session on this Task"
              >
                <Timer className="w-3.5 h-3.5 text-[#244C3B] dark:text-[#DFD0B8]" />
              </button>

              {/* View details */}
              {onViewDetails && (
                <button
                  type="button"
                  onClick={() => onViewDetails(task)}
                  className="p-1 rounded text-[#737C74] hover:text-[#244C3B] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                  title="View Task Details & History"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Expand description if inline */}
              {task.description && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                  title={isExpanded ? 'Collapse description' : 'View instructions'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {/* Reassign button */}
              {onReassignClick && (
                <button
                  type="button"
                  onClick={() => onReassignClick(task)}
                  className="p-1 rounded text-[#737C74] hover:text-[#244C3B] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                  title="Reschedule / Reassign Task"
                >
                  <MoveRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Edit task button */}
              {allowEdit && onEditClick && (
                <button
                  type="button"
                  onClick={() => onEditClick(task)}
                  className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                  title="Edit Task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Delete task button */}
              {allowEdit && onDeleteClick && (
                <button
                  type="button"
                  onClick={() => onDeleteClick(task)}
                  className="p-1 rounded text-[#737C74] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Inline Description */}
          {isExpanded && task.description && (
            <div className="mt-2.5 pt-2.5 border-t border-[#E8E8DF] dark:border-[#393E46] text-xs text-[#4A5749] dark:text-[#C8BFB0] leading-relaxed bg-[#F7F7F2] dark:bg-[#222831] p-2.5 rounded-lg whitespace-pre-wrap">
              {task.description}
            </div>
          )}

          {/* Reassignment audit note */}
          {task.hasReassignment && task.reassignments?.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-mono">
              <MoveRight className="w-3 h-3 flex-shrink-0" />
              <span>
                Reassigned from Day {task.reassignments[0].originalDay?.dayNumber}
                {task.reassignments[0].reason && `: "${task.reassignments[0].reason}"`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
