import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Layers,
  CheckCircle2,
  Clock,
  Flame,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Coffee,
  Plus,
  Trash2,
  Check,
  Trophy,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { taskService } from '../services/taskService';
import { personalTaskService } from '../services/personalTaskService';
import { studySessionService } from '../services/studySessionService';
import TaskItem from '../components/tasks/TaskItem';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import RescheduleMissedTaskModal from '../components/tasks/RescheduleMissedTaskModal';
import SaturdayRecollection from '../components/planner/SaturdayRecollection';
import SundayAssessment from '../components/planner/SundayAssessment';
import WeeklyEngineeringReport from '../components/analytics/WeeklyEngineeringReport';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { CardSkeleton } from '../components/ui/Skeleton';
import {
  getKolkataDateString,
  addDaysToKolkataDate,
  formatKolkataDate,
} from '../utils/date.util';

export default function DailyPlannerPage() {
  const [selectedDate, setSelectedDate] = useState(() => getKolkataDateString());
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed' | 'personal' | 'rescheduled'
  const [plannerData, setPlannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [tasksFocusMap, setTasksFocusMap] = useState({});
  const [weekendMode, setWeekendMode] = useState(true);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);

  // Modals
  const [detailTaskId, setDetailTaskId] = useState(null);
  const [rescheduleTask, setRescheduleTask] = useState(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isAddPersonalOpen, setIsAddPersonalOpen] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    title: '',
    description: '',
    priority: 'normal',
    estimatedDuration: 30,
    category: 'Personal Learning',
  });
  const [isSubmittingPersonal, setIsSubmittingPersonal] = useState(false);

  const fetchPlanner = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDailyPlanner(date);
      setPlannerData(data);

      const ids = [];
      (data?.roadmapsQueue || []).forEach((g) => {
        (g.activeTasks || []).forEach((t) => ids.push(t.id));
      });
      (data?.completedTasksToday || []).forEach((t) => ids.push(t.id));
      (data?.rescheduledTasks || []).forEach((t) => ids.push(t.id));
      if (ids.length > 0) {
        try {
          const focusRes = await studySessionService.getTasksFocusDuration(ids);
          setTasksFocusMap(focusRes || {});
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to load daily planner:', err);
      setError(err.message || 'Failed to fetch planner tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner(selectedDate);
  }, [selectedDate]);

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDaysToKolkataDate(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDaysToKolkataDate(prev, 1));
  };

  const handleJumpToToday = () => {
    setSelectedDate(getKolkataDateString());
  };

  const handleTaskUpdated = () => {
    fetchPlanner(selectedDate);
  };

  const toggleGroupCollapse = (roadmapId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [roadmapId]: !prev[roadmapId],
    }));
  };

  const handleOpenDetail = (taskId) => {
    setDetailTaskId(taskId);
  };

  const handleOpenReschedule = (task) => {
    setRescheduleTask(task);
    setIsRescheduleOpen(true);
  };

  const handleCreatePersonalTask = async (e) => {
    e.preventDefault();
    if (!personalForm.title.trim()) return;
    try {
      setIsSubmittingPersonal(true);
      await personalTaskService.createTask({
        ...personalForm,
        scheduledDate: selectedDate,
      });
      setIsAddPersonalOpen(false);
      setPersonalForm({
        title: '',
        description: '',
        priority: 'normal',
        estimatedDuration: 30,
        category: 'Personal Learning',
      });
      fetchPlanner(selectedDate);
    } catch (err) {
      alert(err.message || 'Failed to create personal task');
    } finally {
      setIsSubmittingPersonal(false);
    }
  };

  const formattedDateTitle = formatKolkataDate(selectedDate, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) || selectedDate;

  const isToday = selectedDate === getKolkataDateString();

  const streak = plannerData?.streak || {
    currentStreak: 0,
    bestStreak: 0,
    completedToday: 0,
    streakTarget: 5,
    remainingToday: 5,
    qualifiedToday: false,
  };

  const roadmapsQueue = plannerData?.roadmapsQueue || plannerData?.roadmaps || [];
  const activeTasksFlat = plannerData?.activeTasks || [];
  const completedTasks = plannerData?.completedTasks || [];
  const rescheduledTasks = plannerData?.rescheduledTasks || [];
  const personalTasks = plannerData?.personalTasks || [];

  const completedCount = completedTasks.length || streak.completedToday || 0;
  const targetCount = streak.streakTarget || 5;
  const progressPercent = Math.min(100, Math.round((completedCount / targetCount) * 100));

  return (
    <div className="space-y-6">
      {/* Rest Day Banner */}
      {plannerData?.isRestDay && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6]">
                {plannerData.restDayInfo?.title || 'Planned Rest Day'}
              </h4>
              <p className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5">
                Neutral day in streak calculation. Your streaks will not be broken today.
                {plannerData.restDayInfo?.reason ? ` • "${plannerData.restDayInfo.reason}"` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header & Date Navigation Card (Reference Layout) */}
      <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Title & Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F8F9F6] dark:bg-[#171B21] rounded-xl p-1 border border-[#E4E7E0] dark:border-[#303945]">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-lg text-[#596258] hover:text-[#202620] dark:text-[#B0B7C2] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextDay}
              className="p-2 rounded-lg text-[#596258] hover:text-[#202620] dark:text-[#B0B7C2] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[#202620] dark:text-[#F3F4F6] font-mono">
              {formattedDateTitle}
            </h1>
            {isToday && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[var(--accent-primary)] border border-amber-500/20">
                Today
              </span>
            )}
          </div>
        </div>

        {/* Right: Date Picker, Freezes Badge, Jump to Today & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-mono text-xs font-semibold">
            <span>❄️ {streak.streakFreezes?.freezesRemaining ?? streak.freezes?.remaining ?? 4}/4 Freezes</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] font-mono text-xs">
            <span className="text-[#858D82] dark:text-[#7F8996]">Completed:</span>
            <span className="font-bold text-[var(--accent-primary)]">
              {completedCount} / {targetCount}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] rounded-xl px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none font-mono cursor-pointer"
            />
          </div>

          {plannerData?.isWeekendRevisionDay && (
            <button
              onClick={() => setIsWeeklyReportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F2ED] dark:bg-[#252C35] hover:border-[var(--accent-primary)] text-xs font-semibold border border-[#E4E7E0] dark:border-[#303945] text-[#202620] dark:text-[#F3F4F6] transition cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span className="hidden sm:inline">Weekly Report</span>
            </button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToToday}
            className={isToday ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold' : ''}
          >
            Today
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddPersonalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Personal</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Progress Bar */}
      <div className="w-full bg-[#E4E7E0] dark:bg-[#252C35] h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3. Workload Overload Alert Banner */}
      {plannerData?.workload?.isOverloaded && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#202620] dark:text-[#F3F4F6]">
                Workload alert: {plannerData.workload.totalScheduled} tasks scheduled for today
              </h4>
              <p className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5">
                Recommended maximum is 7. To maintain consistency, consider rescheduling personal tasks to lighter days.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('personal')}
            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
          >
            Manage Personal Tasks
          </button>
        </div>
      )}

      {/* 4. Weekend Revision Mode Active Banner & Toggle */}
      {plannerData?.isWeekendRevisionDay && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-amber-500/30 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  {plannerData.weekendReviewType === 'recollection' ? 'Saturday Recollection' : 'Sunday Assessment'}
                </span>
                <span className="text-xs text-[#858D82] dark:text-[#7F8996] font-mono">
                  Dedicated Weekend Revision Mode
                </span>
              </div>
              <p className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5">
                Weekends protect and solidify your Mon–Fri learning without advancing curriculum days or consuming streak freezes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setWeekendMode(!weekendMode)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] hover:border-[var(--accent-primary)]/50 transition cursor-pointer text-[#202620] dark:text-[#F3F4F6]"
            >
              {weekendMode ? 'View Normal Task Queue' : 'Return to Revision Mode'}
            </button>
          </div>
        </div>
      )}

      {/* 5. Conditional Render: Weekend Revision Screen vs Regular Queue */}
      {plannerData?.isWeekendRevisionDay && weekendMode ? (
        plannerData.weekendReviewType === 'recollection' ? (
          <SaturdayRecollection
            weekStartDate={plannerData.date}
            initialData={plannerData.weekendData}
            onSaved={() => fetchPlanner(selectedDate)}
          />
        ) : (
          <SundayAssessment
            weekStartDate={plannerData.date}
            initialData={plannerData.weekendData}
            onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
            onSaved={() => fetchPlanner(selectedDate)}
          />
        )
      ) : (
        <>
          {/* Segmented Filter Tabs (Reference Style) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-0.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-mono ${
            activeTab === 'pending'
              ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
              : 'bg-[#FFFFFF] dark:bg-[#1D232B] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
          }`}
        >
          Pending ({activeTasksFlat.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-mono ${
            activeTab === 'completed'
              ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
              : 'bg-[#FFFFFF] dark:bg-[#1D232B] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
          }`}
        >
          Completed ({completedTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-mono ${
            activeTab === 'personal'
              ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
              : 'bg-[#FFFFFF] dark:bg-[#1D232B] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
          }`}
        >
          Personal ({personalTasks.length})
        </button>

        {rescheduledTasks.length > 0 && (
          <button
            onClick={() => setActiveTab('rescheduled')}
            className={`px-4.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer font-mono ${
              activeTab === 'rescheduled'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
                : 'bg-[#FFFFFF] dark:bg-[#1D232B] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#303945] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
            }`}
          >
            Rescheduled ({rescheduledTasks.length})
          </button>
        )}
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Tasks List */}
        <div className="lg:col-span-8 space-y-4">
          {loading && !plannerData ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : error ? (
            <ErrorState
              title="Failed to Load Tasks"
              message={error}
              onRetry={() => fetchPlanner(selectedDate)}
            />
          ) : activeTab === 'pending' ? (
            roadmapsQueue.length > 0 ? (
              <div className="space-y-4">
                {roadmapsQueue.map((group) => {
                  const isCollapsed = collapsedGroups[group.roadmapId];
                  const activeTasks = group.activeTasks || [];
                  if (activeTasks.length === 0) return null;

                  return (
                    <div
                      key={group.roadmapId}
                      className="rounded-xl border border-[#E4E7E0] dark:border-[#303945] bg-[#FFFFFF] dark:bg-[#1D232B] overflow-hidden shadow-xs"
                    >
                      {/* Roadmap Group Header */}
                      <div
                        onClick={() => toggleGroupCollapse(group.roadmapId)}
                        className="px-5 py-3.5 bg-[#F8F9F6] dark:bg-[#171B21] flex items-center justify-between cursor-pointer hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors border-b border-[#E4E7E0] dark:border-[#303945]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/roadmaps/${group.roadmapId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] hover:text-[var(--accent-primary)] transition-colors truncate"
                              >
                                {group.title}
                              </Link>
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white dark:bg-[#252C35] text-[#858D82] dark:text-[#7F8996] border border-[#E4E7E0] dark:border-[#303945]">
                                {group.categoryName}
                              </span>
                            </div>
                            <div className="text-xs text-[#858D82] dark:text-[#7F8996] flex items-center gap-1.5 mt-0.5 font-mono">
                              <span className="font-semibold text-[var(--accent-primary)]">
                                Day {group.currentDayNumber}
                              </span>
                              <span>•</span>
                              <span className="truncate">{group.currentDayTitle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs font-mono text-[#858D82] dark:text-[#7F8996]">
                            {group.dayCompletedTasks || 0}/{group.dayTotalTasks || activeTasks.length} done
                          </span>
                          <button
                            type="button"
                            className="p-1 text-[#858D82] hover:text-[#202620] dark:hover:text-[#F3F4F6] cursor-pointer"
                            aria-label="Toggle collapse"
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
                        <div className="p-4 space-y-2.5">
                          {activeTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              showRoadmapContext={false}
                              focusMinutes={tasksFocusMap[task.id]?.focusMinutes}
                              onTaskUpdated={handleTaskUpdated}
                              onViewDetails={handleOpenDetail}
                              onReassignClick={() => handleOpenReschedule(task)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="All Active Learning Days Completed!"
                description="You've completed all tasks in your pending queue for this date. Great job!"
                action={
                  <Link
                    to="/roadmaps"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)] transition-colors"
                  >
                    Explore Roadmaps
                  </Link>
                }
              />
            )
          ) : activeTab === 'completed' ? (
            completedTasks.length > 0 ? (
              <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono mb-2">
                  Completed Tasks ({completedTasks.length})
                </h3>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={{ ...task, completed: true }}
                      showRoadmapContext={true}
                      onTaskUpdated={handleTaskUpdated}
                      onViewDetails={handleOpenDetail}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Tasks Completed Yet Today"
                description="Check off tasks from your Pending queue to log your daily engineering work."
              />
            )
          ) : activeTab === 'personal' ? (
            personalTasks.length > 0 ? (
              <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono">
                    Personal Tasks ({personalTasks.length})
                  </h3>
                  <Button size="xs" onClick={() => setIsAddPersonalOpen(true)} icon={Plus}>
                    Add New
                  </Button>
                </div>
                <div className="space-y-2">
                  {personalTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-[#E4E7E0] dark:border-[#303945] bg-[#F8F9F6] dark:bg-[#171B21] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleTogglePersonalTask(t.id)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                            t.isCompleted
                              ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-text)]'
                              : 'border-[#D5DBD1] dark:border-[#3A4552]'
                          }`}
                        >
                          {t.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div>
                          <div
                            className={`text-xs font-medium ${
                              t.isCompleted
                                ? 'line-through text-[#858D82] dark:text-[#7F8996]'
                                : 'text-[#202620] dark:text-[#F3F4F6]'
                            }`}
                          >
                            {t.title}
                          </div>
                          {t.description && (
                            <div className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
                              {t.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePersonalTask(t.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Personal Tasks Added"
                description="Add quick ad-hoc study items, reading lists, or bug-fix tasks."
                action={
                  <Button size="sm" onClick={() => setIsAddPersonalOpen(true)} icon={Plus}>
                    Add Personal Task
                  </Button>
                }
              />
            )
          ) : (
            rescheduledTasks.length > 0 ? (
              <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono mb-2">
                  Rescheduled Tasks ({rescheduledTasks.length})
                </h3>
                <div className="space-y-2">
                  {rescheduledTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      showRoadmapContext={true}
                      onTaskUpdated={handleTaskUpdated}
                      onViewDetails={handleOpenDetail}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Rescheduled Tasks"
                description="Tasks you reassign to this date will appear here."
              />
            )
          )}
        </div>

        {/* Right Column (4 cols): Motivational Card & Streak Status from Reference */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reference Trophy Encouragement Card */}
          <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-6 shadow-xs text-center flex flex-col items-center justify-between min-h-[260px]">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-[var(--accent-primary)] flex items-center justify-center mb-3 mt-2 shadow-[0_0_15px_rgba(242,169,59,0.2)]">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#202620] dark:text-[#F3F4F6] mb-1">
                {streak.qualifiedToday ? 'Goal Achieved!' : 'Great Progress!'}
              </h3>
              <p className="text-xs text-[#596258] dark:text-[#B0B7C2] max-w-xs leading-relaxed">
                {streak.qualifiedToday
                  ? `You've locked in your daily goal with ${completedCount} completed tasks today!`
                  : `You're on track to reach your goal today. Complete ${streak.remainingToday} more to qualify.`}
              </p>
            </div>

            <Button
              variant="amber"
              size="md"
              onClick={() => {
                const firstPending = activeTasksFlat[0];
                if (firstPending) {
                  handleOpenDetail(firstPending.id);
                } else {
                  navigate('/focus');
                }
              }}
              className="w-full mt-4 flex items-center justify-center gap-2"
            >
              <span>Keep Going</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Daily Streak & Consistency Summary */}
          <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono">
                  Streak Target
                </h4>
              </div>
              <span className="font-mono text-xs font-bold text-[var(--accent-primary)]">
                {streak.currentStreak} Days Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#858D82] dark:text-[#7F8996] font-mono">
                <span>Daily Target:</span>
                <span className="font-semibold text-[#202620] dark:text-[#F3F4F6]">{streak.streakTarget} tasks</span>
              </div>
              <div className="flex justify-between text-[#858D82] dark:text-[#7F8996] font-mono">
                <span>Completed Today:</span>
                <span className="font-semibold text-[#202620] dark:text-[#F3F4F6]">{completedCount} tasks</span>
              </div>
              <div className="flex justify-between text-[#858D82] dark:text-[#7F8996] font-mono">
                <span>All-Time Best Streak:</span>
                <span className="font-semibold text-[#202620] dark:text-[#F3F4F6]">{streak.bestStreak} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )}

      {/* Weekly Engineering Report Modal */}
      {isWeeklyReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <WeeklyEngineeringReport
              weekStartDate={plannerData?.date}
              onClose={() => setIsWeeklyReportOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {detailTaskId && (
        <TaskDetailModal
          taskId={detailTaskId}
          isOpen={!!detailTaskId}
          onClose={() => setDetailTaskId(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && rescheduleTask && (
        <RescheduleMissedTaskModal
          isOpen={isRescheduleOpen}
          onClose={() => {
            setIsRescheduleOpen(false);
            setRescheduleTask(null);
          }}
          task={rescheduleTask}
          onRescheduled={handleTaskUpdated}
        />
      )}

      {/* Add Personal Task Modal */}
      {isAddPersonalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#202620] dark:text-[#F3F4F6]">
              Add Personal Study Task
            </h3>
            <form onSubmit={handleCreatePersonalTask} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read Spring Transactions chapter"
                  value={personalForm.title}
                  onChange={(e) => setPersonalForm({ ...personalForm, title: e.target.value })}
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key concepts or objectives..."
                  value={personalForm.description}
                  onChange={(e) => setPersonalForm({ ...personalForm, description: e.target.value })}
                  className="input-base text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    value={personalForm.estimatedDuration}
                    onChange={(e) => setPersonalForm({ ...personalForm, estimatedDuration: parseInt(e.target.value, 10) || 30 })}
                    className="input-base text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                    Priority
                  </label>
                  <select
                    value={personalForm.priority}
                    onChange={(e) => setPersonalForm({ ...personalForm, priority: e.target.value })}
                    className="input-base text-xs"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4E7E0] dark:border-[#303945]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddPersonalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmittingPersonal}
                >
                  Save Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
