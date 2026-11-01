import React from 'react';
import { Link } from 'react-router-dom';
import { History, CheckCircle2, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { formatRelativeKolkataTime, formatKolkataTime } from '../../utils/date.util';
import Badge from '../ui/Badge';

export default function RecentActivityFeed({ activities = [] }) {
  const hasActivities = activities && activities.length > 0;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
          <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
            Recent Activity
          </h3>
        </div>
        <span className="text-[11px] text-[#737C74] dark:text-[#948979] font-mono">
          Asia/Kolkata
        </span>
      </div>

      {hasActivities ? (
        <div className="divide-y divide-[#E8E8DF]/60 dark:divide-[#393E46]/60">
          {activities.map((item) => (
            <div
              key={item.id}
              className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#202A23] dark:text-[#DFD0B8] truncate leading-tight">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
                    {item.roadmapTitle && (
                      <>
                        <span className="truncate max-w-[140px] text-[#244C3B] dark:text-[#DFD0B8] font-medium">
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
              <div className="text-right flex-shrink-0">
                <span className="text-[11px] font-mono text-[#737C74] dark:text-[#948979] block">
                  {formatRelativeKolkataTime(item.completedAt)}
                </span>
                <span className="text-[10px] text-[#91A88E] dark:text-[#948979] font-mono hidden sm:block">
                  {formatKolkataTime(item.completedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-xs text-[#737C74] dark:text-[#948979]">
            No recent task completions logged yet. Complete tasks in your Daily Planner or active roadmaps to see your activity timeline here.
          </p>
        </div>
      )}

      <div className="mt-3.5 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46] text-center">
        <Link
          to="/analytics"
          className="text-xs font-semibold text-[#244C3B] dark:text-[#DFD0B8] hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View Comprehensive Engineering Analytics</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
