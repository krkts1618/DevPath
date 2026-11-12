import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { studySessionService } from '../services/studySessionService';

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishedSession, setFinishedSession] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('devpath-timer-sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Pomodoro config (configurable focus & breaks)
  const [pomodoroConfig, setPomodoroConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('devpath-pomodoro-config');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 };
  });

  const timerIntervalRef = useRef(null);
  const hasAlertedCompletion = useRef(false);

  // Synthesize pleasant completion chime using Web Audio API
  const playCompletionChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();

      // Play two-tone bell chime (D5 then A5)
      const playTone = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + startTime);
        osc.stop(audioCtx.currentTime + startTime + duration);
      };

      playTone(587.33, 0, 0.8);     // D5
      playTone(880.00, 0.25, 1.2);   // A5
    } catch (e) {
      console.warn('Audio chime unavailable:', e);
    }
  }, [soundEnabled]);

  // Fetch active session from backend on mount (recovers session on page refresh or route navigation)
  const refreshActiveSession = useCallback(async () => {
    try {
      const session = await studySessionService.getActiveSession();
      setActiveSession(session);
      if (session) {
        if (session.status === 'paused') {
          setElapsedSeconds(session.actualDurationSeconds || 0);
        } else {
          const now = Date.now();
          const startedAt = new Date(session.startedAt).getTime();
          const pausedSec = session.currentPausedSeconds || session.pausedDurationSeconds || 0;
          const liveSec = Math.max(0, Math.floor((now - startedAt) / 1000) - pausedSec);
          setElapsedSeconds(liveSec);
        }
      } else {
        setElapsedSeconds(0);
      }
    } catch (err) {
      console.error('Failed to load active study session:', err);
    }
  }, []);

  useEffect(() => {
    // Prioritize primary route queries before fetching timer status
    const initTimer = setTimeout(() => {
      refreshActiveSession();
    }, 350);
    return () => clearTimeout(initTimer);
  }, [refreshActiveSession]);

  // Save sound setting
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('devpath-timer-sound', String(next));
      return next;
    });
  };

  // Save pomodoro settings
  const updatePomodoroConfig = (newConfig) => {
    setPomodoroConfig(newConfig);
    localStorage.setItem('devpath-pomodoro-config', JSON.stringify(newConfig));
  };

  // Wall-clock ticker
  useEffect(() => {
    if (!activeSession) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    if (activeSession.status === 'paused') {
      setElapsedSeconds(activeSession.actualDurationSeconds || 0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    const startedAt = new Date(activeSession.startedAt).getTime();
    const pausedSec = activeSession.currentPausedSeconds || activeSession.pausedDurationSeconds || 0;
    const targetMinutes = activeSession.targetDurationMinutes;
    const targetSeconds = targetMinutes ? targetMinutes * 60 : null;

    const tick = () => {
      const now = Date.now();
      const liveElapsed = Math.max(0, Math.floor((now - startedAt) / 1000) - pausedSec);
      setElapsedSeconds(liveElapsed);

      // Check if target reached
      if (targetSeconds && liveElapsed >= targetSeconds) {
        if (!hasAlertedCompletion.current) {
          hasAlertedCompletion.current = true;
          playCompletionChime();
          setFinishedSession({
            ...activeSession,
            actualDurationSeconds: targetSeconds,
          });
        }
      }
    };

    tick();
    timerIntervalRef.current = setInterval(tick, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeSession, playCompletionChime]);

  // Actions
  const startTimer = async (options) => {
    hasAlertedCompletion.current = false;
    const newSession = await studySessionService.startSession(options);
    setActiveSession(newSession);
    setElapsedSeconds(0);
    return newSession;
  };

  const pauseTimer = async () => {
    if (!activeSession) return;
    const updated = await studySessionService.pauseSession(activeSession.id);
    setActiveSession(updated);
  };

  const resumeTimer = async () => {
    if (!activeSession) return;
    const updated = await studySessionService.resumeSession(activeSession.id);
    setActiveSession(updated);
  };

  const completeTimer = async (notes = '') => {
    if (!activeSession) return;
    const res = await studySessionService.completeSession(activeSession.id, {
      actualDurationSeconds: elapsedSeconds,
      notes,
    });
    setActiveSession(null);
    setElapsedSeconds(0);
    setFinishedSession(null);
    hasAlertedCompletion.current = false;
    return res;
  };

  const interruptTimer = async (notes = '') => {
    if (!activeSession) return;
    const res = await studySessionService.interruptSession(activeSession.id, {
      actualDurationSeconds: elapsedSeconds,
      notes,
    });
    setActiveSession(null);
    setElapsedSeconds(0);
    setFinishedSession(null);
    return res;
  };

  const discardTimer = async () => {
    if (!activeSession) return;
    await studySessionService.discardSession(activeSession.id);
    setActiveSession(null);
    setElapsedSeconds(0);
    setFinishedSession(null);
  };

  // Helper values
  const isRunning = activeSession && activeSession.status === 'active';
  const isPaused = activeSession && activeSession.status === 'paused';
  const targetSeconds = activeSession?.targetDurationMinutes
    ? activeSession.targetDurationMinutes * 60
    : null;

  const remainingSeconds = targetSeconds ? Math.max(0, targetSeconds - elapsedSeconds) : null;
  const progressPercent = targetSeconds
    ? Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100))
    : null;

  return (
    <TimerContext.Provider
      value={{
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
        finishedSession,
        setFinishedSession,
        startTimer,
        pauseTimer,
        resumeTimer,
        completeTimer,
        interruptTimer,
        discardTimer,
        refreshActiveSession,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
