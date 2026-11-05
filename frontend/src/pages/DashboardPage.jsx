import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Flame,
  Clock,
  Layers,
  ArrowRight,
  Timer,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { studySessionService } from '../services/studySessionService';
import { useTimer } from '../context/TimerContext';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import TodayTaskPreview from '../components/dashboard/TodayTaskPreview';
import ActiveRoadmapsGrid from '../components/dashboard/ActiveRoadmapsGrid';
import ActivityChart from '../components/dashboard/ActivityChart';
import NotificationSummaryCard from '../components/dashboard/NotificationSummaryCard';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import { StatCardSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { activeSession, remainingSeconds, elapsedSeconds } = useTimer();
  const [stats, setStats] = useState(null);
  const [focusAnalytics, setFocusAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (skipCache = false) => {
    try {
      const statsPromise = dashboardService.getStats({ skipCache }).then((statsRes) => {
        setStats(statsRes);
        setLoading(false);
        return statsRes;
      });

      studySessionService
        .getAnalytics()
        .then((focusRes) => setFocusAnalytics(focusRes))
        .catch((e) => console.warn('Study analytics warning:', e));

      await statsPromise;
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to connect to DevPath backend.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTaskUpdated = () => {
    fetchDashboardData(true);
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-[#E4E7E0] dark:bg-[#1D232B] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to Load Dashboard"
          message={error}
          onRetry={() => {
            setLoading(true);
            setError(null);
            fetchDashboardData();
          }}
        />
      </div>
    );
  }

  const queueItems = stats?.learningQueue || [];
  const queueTotalTasks =
    stats?.todayScheduledTasks ||
    queueItems.reduce((acc, g) => acc + (g.activeTasks?.length || 0), 0);

  // Daily Progress calculations for Ring
  const completedToday = stats?.completedToday ?? 0;
  const streakTarget = stats?.streakTarget ?? 5;
  const dailyProgressPercent = Math.min(100, Math.round((completedToday / streakTarget) * 100));

  // Focus time calculation
  const totalFocusMins = focusAnalytics?.todayFocusMinutes ?? 0;
  const focusHours = Math.floor(totalFocusMins / 60);
  const focusMins = totalFocusMins % 60;
  const focusTimeDisplay = totalFocusMins > 0 ? `${focusHours}h ${focusMins}m` : '0h 0m';

  // SVG Circular Ring parameters
  const ringRadius = 22;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (dailyProgressPercent / 100) * ringCircumference;

  return (
    <div className="space-y-6">
      {/* 1. Atmospheric Hero Header */}
      <WelcomeBanner stats={stats} />

      {/* 2. Four Compact Metric Cards from Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Daily Progress with Circular Ring */}
        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#858D82] dark:text-[#7F8996] uppercase tracking-wider font-mono">
              Daily Progress
            </span>
            <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-1">
              {completedToday} / {streakTarget}
            </div>
            <span className="text-xs font-mono font-semibold text-[var(--accent-primary)] mt-0.5 block">
              {dailyProgressPercent}%
            </span>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r={ringRadius}
                className="stroke-[#E4E7E0] dark:stroke-[#252C35]"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r={ringRadius}
                className="stroke-[var(--accent-primary)] transition-all duration-700 ease-out"
                strokeWidth="4.5"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="absolute font-mono text-[11px] font-bold text-[#202620] dark:text-[#F3F4F6]">
              {dailyProgressPercent}%
            </span>
          </div>
        </div>

        {/* Card 2: Streak */}
        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#858D82] dark:text-[#7F8996] uppercase tracking-wider font-mono">
              Streak
            </span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6]">
              {stats?.currentStreak ?? 0} Days
            </div>
            <div className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5 flex items-center gap-1">
              <span>{stats?.qualifiedToday ? 'Target locked today! 🎯' : 'Keep going! 🔥'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Roadmaps */}
        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#858D82] dark:text-[#7F8996] uppercase tracking-wider font-mono">
              Active Roadmaps
            </span>
            <Compass className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6]">
              {stats?.activeRoadmapsCount ?? 0}
            </div>
            <div className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Learning & progressing...</span>
            </div>
          </div>
        </div>

        {/* Card 4: Focus Time */}
        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#858D82] dark:text-[#7F8996] uppercase tracking-wider font-mono">
              Focus Time
            </span>
            <Timer className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6]">
              {focusTimeDisplay}
            </div>
            <div className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-0.5">
              Today's deep work
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7-8 Columns: Today's Learning Queue & Active Roadmaps */}
        <div className="lg:col-span-8 space-y-6">
          <TodayTaskPreview
            learningQueue={queueItems}
            totalTasksInQueue={queueTotalTasks}
            onTaskUpdated={handleTaskUpdated}
          />

          <ActiveRoadmapsGrid roadmaps={stats?.roadmaps || []} />
        </div>

        {/* Right 4-5 Columns: Weekly Consistency, Reminders & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Weekly Consistency Bar Chart */}
          <ActivityChart data={stats?.weeklyActivity || []} />

          {/* Reminders & Alerts */}
          <NotificationSummaryCard stats={stats} />

          {/* Recent Activity Feed */}
          <RecentActivityFeed activities={stats?.recentCompletions || []} />
        </div>
      </div>
    </div>
  );
}
