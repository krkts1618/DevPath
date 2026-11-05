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
          ? 'bg-[#F8F9F6]/80 dark:bg-[#171B21]/60 border-[#E4E7E0]/70 dark:border-[#303945]/60'
          : 'bg-[#FFFFFF] dark:bg-[#1D232B] border-[#E4E7E0] dark:border-[#303945] hover:border-[#D5DBD1] dark:hover:border-[#3A4552] shadow-2xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Custom Amber Circular Checkbox matching Reference */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleToggle}
          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-150 flex-shrink-0 cursor-pointer ${
            isCompleted
              ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs scale-105'
              : 'border-[#D5DBD1] dark:border-[#3A4552] hover:border-[var(--accent-primary)] bg-transparent'
          }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col flex-1 min-w-0">
              {showRoadmapContext && task.roadmapTitle && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#858D82] dark:text-[#7F8996] mb-0.5 font-mono">
                  <span className="font-semibold text-[var(--accent-primary)]">
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
                className={`text-xs sm:text-sm font-medium leading-snug transition-colors cursor-pointer hover:text-[var(--accent-primary)] ${
                  isCompleted
                    ? 'line-through text-[#858D82] dark:text-[#7F8996]'
                    : 'text-[#202620] dark:text-[#F3F4F6]'
                }`}
              >
                {task.title}
              </span>
            </div>

            {/* Badges & Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {task.taskType && <Badge type={task.taskType} size="xs" />}
              {task.estimatedDuration && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#F0F2ED] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945]">
                  <Clock className="w-2.5 h-2.5 opacity-70" />
                  {task.estimatedDuration}m
                </span>
              )}
            </div>
          </div>

          {/* Description preview or expanded text */}
          {task.description && (
            <div className="mt-1">
              <p
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-xs text-[#596258] dark:text-[#B0B7C2] leading-relaxed cursor-pointer ${
                  isExpanded ? '' : 'line-clamp-1'
                }`}
              >
                {task.description}
              </p>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#E4E7E0]/60 dark:border-[#303945]/60 text-[11px] text-[#858D82] dark:text-[#7F8996]">
            <div className="flex items-center gap-3 font-mono text-[10px]">
              {finalFocusMinutes > 0 && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Timer className="w-3 h-3" />
                  {finalFocusMinutes}m focused
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onViewDetails && (
                <button
                  type="button"
                  onClick={() => onViewDetails(task)}
                  className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors"
                  title="View task specifications"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}

              {onReassignClick && (
                <button
                  type="button"
                  onClick={() => onReassignClick(task)}
                  className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors"
                  title="Reassign to another day"
                >
                  <MoveRight className="w-3.5 h-3.5" />
                </button>
              )}

              {allowEdit && onEditClick && (
                <button
                  type="button"
                  onClick={() => onEditClick(task)}
                  className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}

              {allowEdit && onDeleteClick && (
                <button
                  type="button"
                  onClick={() => onDeleteClick(task)}
                  className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

