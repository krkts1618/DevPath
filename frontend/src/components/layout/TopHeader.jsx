import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Plus, Calendar, Timer, Play, Pause } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTimer } from '../../context/TimerContext';
import Button from '../ui/Button';
import NotificationBellDropdown from '../notifications/NotificationBellDropdown';

function formatCompactTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
    return '00:00';
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const pageTitles = {
  '/':          { title: 'Dashboard',          subtitle: 'Overview & Learning Progress' },
  '/planner':   { title: 'Daily Planner',      subtitle: 'Schedule & Execution (Asia/Kolkata)' },
  '/calendar':  { title: 'Calendar',           subtitle: 'Learning Schedule & Pacing' },
  '/roadmaps':  { title: 'My Roadmaps',        subtitle: 'Track & Master Curriculum' },
  '/analytics': { title: 'Analytics',          subtitle: 'Performance & Velocity Metrics' },
  '/notes':     { title: 'Notes Workspace',    subtitle: 'Technical Documentation & Code' },
  '/revision':  { title: 'Revision Schedule',  subtitle: 'Spaced Repetition & Recall' },
  '/projects':  { title: 'Projects',           subtitle: 'Full-Stack & Systems Portfolio' },
  '/focus':     { title: 'Focus Timer',        subtitle: 'Deep Work & Study Session Tracker' },
  '/notifications': { title: 'Notification Center', subtitle: 'Reminders & Learning Alerts' },
  '/settings':  { title: 'Settings',           subtitle: 'Preferences & System Configuration' },
};

export default function TopHeader({
  onMenuToggle,
  onOpenAddRoadmap,
  onOpenAddCategory,
}) {
  const { theme, toggleTheme } = useTheme();
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
    currentTitle = { title: 'DevPath', subtitle: 'Engineering Learning Tracker' };
  }

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-[#F7F7F2]/90 dark:bg-[#222831]/90 backdrop-blur-md border-b border-[#E8E8DF] dark:border-[#393E46] h-16">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#202A23] dark:text-[#DFD0B8] leading-tight">
              {currentTitle.title}
            </h1>
            <p className="hidden sm:block text-xs text-[#737C74] dark:text-[#948979] leading-none mt-0.5">
              {currentTitle.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Date, Theme Switcher, Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Header Compact Focus Timer */}
          {activeSession ? (
            <div
              onClick={() => navigate('/focus')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#E8F0EB] text-[#244C3B] dark:bg-[#2A303A] dark:text-[#DFD0B8] border border-[#244C3B]/30 dark:border-[#DFD0B8]/30 shadow-xs cursor-pointer transition hover:opacity-90"
              title="Click to open Focus Workspace"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-mono text-xs font-bold">
                {activeSession.sessionType === 'stopwatch'
                  ? formatCompactTime(elapsedSeconds)
                  : formatCompactTime(remainingSeconds)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isRunning) pauseTimer();
                  else resumeTimer();
                }}
                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
              >
                {isRunning ? (
                  <Pause className="w-3 h-3 text-[#244C3B] dark:text-[#DFD0B8]" />
                ) : (
                  <Play className="w-3 h-3 text-[#244C3B] dark:text-[#DFD0B8]" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/focus')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] text-xs font-medium text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8] transition cursor-pointer"
              title="Open Focus Timer"
            >
              <Timer className="w-3.5 h-3.5 text-[#244C3B] dark:text-[#DFD0B8]" />
              <span>Focus</span>
            </button>
          )}

          {/* Current Date in Asia/Kolkata */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F0EB] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] text-xs font-medium text-[#4A5749] dark:text-[#DFD0B8]">
            <Calendar className="w-3.5 h-3.5 text-[#91A88E]" />
            <span className="font-mono">{todayFormatted}</span>
          </div>

          {/* Notification Bell Dropdown */}
          <NotificationBellDropdown />

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-[#4A5749] hover:-rotate-12 transition-transform duration-200" />
            )}
          </button>

          {/* Quick Action: Add Roadmap */}
          {onOpenAddRoadmap && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onOpenAddRoadmap}
              className="hidden sm:inline-flex"
            >
              Add Roadmap
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
