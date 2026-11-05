import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

export default function ActiveRoadmapsGrid({ roadmaps = [] }) {
  const activeRoadmaps = roadmaps.filter((r) => r.status?.toLowerCase() === 'active');

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono">
            Active Learning Tracks
          </h2>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            {activeRoadmaps.length} tracks
          </span>
        </div>

        <Link
          to="/roadmaps"
          className="text-xs font-medium text-[var(--accent-primary)] hover:text-[var(--accent-hover)] flex items-center gap-1 group font-mono"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {activeRoadmaps.slice(0, 6).map((roadmap) => {
          const progress   = roadmap.progressPercent || 0;
          const currentDay = roadmap.currentDayNumber || 1;

          return (
            <Link
              key={roadmap.id}
              to={`/roadmaps/${roadmap.id}`}
              className="group block p-4 rounded-xl border border-[#E4E7E0] dark:border-[#303945] bg-[#F8F9F6] dark:bg-[#171B21] hover:border-[var(--accent-primary)] dark:hover:border-[var(--accent-primary)] transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white dark:bg-[#252C35] text-[#858D82] dark:text-[#7F8996] border border-[#E4E7E0] dark:border-[#303945]">
                    {roadmap.category?.name || 'Development'}
                  </span>
                  <h3 className="text-sm font-bold text-[#202620] dark:text-[#F3F4F6] group-hover:text-[var(--accent-primary)] transition-colors mt-1.5 truncate">
                    {roadmap.title}
                  </h3>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Current Learning Day */}
              <div className="flex items-center justify-between text-xs text-[#858D82] dark:text-[#7F8996] mb-2 font-mono">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#202620] dark:text-[#F3F4F6]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                  Day {currentDay} of {roadmap.duration}
                </span>
                <span className="text-[11px]">
                  {roadmap.completedTasks || 0}/{roadmap.totalTasks || 0} tasks
                </span>
              </div>

              <ProgressBar value={progress} size="sm" showLabel={false} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
