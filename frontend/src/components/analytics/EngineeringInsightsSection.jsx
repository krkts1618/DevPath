import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  RotateCcw,
  FolderGit2,
  AlertTriangle,
  ArrowRight,
  X,
  Compass,
} from 'lucide-react';

export function getInsightCategoryMeta(type) {
  switch (type) {
    case 'consistency':
      return { icon: Flame, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
    case 'technology':
      return { icon: Compass, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' };
    case 'study-time':
      return { icon: Clock, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800' };
    case 'tasks':
      return { icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' };
    case 'revision':
      return { icon: RotateCcw, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' };
    case 'project':
      return { icon: FolderGit2, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' };
    default:
      return { icon: Sparkles, color: 'text-[#244C3B] bg-[#E8F0EB] dark:text-[#DFD0B8] dark:bg-[#393E46] border-[#244C3B]/20 dark:border-[#DFD0B8]/20' };
  }
}

export default function EngineeringInsightsSection({ insights = [] }) {
  const navigate = useNavigate();
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('devpath-dismissed-insights');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('devpath-dismissed-insights', JSON.stringify(updated));
    } catch (err) {
      // ignore
    }
  };

  const handleRestoreAll = () => {
    setDismissedIds([]);
    try {
      localStorage.removeItem('devpath-dismissed-insights');
    } catch (err) {
      // ignore
    }
  };

  const activeInsights = insights.filter((i) => !dismissedIds.includes(i.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
              Deterministic Engineering Insights
            </h2>
          </div>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-0.5">
            Rule-based evaluations derived strictly from your persisted learning and execution data
          </p>
        </div>

        {dismissedIds.length > 0 && (
          <button
            onClick={handleRestoreAll}
            className="text-xs text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8] hover:underline cursor-pointer"
          >
            Restore {dismissedIds.length} dismissed
          </button>
        )}
      </div>

      {/* Insights Cards Grid */}
      {activeInsights.length === 0 ? (
        <div className="py-10 text-center bg-[#FFFFFF] dark:bg-[#2A303A] rounded-xl border border-[#E8E8DF] dark:border-[#393E46] p-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
          <p className="text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8]">
            All current insights acknowledged.
          </p>
          <p className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
            New insights will trigger automatically as curriculum tasks and focus sessions are logged.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeInsights.map((insight) => {
            const meta = getInsightCategoryMeta(insight.type);
            const Icon = meta.icon;

            return (
              <div
                key={insight.id}
                className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] shadow-xs flex flex-col justify-between hover:border-[#244C3B]/40 dark:hover:border-[#DFD0B8]/40 transition group relative"
              >
                <div>
                  {/* Category Pill + Dismiss Button */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded-md border ${meta.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#737C74] dark:text-[#948979]">
                        {insight.category}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDismiss(insight.id, e)}
                      className="text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] p-1 rounded hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition opacity-70 group-hover:opacity-100 cursor-pointer"
                      title="Dismiss insight"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-[#202A23] dark:text-[#DFD0B8] mb-1.5">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-[#737C74] dark:text-[#948979] leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                {/* Action Link */}
                {insight.actionUrl && (
                  <div className="mt-4 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46] flex items-center justify-between">
                    <span className="text-[10px] text-[#737C74] dark:text-[#948979]">
                      Source: Database Metrics
                    </span>
                    <button
                      onClick={() => navigate(insight.actionUrl)}
                      className="text-xs font-semibold text-[#244C3B] dark:text-[#DFD0B8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{insight.actionText || 'Take Action'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
