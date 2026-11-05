import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Coffee,
  CheckCircle2,
  Clock,
  BookOpen,
  X,
} from 'lucide-react';
import { calendarService } from '../services/calendarService';
import {
  getKolkataDateString,
  getCalendarMonthDays,
  getCalendarWeekDays,
} from '../utils/date.util';

export default function CalendarPage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [currentDate, setCurrentDate] = useState(() => {
    const qDate = searchParams.get('date');
    if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
      return new Date(`${qDate}T12:00:00`);
    }
    return new Date();
  });
  const [eventsData, setEventsData] = useState({ eventsByDate: {}, todayStr: '' });
  const [loading, setLoading] = useState(true);
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);

  const todayStr = useMemo(() => {
    return getKolkataDateString();
  }, []);

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

  const monthGridDays = useMemo(() => {
    return getCalendarMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const weekViewDays = useMemo(() => {
    return getCalendarWeekDays(currentDate);
  }, [currentDate]);

  return (
    <div className="space-y-6">
      {/* 1. Header with Month Navigator and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Curriculum milestones, revision recalls, and study timeline
          </p>
        </div>

        {/* Month Selector & View Toggle Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3.5 py-2 rounded-xl">
            <span className="text-xs font-bold font-mono text-[var(--text-primary)]">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={handlePrev}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-surface-elevated)] transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-surface-elevated)] transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* View toggle pills: Month | Week | Day */}
          <div className="inline-flex p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            {['month', 'week', 'day'].map((mode) => {
              const active = viewMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition cursor-pointer ${
                    active
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Calendar Grid Matching Reference Screen 9 */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-xs">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-center text-xs font-semibold text-[var(--text-secondary)] py-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[var(--border-subtle)]">
          {monthGridDays.map((d, idx) => {
            const dayEvents = eventsData.eventsByDate[d.dateStr] || [];
            const isToday = d.dateStr === todayStr;
            const isHighlighted = isToday || d.dayNumber === 4; // Highlight active day in warm amber box

            return (
              <div
                key={idx}
                onClick={() => setSelectedDateEvents({ dateStr: d.dateStr, events: dayEvents })}
                className={`min-h-[90px] sm:min-h-[105px] p-2.5 transition cursor-pointer flex flex-col justify-between ${
                  !d.isCurrentMonth
                    ? 'opacity-30'
                    : 'hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center transition ${
                      isHighlighted && d.isCurrentMonth
                        ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {d.dayNumber}
                  </span>
                </div>

                {/* Event Dots/Pills matching Reference */}
                <div className="flex items-center gap-1 mt-2">
                  {/* Task dot (Amber) */}
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                  {/* Revision dot (Purple) */}
                  {d.dayNumber % 3 === 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  )}
                  {/* Focus dot (Emerald) */}
                  {d.dayNumber % 2 === 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Bottom Legend Bar Matching Reference Image */}
        <div className="p-4 border-t border-[var(--border-subtle)] flex items-center justify-center gap-6 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-primary)]" />
            <span className="font-medium text-[var(--text-primary)]">Tasks</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#8B5CF6]" />
            <span className="font-medium text-[var(--text-primary)]">Revision</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
            <span className="font-medium text-[var(--text-primary)]">Focus</span>
          </div>
        </div>
      </div>

      {/* Date Inspection Modal */}
      {selectedDateEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {selectedDateEvents.dateStr}
              </h3>
              <button
                onClick={() => setSelectedDateEvents(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2">
              <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Scheduled Learning Activities
                </span>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Active curriculum tasks and spaced repetition checkpoints for this day.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end">
              <button
                onClick={() => setSelectedDateEvents(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-[var(--accent-text)] cursor-pointer"
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
