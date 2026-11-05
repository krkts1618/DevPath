import React from 'react';
import { Link } from 'react-router-dom';
import { History, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatRelativeKolkataTime, formatKolkataTime } from '../../utils/date.util';

export default function RecentActivityFeed({ activities = [] }) {
  const hasActivities = activities && activities.length > 0;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono">
            Recent Activity
          </h3>
        </div>
        <span className="text-[11px] text-[#858D82] dark:text-[#7F8996] font-mono">
          Asia/Kolkata
        </span>
      </div>

      {hasActivities ? (
        <div className="divide-y divide-[#E4E7E0]/60 dark:divide-[#303945]/60">
          {activities.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#202620] dark:text-[#F3F4F6] truncate leading-tight">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5 font-mono">
                    {item.roadmapTitle && (
                      <>
                        <span className="truncate max-w-[140px] text-[var(--accent-primary)] font-medium">
                          {item.roadmapTitle}
                        </span>
                        <span>•</span>
                        <span>Day {item.dayNumber}</span>
                        <span>•</span>
                      </>
                    )}
                    <span className="capitalize">{item.taskType}</span>
                  </div>
                </div>
              </div>

              {/* Timestamp in IST */}
              <div className="text-right flex-shrink-0 font-mono">
                <span className="text-[11px] text-[#858D82] dark:text-[#7F8996] block">
                  {formatRelativeKolkataTime(item.completedAt)}
                </span>
                <span className="text-[10px] text-[var(--accent-primary)] opacity-80 hidden sm:block">
                  {formatKolkataTime(item.completedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-xs text-[#858D82] dark:text-[#7F8996]">
            No recent task completions logged yet. Complete tasks in your Daily Planner to record your learning momentum.
          </p>
        </div>
      )}

      <div className="mt-3.5 pt-3 border-t border-[#E4E7E0] dark:border-[#303945] text-center">
        <Link
          to="/analytics"
          className="text-xs font-semibold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer font-mono"
        >
          <span>View Engineering Analytics</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
