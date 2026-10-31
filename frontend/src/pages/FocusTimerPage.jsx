import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Coffee,
  Volume2,
  VolumeX,
  Settings,
  X,
  Clock,
  Layers,
  CheckSquare,
  Sparkles,
  FolderGit2,
  BookOpen,
  Calendar,
  Trash2,
  Edit2,
  Save,
  BarChart2,
  TrendingUp,
  AlertCircle,
  Square,
} from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';
import { studySessionService } from '../services/studySessionService';
import { roadmapService } from '../services/roadmapService';
import { revisionService } from '../services/revisionService';
import { projectService } from '../services/projectService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

function formatTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) {
    return '00:00';
  }
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function FocusTimerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
    finishedSession,
    setFinishedSession,
    startTimer,
    pauseTimer,
    resumeTimer,
    completeTimer,
    discardTimer,
    refreshActiveSession,
  } = useTimer();

  // Mode selection for configuring new timer: 'pomodoro' | 'custom' | 'stopwatch'
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [pomodoroSubMode, setPomodoroSubMode] = useState('focus'); // 'focus' | 'short_break' | 'long_break'
  const [customDurationMinutes, setCustomDurationMinutes] = useState(30);

  // Associations & metadata
  const [roadmaps, setRoadmaps] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(searchParams.get('roadmapId') || '');
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState(searchParams.get('dayId') || '');
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(searchParams.get('taskId') || '');
  const [selectedRevisionId, setSelectedRevisionId] = useState(searchParams.get('revisionId') || '');
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('projectId') || '');
  const [customTitle, setCustomTitle] = useState(searchParams.get('title') || '');

  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAssociateOpen, setIsAssociateOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics & History
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyTab, setHistoryTab] = useState('all'); // 'all' | 'completed' | 'interrupted'
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [editingNotesValue, setEditingNotesValue] = useState('');

  // Config settings form
  const [tempConfig, setTempConfig] = useState(pomodoroConfig);

  // Load auxiliary records (roadmaps, revisions, projects)
  useEffect(() => {
    async function loadAuxData() {
      try {
        const [rmData, revData, projData] = await Promise.all([
          roadmapService.getRoadmaps({ status: 'all' }),
          revisionService.getRevisions({ status: 'all' }),
          projectService.getProjects(),
        ]);
        setRoadmaps(rmData?.roadmaps || rmData || []);
        const rawRevs = revData?.dueToday
          ? [...(revData.dueToday || []), ...(revData.upcoming || [])]
          : revData || [];
        setRevisions(rawRevs);
        setProjects(projData || []);
      } catch (err) {
        console.error('Failed to load aux data for timer associations:', err);
      }
    }
    loadAuxData();
  }, []);

  // When roadmap changes, load its days
  useEffect(() => {
    if (!selectedRoadmapId) {
      setAvailableDays([]);
      setAvailableTasks([]);
      return;
    }
    async function loadRoadmapHierarchy() {
      try {
        const rm = await roadmapService.getRoadmapById(selectedRoadmapId);
        const days = [];
        (rm?.modules || []).forEach((m) => {
          (m.days || []).forEach((d) => days.push(d));
        });
        setAvailableDays(days);

        if (selectedDayId) {
          const matchedDay = days.find((d) => d.id === selectedDayId);
          setAvailableTasks(matchedDay?.tasks || []);
        }
      } catch (err) {
        console.error('Failed to load roadmap days:', err);
      }
    }
    loadRoadmapHierarchy();
  }, [selectedRoadmapId, selectedDayId]);

  // Load Analytics and History
  const fetchAnalyticsAndHistory = useCallback(async () => {
    try {
      const [anaData, histData] = await Promise.all([
        studySessionService.getAnalytics(),
        studySessionService.getHistory({ status: historyTab === 'all' ? undefined : historyTab }),
      ]);
      setAnalytics(anaData);
      setHistory(histData?.sessions || []);
    } catch (err) {
      console.error('Failed to load study analytics & history:', err);
    }
  }, [historyTab]);

  useEffect(() => {
    fetchAnalyticsAndHistory();
  }, [fetchAnalyticsAndHistory]);

  // Handle Starting a new session
  const handleStart = async () => {
    try {
      setIsSubmitting(true);
      let sessionType = 'pomodoro';
      let targetMinutes = 25;

      if (timerMode === 'pomodoro') {
        if (pomodoroSubMode === 'short_break') {
          sessionType = 'short_break';
          targetMinutes = pomodoroConfig.shortBreakMinutes || 5;
        } else if (pomodoroSubMode === 'long_break') {
          sessionType = 'long_break';
          targetMinutes = pomodoroConfig.longBreakMinutes || 15;
        } else {
          sessionType = 'pomodoro';
          targetMinutes = pomodoroConfig.focusMinutes || 25;
        }
      } else if (timerMode === 'custom') {
        sessionType = 'custom';
        targetMinutes = Number(customDurationMinutes) || 30;
      } else if (timerMode === 'stopwatch') {
        sessionType = 'stopwatch';
        targetMinutes = null;
      }

      await startTimer({
        sessionType,
        targetDurationMinutes: targetMinutes,
        roadmapId: selectedRoadmapId || null,
        roadmapDayId: selectedDayId || null,
        taskId: selectedTaskId || null,
        revisionScheduleId: selectedRevisionId || null,
        projectId: selectedProjectId || null,
        title: customTitle.trim() || null,
      });

      setIsAssociateOpen(false);
    } catch (err) {
      alert(err.message || 'Could not start focus session');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complete
  const handleCompleteCurrent = async () => {
    try {
      setIsSubmitting(true);
      await completeTimer(completionNotes);
      setCompletionNotes('');
      fetchAnalyticsAndHistory();
    } catch (err) {
      console.error('Failed to complete session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Discard
  const handleDiscardCurrent = async () => {
    try {
      setIsSubmitting(true);
      await discardTimer();
      setIsDiscardConfirmOpen(false);
      fetchAnalyticsAndHistory();
    } catch (err) {
      console.error('Failed to discard session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updatePomodoroConfig({
      focusMinutes: Number(tempConfig.focusMinutes) || 25,
      shortBreakMinutes: Number(tempConfig.shortBreakMinutes) || 5,
      longBreakMinutes: Number(tempConfig.longBreakMinutes) || 15,
    });
    setIsSettingsOpen(false);
  };

  // Save Inline Session Notes Edit
  const handleSaveNotesEdit = async (sessionId) => {
    try {
      await studySessionService.updateNotes(sessionId, editingNotesValue);
      setEditingNotesId(null);
      fetchAnalyticsAndHistory();
    } catch (err) {
      console.error('Failed to update session notes:', err);
    }
  };

  // Delete Session Record
  const handleDeleteSessionConfirm = async () => {
    if (!sessionToDelete) return;
    try {
      await studySessionService.deleteSession(sessionToDelete.id);
      setSessionToDelete(null);
      fetchAnalyticsAndHistory();
    } catch (err) {
      console.error('Delete session error:', err);
    }
  };

  // Display timer value
  const displayTimer = useMemo(() => {
    if (activeSession) {
      if (activeSession.sessionType === 'stopwatch') {
        return formatTime(elapsedSeconds);
      }
      return formatTime(remainingSeconds);
    }
    if (timerMode === 'pomodoro') {
      if (pomodoroSubMode === 'short_break') return formatTime((pomodoroConfig.shortBreakMinutes || 5) * 60);
      if (pomodoroSubMode === 'long_break') return formatTime((pomodoroConfig.longBreakMinutes || 15) * 60);
      return formatTime((pomodoroConfig.focusMinutes || 25) * 60);
    }
    if (timerMode === 'custom') {
      return formatTime((customDurationMinutes || 30) * 60);
    }
    return '00:00';
  }, [activeSession, elapsedSeconds, remainingSeconds, timerMode, pomodoroSubMode, pomodoroConfig, customDurationMinutes]);

  const activeAssociationLabel = useMemo(() => {
    if (!activeSession) return null;
    if (activeSession.task?.title) return `Task: ${activeSession.task.title}`;
    if (activeSession.revisionSchedule?.topic) return `Revision: ${activeSession.revisionSchedule.topic}`;
    if (activeSession.project?.name) return `Project: ${activeSession.project.name}`;
    if (activeSession.roadmap?.title) return `Roadmap: ${activeSession.roadmap.title}`;
    return activeSession.title || 'General Focus Session';
  }, [activeSession]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#244C3B] dark:text-[#DFD0B8]" />
            Focus Timer & Study Workspace
          </h2>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
            Timestamp-validated focus sessions, Pomodoro intervals, and curriculum task association.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Audio chime enabled' : 'Audio chime muted'}
            className="p-2 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8] transition bg-[#FFFFFF] dark:bg-[#2A303A]"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={() => {
              setTempConfig(pomodoroConfig);
              setIsSettingsOpen(true);
            }}
            title="Configure Pomodoro Durations"
            className="p-2 rounded-lg border border-[#E8E8DF] dark:border-[#393E46] text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8] transition bg-[#FFFFFF] dark:bg-[#2A303A]"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Focus Timer Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-2xl p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center relative overflow-hidden">
        {/* If session is not active, show mode switcher */}
        {!activeSession ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-md mb-6">
            {/* Mode tabs: Pomodoro, Custom, Stopwatch */}
            <div className="flex items-center p-1 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] w-full text-xs font-semibold">
              <button
                onClick={() => setTimerMode('pomodoro')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  timerMode === 'pomodoro'
                    ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                    : 'text-[#737C74] dark:text-[#948979]'
                }`}
              >
                Pomodoro
              </button>
              <button
                onClick={() => setTimerMode('custom')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  timerMode === 'custom'
                    ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                    : 'text-[#737C74] dark:text-[#948979]'
                }`}
              >
                Custom
              </button>
              <button
                onClick={() => setTimerMode('stopwatch')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  timerMode === 'stopwatch'
                    ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                    : 'text-[#737C74] dark:text-[#948979]'
                }`}
              >
                Stopwatch
              </button>
            </div>

            {/* Pomodoro Sub-Mode Pill Switcher */}
            {timerMode === 'pomodoro' && (
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setPomodoroSubMode('focus')}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    pomodoroSubMode === 'focus'
                      ? 'bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8] border border-[#244C3B]/40'
                      : 'text-[#737C74] dark:text-[#948979]'
                  }`}
                >
                  Focus ({pomodoroConfig.focusMinutes}m)
                </button>
                <button
                  onClick={() => setPomodoroSubMode('short_break')}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    pomodoroSubMode === 'short_break'
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-500/40'
                      : 'text-[#737C74] dark:text-[#948979]'
                  }`}
                >
                  Short Break ({pomodoroConfig.shortBreakMinutes}m)
                </button>
                <button
                  onClick={() => setPomodoroSubMode('long_break')}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    pomodoroSubMode === 'long_break'
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-500/40'
                      : 'text-[#737C74] dark:text-[#948979]'
                  }`}
                >
                  Long Break ({pomodoroConfig.longBreakMinutes}m)
                </button>
              </div>
            )}

            {/* Custom slider */}
            {timerMode === 'custom' && (
              <div className="w-full flex items-center gap-3 text-xs text-[#737C74] dark:text-[#948979]">
                <span>Duration:</span>
                <input
                  type="range"
                  min="1"
                  max="180"
                  step="5"
                  value={customDurationMinutes}
                  onChange={(e) => setCustomDurationMinutes(Number(e.target.value))}
                  className="flex-1 accent-[#244C3B] dark:accent-[#DFD0B8]"
                />
                <span className="font-bold text-[#202A23] dark:text-[#DFD0B8] min-w-[50px] text-right">
                  {customDurationMinutes} min
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Active session indicator badge */
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRunning
                    ? 'bg-emerald-500 animate-pulse'
                    : isPaused
                    ? 'bg-amber-500'
                    : 'bg-gray-400'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#244C3B] dark:text-[#DFD0B8]">
                {activeSession.sessionType === 'pomodoro'
                  ? 'Pomodoro Focus'
                  : activeSession.sessionType === 'short_break'
                  ? 'Short Break'
                  : activeSession.sessionType === 'long_break'
                  ? 'Long Break'
                  : activeSession.sessionType === 'custom'
                  ? 'Custom Focus'
                  : 'Stopwatch Mode'}
              </span>
              <span className="text-xs text-[#737C74] dark:text-[#948979]">
                ({activeSession.status})
              </span>
            </div>

            {activeAssociationLabel && (
              <span className="text-xs text-[#202A23] dark:text-[#DFD0B8] font-medium max-w-md truncate bg-[#F7F7F2] dark:bg-[#222831] px-3 py-1 rounded-full border border-[#E8E8DF] dark:border-[#393E46]">
                {activeAssociationLabel}
              </span>
            )}
          </div>
        )}

        {/* Big Digital Clock Display */}
        <div className="my-6 flex flex-col items-center">
          <div className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tight text-[#202A23] dark:text-[#DFD0B8]">
            {displayTimer}
          </div>

          {/* Progress percentage bar when target exists */}
          {activeSession && progressPercent !== null && (
            <div className="w-64 mt-4">
              <div className="w-full bg-[#E8E8DF] dark:bg-[#393E46] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#244C3B] dark:bg-[#DFD0B8] h-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#737C74] dark:text-[#948979] mt-1 font-mono">
                <span>{formatTime(elapsedSeconds)} elapsed</span>
                <span>{progressPercent}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-3 mt-2">
          {!activeSession ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                icon={Play}
                onClick={handleStart}
                disabled={isSubmitting}
                className="px-8 shadow-sm"
              >
                {timerMode === 'pomodoro' && pomodoroSubMode.includes('break')
                  ? 'Start Break'
                  : 'Start Focus Session'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                icon={Layers}
                onClick={() => setIsAssociateOpen(!isAssociateOpen)}
              >
                {selectedTaskId || selectedRoadmapId || selectedProjectId || selectedRevisionId
                  ? 'Linked to Learning'
                  : 'Associate with Task'}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {isRunning && (
                <Button
                  variant="outline"
                  size="lg"
                  icon={Pause}
                  onClick={pauseTimer}
                  disabled={isSubmitting}
                >
                  Pause
                </Button>
              )}

              {isPaused && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={Play}
                  onClick={resumeTimer}
                  disabled={isSubmitting}
                >
                  Resume
                </Button>
              )}

              <Button
                variant="primary"
                size="lg"
                icon={CheckCircle2}
                onClick={() => setFinishedSession(activeSession)}
                disabled={isSubmitting}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                Complete Session
              </Button>

              <Button
                variant="outline"
                size="lg"
                icon={X}
                onClick={() => setIsDiscardConfirmOpen(true)}
                disabled={isSubmitting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                Discard
              </Button>
            </div>
          )}
        </div>

        {/* Association Drawer when configuring */}
        {!activeSession && isAssociateOpen && (
          <div className="w-full max-w-xl mt-6 p-4 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#202A23] dark:text-[#DFD0B8]">
                Link Session with Curriculum or Project
              </span>
              <button
                onClick={() => setIsAssociateOpen(false)}
                className="text-[#737C74] hover:text-[#202A23] dark:hover:text-[#DFD0B8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#737C74] dark:text-[#948979] mb-1">
                  Roadmap
                </label>
                <select
                  value={selectedRoadmapId}
                  onChange={(e) => {
                    setSelectedRoadmapId(e.target.value);
                    setSelectedDayId('');
                    setSelectedTaskId('');
                  }}
                  className="w-full bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-2.5 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none"
                >
                  <option value="">General / Unlinked</option>
                  {roadmaps.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#737C74] dark:text-[#948979] mb-1">
                  Curriculum Day
                </label>
                <select
                  value={selectedDayId}
                  disabled={!selectedRoadmapId || availableDays.length === 0}
                  onChange={(e) => {
                    setSelectedDayId(e.target.value);
                    setSelectedTaskId('');
                  }}
                  className="w-full bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-2.5 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none disabled:opacity-50"
                >
                  <option value="">Select Day (Optional)</option>
                  {availableDays.map((d) => (
                    <option key={d.id} value={d.id}>
                      Day {d.dayNumber}: {d.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedDayId && availableTasks.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-[#737C74] dark:text-[#948979] mb-1">
                  Curriculum Task
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-2.5 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none"
                >
                  <option value="">Select Task (Optional)</option>
                  {availableTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.estimatedDuration}m)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#737C74] dark:text-[#948979] mb-1">
                  Revision Topic
                </label>
                <select
                  value={selectedRevisionId}
                  onChange={(e) => setSelectedRevisionId(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-2.5 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none"
                >
                  <option value="">No Revision Linked</option>
                  {revisions.map((rev) => (
                    <option key={rev.id} value={rev.id}>
                      {rev.topic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#737C74] dark:text-[#948979] mb-1">
                  Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-2.5 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none"
                >
                  <option value="">No Project Linked</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#737C74] dark:text-[#948979] mb-1">
                Custom Session Goal / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Implement Raft Log Consistency Check..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-2.5 py-1.5 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Focus Time"
          value={`${Math.floor((analytics?.todayFocusMinutes || 0) / 60)}h ${(analytics?.todayFocusMinutes || 0) % 60}m`}
          subtitle="Validated focused time"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="This Week"
          value={`${Math.floor((analytics?.weekFocusMinutes || 0) / 60)}h ${(analytics?.weekFocusMinutes || 0) % 60}m`}
          subtitle="Monday to Sunday"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Completed Sessions"
          value={`${analytics?.completedSessionsCount || 0} Sessions`}
          subtitle={`Average ${analytics?.averageDailyFocusMinutes || 0}m daily`}
          icon={CheckCircle2}
          color="sky"
        />
        <StatCard
          title="Longest Session"
          value={`${analytics?.longestSessionMinutes || 0} min`}
          subtitle="Peak uninterrupted focus"
          icon={Sparkles}
          color="amber"
        />
      </div>

      {/* 14-Day Focus Trend Chart */}
      {analytics?.dailyTrend && analytics.dailyTrend.length > 0 && (
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
              14-Day Focus Time Trend (Minutes)
            </h3>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.substring(5)}
                  tick={{ fontSize: 10, fill: '#737C74' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#737C74' }} />
                <Tooltip
                  formatter={(val) => [`${val} minutes`, 'Focus Time']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: '#2A303A',
                    borderColor: '#393E46',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#DFD0B8',
                  }}
                />
                <Bar dataKey="focusMinutes" fill="#244C3B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Session History & Notes */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
            Study Session History ({history.length})
          </h3>

          <div className="flex items-center gap-2 text-xs">
            {['all', 'completed', 'interrupted'].map((t) => (
              <button
                key={t}
                onClick={() => setHistoryTab(t)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition ${
                  historyTab === t
                    ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                    : 'text-[#737C74] dark:text-[#948979] hover:bg-[#EAEAE4] dark:hover:bg-[#393E46]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-[#737C74] dark:text-[#948979] py-6 text-center">
            No focus session records found for this filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E8DF] dark:border-[#393E46] text-[#737C74] dark:text-[#948979]">
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3">Associated Task / Curricula</th>
                  <th className="py-2.5 px-3">Focused</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8DF] dark:divide-[#393E46]">
                {history.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F7F7F2]/50 dark:hover:bg-[#222831]/50">
                    <td className="py-2.5 px-3 font-semibold text-[#202A23] dark:text-[#DFD0B8]">
                      {s.title || s.sessionType}
                    </td>
                    <td className="py-2.5 px-3 text-[#737C74] dark:text-[#948979]">
                      {s.task?.title ? (
                        <span className="text-[#244C3B] dark:text-[#DFD0B8] font-medium">
                          {s.task.title}
                        </span>
                      ) : s.roadmap?.title ? (
                        <span>{s.roadmap.title}</span>
                      ) : (
                        <span>General Study</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-[#202A23] dark:text-[#DFD0B8]">
                      {formatTime(s.actualDurationSeconds)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : s.status === 'interrupted'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : s.status === 'discarded'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#737C74] dark:text-[#948979]">
                      {new Date(s.startedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      {editingNotesId === s.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingNotesValue}
                            onChange={(e) => setEditingNotesValue(e.target.value)}
                            className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded px-2 py-0.5 text-xs text-[#202A23] dark:text-[#DFD0B8] outline-none"
                          />
                          <button
                            onClick={() => handleSaveNotesEdit(s.id)}
                            className="text-emerald-600 hover:text-emerald-700 p-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(s.id);
                            setEditingNotesValue(s.notes || '');
                          }}
                          className="cursor-pointer text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8] truncate max-w-[160px]"
                          title="Click to edit notes"
                        >
                          {s.notes || '—'}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSessionToDelete(s)}
                        title="Delete record"
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session Completion Modal */}
      <Modal
        isOpen={!!finishedSession}
        onClose={() => setFinishedSession(null)}
        title="Focus Session Complete! 🎉"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-center">
            <span className="text-xs uppercase tracking-wider font-bold text-[#244C3B] dark:text-[#DFD0B8]">
              Great Job Maintaining Deep Work
            </span>
            <div className="text-3xl font-mono font-bold text-[#202A23] dark:text-[#DFD0B8] my-2">
              {formatTime(finishedSession?.actualDurationSeconds || elapsedSeconds)}
            </div>
            <p className="text-xs text-[#737C74] dark:text-[#948979]">
              Your focused duration has been logged into your persistent study records.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
              Session Takeaways / Reflection (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What did you build or learn? Any blockers resolved?"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
            <Button
              variant="outline"
              size="sm"
              icon={Coffee}
              onClick={async () => {
                await handleCompleteCurrent();
                setFinishedSession(null);
                setTimerMode('pomodoro');
                setPomodoroSubMode('short_break');
              }}
            >
              Start 5m Short Break
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={async () => {
                await handleCompleteCurrent();
                setFinishedSession(null);
              }}
            >
              Save & Finish Session
            </Button>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Pomodoro Preferences"
      >
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Focus Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={tempConfig.focusMinutes}
                onChange={(e) => setTempConfig({ ...tempConfig, focusMinutes: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Short Break (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={tempConfig.shortBreakMinutes}
                onChange={(e) => setTempConfig({ ...tempConfig, shortBreakMinutes: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                Long Break (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={tempConfig.longBreakMinutes}
                onChange={(e) => setTempConfig({ ...tempConfig, longBreakMinutes: e.target.value })}
                className="w-full text-xs bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-lg px-3 py-2 text-[#202A23] dark:text-[#DFD0B8] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>
      </Modal>

      {/* Discard Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDiscardConfirmOpen}
        onClose={() => setIsDiscardConfirmOpen(false)}
        onConfirm={handleDiscardCurrent}
        title="Discard Focus Session"
        message="Are you sure you want to discard this focus session? This session will be discarded and excluded from your study metrics."
        confirmText="Discard Session"
        confirmVariant="danger"
      />

      {/* Delete Record Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDeleteSessionConfirm}
        title="Delete Session Record"
        message="Are you sure you want to permanently delete this study session record?"
        confirmText="Delete Record"
        confirmVariant="danger"
      />
    </div>
  );
}
