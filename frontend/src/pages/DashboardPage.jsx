import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  ListTodo,
  Flame,
  Clock,
  History,
  Layers,
  ArrowRight,
  TrendingUp,
  Timer,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { roadmapService } from '../services/roadmapService';
import { studySessionService } from '../services/studySessionService';
import { useTimer } from '../context/TimerContext';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import TodayTaskPreview from '../components/dashboard/TodayTaskPreview';
import ActiveRoadmapsGrid from '../components/dashboard/ActiveRoadmapsGrid';
import ActivityChart from '../components/dashboard/ActivityChart';
import NotificationSummaryCard from '../components/dashboard/NotificationSummaryCard';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
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
      // 1. Fetch essential core stats first (unblocks hero, streaks, queue, and tracks)
      const statsPromise = dashboardService.getStats({ skipCache }).then((statsRes) => {
        setStats(statsRes);
        setLoading(false);
        return statsRes;
      });

      // 2. Fetch secondary study analytics concurrently without blocking primary UI
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
    // Re-fetch stats immediately with skipCache=true to recalculate adaptive progression & streaks
    fetchDashboardData(true);
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-44 bg-[#E8E8DF] dark:bg-[#393E46] rounded-xl animate-pulse" />
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

  return (
    <div className="space-y-6">
      {/* 1. Refined Engineering Workspace Hero Header with 5-Task Streak Meter */}
      <WelcomeBanner stats={stats} />

      {/* 2. Compact Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Daily Streak"
          value={`${stats?.currentStreak ?? 0} d`}
          subtitle={
            stats?.qualifiedToday
              ? 'Qualified today (5+ tasks)'
              : stats?.completedToday > 0
              ? `${stats?.remainingToday} more to qualify today`
              : 'Complete 5 tasks to qualify'
          }
          icon={Flame}
          color={stats?.qualifiedToday ? 'emerald' : stats?.currentStreak > 0 ? 'amber' : 'slate'}
          badgeText={stats?.bestStreak > 0 ? `Best: ${stats?.bestStreak}d` : null}
        />

        <StatCard
          title="Active Tracks"
          value={stats?.activeRoadmapsCount ?? 0}
          subtitle={`Across ${stats?.totalRoadmapsCount ?? 0} total curriculum tracks`}
          icon={Compass}
          color="green"
        />

        <StatCard
          title="Curriculum Progress"
          value={`${stats?.overallProgressPercent ?? 0}%`}
          subtitle={`${stats?.completedTasks ?? 0} of ${stats?.totalTasks ?? 0} total tasks`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Active Learning Queue"
          value={queueTotalTasks}
          subtitle="Frontier tasks across active tracks"
          icon={Layers}
          color="sky"
        />
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Adaptive Learning Queue & Active Roadmaps */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Adaptive Learning Queue Grouped by Roadmap */}
          <TodayTaskPreview
            learningQueue={queueItems}
            totalTasksInQueue={queueTotalTasks}
            onTaskUpdated={handleTaskUpdated}
          />

          {/* Active Roadmaps Overview */}
          <ActiveRoadmapsGrid roadmaps={stats?.roadmaps || []} />
        </div>

        {/* Right 4 Columns: Weekly Velocity & Systems Portfolio */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notification & Reminders Summary Card */}
          <NotificationSummaryCard stats={stats} />

          {/* Focus & Deep Work Summary Card */}
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
                <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
                  Focus & Deep Work
                </h3>
              </div>
              <button
                onClick={() => navigate('/focus')}
                className="text-[11px] font-semibold text-[#244C3B] dark:text-[#DFD0B8] hover:underline cursor-pointer"
              >
                Open Timer &rarr;
              </button>
            </div>

            {/* Active session banner if running */}
            {activeSession && (
              <div
                onClick={() => navigate('/focus')}
                className="mb-3 p-2.5 rounded-lg bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8] border border-[#244C3B]/20 dark:border-[#DFD0B8]/20 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-xs font-bold truncate">
                    {activeSession.title || 'Focus Session Active'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold shrink-0 ml-2">
                  {Math.floor(((remainingSeconds || elapsedSeconds) || 0) / 60)}:
                  {(((remainingSeconds || elapsedSeconds) || 0) % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                <span className="text-[10px] text-[#737C74] dark:text-[#948979] uppercase font-bold block mb-0.5">
                  Today's Focus
                </span>
                <span className="text-base font-bold font-mono text-[#202A23] dark:text-[#DFD0B8]">
                  {Math.floor((focusAnalytics?.todayFocusMinutes || 0) / 60)}h {(focusAnalytics?.todayFocusMinutes || 0) % 60}m
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                <span className="text-[10px] text-[#737C74] dark:text-[#948979] uppercase font-bold block mb-0.5">
                  Weekly Focus
                </span>
                <span className="text-base font-bold font-mono text-[#202A23] dark:text-[#DFD0B8]">
                  {Math.floor((focusAnalytics?.weekFocusMinutes || 0) / 60)}h {(focusAnalytics?.weekFocusMinutes || 0) % 60}m
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#737C74] dark:text-[#948979] mb-3">
              <span>Completed Sessions:</span>
              <span className="font-bold text-[#202A23] dark:text-[#DFD0B8]">
                {focusAnalytics?.completedSessionsCount || 0}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Timer}
              onClick={() => navigate('/focus')}
              className="w-full text-xs"
            >
              Quick-Start Focus Session
            </Button>
          </div>

          {/* Weekly Learning Activity */}
          <ActivityChart data={stats?.weeklyActivity} />

          {/* Recent Activity Timeline */}
          <RecentActivityFeed activities={stats?.recentActivity} />

          {/* Spaced Recall & Revisions Card */}
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
                  Upcoming Spaced Recall
                </h3>
              </div>
              <span className="text-[11px] text-[#737C74] dark:text-[#948979] font-mono">1, 3, 7, 14d</span>
            </div>

            <p className="text-xs text-[#737C74] dark:text-[#948979] leading-relaxed mb-3">
              Tasks you complete automatically enter the spaced recall queue to solidify concepts before interviews.
            </p>

            <div className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-xs">
              <div className="flex items-center justify-between text-[#4A5749] dark:text-[#C8BFB0]">
                <span>Active revision queue</span>
                <span className="font-mono font-medium text-[#202A23] dark:text-[#DFD0B8]">
                  {stats?.completedTasks > 0 ? `${stats.completedTasks} items tracking` : 'Idle'}
                </span>
              </div>
            </div>
          </div>

          {/* Placement Milestone Readiness */}
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
                  Readiness Overview
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#737C74] dark:text-[#948979]">Total Completed Tasks</span>
                <span className="font-mono font-bold text-[#202A23] dark:text-[#DFD0B8]">
                  {stats?.completedTasks ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#737C74] dark:text-[#948979]">Daily Streak Target</span>
                <span className="font-mono font-medium text-[#244C3B] dark:text-[#DFD0B8]">
                  5 tasks / day
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#737C74] dark:text-[#948979]">Placement Target</span>
                <span className="font-semibold text-[#202A23] dark:text-[#DFD0B8]">
                  Java Full-Stack / Software Engineer
                </span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
              <button
                onClick={() => navigate('/analytics')}
                className="w-full text-center text-xs font-semibold text-[#244C3B] dark:text-[#DFD0B8] hover:underline flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Detailed Analytics & Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
