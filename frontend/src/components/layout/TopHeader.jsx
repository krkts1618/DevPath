import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Plus, Calendar, Timer, Play, Pause } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTimer } from '../../context/TimerContext';
import Button from '../ui/Button';
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
  '/calendar':  { title: 'Calendar',           subtitle: 'Learning Pacing' },
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
  onOpenAddCategory,
}) {
  const { isDark, toggleTheme } = useTheme();
  const {
    activeSession,
    remainingSeconds,
    elapsedSeconds,
    isRunning,
    isPaused,
    pauseTimer,
    resumeTimer,
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
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 dark:bg-[#171B21]/90 backdrop-blur-md border-b border-[#E4E7E0] dark:border-[#303945] h-13">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-baseline gap-2">
            <h1 className="text-sm sm:text-base font-bold text-[#202620] dark:text-[#F3F4F6] leading-tight tracking-tight">
              {currentTitle.title}
            </h1>
            <span className="hidden sm:inline text-xs text-[#858D82] dark:text-[#7F8996]">
              • {currentTitle.subtitle}
            </span>
          </div>
        </div>

        {/* Right: Timer, Date, Notifications, Theme, Actions */}
        <div className="flex items-center gap-2">
          {/* Header Compact Focus Timer */}
          {activeSession ? (
            <div
              onClick={() => navigate('/focus')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold cursor-pointer transition hover:opacity-90"
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
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F9F6] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] text-xs text-[#596258] dark:text-[#B0B7C2] font-mono">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)] opacity-80" />
            <span>{todayFormatted}</span>
          </div>

          {/* Notifications Dropdown */}
          <NotificationBellDropdown />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#F2A93B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#596258]" />
            )}
          </button>

          {/* Quick Action Button */}
          {onOpenAddRoadmap && (
            <button
              onClick={onOpenAddRoadmap}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition shadow-xs cursor-pointer ml-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
