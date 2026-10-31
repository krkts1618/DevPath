import React from 'react';
import { Flame, CheckCircle2, Trophy, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import workspaceHero from '../../assets/workspace-hero.jpg';

export default function WelcomeBanner({ stats }) {
  const kolkataDateFormatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const kolkataHour = parseInt(
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  );

  let greeting = 'Good morning';
  if (kolkataHour >= 12 && kolkataHour < 17) {
    greeting = 'Good afternoon';
  } else if (kolkataHour >= 17) {
    greeting = 'Good evening';
  }

  const currentStreak  = stats?.currentStreak ?? 0;
  const bestStreak     = stats?.bestStreak ?? currentStreak;
  const completedToday = stats?.completedToday ?? 0;
  const streakTarget   = stats?.streakTarget ?? 5;
  const qualifiedToday = stats?.qualifiedToday ?? false;
  const remainingToday = stats?.remainingToday ?? Math.max(0, streakTarget - completedToday);
  const activeCount    = stats?.activeRoadmapsCount ?? 0;
  const overallProgress = stats?.overallProgressPercent ?? 0;

  const streakPercent = Math.min(100, Math.round((completedToday / streakTarget) * 100));

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#E8E8DF] dark:border-[#393E46] bg-[#FFFFFF] dark:bg-[#2A303A] shadow-xs">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={workspaceHero}
          alt="Workspace"
          className="w-full h-full object-cover object-right-top opacity-10 dark:opacity-20 filter saturate-50"
        />
        {/* Light theme gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/96 to-white/70 dark:hidden" />
        {/* Dark theme gradient overlay */}
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-[#2A303A] via-[#2A303A]/96 to-[#2A303A]/75" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#F0F0EB] dark:bg-[#393E46] text-[#4A5749] dark:text-[#C8BFB0] border border-[#E8E8DF] dark:border-[#4F5561]">
              <Clock className="w-3 h-3 text-[#91A88E]" />
              <span>{kolkataDateFormatted}</span>
            </span>
            <span className="text-xs text-[#91A88E] dark:text-[#948979] font-mono hidden sm:inline">•</span>
            <span className="text-xs text-[#737C74] dark:text-[#948979] font-medium hidden sm:inline">
              Asia/Kolkata (IST)
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202A23] dark:text-[#DFD0B8] mb-1.5">
            {greeting}, Engineer
          </h1>

          <p className="text-sm text-[#4A5749] dark:text-[#C8BFB0] leading-relaxed mb-4">
            Adaptive placement & systems preparation. Tracking{' '}
            <span className="font-semibold text-[#202A23] dark:text-[#DFD0B8]">
              {activeCount} active learning tracks
            </span>{' '}
            at{' '}
            <span className="font-semibold text-[#244C3B] dark:text-[#DFD0B8]">
              {overallProgress}% completion
            </span>
            . Roadmaps advance independently based on your individual task progress.
          </p>

          <div className="flex items-center gap-3">
            <Link
              to="/planner"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#244C3B] hover:bg-[#1A3B2C] text-white dark:bg-[#DFD0B8] dark:text-[#222831] dark:hover:bg-[#ECE3D4] transition-colors shadow-xs"
            >
              <span>Go to Daily Learning Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/roadmaps"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#F0F0EB] hover:bg-[#E8E8DF] dark:bg-[#393E46] dark:hover:bg-[#454B54] text-[#4A5749] dark:text-[#DFD0B8] transition-colors"
            >
              <span>Explore Roadmaps</span>
            </Link>
          </div>
        </div>

        {/* Right Column: 5-Task Daily Streak Card */}
        <div className="w-full lg:w-80 bg-[#F7F7F2]/90 dark:bg-[#222831]/80 border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 sm:p-5 backdrop-blur-xs flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  qualifiedToday
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : currentStreak > 0
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'bg-[#F0F0EB] dark:bg-[#393E46] text-[#737C74] dark:text-[#948979]'
                }`}
              >
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8]">
                    {currentStreak}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#737C74] dark:text-[#948979]">
                    Day Streak
                  </span>
                </div>
              </div>
            </div>

            {bestStreak > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#737C74] dark:text-[#DFD0B8] bg-[#FFFFFF] dark:bg-[#393E46] px-2 py-0.5 rounded border border-[#E8E8DF] dark:border-[#4F5561]">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span>Best: {bestStreak}d</span>
              </div>
            )}
          </div>

          {/* Today's 5-task rule meter */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#4A5749] dark:text-[#C8BFB0]">
                Today's Goal (5 tasks/day)
              </span>
              <span className="font-mono text-[#202A23] dark:text-[#DFD0B8]">
                {completedToday}/{streakTarget}
              </span>
            </div>

            {/* Progress track */}
            <div className="w-full h-2 bg-[#E8E8DF] dark:bg-[#393E46] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  qualifiedToday
                    ? 'bg-emerald-500'
                    : completedToday > 0
                    ? 'bg-amber-500'
                    : 'bg-[#D4D4CA] dark:bg-[#393E46]'
                }`}
                style={{ width: `${streakPercent}%` }}
              />
            </div>

            {/* Status message */}
            <div className="text-[11px] leading-tight pt-1">
              {qualifiedToday ? (
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Streak qualified for today!</span>
                </div>
              ) : remainingToday > 0 ? (
                <p className="text-[#737C74] dark:text-[#948979]">
                  Complete{' '}
                  <strong className="text-amber-600 dark:text-amber-400 font-semibold">
                    {remainingToday} more {remainingToday === 1 ? 'task' : 'tasks'}
                  </strong>{' '}
                  today to qualify for your streak.
                </p>
              ) : (
                <p className="text-[#737C74] dark:text-[#948979]">
                  Complete 5 distinct tasks in a calendar day to qualify.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
