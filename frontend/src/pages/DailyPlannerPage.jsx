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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { taskService } from '../services/taskService';
import { personalTaskService } from '../services/personalTaskService';
import { studySessionService } from '../services/studySessionService';
import TaskItem from '../components/tasks/TaskItem';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import RescheduleMissedTaskModal from '../components/tasks/RescheduleMissedTaskModal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { CardSkeleton } from '../components/ui/Skeleton';

export default function DailyPlannerPage() {
  const getTodayKolkata = () =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

  const [selectedDate, setSelectedDate] = useState(getTodayKolkata);
  const [activeTab, setActiveTab] = useState('adaptive');
  const [plannerData, setPlannerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [tasksFocusMap, setTasksFocusMap] = useState({});

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
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    dateObj.setUTCDate(dateObj.getUTCDate() - 1);
    const newDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    dateObj.setUTCDate(dateObj.getUTCDate() + 1);
    const newDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
    setSelectedDate(newDate);
  };

  const handleJumpToToday = () => {
    setSelectedDate(getTodayKolkata());
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

  const handleCancelReassignment = async (task) => {
    try {
      await taskService.cancelReassignment(task.id);
      fetchPlanner(selectedDate);
    } catch (err) {
      setError(err.message || 'Failed to revert reassignment');
    }
  };

  const handleTogglePersonalTask = async (id) => {
    try {
      await personalTaskService.toggleTask(id);
      fetchPlanner(selectedDate);
    } catch (err) {
      alert(err.message || 'Failed to toggle personal task');
    }
  };

  const handleDeletePersonalTask = async (id) => {
    try {
      await personalTaskService.deleteTask(id);
      fetchPlanner(selectedDate);
    } catch (err) {
      alert(err.message || 'Failed to delete personal task');
    }
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

  let formattedDateTitle = selectedDate;
  try {
    formattedDateTitle = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${selectedDate}T12:00:00Z`));
  } catch {
    formattedDateTitle = selectedDate;
  }

  const isToday = selectedDate === getTodayKolkata();

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

  return (
    <div className="space-y-6">
      {/* Rest Day Banner */}
      {plannerData?.isRestDay && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                {plannerData.restDayInfo?.title || 'Planned Rest Day'}
              </h4>
              <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
                Neutral day in streak calculation. Your streaks will not be broken today.
                {plannerData.restDayInfo?.reason ? ` • "${plannerData.restDayInfo.reason}"` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header & Navigation Controls */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F0F0EB] dark:bg-[#393E46] rounded-lg p-0.5 border border-[#E8E8DF] dark:border-[#4F5561]">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-md text-[#4A5749] dark:text-[#C8BFB0] hover:bg-white dark:hover:bg-[#393E46] transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-md text-[#4A5749] dark:text-[#C8BFB0] hover:bg-white dark:hover:bg-[#393E46] transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-[#202A23] dark:text-[#DFD0B8]">
                {formattedDateTitle}
              </h1>
              {isToday && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F0EB] dark:bg-[#393E46] text-[#244C3B] dark:text-[#DFD0B8] border border-[#C5D9CB] dark:border-[#4F5561]">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-[#737C74] dark:text-[#948979] font-mono">
              Asia/Kolkata (IST • UTC+05:30)
            </p>
          </div>
        </div>

        {/* Date Controls & Today's Streak Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 5-Task Streak Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-xs font-mono">
            <Flame
              className={`w-3.5 h-3.5 ${
                streak.qualifiedToday
                  ? 'text-emerald-500'
                  : streak.completedToday > 0
                  ? 'text-amber-500'
                  : 'text-[#737C74]'
              }`}
            />
            <span className="font-semibold text-[#202A23] dark:text-[#DFD0B8]">
              Streak: {streak.currentStreak}d
            </span>
            <span className="text-[#D4D4CA] dark:text-[#4F5561]">|</span>
            <span className={streak.qualifiedToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#737C74] dark:text-[#948979]'}>
              {streak.completedToday}/{streak.streakTarget} tasks
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#91A88E]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-[#202A23] dark:text-[#DFD0B8] focus:outline-none font-mono cursor-pointer"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToToday}
            className={isToday ? 'border-[#244C3B] text-[#244C3B] dark:border-[#DFD0B8] dark:text-[#DFD0B8] font-semibold' : ''}
          >
            Today
          </Button>
        </div>
      </div>

      {/* 2. Primary Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E8E8DF] dark:border-[#393E46] pb-px">
        <button
          onClick={() => setActiveTab('adaptive')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'adaptive'
              ? 'border-[#244C3B] dark:border-[#DFD0B8] text-[#244C3B] dark:text-[#DFD0B8] bg-[#FFFFFF] dark:bg-[#2A303A] border-x border-t border-[#E8E8DF] dark:border-[#393E46] -mb-px'
              : 'border-transparent text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#E6EDE5]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Active Learning Queue</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8]">
            {activeTasksFlat.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'completed'
              ? 'border-[#244C3B] dark:border-[#DFD0B8] text-[#244C3B] dark:text-[#DFD0B8] bg-[#FFFFFF] dark:bg-[#2A303A] border-x border-t border-[#E8E8DF] dark:border-[#393E46] -mb-px'
              : 'border-transparent text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#E6EDE5]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Completed Today</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            {completedTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'personal'
              ? 'border-[#244C3B] dark:border-[#DFD0B8] text-[#244C3B] dark:text-[#DFD0B8] bg-[#FFFFFF] dark:bg-[#2A303A] border-x border-t border-[#E8E8DF] dark:border-[#393E46] -mb-px'
              : 'border-transparent text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#E6EDE5]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>Personal Tasks</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            {personalTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rescheduled')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
            activeTab === 'rescheduled'
              ? 'border-[#244C3B] dark:border-[#DFD0B8] text-[#244C3B] dark:text-[#DFD0B8] bg-[#FFFFFF] dark:bg-[#2A303A] border-x border-t border-[#E8E8DF] dark:border-[#393E46] -mb-px'
              : 'border-transparent text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#E6EDE5]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
          <span>Rescheduled</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-[#E8E8DF] dark:bg-[#393E46] text-[#737C74] dark:text-[#948979]">
            {rescheduledTasks.length}
          </span>
        </button>

        <div className="ml-auto pb-1.5">
          <Button
            size="sm"
            onClick={() => setIsAddPersonalOpen(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Personal Task</span>
          </Button>
        </div>
      </div>

      {/* 3. Tab Content */}
      {loading && !plannerData ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to Load Tasks"
          message={error}
          onRetry={() => fetchPlanner(selectedDate)}
        />
      ) : activeTab === 'adaptive' ? (
        roadmapsQueue.length > 0 ? (
          <div className="space-y-4">
            {roadmapsQueue.map((group) => {
              const isCollapsed = collapsedGroups[group.roadmapId];
              const activeTasks = group.activeTasks || [];
              const dayPercent =
                group.dayTotalTasks > 0
                  ? Math.round((group.dayCompletedTasks / group.dayTotalTasks) * 100)
                  : 0;

              return (
                <div
                  key={group.roadmapId}
                  className="rounded-xl border border-[#E8E8DF] dark:border-[#393E46] bg-[#FFFFFF] dark:bg-[#2A303A] overflow-hidden shadow-xs"
                >
                  {/* Roadmap Track Header */}
                  <div
                    onClick={() => toggleGroupCollapse(group.roadmapId)}
                    className="px-5 py-3.5 bg-[#F0F0EB] dark:bg-[#393E46] flex items-center justify-between cursor-pointer hover:bg-[#E8E8DF] dark:hover:bg-[#454B54] transition-colors border-b border-[#E8E8DF] dark:border-[#393E46]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#244C3B] dark:bg-[#DFD0B8] flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/roadmaps/${group.roadmapId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-bold text-[#202A23] dark:text-[#DFD0B8] hover:text-[#244C3B] dark:hover:text-[#DFD0B8] transition-colors truncate"
                          >
                            {group.title}
                          </Link>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white dark:bg-[#2A303A] text-[#737C74] dark:text-[#948979] border border-[#E8E8DF] dark:border-[#393E46]">
                            {group.categoryName}
                          </span>
                        </div>
                        <div className="text-xs text-[#737C74] dark:text-[#948979] flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-[#244C3B] dark:text-[#DFD0B8]">
                            Day {group.currentDayNumber}
                          </span>
                          <span>•</span>
                          <span className="truncate">{group.currentDayTitle}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-mono text-[#737C74] dark:text-[#948979]">
                          {group.dayCompletedTasks}/{group.dayTotalTasks} done
                        </div>
                        <div className="w-20 h-1.5 bg-[#E8E8DF] dark:bg-[#222831] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#244C3B] dark:bg-[#DFD0B8] rounded-full transition-all duration-300"
                            style={{ width: `${dayPercent}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="p-1 text-[#737C74] hover:text-[#202A23] dark:hover:text-[#E6EDE5] cursor-pointer"
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

                  {/* Tasks */}
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
            description="You have completed all frontier tasks across your active tracks. Advance into new modules or review completed topics."
            action={
              <Link
                to="/roadmaps"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#244C3B] hover:bg-[#1A3B2C] text-white dark:bg-[#DFD0B8] dark:text-[#222831] dark:hover:bg-[#ECE3D4] transition-colors"
              >
                Explore Roadmaps
              </Link>
            }
          />
        )
      ) : activeTab === 'completed' ? (
        completedTasks.length > 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider mb-2">
              Completed Tasks on {selectedDate}
            </h3>
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                showRoadmapContext={true}
                onTaskUpdated={handleTaskUpdated}
                onViewDetails={handleOpenDetail}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Completed Tasks Logged for this Date"
            description="Tasks you complete on this date will appear here in chronological sequence."
          />
        )
      ) : activeTab === 'personal' ? (
        personalTasks.length > 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
                Personal Learning Tasks ({personalTasks.length})
              </h3>
              <span className="text-[11px] text-[#737C74] dark:text-[#948979]">
                Contributes to overall 5-task daily streak
              </span>
            </div>
            <div className="space-y-2.5">
              {personalTasks.map((pt) => (
                <div
                  key={pt.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    pt.completed
                      ? 'bg-[#F7F7F2]/80 dark:bg-[#222831]/60 border-[#E8E8DF] dark:border-[#393E46]'
                      : 'bg-white dark:bg-[#2A303A] border-[#E8E8DF] dark:border-[#393E46]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePersonalTask(pt.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-150 flex-shrink-0 cursor-pointer ${
                        pt.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-[#D4D4CA] dark:border-[#4F5561] hover:border-[#244C3B] dark:hover:border-[#DFD0B8]'
                      }`}
                    >
                      {pt.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            pt.completed
                              ? 'line-through text-[#737C74] dark:text-[#948979]'
                              : 'text-[#202A23] dark:text-[#DFD0B8]'
                          }`}
                        >
                          {pt.title}
                        </h4>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                            pt.priority === 'urgent'
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                              : pt.priority === 'high'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border border-neutral-500/30'
                          }`}
                        >
                          {pt.priority}
                        </span>
                      </div>
                      {pt.description && (
                        <p className="text-xs text-[#737C74] dark:text-[#948979] truncate mt-0.5">
                          {pt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-mono text-[#737C74] dark:text-[#948979]">
                      {pt.estimatedDuration}m
                    </span>
                    <button
                      onClick={() => handleDeletePersonalTask(pt.id)}
                      className="p-1 rounded-md text-[#737C74] hover:text-red-600 dark:hover:text-red-400"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No Personal Tasks Scheduled for this Date"
            description="Add custom standalone learning tasks, practice challenges, or reading goals."
            action={
              <Button size="sm" onClick={() => setIsAddPersonalOpen(true)}>
                Add Personal Task
              </Button>
            }
          />
        )
      ) : (
        rescheduledTasks.length > 0 ? (
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider mb-2">
              Rescheduled Tasks ({rescheduledTasks.length})
            </h3>
            <div className="space-y-2.5">
              {rescheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] bg-[#F7F7F2] dark:bg-[#222831] flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-[#244C3B] dark:text-[#DFD0B8] font-semibold uppercase">
                      {task.roadmapTitle}
                    </span>
                    <h4 className="text-sm font-semibold text-[#202A23] dark:text-[#DFD0B8] truncate">
                      {task.title}
                    </h4>
                    <p className="text-xs text-[#737C74] dark:text-[#948979] mt-0.5">
                      Moved from Day {task.originalDayNumber || 'N/A'} to Day{' '}
                      {task.newDayNumber || 'N/A'}{' '}
                      {task.reason && `• "${task.reason}"`}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelReassignment(task)}
                    className="flex-shrink-0 text-xs"
                  >
                    Revert
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No Rescheduled Tasks"
            description="When you carry forward or reschedule a task to another day, its audit trail appears here."
          />
        )
      )}

      {/* Task Details Modal */}
      {detailTaskId && (
        <TaskDetailModal
          taskId={detailTaskId}
          isOpen={!!detailTaskId}
          onClose={() => setDetailTaskId(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {/* Reschedule Missed Task Modal */}
      {isRescheduleOpen && rescheduleTask && (
        <RescheduleMissedTaskModal
          task={rescheduleTask}
          isOpen={isRescheduleOpen}
          onClose={() => {
            setIsRescheduleOpen(false);
            setRescheduleTask(null);
          }}
          onSuccess={() => {
            setIsRescheduleOpen(false);
            setRescheduleTask(null);
            handleTaskUpdated();
          }}
        />
      )}

      {/* Add Personal Task Modal */}
      {isAddPersonalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8]">
              Create Personal Learning Task
            </h3>
            <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
              Standalone learning tasks count toward your overall 5-task daily streak.
            </p>

            <form onSubmit={handleCreatePersonalTask} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 2 LeetCode dynamic programming problems"
                  value={personalForm.title}
                  onChange={(e) => setPersonalForm({ ...personalForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Description / Resource Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Reference links, approach, or key concepts..."
                  value={personalForm.description}
                  onChange={(e) => setPersonalForm({ ...personalForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] mb-1">
                    Priority
                  </label>
                  <select
                    value={personalForm.priority}
                    onChange={(e) => setPersonalForm({ ...personalForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8]"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={personalForm.estimatedDuration}
                    onChange={(e) => setPersonalForm({ ...personalForm, estimatedDuration: parseInt(e.target.value, 10) || 30 })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
                <button
                  type="button"
                  onClick={() => setIsAddPersonalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#737C74] dark:text-[#948979] hover:bg-[#F0F0EB] dark:hover:bg-[#222831]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPersonal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#244C3B] dark:bg-[#DFD0B8] text-white dark:text-[#222831] disabled:opacity-50"
                >
                  {isSubmittingPersonal ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
