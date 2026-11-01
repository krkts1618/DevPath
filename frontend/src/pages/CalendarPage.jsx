import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Coffee,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  Filter,
  X,
  Compass,
} from 'lucide-react';
import { calendarService } from '../services/calendarService';
import { personalTaskService } from '../services/personalTaskService';
import {
  getKolkataDateString,
  getCalendarMonthDays,
  getCalendarWeekDays,
  formatKolkataDate,
} from '../utils/date.util';

export default function CalendarPage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'agenda'
  const [currentDate, setCurrentDate] = useState(() => {
    const qDate = searchParams.get('date');
    if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
      return new Date(`${qDate}T12:00:00`);
    }
    return new Date();
  });
  const [eventsData, setEventsData] = useState({ eventsByDate: {}, todayStr: '' });
  const [loading, setLoading] = useState(true);

  // Rest day modal
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [restForm, setRestForm] = useState({
    date: getKolkataDateString(),
    title: 'Planned Rest Day',
    reason: '',
  });

  // Selected date inspector modal
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);

  const todayStr = useMemo(() => {
    return getKolkataDateString();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      // Fetch 60 days around current view strictly in Asia/Kolkata
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
      setEventsData(res || { eventsByDate: {}, todayStr });
    } catch (err) {
      console.error('Failed to load calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarEvents();
  }, [currentDate]);

  // Navigate dates
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 14);
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
      d.setDate(d.getDate() + 14);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month grid generator
  // Month grid generator (Strictly safe in Asia/Kolkata without UTC day shifts)
  const monthGridDays = useMemo(() => {
    return getCalendarMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Week view days generator (7 days strictly in Asia/Kolkata)
  const weekViewDays = useMemo(() => {
    return getCalendarWeekDays(currentDate);
  }, [currentDate]);

  // Save Rest Day
  const handleSaveRestDay = async (e) => {
    e.preventDefault();
    try {
      await calendarService.setRestDay(restForm);
      setIsRestModalOpen(false);
      await loadCalendarEvents();
    } catch (err) {
      alert(err.message || 'Failed to plan rest day');
    }
  };

  const handleDeleteRestDay = async (dateStr) => {
    if (!window.confirm(`Remove planned rest day on ${dateStr}?`)) return;
    try {
      await calendarService.deleteRestDay(dateStr);
      if (selectedDateEvents && selectedDateEvents.dateStr === dateStr) {
        setSelectedDateEvents(null);
      }
      await loadCalendarEvents();
    } catch (err) {
      alert(err.message || 'Failed to remove rest day');
    }
  };

  const renderEventPill = (evt) => {
    switch (evt.type) {
      case 'rest_day':
        return (
          <div
            key={evt.id}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 truncate"
          >
            <Coffee className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{evt.title}</span>
          </div>
        );
      case 'personal_task':
        return (
          <div
            key={evt.id}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border truncate ${
              evt.completed
                ? 'bg-[#244C3B]/10 dark:bg-[#DFD0B8]/10 text-[#244C3B] dark:text-[#DFD0B8] border-[#244C3B]/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="truncate">{evt.title}</span>
          </div>
        );
      case 'revision':
        return (
          <div
            key={evt.id}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 truncate"
          >
            <BookOpen className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{evt.title}</span>
          </div>
        );
      case 'roadmap_day':
      default:
        return (
          <div
            key={evt.id}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border truncate ${
              evt.isCompleted
                ? 'bg-[#244C3B]/15 text-[#244C3B] dark:bg-[#DFD0B8]/15 dark:text-[#DFD0B8] border-[#244C3B]/30'
                : evt.isPastDue
                ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
                : 'bg-[#F0F0EB] dark:bg-[#222831] text-[#202A23] dark:text-[#DFD0B8] border-[#E8E8DF] dark:border-[#393E46]'
            }`}
          >
            <Compass className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">
              {evt.roadmapTitle}: Day {evt.dayNumber}
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#244C3B] dark:text-[#DFD0B8]" />
            Learning Calendar
          </h2>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-0.5">
            Unified multi-track schedule, planned rest days, and spaced revision timeline in Asia/Kolkata
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="p-0.5 bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl flex items-center shadow-xs">
            {['month', 'week', 'agenda'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-[#244C3B] dark:bg-[#DFD0B8] text-white dark:text-[#222831]'
                    : 'text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Plan Rest Day Button */}
          <button
            onClick={() => setIsRestModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors shadow-xs"
          >
            <Coffee className="w-3.5 h-3.5 text-indigo-400" />
            <span>Plan Rest Day</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8]">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#737C74] dark:text-[#948979]">
            Asia/Kolkata
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E8E8DF] dark:border-[#393E46] hover:bg-[#F0F0EB] dark:hover:bg-[#222831] text-[#202A23] dark:text-[#DFD0B8]"
          >
            Today
          </button>
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] hover:bg-[#F0F0EB] dark:hover:bg-[#222831] text-[#202A23] dark:text-[#DFD0B8]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] hover:bg-[#F0F0EB] dark:hover:bg-[#222831] text-[#202A23] dark:text-[#DFD0B8]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl overflow-hidden shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[#E8E8DF] dark:border-[#393E46] bg-[#F7F7F2] dark:bg-[#222831] text-center text-xs font-semibold text-[#737C74] dark:text-[#948979] py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#E8E8DF] dark:divide-[#393E46]">
            {monthGridDays.map((d, idx) => {
              const dayEvents = eventsData.eventsByDate[d.dateStr] || [];
              const isToday = d.dateStr === todayStr;
              const hasRestDay = dayEvents.some((e) => e.type === 'rest_day');

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateEvents({ dateStr: d.dateStr, events: dayEvents })}
                  className={`min-h-[105px] p-2 transition-colors cursor-pointer flex flex-col justify-between ${
                    !d.isCurrentMonth
                      ? 'bg-[#F7F7F2]/50 dark:bg-[#222831]/40 opacity-50'
                      : 'hover:bg-[#F0F0EB]/60 dark:hover:bg-[#222831]/60'
                  } ${isToday ? 'bg-[#244C3B]/5 dark:bg-[#DFD0B8]/5' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#244C3B] dark:bg-[#DFD0B8] text-white dark:text-[#222831]'
                          : 'text-[#202A23] dark:text-[#DFD0B8]'
                      }`}
                    >
                      {d.dayNumber}
                    </span>

                    {hasRestDay && (
                      <span title="Planned Rest Day (Neutral)" className="text-indigo-400">
                        <Coffee className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Events list */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((evt) => renderEventPill(evt))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-[#737C74] dark:text-[#948979] pl-1 font-medium">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-7 divide-x divide-[#E8E8DF] dark:divide-[#393E46] min-h-[400px]">
            {weekViewDays.map((d, idx) => {
              const dayEvents = eventsData.eventsByDate[d.dateStr] || [];
              const isToday = d.dateStr === todayStr;
              return (
                <div key={idx} className="flex flex-col">
                  <div className={`p-3 text-center border-b border-[#E8E8DF] dark:border-[#393E46] ${isToday ? 'bg-[#244C3B]/10 dark:bg-[#DFD0B8]/10' : 'bg-[#F7F7F2] dark:bg-[#222831]'}`}>
                    <div className="text-[11px] font-medium text-[#737C74] dark:text-[#948979] uppercase">{d.dayName}</div>
                    <div className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8] mt-0.5">{d.dayNumber}</div>
                  </div>
                  <div
                    onClick={() => setSelectedDateEvents({ dateStr: d.dateStr, events: dayEvents })}
                    className="flex-1 p-2 space-y-1.5 cursor-pointer hover:bg-[#F0F0EB]/50 dark:hover:bg-[#222831]/50"
                  >
                    {dayEvents.map((evt) => renderEventPill(evt))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#202A23] dark:text-[#DFD0B8]">Upcoming Agenda Timeline</h3>
          <div className="space-y-3">
            {Object.keys(eventsData.eventsByDate)
              .sort()
              .filter((dStr) => dStr >= todayStr)
              .slice(0, 14)
              .map((dStr) => {
                const dayEvents = eventsData.eventsByDate[dStr] || [];
                return (
                  <div key={dStr} className="p-3 rounded-xl bg-[#F0F0EB]/60 dark:bg-[#222831]/60 border border-[#E8E8DF] dark:border-[#393E46]">
                    <div className="font-semibold text-xs text-[#202A23] dark:text-[#DFD0B8] mb-2 flex items-center justify-between">
                      <span>{dStr} {dStr === todayStr && '(Today)'}</span>
                      <span className="text-[11px] text-[#737C74] dark:text-[#948979]">{dayEvents.length} items</span>
                    </div>
                    <div className="space-y-1.5">
                      {dayEvents.map((evt) => renderEventPill(evt))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Day Drilldown / Inspector Modal */}
      {selectedDateEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
              <div>
                <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8]">
                  Schedule for {selectedDateEvents.dateStr}
                </h3>
                <span className="text-xs text-[#737C74] dark:text-[#948979]">
                  Asia/Kolkata timezone
                </span>
              </div>
              <button
                onClick={() => setSelectedDateEvents(null)}
                className="p-1 rounded-lg text-[#737C74] hover:text-[#202A23] dark:hover:text-[#DFD0B8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-3">
              {selectedDateEvents.events.length === 0 ? (
                <p className="text-xs text-[#737C74] dark:text-[#948979] text-center py-6">
                  No scheduled roadmap days, personal tasks, or rest days on this date.
                </p>
              ) : (
                selectedDateEvents.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#202A23] dark:text-[#DFD0B8]">
                        {evt.title}
                      </span>
                      {evt.type === 'rest_day' && (
                        <button
                          onClick={() => handleDeleteRestDay(selectedDateEvents.dateStr)}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Remove Rest Day
                        </button>
                      )}
                    </div>
                    {evt.reason && (
                      <p className="text-xs text-[#737C74] dark:text-[#948979]">{evt.reason}</p>
                    )}
                    {evt.tasks && (
                      <div className="space-y-1 pt-1">
                        {evt.tasks.map((t) => (
                          <div key={t.id} className="flex items-center justify-between text-[11px]">
                            <span className={t.completed ? 'line-through text-[#737C74]' : 'text-[#202A23] dark:text-[#DFD0B8]'}>
                              • {t.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] capitalize bg-neutral-200 dark:bg-neutral-800">
                              {t.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E8DF] dark:border-[#393E46] flex justify-end">
              <button
                onClick={() => setSelectedDateEvents(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#244C3B] dark:bg-[#DFD0B8] text-white dark:text-[#222831]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Rest Day Modal */}
      {isRestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-2">
              <Coffee className="w-4 h-4 text-indigo-400" />
              Plan Rest Day
            </h3>
            <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
              Mark a calendar date as a neutral rest day. It will neither increment nor break your streak.
            </p>

            <form onSubmit={handleSaveRestDay} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={restForm.date}
                  onChange={(e) => setRestForm({ ...restForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={restForm.title}
                  onChange={(e) => setRestForm({ ...restForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Reason / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={restForm.reason}
                  onChange={(e) => setRestForm({ ...restForm, reason: e.target.value })}
                  placeholder="Recovery, travel, or sprint break..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F0F0EB] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
                <button
                  type="button"
                  onClick={() => setIsRestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#737C74] dark:text-[#948979] hover:bg-[#F0F0EB] dark:hover:bg-[#222831]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#244C3B] dark:bg-[#DFD0B8] text-white dark:text-[#222831]"
                >
                  Save Rest Day
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
