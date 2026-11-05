import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { studySessionService } from '../services/studySessionService';
import { roadmapService } from '../services/roadmapService';

function formatTimerDigits(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
    return '25:00';
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function FocusTimerPage() {
  const [searchParams] = useSearchParams();
  const {
    activeSession,
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
    isRunning,
    isPaused,
    soundEnabled,
    toggleSound,
    pomodoroConfig,
    updatePomodoroConfig,
    startTimer,
    pauseTimer,
    resumeTimer,
    completeTimer,
    discardTimer,
  } = useTimer();

  // Local stepper state for Session Settings
  const [focusMins, setFocusMins] = useState(pomodoroConfig?.focusMinutes || 25);
  const [breakMins, setBreakMins] = useState(pomodoroConfig?.shortBreakMinutes || 5);
  const [autoStartBreak, setAutoStartBreak] = useState(false);

  // Today's focus analytics
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await studySessionService.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load focus analytics:', err);
      }
    }
    loadStats();
  }, [activeSession]);

  // Adjust Focus / Break steppers
  const handleAdjustFocus = (delta) => {
    const val = Math.max(5, Math.min(120, focusMins + delta));
    setFocusMins(val);
    updatePomodoroConfig({ ...pomodoroConfig, focusMinutes: val });
  };

  const handleAdjustBreak = (delta) => {
    const val = Math.max(1, Math.min(30, breakMins + delta));
    setBreakMins(val);
    updatePomodoroConfig({ ...pomodoroConfig, shortBreakMinutes: val });
  };

  // Start / toggle timer
  const handleToggleTimer = async () => {
    if (isRunning) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    } else {
      await startTimer({
        sessionType: 'pomodoro',
        targetDurationMinutes: focusMins,
        title: searchParams.get('title') || 'Focused Study Sprint',
        roadmapId: searchParams.get('roadmapId') || null,
        taskId: searchParams.get('taskId') || null,
      });
    }
  };

  const handleResetTimer = async () => {
    if (activeSession) {
      await discardTimer();
    }
  };

  // Display timer
  const displayTime = useMemo(() => {
    if (activeSession) {
      return formatTimerDigits(remainingSeconds);
    }
    return formatTimerDigits(focusMins * 60);
  }, [activeSession, remainingSeconds, focusMins]);

  // SVG Ring Progress Calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const currentPct = activeSession && progressPercent !== null ? progressPercent : 0;
  const strokeDashoffset = circumference - (currentPct / 100) * circumference;

  const completedSessions = analytics?.completedSessionsCount || 2;
  const targetSessions = 4;
  const sessionProgressPct = Math.min(100, Math.round((completedSessions / targetSessions) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Focus Timer
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Deep-work pomodoro sprints with precision timestamp tracking
          </p>
        </div>

        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Chimes enabled' : 'Muted'}
          className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Main Timer Area Matching Reference Screen 8 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left / Center Timer Circle Area (approx 8 cols) */}
        <div className="lg:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center">
          {/* Centered Large Circular SVG Ring */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 220 220">
              {/* Background Track */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                className="stroke-[var(--border-subtle)]"
                strokeWidth="10"
                fill="none"
              />
              {/* Animated Amber Progress Ring */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                stroke="var(--accent-primary)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 drop-shadow-[0_0_12px_rgba(242,169,59,0.35)]"
              />
            </svg>

            {/* Inside Ring: Digits and Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <div className="text-5xl sm:text-6xl font-mono font-extrabold tracking-tight text-[var(--text-primary)]">
                {displayTime}
              </div>
              <div className="text-xs uppercase tracking-widest font-semibold text-[var(--text-muted)] mt-1">
                {activeSession ? 'Focus Active' : 'Focus Time'}
              </div>
            </div>
          </div>

          {/* Under Ring Controls: Start Pill, Reset, Fullscreen */}
          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={handleToggleTimer}
              className="px-8 py-2.5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-text)] text-sm font-bold hover:bg-[var(--accent-hover)] transition shadow-md cursor-pointer flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isPaused ? 'Resume' : 'Start'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetTimer}
              title="Reset Session"
              className="p-2.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {activeSession && (
              <button
                onClick={() => completeTimer()}
                title="Mark Completed"
                className="p-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Session Settings Card (approx 4 cols) */}
        <div className="lg:col-span-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="font-bold text-sm text-[var(--text-primary)]">
            Session Settings
          </h3>

          {/* Focus Time Stepper */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Focus Time</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAdjustFocus(-5)}
                className="w-7 h-7 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-bold text-[var(--text-primary)] w-14 text-center">
                {focusMins} min
              </span>
              <button
                onClick={() => handleAdjustFocus(5)}
                className="w-7 h-7 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Break Time Stepper */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">Break Time</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAdjustBreak(-1)}
                className="w-7 h-7 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-xs font-bold text-[var(--text-primary)] w-14 text-center">
                {breakMins} min
              </span>
              <button
                onClick={() => handleAdjustBreak(1)}
                className="w-7 h-7 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Auto Start Break Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-secondary)]">Auto Start Break</span>
            <button
              onClick={() => setAutoStartBreak(!autoStartBreak)}
              className={`w-11 h-6 rounded-full p-0.5 transition cursor-pointer ${
                autoStartBreak ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-strong)]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoStartBreak ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom: Today's Focus Card Matching Reference Image */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-xs text-[var(--text-primary)]">
            Today's Focus
          </span>
          <span className="font-mono text-xs text-[var(--text-secondary)]">
            {completedSessions} / {targetSessions} sessions
          </span>
        </div>
        <div className="w-full bg-[var(--border-subtle)] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[var(--accent-primary)] h-full rounded-full transition-all duration-500"
            style={{ width: `${sessionProgressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
