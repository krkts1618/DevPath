import React, { useState, useMemo } from 'react';
import { Calendar, Flame, CheckCircle, Coffee, Info } from 'lucide-react';

export default function ActivityHeatmap({ data, onSelectDate }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  const days = data?.days || [];
  const summary = data?.summary || {};

  // Group contiguous days into weeks (columns)
  const { weeks, monthLabels } = useMemo(() => {
    if (!days.length) return { weeks: [], monthLabels: [] };

    const weeksArr = [];
    let currentWeek = [];
    const months = [];

    // First day of the range
    const firstDay = new Date(`${days[0].date}T00:00:00`);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)

    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    let lastMonth = -1;

    days.forEach((day, index) => {
      const d = new Date(`${day.date}T00:00:00`);
      const month = d.getMonth();

      if (month !== lastMonth && currentWeek.length === 0) {
        months.push({
          label: d.toLocaleDateString('en-US', { month: 'short' }),
          colIndex: weeksArr.length,
        });
        lastMonth = month;
      } else if (month !== lastMonth && weeksArr.length === 0 && index === 0) {
        months.push({
          label: d.toLocaleDateString('en-US', { month: 'short' }),
          colIndex: 0,
        });
        lastMonth = month;
      }

      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArr.push(currentWeek);
    }

    return { weeks: weeksArr, monthLabels: months };
  }, [days]);

  const getCellColorClass = (day) => {
    if (!day) return 'bg-transparent';
    if (day.isRestDay && day.count === 0) {
      return 'bg-indigo-500/20 border border-indigo-500/40';
    }
    if (day.count === 0) {
      return 'bg-[var(--border-subtle)]/60 border border-[var(--border-subtle)]';
    }

    switch (day.level) {
      case 1:
        return 'bg-[var(--accent-primary)]/30 border border-[var(--accent-primary)]/20';
      case 2:
        return 'bg-[var(--accent-primary)]/55 border border-[var(--accent-primary)]/40';
      case 3:
        return 'bg-[var(--accent-primary)]/80 border border-[var(--accent-primary)]/60';
      case 4:
      default:
        return 'bg-[var(--accent-primary)] border border-[var(--accent-hover)] shadow-xs';
    }
  };

  const handleCellClick = (day) => {
    if (!day) return;
    setSelectedDay(day);
    if (onSelectDate) onSelectDate(day.date);
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--border-subtle)] shadow-xs">
      {/* Header with Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-subtle)] gap-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
            12-Month Learning Activity Heatmap
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Local calendar completions strictly in Asia/Kolkata timezone
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)]">
            <Flame className="w-3.5 h-3.5 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
            <span>Streak: {summary.currentStreak || 0}d</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Total Tasks: {summary.totalCompletedTasks || 0}</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)]">
            <span>Active Days: {summary.totalActiveDays || 0}</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pt-5 pb-2">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1.5 text-[11px] text-[var(--text-muted)] font-medium h-4">
            <div className="w-7 flex-shrink-0" />
            <div className="flex-1 flex gap-1 relative">
              {monthLabels.map((m, idx) => (
                <div
                  key={idx}
                  style={{ position: 'absolute', left: `${m.colIndex * 15}px` }}
                  className="whitespace-nowrap"
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Days Grid */}
          <div className="flex gap-1">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between text-[9px] text-[var(--text-muted)] font-medium pr-1.5 w-7 text-right select-none">
              <span className="h-3"></span>
              <span className="h-3 leading-3">Mon</span>
              <span className="h-3"></span>
              <span className="h-3 leading-3">Wed</span>
              <span className="h-3"></span>
              <span className="h-3 leading-3">Fri</span>
              <span className="h-3"></span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onClick={() => handleCellClick(day)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={
                        day
                          ? `${day.date}: ${day.count} task${day.count !== 1 ? 's' : ''}${
                              day.qualified ? ' (Qualified for streak)' : ''
                            }${day.isRestDay ? ' [Rest Day]' : ''}`
                          : ''
                      }
                      className={`w-3 h-3 rounded-xs transition-transform duration-100 ${
                        day ? 'cursor-pointer hover:scale-125' : ''
                      } ${getCellColorClass(day)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Hover Detail Info Bar */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-3">
        {/* Dynamic hover inspection */}
        <div className="flex items-center gap-2">
          {hoveredDay ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-primary)]">
                {hoveredDay.date}:
              </span>
              <span>
                {hoveredDay.count} task{hoveredDay.count !== 1 ? 's' : ''}
              </span>
              {hoveredDay.qualified && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--accent-subtle)] text-[var(--accent-primary)]">
                  Streak Target Met
                </span>
              )}
              {hoveredDay.isRestDay && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400">
                  Rest Day
                </span>
              )}
            </div>
          ) : (
            <span className="italic flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Hover over a day to view details, click to inspect.
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 select-none">
          <span className="text-[11px] mr-1">Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-[var(--border-subtle)]/60" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-primary)]/30" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-primary)]/55" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-primary)]/80" />
          <div className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-primary)]" />
          <span className="text-[11px] ml-1">More</span>

          <div className="ml-3 pl-3 border-l border-[var(--border-subtle)] flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-indigo-500/20 border border-indigo-500/40" />
            <span className="text-[11px] flex items-center gap-1">
              <Coffee className="w-3 h-3 text-indigo-400" /> Rest Day
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
