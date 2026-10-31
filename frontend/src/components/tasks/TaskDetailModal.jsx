import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  History,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { taskService } from '../../services/taskService';

export default function TaskDetailModal({
  isOpen,
  onClose,
  taskId,
  onTaskUpdated,
}) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTaskById(taskId);
      setTask(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    } else {
      setTask(null);
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  const isCompleted = task?.completions?.some((c) => c.completed);
  const completionRecord = task?.completions?.find((c) => c.completed);

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      await taskService.toggleCompletion(task.id, !isCompleted);
      await fetchTaskDetails();
      onTaskUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to update completion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelReassignment = async () => {
    setActionLoading(true);
    try {
      await taskService.cancelReassignment(task.id);
      await fetchTaskDetails();
      onTaskUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to cancel reassignment');
    } finally {
      setActionLoading(false);
    }
  };

  const formattedCompletedAt = completionRecord?.completedAt
    ? new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(completionRecord.completedAt))
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details & History"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {task?.reassignments && task.reassignments.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                icon={RotateCcw}
                onClick={handleCancelReassignment}
                disabled={actionLoading}
                className="text-amber-600 hover:text-amber-700"
              >
                Revert to Original Day
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {task && (
              <Button
                variant={isCompleted ? 'secondary' : 'success'}
                size="sm"
                icon={isCompleted ? XCircle : CheckCircle2}
                onClick={handleToggle}
                isLoading={actionLoading}
              >
                {isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {loading || !task ? (
        <div className="py-8 text-center text-xs text-[#737C74] dark:text-[#948979]">
          Loading task details...
        </div>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Header Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase font-mono tracking-wider text-[#244C3B] dark:text-[#DFD0B8]">
                {task.roadmapDay?.roadmap?.title}
              </span>
              <span className="text-[#D4D4CA] dark:text-[#4F5561]">•</span>
              <span className="text-xs font-mono text-[#737C74] dark:text-[#948979]">
                Day {task.roadmapDay?.dayNumber}: {task.roadmapDay?.title}
              </span>
              <span className="text-[#D4D4CA] dark:text-[#4F5561]">•</span>
              <Badge type={task.taskType} size="xs">
                {task.taskType}
              </Badge>
            </div>

            <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8] leading-snug">
              {task.title}
            </h3>
          </div>

          {/* Status & Timing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
              <span className="text-[10px] uppercase font-mono text-[#737C74] dark:text-[#948979] block mb-1">
                Completion Status
              </span>
              <div className="flex items-center gap-1.5">
                {isCompleted ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pending
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
              <span className="text-[10px] uppercase font-mono text-[#737C74] dark:text-[#948979] block mb-1">
                Estimated Duration
              </span>
              <span className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] font-mono">
                {task.estimatedDuration} minutes
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
              <span className="text-[10px] uppercase font-mono text-[#737C74] dark:text-[#948979] block mb-1">
                Requirement
              </span>
              <span className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8]">
                {task.isRequired ? 'Mandatory' : 'Optional'}
              </span>
            </div>
          </div>

          {/* Completed Timestamp Note */}
          {isCompleted && formattedCompletedAt && (
            <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Completed on {formattedCompletedAt}</span>
            </div>
          )}

          {/* Description / Instructions */}
          {task.description && (
            <div>
              <span className="text-[11px] font-semibold text-[#4A5749] dark:text-[#C8BFB0] uppercase tracking-wider block mb-1.5">
                Instructions & Implementation Scope
              </span>
              <div className="p-3 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-xs text-[#202A23] dark:text-[#DFD0B8] leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}

          {/* Reassignment / Reschedule Audit History */}
          {task.reassignments && task.reassignments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider mb-2">
                <History className="w-3.5 h-3.5 text-[#244C3B] dark:text-[#DFD0B8]" />
                <span>Reschedule History</span>
              </div>

              <div className="space-y-2">
                {task.reassignments.map((r, i) => (
                  <div
                    key={r.id || i}
                    className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 font-mono">
                      <span>
                        Moved from Day {r.originalDay?.dayNumber} → Day {r.newDay?.dayNumber}
                      </span>
                      <span>
                        {new Intl.DateTimeFormat('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          month: 'short',
                          day: 'numeric',
                        }).format(new Date(r.reassignedAt))}
                      </span>
                    </div>
                    {r.reason && (
                      <p className="text-[#4A5749] dark:text-[#C8BFB0] italic">
                        Reason: "{r.reason}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
