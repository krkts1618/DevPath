import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Plus, Calendar, Timer, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTimer } from '../../context/TimerContext';
import NotificationBellDropdown from '../notifications/NotificationBellDropdown';
import { formatKolkataDate } from '../../utils/date.util';

function formatCompactTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
    return '00:00';
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const pageTitles = {
  '/':          { title: 'Dashboard',          subtitle: 'Personal Command Center' },
  '/planner':   { title: 'Daily Planner',      subtitle: 'Schedule & Execution' },
  '/calendar':  { title: 'Calendar',           subtitle: 'Learning Timeline' },
  '/roadmaps':  { title: 'My Roadmaps',        subtitle: 'Curriculum & Tracks' },
  '/analytics': { title: 'Analytics',          subtitle: 'Engineering Growth' },
  '/notes':     { title: 'Notes',              subtitle: 'Knowledge Workspace' },
  '/revision':  { title: 'Revision Schedule',  subtitle: 'Spaced Recall' },
  '/projects':  { title: 'Projects',           subtitle: 'Systems Portfolio' },
  '/focus':     { title: 'Focus Timer',        subtitle: 'Deep Work Session' },
  '/notifications': { title: 'Notifications',  subtitle: 'Alerts & Reminders' },
  '/settings':  { title: 'Settings',           subtitle: 'Preferences & System' },
};

export default function TopHeader({
  onMenuToggle,
  onOpenAddRoadmap,
}) {
  const { isDark, toggleTheme } = useTheme();
  const {
    activeSession,
    remainingSeconds,
    elapsedSeconds,
    isRunning,
  } = useTimer();
  const location = useLocation();
  const navigate = useNavigate();

  let currentTitle = pageTitles[location.pathname];
  if (!currentTitle && location.pathname.startsWith('/roadmaps/')) {
    currentTitle = { title: 'Roadmap Details', subtitle: 'Curriculum & Task Breakdown' };
  }
  if (!currentTitle) {
    currentTitle = { title: 'DevPath', subtitle: 'Personal Engineering Workspace' };
  }

  const todayFormatted = formatKolkataDate(new Date(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 dark:bg-[#171B21]/90 backdrop-blur-md border-b border-[#E4E7E0] dark:border-[#303945] h-14">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 truncate">
            <h1 className="text-sm sm:text-base font-bold text-[#202620] dark:text-[#F3F4F6] tracking-tight truncate">
              {currentTitle.title}
            </h1>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F0F2ED] dark:bg-[#252C35] text-[#858D82] dark:text-[#7F8996] border border-[#E4E7E0] dark:border-[#303945] truncate">
              {currentTitle.subtitle}
            </span>
          </div>
        </div>

        {/* Center: Sleek Quick Search Bar (visible on md+) */}
        <div
          onClick={() => navigate('/roadmaps')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F9F6] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#858D82] dark:text-[#7F8996] w-64 lg:w-72 cursor-pointer hover:border-[var(--accent-primary)]/50 transition shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-[#858D82] dark:text-[#7F8996]" />
          <span className="flex-1 truncate">Search roadmaps, notes...</span>
          <kbd className="font-mono text-[10px] bg-[#E4E7E0] dark:bg-[#252C35] px-1.5 py-0.5 rounded text-[#596258] dark:text-[#B0B7C2]">
            ⌘K
          </kbd>
        </div>

        {/* Right: Timer, Date, Notifications, Theme, Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Active Focus Session Pill */}
          {activeSession ? (
            <div
              onClick={() => navigate('/focus')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold cursor-pointer transition hover:opacity-90 shadow-2xs"
              title="Click to open Focus Workspace"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRunning ? 'bg-amber-500 animate-pulse' : 'bg-[#858D82]'
                }`}
              />
              <Timer className="w-3.5 h-3.5" />
              <span>
                {activeSession.type === 'stopwatch'
                  ? formatCompactTime(elapsedSeconds)
                  : formatCompactTime(remainingSeconds)}
              </span>
            </div>
          ) : null}

          {/* Date Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F8F9F6] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#596258] dark:text-[#B0B7C2] font-mono shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)] opacity-80" />
            <span>{todayFormatted}</span>
          </div>

          {/* Notifications Dropdown */}
          <NotificationBellDropdown />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] bg-[#F8F9F6] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] hover:border-[var(--accent-primary)]/50 transition cursor-pointer shadow-2xs"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-[#F2A93B]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#596258]" />
            )}
          </button>

          {/* Create Roadmap Action Button */}
          {onOpenAddRoadmap && (
            <button
              onClick={onOpenAddRoadmap}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Roadmap</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
