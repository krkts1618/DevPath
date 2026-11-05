import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import workspaceHero from '../../assets/workspace-hero.jpg';
import { useKolkataGreeting } from '../../utils/date.util';

export default function WelcomeBanner({ stats }) {
  const { title: greetingTitle, formattedDate } = useKolkataGreeting();

  const currentStreak   = stats?.currentStreak ?? 0;
  const completedToday  = stats?.completedToday ?? 0;
  const streakTarget    = stats?.streakTarget ?? 5;
  const activeCount     = stats?.activeRoadmapsCount ?? 0;
  const overallProgress = stats?.overallProgressPercent ?? 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#E4E7E0] dark:border-[#303945] bg-[#FFFFFF] dark:bg-[#1D232B] shadow-xs">
      {/* Background Architectural / Atmospheric Texture */}
      <div className="absolute inset-0 z-0">
        <img
          src={workspaceHero}
          alt="Engineering Workspace"
          className="w-full h-full object-cover object-right-top opacity-15 dark:opacity-25 filter saturate-50 contrast-125"
        />
        {/* Light theme subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/75 dark:hidden" />
        {/* Dark theme subtle overlay */}
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-[#1D232B] via-[#1D232B]/95 to-[#1D232B]/80" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#F0F2ED] dark:bg-[#252C35] text-[#596258] dark:text-[#B0B7C2] border border-[#E4E7E0] dark:border-[#3A4552]">
              <Clock className="w-3 h-3 text-[var(--accent-primary)]" />
              <span>{formattedDate}</span>
            </span>
            <span className="text-xs text-[#858D82] dark:text-[#7F8996] font-mono hidden sm:inline">•</span>
            <span className="text-xs text-[#858D82] dark:text-[#7F8996] font-medium hidden sm:inline">
              Asia/Kolkata (IST • UTC+05:30)
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202620] dark:text-[#F3F4F6] mb-1.5 flex items-center gap-2">
            <span>{greetingTitle}, Engineer!</span>
            <span>👋</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#596258] dark:text-[#B0B7C2] leading-relaxed mb-4">
            Plan your learning. Build consistency. Become a better engineer.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--accent-primary)] hover:brightness-105 active:scale-[0.98] text-[var(--accent-text)] transition-all shadow-sm"
            >
              <span>Daily Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/roadmaps"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F0F2ED] hover:bg-[#E4E7E0] dark:bg-[#252C35] dark:hover:bg-[#2B333D] active:scale-[0.98] text-[#202620] dark:text-[#F3F4F6] transition-all border border-[#E4E7E0] dark:border-[#3A4552] shadow-xs"
            >
              <span>Explore Roadmaps ({activeCount} Active)</span>
            </Link>
          </div>
        </div>

        {/* Quick Context Summary Pill on Right */}
        <div className="hidden lg:flex flex-col items-end gap-1.5 text-right font-mono text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[#858D82] dark:text-[#7F8996]">Overall Progress: </span>
            <span className="font-bold text-[var(--accent-primary)]">{overallProgress}%</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945]">
            <span className="text-[#858D82] dark:text-[#7F8996]">Today's Output: </span>
            <span className="font-bold text-[#202620] dark:text-[#F3F4F6]">{completedToday} / {streakTarget}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
