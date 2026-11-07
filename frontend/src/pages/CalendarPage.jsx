import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  Trash2,
  Edit2,
  X,
  Coffee,
} from 'lucide-react';
import { calendarService } from '../services/calendarService';
import { personalTaskService } from '../services/personalTaskService';
import { taskService } from '../services/taskService';
import {
  getKolkataDateString,
  getCalendarMonthDays,
  getCalendarWeekDays,
  formatKolkataDate,
  addDaysToKolkataDate,
} from '../utils/date.util';

export default function CalendarPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [currentDate, setCurrentDate] = useState(() => {
    const qDate = searchParams.get('date');
    if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
      return new Date(`${qDate}T12:00:00`);
    }
    return new Date();
  });

  const [eventsData, setEventsData] = useState({ eventsByDate: {}, todayStr: '', dayWorkload: {}, streakFreezes: null });
  const [loading, setLoading] = useState(true);
  const [selectedDateStr, setSelectedDateStr] = useState(() => getKolkataDateString());
  const [isDateDetailOpen, setIsDateDetailOpen] = useState(false);

  // Add Task Modal State
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    scheduledDate: getKolkataDateString(),
    startTime: '09:00',
    endTime: '10:00',
    priority: 'normal',
    taskType: 'custom',
    estimatedDuration: 60,
  });
  const [submittingTask, setSubmittingTask] = useState(false);

  const todayStr = useMemo(() => getKolkataDateString(), []);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth();
      const startMonth = m === 0 ? 11 : m - 1;
      const startYear = m === 0 ? y - 1 : y;
      const start = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-01`;
      const endMonth = m >= 10 ? (m + 2) % 12 : m + 2;
      const endYear = m >= 10 ? y + 1 : y;
      const lastDayOfEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
      const end = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(lastDayOfEndMonth).padStart(2, '0')}`;

      const res = await calendarService.getEvents(start, end);
      setEventsData(res || { eventsByDate: {}, todayStr, dayWorkload: {}, streakFreezes: null });
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate]);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date());
    setSelectedDateStr(todayStr);
  };

  const handleOpenDayModal = (dateStr) => {
    setSelectedDateStr(dateStr);
    setIsDateDetailOpen(true);
  };

  const handleOpenAddTask = (dateStr = null) => {
    setTaskForm((prev) => ({
      ...prev,
      scheduledDate: dateStr || selectedDateStr || todayStr,
    }));
    setIsAddTaskOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    try {
      setSubmittingTask(true);
      await personalTaskService.createTask(taskForm);
      setIsAddTaskOpen(false);
      setTaskForm({
        title: '',
        description: '',
        scheduledDate: selectedDateStr || todayStr,
        startTime: '09:00',
        endTime: '10:00',
        priority: 'normal',
        taskType: 'custom',
        estimatedDuration: 60,
      });
      loadCalendarEvents();
    } catch (err) {
      alert(err.message || 'Failed to schedule task');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleTogglePersonalTask = async (personalTaskId) => {
    try {
      await personalTaskService.toggleTask(personalTaskId);
      loadCalendarEvents();
    } catch (err) {
      alert(err.message || 'Failed to toggle task');
    }
  };

  const handleDeletePersonalTask = async (personalTaskId) => {
    if (!window.confirm('Delete this scheduled task?')) return;
    try {
      await personalTaskService.deleteTask(personalTaskId);
      loadCalendarEvents();
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleToggleCurriculumTask = async (taskId) => {
    try {
      await taskService.toggleTaskCompletion(taskId);
      loadCalendarEvents();
    } catch (err) {
      alert(err.message || 'Failed to update curriculum task');
    }
  };

  const monthGridDays = useMemo(() => {
    return getCalendarMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const weekViewDays = useMemo(() => {
    return getCalendarWeekDays(currentDate);
  }, [currentDate]);

  const activeDayEvents = eventsData.eventsByDate[selectedDateStr] || [];
  const freezes = eventsData.streakFreezes;
  const freezesRemaining = freezes?.freezesRemaining ?? 4;
  const freezesTotal = freezes?.monthlyAllowance ?? 4;

  const currentMonthTitle = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Month Navigator, Freezes Badge, and View Switcher */}
      <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F0F2ED] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2]">
              Calendar & Timeline
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
              ❄️ {freezesRemaining}/{freezesTotal} Monthly Freezes
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202620] dark:text-[#F3F4F6] tracking-tight">
            Learning Calendar
          </h1>
        </div>

        {/* Month Selector, Navigator, View Toggle, Add Task */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mr-2">
              {currentMonthTitle}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1 rounded-lg text-[#596258] hover:text-[#202620] dark:text-[#B0B7C2] dark:hover:text-[#F3F4F6] cursor-pointer hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition"
                title="Previous"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-lg text-[#596258] hover:text-[#202620] dark:text-[#B0B7C2] dark:hover:text-[#F3F4F6] cursor-pointer hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition"
                title="Next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Today Button */}
          <button
            onClick={handleJumpToToday}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] hover:border-[var(--accent-primary)] text-[#202620] dark:text-[#F3F4F6] transition cursor-pointer"
          >
            Today
          </button>

          {/* View toggle pills: Month | Week | Day */}
          <div className="inline-flex p-1 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            {['month', 'week', 'day'].map((mode) => {
              const active = viewMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition cursor-pointer font-mono ${
                    active
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
                      : 'text-[#596258] dark:text-[#B0B7C2] hover:text-[#202620] dark:hover:text-[#F3F4F6]'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>

          {/* Add Scheduled Task Button */}
          <button
            onClick={() => handleOpenAddTask(selectedDateStr)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:brightness-105 active:scale-[0.98] text-[var(--accent-text)] text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 2. Main Calendar Content: Month, Week, or Day View */}
      {viewMode === 'month' && (
        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-2xl overflow-hidden shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[#E4E7E0] dark:border-[#303945] bg-[#F8F9F6] dark:bg-[#171B21] text-center text-xs font-bold text-[#858D82] dark:text-[#7F8996] py-3 font-mono">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#E4E7E0] dark:divide-[#303945]">
            {monthGridDays.map((d, idx) => {
              const dayEvents = eventsData.eventsByDate[d.dateStr] || [];
              const isToday = d.dateStr === todayStr;
              const isSelected = d.dateStr === selectedDateStr;
              const isWeekend = idx % 7 === 0 || idx % 7 === 6;

              // Count real tasks
              const roadmapTasksCount = dayEvents
                .filter((e) => e.type === 'roadmap_day')
                .reduce((sum, e) => sum + (e.tasks?.length || 0), 0);
              const personalTasksCount = dayEvents.filter((e) => e.type === 'personal_task').length;
              const revisionsCount = dayEvents.filter((e) => e.type === 'revision').length;
              const hasRestDay = dayEvents.some((e) => e.type === 'rest_day');
              const totalTasksScheduled = roadmapTasksCount + personalTasksCount;
              const isOverloaded = totalTasksScheduled > 7;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenDayModal(d.dateStr)}
                  className={`min-h-[100px] sm:min-h-[115px] p-2.5 transition cursor-pointer flex flex-col justify-between ${
                    !d.isCurrentMonth
                      ? 'opacity-30'
                      : isSelected
                      ? 'bg-amber-500/5 dark:bg-amber-500/10'
                      : isWeekend
                      ? 'bg-[#FAFBF9] dark:bg-[#15191F]/50 hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
                      : 'hover:bg-[#F8F9F6] dark:hover:bg-[#252C35]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center font-mono transition ${
                        isToday
                          ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
                          : 'text-[#202620] dark:text-[#F3F4F6]'
                      }`}
                    >
                      {d.dayNumber}
                    </span>

                    {/* Weekend Revision or Overload pill */}
                    {isWeekend && d.isCurrentMonth && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold">
                        {idx % 7 === 6 ? 'Sat Recall' : 'Sun Assess'}
                      </span>
                    )}

                    {isOverloaded && d.isCurrentMonth && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold" title="Workload alert (>7 tasks)">
                        ⚠️ {totalTasksScheduled}
                      </span>
                    )}
                  </div>

                  {/* Real Events Chips/Indicators */}
                  <div className="space-y-1 mt-2">
                    {roadmapTasksCount > 0 && (
                      <div className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[var(--accent-primary)] text-[10px] font-mono truncate font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                        <span>{roadmapTasksCount} curriculum</span>
                      </div>
                    )}

                    {personalTasksCount > 0 && (
                      <div className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono truncate font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{personalTasksCount} personal</span>
                      </div>
                    )}

                    {revisionsCount > 0 && (
                      <div className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono truncate font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{revisionsCount} revision</span>
                      </div>
                    )}

                    {hasRestDay && (
                      <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono truncate flex items-center gap-1">
                        <Coffee className="w-2.5 h-2.5" />
                        <span>Rest Day</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend Bar */}
          <div className="p-4 border-t border-[#E4E7E0] dark:border-[#303945] bg-[#F8F9F6] dark:bg-[#171B21] flex flex-wrap items-center justify-center gap-6 text-xs text-[#596258] dark:text-[#B0B7C2]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-primary)]" />
              <span className="font-medium text-[#202620] dark:text-[#F3F4F6]">Curriculum Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" />
              <span className="font-medium text-[#202620] dark:text-[#F3F4F6]">Personal Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-purple-500" />
              <span className="font-medium text-[#202620] dark:text-[#F3F4F6]">Revision Checkpoints</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/30 border border-amber-500" />
              <span className="font-medium text-[#202620] dark:text-[#F3F4F6]">Weekend Revision</span>
            </div>
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekViewDays.map((dayObj) => {
            const dayEvents = eventsData.eventsByDate[dayObj.dateStr] || [];
            const isToday = dayObj.dateStr === todayStr;
            const isWeekend = dayObj.dayName === 'Sat' || dayObj.dayName === 'Sun';

            return (
              <div
                key={dayObj.dateStr}
                className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[300px] ${
                  isToday
                    ? 'bg-[#FFFFFF] dark:bg-[#1D232B] border-[var(--accent-primary)] shadow-sm'
                    : isWeekend
                    ? 'bg-[#FAFBF9] dark:bg-[#171B21]/60 border-[#E4E7E0] dark:border-[#303945]'
                    : 'bg-[#FFFFFF] dark:bg-[#1D232B] border-[#E4E7E0] dark:border-[#303945]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E4E7E0] dark:border-[#303945] mb-3">
                    <div>
                      <span className="text-xs font-bold text-[#858D82] dark:text-[#7F8996] font-mono block">
                        {dayObj.dayName}
                      </span>
                      <h4 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] font-mono">
                        {dayObj.dateStr.slice(5)}
                      </h4>
                    </div>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--accent-primary)] text-[var(--accent-text)]">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Day Tasks List */}
                  <div className="space-y-2">
                    {dayEvents.length === 0 ? (
                      <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] font-mono py-4 text-center">
                        No events
                      </p>
                    ) : (
                      dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-2 rounded-xl bg-[#F8F9F6] dark:bg-[#252C35] border border-[#E4E7E0] dark:border-[#303945] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#858D82] dark:text-[#7F8996] truncate">
                              {evt.type.replace('_', ' ')}
                            </span>
                            {evt.startTime && (
                              <span className="text-[10px] font-mono text-[var(--accent-primary)] font-semibold">
                                {evt.startTime}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-[#202620] dark:text-[#F3F4F6] line-clamp-2">
                            {evt.title}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDayModal(dayObj.dateStr)}
                  className="w-full mt-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F0F2ED] dark:bg-[#252C35] hover:bg-[#E4E7E0] text-[#202620] dark:text-[#F3F4F6] transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E7E0] dark:border-[#303945]">
            <div>
              <span className="text-xs font-mono text-[#858D82] dark:text-[#7F8996]">
                {formatKolkataDate(currentDate, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <h2 className="text-xl font-bold text-[#202620] dark:text-[#F3F4F6] mt-0.5">
                Day Schedule & Agenda
              </h2>
            </div>

            <button
              onClick={() => handleOpenAddTask(getKolkataDateString(currentDate))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs font-semibold cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-3">
            {(eventsData.eventsByDate[getKolkataDateString(currentDate)] || []).length === 0 ? (
              <p className="text-center py-12 text-xs text-[#858D82] dark:text-[#7F8996] font-mono">
                No tasks or milestones scheduled for this date.
              </p>
            ) : (
              (eventsData.eventsByDate[getKolkataDateString(currentDate)] || []).map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E4E7E0] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2] capitalize">
                          {evt.type.replace('_', ' ')}
                        </span>
                        {evt.startTime && (
                          <span className="text-xs font-mono text-[var(--accent-primary)] font-semibold">
                            {evt.startTime} - {evt.endTime || 'Wrap up'}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] mt-1 truncate">
                        {evt.title}
                      </h4>
                      {evt.description && (
                        <p className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5 line-clamp-1">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {evt.personalTaskId && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTogglePersonalTask(evt.personalTaskId)}
                        className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                          evt.completed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                            : 'bg-[#FFFFFF] dark:bg-[#252C35] border-[#E4E7E0] dark:border-[#303945] text-[#596258]'
                        }`}
                      >
                        {evt.completed ? '✓ Completed' : 'Mark Done'}
                      </button>
                      <button
                        onClick={() => handleDeletePersonalTask(evt.personalTaskId)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Date Inspection Drawer / Modal */}
      {isDateDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
              <div>
                <span className="text-[10px] font-mono text-[#858D82] dark:text-[#7F8996] uppercase font-bold">
                  Date Agenda
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#202620] dark:text-[#F3F4F6] font-mono">
                  {selectedDateStr}
                </h3>
              </div>
              <button
                onClick={() => setIsDateDetailOpen(false)}
                className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {activeDayEvents.length === 0 ? (
                <p className="text-xs text-[#858D82] dark:text-[#7F8996] text-center py-6 font-mono">
                  No scheduled activities for this date.
                </p>
              ) : (
                activeDayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#E4E7E0] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2]">
                        {evt.type.replace('_', ' ')}
                      </span>
                      {evt.startTime && (
                        <span className="text-xs font-mono text-[var(--accent-primary)] font-semibold">
                          {evt.startTime} - {evt.endTime || ''}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#202620] dark:text-[#F3F4F6]">
                      {evt.title}
                    </h4>
                    {evt.description && (
                      <p className="text-xs text-[#596258] dark:text-[#B0B7C2]">
                        {evt.description}
                      </p>
                    )}

                    {evt.personalTaskId && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4E7E0] dark:border-[#303945]">
                        <button
                          onClick={() => handleTogglePersonalTask(evt.personalTaskId)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                            evt.completed
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-[#FFFFFF] dark:bg-[#252C35] border border-[#E4E7E0] dark:border-[#303945] text-[#202620] dark:text-[#F3F4F6]'
                          }`}
                        >
                          {evt.completed ? '✓ Done' : 'Mark Done'}
                        </button>
                        <button
                          onClick={() => handleDeletePersonalTask(evt.personalTaskId)}
                          className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#E4E7E0] dark:border-[#303945] flex items-center justify-between">
              <button
                onClick={() => {
                  setIsDateDetailOpen(false);
                  navigate(`/planner?date=${selectedDateStr}`);
                }}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                Open in Daily Planner →
              </button>
              <button
                onClick={() => {
                  setIsDateDetailOpen(false);
                  handleOpenAddTask(selectedDateStr);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-[var(--accent-text)] cursor-pointer"
              >
                + Add Task to Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
              <h3 className="text-base font-bold text-[#202620] dark:text-[#F3F4F6]">
                Schedule Task in Calendar & Planner
              </h3>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="p-1 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement PostgreSQL Indexing Benchmarks"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Key deliverables, documentation links, or test cases..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={taskForm.scheduledDate}
                    onChange={(e) => setTaskForm({ ...taskForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#202620] dark:text-[#F3F4F6] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#202620] dark:text-[#F3F4F6] focus:outline-none focus:border-[var(--accent-primary)]"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={taskForm.startTime}
                    onChange={(e) => setTaskForm({ ...taskForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#202620] dark:text-[#F3F4F6] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#596258] dark:text-[#B0B7C2] block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={taskForm.endTime}
                    onChange={(e) => setTaskForm({ ...taskForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#202620] dark:text-[#F3F4F6] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E4E7E0] dark:border-[#303945]">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E4E7E0] dark:border-[#303945] text-[#596258] dark:text-[#B0B7C2] hover:bg-[#F0F2ED] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-[var(--accent-text)] hover:brightness-105 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                >
                  {submittingTask ? 'Scheduling...' : 'Schedule Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
