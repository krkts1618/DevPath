import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const RATING_COLORS = {
  again: '#E11D48',
  difficult: '#EA580C',
  good: 'var(--accent-primary)',
  easy: '#059669',
};

export default function RevisionPerformanceSection({ revisionPerformance }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!revisionPerformance) return null;

  const ratingData = (revisionPerformance.ratingDistribution || []).map((r) => ({
    ...r,
    color: RATING_COLORS[r.rating] || 'var(--accent-primary)',
  }));

  const topicsNeedingPractice = revisionPerformance.topicsNeedingPractice || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6]">
            Revision & Spaced Recall Analytics
          </h2>
          <p className="text-xs text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Retention pacing, stage progression, and topics requiring reinforcement
          </p>
        </div>

        <button
          onClick={() => navigate('/revision')}
          className="text-xs font-semibold text-[var(--accent-primary)] dark:text-[#F3F4F6] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Open Revision Center</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Total Topics</div>
          <div className="text-2xl font-bold font-mono text-[#202620] dark:text-[#F3F4F6] mt-1">
            {revisionPerformance.totalTopics}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Spaced repetition subjects
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Completed Reviews</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {revisionPerformance.revisionsCompleted}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Successful reviews logged
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Due Today</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {revisionPerformance.revisionsDue}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Scheduled for today
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996]">Overdue Revisions</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {revisionPerformance.revisionsOverdue}
          </div>
          <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
            Need immediate review
          </p>
        </div>
      </div>

      {/* Grid: Rating Breakdown & Topics Needing Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rating Breakdown Pie (5 Columns) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6] mb-3">
            Recall Understanding Ratings
          </h3>

          <div className="h-56 w-full flex items-center justify-center">
            {ratingData.some((r) => r.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingData}
                    dataKey="count"
                    nameKey="rating"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#FFFFFF] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] p-2 rounded shadow-md text-xs">
                            <p className="font-bold text-[#202620] dark:text-[#F3F4F6] capitalize">{data.rating}</p>
                            <p className="text-[var(--accent-primary)] dark:text-[#F3F4F6] font-mono">{data.count} review sessions</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-[11px] text-[#202620] dark:text-[#F3F4F6] capitalize">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[#858D82] dark:text-[#7F8996]">
                No revision sessions logged in this timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Topics Needing Practice (7 Columns) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#202620] dark:text-[#F3F4F6]">
                Topics Flagged for Additional Practice
              </h3>
            </div>
            <span className="text-[11px] text-[#858D82] dark:text-[#7F8996]">
              Rated 'Again' or 'Difficult'
            </span>
          </div>

          {topicsNeedingPractice.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#858D82] dark:text-[#7F8996]">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-60" />
              <p>No revision topics currently flagged for difficulty.</p>
              <p className="text-[10px] mt-0.5">Spaced repetition recall ratings are on track.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {topicsNeedingPractice.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/revision')}
                  className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E4E7E0] dark:border-[#303945] flex items-center justify-between text-xs hover:border-[var(--accent-primary)]/40 transition cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-[#202620] dark:text-[#F3F4F6]">
                      {t.topic}
                    </div>
                    <div className="text-[10px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
                      {t.roadmapTitle} &bull; Stage {t.stage}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                      {t.lastRating}
                    </span>
                    <div className="text-[10px] text-[#858D82] dark:text-[#7F8996] mt-0.5">
                      {t.ratingIssuesCount} difficult attempts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
