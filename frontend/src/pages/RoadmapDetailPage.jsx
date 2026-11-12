import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Layers,
  Archive,
  RotateCcw,
  ListTodo,
  Plus,
  Edit2,
  CalendarPlus,
  Compass,
  Pause,
  Play,
  History,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { roadmapService } from '../services/roadmapService';
import { moduleService } from '../services/moduleService';
import { dayService } from '../services/dayService';
import { taskService } from '../services/taskService';
import ModuleAccordion from '../components/roadmaps/ModuleAccordion';
import ModuleModal from '../components/roadmaps/ModuleModal';
import DayModal from '../components/roadmaps/DayModal';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import EditRoadmapModal from '../components/roadmaps/EditRoadmapModal';
import ReassignTaskModal from '../components/tasks/ReassignTaskModal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import ErrorState from '../components/ui/ErrorState';
import { CardSkeleton } from '../components/ui/Skeleton';

export default function RoadmapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories = [], refreshNavData } = useOutletContext() || {};

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isEditRoadmapOpen, setIsEditRoadmapOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [defaultModuleIdForDay, setDefaultModuleIdForDay] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [targetDayIdForTask, setTargetDayIdForTask] = useState(null);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [targetTaskForReassign, setTargetTaskForReassign] = useState(null);
  const [detailTaskId, setDetailTaskId] = useState(null);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [pauseHistory, setPauseHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    impactDetails: null,
    isDestructive: false,
    confirmLabel: 'Confirm',
    action: null,
  });

  const fetchRoadmap = async () => {
    if (!roadmap) setLoading(true);
    setError(null);
    try {
      // Summary-first progressive loading (<40 KB payload, renders ~4-5x faster)
      const data = await roadmapService.getRoadmapSummary(id);
      setRoadmap(data);
    } catch (err) {
      console.warn('Summary-first fetch failed, falling back to full roadmap:', err);
      try {
        const full = await roadmapService.getRoadmapById(id);
        setRoadmap(full);
      } catch (fallbackErr) {
        console.error('Failed to load roadmap details:', fallbackErr);
        if (!roadmap) {
          setError(fallbackErr.message || 'Roadmap not found or server error');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDayTasks = async (dayId) => {
    try {
      const fullDay = await dayService.getDayById(dayId);
      if (fullDay && fullDay.tasks) {
        setRoadmap((prev) => {
          if (!prev) return prev;
          const updatedDays = (prev.roadmapDays || []).map((d) =>
            d.id === dayId ? { ...d, tasks: fullDay.tasks } : d
          );
          return { ...prev, roadmapDays: updatedDays };
        });
      }
    } catch (err) {
      console.error(`Failed to load tasks for day ${dayId}:`, err);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const handleTaskUpdated = (taskId, newStatus) => {
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updatedDays = prev.roadmapDays.map((day) => {
        const updatedTasks = day.tasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              completions: newStatus ? [{ completed: true, completedAt: new Date() }] : [],
            };
          }
          return task;
        });
        return { ...day, tasks: updatedTasks };
      });
      return { ...prev, roadmapDays: updatedDays };
    });
  };

  // Module Actions
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleDeleteModule = (mod) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Module: ${mod.title}?`,
      message:
        'Are you sure you want to delete this module? Days inside this module will not be deleted; they will become standalone days.',
      isDestructive: true,
      confirmLabel: 'Delete Module',
      action: async () => {
        try {
          await moduleService.deleteModule(mod.id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchRoadmap();
        } catch (err) {
          setError(err.message || 'Failed to delete module');
        }
      },
    });
  };

  // Day Actions
  const handleOpenAddDay = (targetModule = null) => {
    setEditingDay(null);
    setDefaultModuleIdForDay(targetModule?.id || null);
    setIsDayModalOpen(true);
  };

  const handleOpenEditDay = (d) => {
    setEditingDay(d);
    setIsDayModalOpen(true);
  };

  const handleDeleteDay = (d) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Day ${d.dayNumber}: ${d.title}?`,
      message:
        'Are you sure you want to delete this roadmap day? All tasks scheduled under this day will also be deleted.',
      impactDetails: <div>• {d.tasks?.length || 0} tasks will be removed</div>,
      isDestructive: true,
      confirmLabel: 'Delete Day',
      action: async () => {
        try {
          await dayService.deleteDay(d.id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchRoadmap();
        } catch (err) {
          setError(err.message || 'Failed to delete day');
        }
      },
    });
  };

  // Task Actions
  const handleOpenAddTask = (d) => {
    setEditingTask(null);
    setTargetDayIdForTask(d.id);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTargetDayIdForTask(task.roadmapDayId);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (task) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Task: ${task.title}?`,
      message:
        'Are you sure you want to permanently delete this task from the curriculum?',
      isDestructive: true,
      confirmLabel: 'Delete Task',
      action: async () => {
        try {
          await taskService.deleteTask(task.id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchRoadmap();
        } catch (err) {
          setError(err.message || 'Failed to delete task');
        }
      },
    });
  };

  const handleOpenReassign = (task) => {
    setTargetTaskForReassign(task);
    setIsReassignModalOpen(true);
  };

  const handleArchiveRoadmap = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Archive Roadmap: ${roadmap.title}?`,
      message:
        'Archiving removes this roadmap from your daily active views and learning queue. You can restore it at any time.',
      isDestructive: false,
      confirmLabel: 'Archive Roadmap',
      action: async () => {
        try {
          await roadmapService.archiveRoadmap(id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await refreshNavData?.();
          fetchRoadmap();
        } catch (err) {
          setError(err.message || 'Archive failed');
        }
      },
    });
  };

  const handleRestoreRoadmap = async () => {
    try {
      await roadmapService.restoreRoadmap(id);
      await refreshNavData?.();
      fetchRoadmap();
    } catch (err) {
      setError(err.message || 'Restore failed');
    }
  };

  const handleDeletePermanentRoadmap = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Permanently Delete Roadmap: ${roadmap.title}?`,
      message:
        'CRITICAL: This will permanently remove this roadmap and all its modules, roadmap days, and associated tasks from the database. This action cannot be undone.',
      impactDetails: (
        <div className="space-y-1 text-xs">
          <div>• {roadmap.modules?.length || 0} Modules will be permanently deleted</div>
          <div>• {roadmap.roadmapDays?.length || 0} Roadmap Days will be permanently deleted</div>
          <div>• All tasks and historical completions will be completely purged</div>
        </div>
      ),
      isDestructive: true,
      confirmLabel: 'Delete Permanently',
      action: async () => {
        try {
          await roadmapService.deleteRoadmapPermanently(id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await refreshNavData?.();
          navigate('/roadmaps');
        } catch (err) {
          setError(err.message || 'Failed to delete roadmap');
        }
      },
    });
  };

  const handlePauseRoadmap = async (e) => {
    e.preventDefault();
    try {
      await roadmapService.pauseRoadmap(id, pauseReason);
      setIsPauseModalOpen(false);
      setPauseReason('');
      fetchRoadmap();
    } catch (err) {
      alert(err.message || 'Failed to pause roadmap');
    }
  };

  const handleResumeRoadmap = async () => {
    try {
      await roadmapService.resumeRoadmap(id);
      fetchRoadmap();
    } catch (err) {
      alert(err.message || 'Failed to resume roadmap');
    }
  };

  const handleOpenPauseHistory = async () => {
    try {
      const history = await roadmapService.getPauseHistory(id);
      setPauseHistory(history || []);
      setIsHistoryOpen(true);
    } catch (err) {
      alert(err.message || 'Failed to load pause history');
    }
  };

  if (loading && !roadmap) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-[#E4E7E0] dark:bg-[#303945] rounded animate-pulse" />
        <div className="h-44 bg-[#E4E7E0] dark:bg-[#303945] rounded-xl animate-pulse" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="py-12">
        <ErrorState
          title="Unable to load roadmap"
          message={error || 'Roadmap not found'}
          onRetry={fetchRoadmap}
        />
        <div className="mt-4 text-center">
          <Link
            to="/roadmaps"
            className="text-xs text-[var(--accent-primary)] dark:text-[#F3F4F6] hover:underline font-medium"
          >
            ← Back to All Roadmaps
          </Link>
        </div>
      </div>
    );
  }

  // Calculate overall metrics
  let totalTasks = 0;
  let completedTasks = 0;
  (roadmap.roadmapDays || []).forEach((d) => {
    (d.tasks || []).forEach((t) => {
      totalTasks++;
      if (t.completions?.some((c) => c.completed)) {
        completedTasks++;
      }
    });
  });

  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formattedStartDate = roadmap.startDate
    ? new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(roadmap.startDate))
    : 'Not scheduled';

  const modules = roadmap.modules || [];
  const roadmapDays = roadmap.roadmapDays || [];
  const standaloneDays = roadmapDays.filter((d) => !d.moduleId);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation & Top Action Menu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#858D82] dark:text-[#7F8996]">
          <Link
            to="/roadmaps"
            className="hover:text-[var(--accent-primary)] transition-colors font-medium"
          >
            My Roadmaps
          </Link>
          <span>/</span>
          <span className="font-mono">{roadmap.category?.name || 'Category'}</span>
          <span>/</span>
          <span className="font-semibold text-[#202620] dark:text-[#F3F4F6] truncate max-w-[200px]">
            {roadmap.title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            icon={Plus}
            onClick={handleOpenAddModule}
          >
            Add Module
          </Button>

          <Button
            variant="outline"
            size="xs"
            icon={CalendarPlus}
            onClick={() => handleOpenAddDay()}
          >
            Add Day
          </Button>

          <Button
            variant="outline"
            size="xs"
            icon={Edit2}
            onClick={() => setIsEditRoadmapOpen(true)}
          >
            Configure
          </Button>

          {roadmap.status?.toLowerCase() === 'paused' ? (
            <Button
              size="xs"
              icon={Play}
              onClick={handleResumeRoadmap}
              className="bg-[var(--accent-primary)] text-[var(--accent-text)] font-semibold"
            >
              Resume Track
            </Button>
          ) : roadmap.status?.toLowerCase() === 'active' ? (
            <Button
              variant="outline"
              size="xs"
              icon={Pause}
              onClick={() => setIsPauseModalOpen(true)}
            >
              Pause
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="xs"
            icon={History}
            onClick={handleOpenPauseHistory}
            title="Pause and resume audit history"
          >
            History
          </Button>

          {roadmap.status?.toLowerCase() === 'archived' ? (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                icon={RotateCcw}
                onClick={handleRestoreRoadmap}
              >
                Restore
              </Button>
              <Button
                variant="danger"
                size="xs"
                icon={Trash2}
                onClick={handleDeletePermanentRoadmap}
              >
                Delete Permanently
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="xs"
                icon={Archive}
                onClick={handleArchiveRoadmap}
                className="text-[#858D82] hover:text-amber-600 dark:hover:text-amber-400"
              >
                Archive
              </Button>
              <Button
                variant="ghost"
                size="xs"
                icon={Trash2}
                onClick={handleDeletePermanentRoadmap}
                className="text-[#858D82] hover:text-rose-600 dark:hover:text-rose-400"
                title="Permanently Delete Roadmap"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap Header Summary Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase font-mono tracking-wider text-[var(--accent-primary)] dark:text-[#F3F4F6]">
                {roadmap.category?.name || 'General Category'}
              </span>
              <span className="text-[#D4D4CA] dark:text-[#4F5561]">•</span>
              <Badge type={roadmap.status}>{roadmap.status}</Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#202620] dark:text-[#F3F4F6] mb-2 tracking-tight">
              {roadmap.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#596258] dark:text-[#B0B7C2] max-w-3xl leading-relaxed">
              {roadmap.description || 'Master this engineering curriculum through targeted daily learning and coding.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0 bg-[#F7F7F2] dark:bg-[#222831] p-3.5 rounded-xl border border-[#E4E7E0] dark:border-[#303945]">
            {roadmap.currentLearningDayNumber && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] dark:text-[#F3F4F6]">
                <Compass className="w-3.5 h-3.5 text-[var(--accent-primary)] dark:text-[#F3F4F6]" />
                <span>Active Frontier: Day {roadmap.currentLearningDayNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-[#596258] dark:text-[#B0B7C2]">
              <Clock className="w-3.5 h-3.5 text-[#91A88E]" />
              <span className="font-semibold">{roadmap.duration} Total Days</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#596258] dark:text-[#B0B7C2]">
              <Calendar className="w-3.5 h-3.5 text-[#91A88E]" />
              <span>Starts {formattedStartDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#596258] dark:text-[#B0B7C2]">
              <ListTodo className="w-3.5 h-3.5 text-[#91A88E]" />
              <span>{roadmap.targetDailyStudyTime}m / day target</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4 border-t border-[#E4E7E0] dark:border-[#303945]">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#202620] dark:text-[#F3F4F6]">
                Roadmap Completion Progress
              </span>
              <span className="font-mono text-[#858D82] dark:text-[#7F8996]">
                ({completedTasks} of {totalTasks} tasks completed)
              </span>
            </div>
            <span className="font-mono font-bold text-[#202620] dark:text-[#F3F4F6]">
              {progressPercent}%
            </span>
          </div>
          <ProgressBar
            value={progressPercent}
            size="md"
            color={progressPercent === 100 ? 'emerald' : 'green'}
          />
        </div>
      </div>

      {/* Paused Banner */}
      {roadmap.status?.toLowerCase() === 'paused' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Pause className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                Roadmap Currently Paused
              </h4>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                Progression frontier is preserved. Tasks from this track are temporarily omitted from your daily learning queue.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            icon={Play}
            onClick={handleResumeRoadmap}
            className="bg-[var(--accent-primary)] dark:bg-[#F3F4F6] text-white dark:text-[#222831]"
          >
            Resume Track
          </Button>
        </div>
      )}

      {/* Archived Banner */}
      {roadmap.status?.toLowerCase() === 'archived' && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                Roadmap Currently Archived
              </h4>
              <p className="text-xs text-rose-700/80 dark:text-rose-400/80 mt-0.5">
                This track is hidden from your active curriculum and daily planner. You can restore it or permanently delete it.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              size="xs"
              variant="outline"
              icon={RotateCcw}
              onClick={handleRestoreRoadmap}
            >
              Restore Track
            </Button>
            <Button
              size="xs"
              variant="danger"
              icon={Trash2}
              onClick={handleDeletePermanentRoadmap}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      )}

      {/* Modules & Curriculum Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-primary)] dark:text-[#F3F4F6]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6]">
              Curriculum Modules & Day Schedule
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#E4E7E0] dark:bg-[#303945] text-[#858D82] dark:text-[#7F8996]">
              {modules.length} Modules • {roadmapDays.length} Days
            </span>
          </div>
        </div>

        {/* Modules Accordions */}
        {modules.map((mod) => {
          const modDays = roadmapDays.filter(
            (d) => d.moduleId === mod.id || (d.dayNumber >= mod.startingDay && d.dayNumber <= mod.endingDay)
          );

          return (
            <ModuleAccordion
              key={mod.id}
              module={mod}
              days={modDays}
              roadmapStartDate={roadmap.startDate}
              onTaskUpdated={handleTaskUpdated}
              onReassignTask={handleOpenReassign}
              onViewTaskDetails={(task) => setDetailTaskId(task.id)}
              onEditTask={handleOpenEditTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleOpenAddTask}
              onEditDay={handleOpenEditDay}
              onDeleteDay={handleDeleteDay}
              onAddDayToModule={handleOpenAddDay}
              onEditModule={handleOpenEditModule}
              onDeleteModule={handleDeleteModule}
              onLoadDayTasks={handleLoadDayTasks}
              allRoadmapDays={roadmapDays}
            />
          );
        })}

        {/* Standalone Days (if any) */}
        {standaloneDays.length > 0 && modules.length > 0 && (
          <div className="pt-4 border-t border-[#E4E7E0] dark:border-[#303945]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#858D82] mb-3">
              Standalone Roadmap Days
            </h4>
            <div className="space-y-4">
              {standaloneDays.map((d) => (
                <div
                  key={d.id}
                  className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E4E7E0] dark:border-[#303945]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#E8F0EB] text-[var(--accent-primary)] dark:bg-[#303945] dark:text-[#F3F4F6]">
                        Day {d.dayNumber}
                      </span>
                      <h5 className="text-sm font-semibold text-[#202620] dark:text-[#F3F4F6]">
                        {d.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge type={d.dayType} size="xs">
                        {d.dayType}
                      </Badge>
                      <button
                        onClick={() => handleOpenAddTask(d)}
                        className="p-1 rounded text-[#858D82] hover:text-[var(--accent-primary)] dark:hover:text-[#F3F4F6]"
                        title="Add Task"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditDay(d)}
                        className="p-1 rounded text-[#858D82] hover:text-[#202620] dark:hover:text-[#E6EDE5]"
                        title="Edit Day"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(d.tasks || []).map((t) => (
                      <TaskItem
                        key={t.id}
                        task={t}
                        allowEdit={true}
                        onTaskUpdated={handleTaskUpdated}
                        onViewDetails={(task) => setDetailTaskId(task.id)}
                        onEditClick={handleOpenEditTask}
                        onDeleteClick={handleDeleteTask}
                        onReassignClick={handleOpenReassign}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditRoadmapModal
        isOpen={isEditRoadmapOpen}
        onClose={() => setIsEditRoadmapOpen(false)}
        roadmap={roadmap}
        categories={categories}
        onSuccess={() => {
          fetchRoadmap();
          refreshNavData?.();
        }}
        onArchive={handleArchiveRoadmap}
        onRestore={handleRestoreRoadmap}
        onDeletePermanent={handleDeletePermanentRoadmap}
      />

      <ModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        roadmapId={roadmap.id}
        roadmapDuration={roadmap.duration}
        module={editingModule}
        onSuccess={fetchRoadmap}
      />

      <DayModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        roadmapId={roadmap.id}
        roadmapStartDate={roadmap.startDate}
        roadmapDuration={roadmap.duration}
        modules={modules}
        day={editingDay}
        defaultModuleId={defaultModuleIdForDay}
        onSuccess={fetchRoadmap}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        dayId={targetDayIdForTask}
        task={editingTask}
        onSuccess={fetchRoadmap}
      />

      <TaskDetailModal
        isOpen={!!detailTaskId}
        onClose={() => setDetailTaskId(null)}
        taskId={detailTaskId}
        onTaskUpdated={fetchRoadmap}
      />

      <ReassignTaskModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        task={targetTaskForReassign}
        availableDays={roadmapDays}
        onSuccess={fetchRoadmap}
      />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        impactDetails={confirmDialog.impactDetails}
        isDestructive={confirmDialog.isDestructive}
        confirmLabel={confirmDialog.confirmLabel}
      />

      {/* Pause Roadmap Modal */}
      {isPauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-2">
              <Pause className="w-4 h-4 text-amber-500" />
              Pause Roadmap Track
            </h3>
            <p className="text-xs text-[#858D82] dark:text-[#7F8996] mt-1">
              Pausing "{roadmap.title}" will temporarily freeze progression and hide its tasks from your Daily Planner without losing completed records.
            </p>

            <form onSubmit={handlePauseRoadmap} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#202620] dark:text-[#F3F4F6] mb-1">
                  Reason for Pausing (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Focusing on other tracks, exams, busy sprint..."
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F0F0EB] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] text-[#202620] dark:text-[#F3F4F6] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7E0] dark:border-[#303945]">
                <button
                  type="button"
                  onClick={() => setIsPauseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#858D82] dark:text-[#7F8996] hover:bg-[#F0F0EB] dark:hover:bg-[#222831]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700"
                >
                  Confirm Pause
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pause History Audit Log Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[80vh] flex flex-col">
            <h3 className="text-base font-bold text-[#202620] dark:text-[#F3F4F6] flex items-center gap-2">
              <History className="w-4 h-4 text-[var(--accent-primary)] dark:text-[#F3F4F6]" />
              Roadmap Lifecycle Audit Log
            </h3>
            <p className="text-xs text-[#858D82] dark:text-[#7F8996] mt-1">
              Historical pause and resume transitions for "{roadmap.title}".
            </p>

            <div className="overflow-y-auto flex-1 my-4 space-y-2">
              {pauseHistory.length === 0 ? (
                <p className="text-xs text-[#858D82] dark:text-[#7F8996] py-4 text-center">
                  No pause events recorded for this roadmap.
                </p>
              ) : (
                pauseHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#F0F0EB] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-[#202620] dark:text-[#F3F4F6]">
                      <span>{item.resumedAt ? 'Completed Pause Period' : 'Currently Paused'}</span>
                      <span className="font-mono text-[10px] text-[#858D82] dark:text-[#7F8996]">
                        {new Date(item.pausedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-[#858D82] dark:text-[#7F8996] italic">
                        "{item.reason}"
                      </p>
                    )}
                    {item.resumedAt && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        Resumed: {new Date(item.resumedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E4E7E0] dark:border-[#303945]">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] dark:bg-[#F3F4F6] text-white dark:text-[#222831]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
