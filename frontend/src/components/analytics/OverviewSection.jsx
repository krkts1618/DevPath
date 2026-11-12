import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

function ComparisonBadge({ comparison }) {
  if (!comparison || comparison.status === 'insufficient_data') {
    return (
      <span className="text-[10px] font-medium text-[var(--text-muted)] italic">
        Insufficient historical data
      </span>
    );
  }

  if (comparison.status === 'improvement') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
        <ArrowUpRight className="w-3 h-3" />
        {comparison.text}
      </span>
    );
  }

  if (comparison.status === 'decline') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
        <ArrowDownRight className="w-3 h-3" />
        {comparison.text}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg-surface-elevated)] px-1.5 py-0.5 rounded">
      <Minus className="w-3 h-3" />
      No change
    </span>
  );
}

export default function OverviewSection({ overview, roadmaps = [], studyTime = null, consistency = null }) {
  if (!overview) return null;

  const completionPct = overview.totalCompletionPercentage ?? 0;
  const completedTasks = overview.totalCompletedCurriculumTasks ?? 0;
  const streakDays = overview.currentOverallStreak ?? 0;
  const focusHours = overview.totalFocusedStudyHours ?? 0;

  // Real distribution for Learning Trend curve (Asia/Kolkata date points)
  const defaultTrendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendPoints =
    overview.learningTrend && overview.learningTrend.length > 0
      ? overview.learningTrend.slice(-7)
      : defaultTrendDays.map((day) => ({ day, val: 0, completedTasks: 0 }));

  const maxVal = Math.max(...trendPoints.map((p) => p.val ?? p.completedTasks ?? 0), 5);

  // SVG curved path builder
  const chartWidth = 360;
  const chartHeight = 130;
  const paddingX = 30;
  const paddingY = 20;
  const innerW = chartWidth - paddingX * 2;
  const innerH = chartHeight - paddingY * 2;

  const points = trendPoints.map((pt, idx) => {
    const divisor = trendPoints.length > 1 ? trendPoints.length - 1 : 1;
    const x = paddingX + (idx / divisor) * innerW;
    const v = pt.val ?? pt.completedTasks ?? 0;
    const y = chartHeight - paddingY - (v / maxVal) * innerH;
    return { x, y, val: v, day: pt.day || '' };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[idx - 1];
    const cpx1 = prev.x + (curr.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (curr.x - prev.x) / 2;
    const cpy2 = curr.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Roadmap Progress segments for donut chart (from real active roadmaps)
  const activeRoadmaps = (roadmaps || []).filter((r) => r.status === 'active');
  const palette = ['var(--accent-primary)', '#F97316', '#38BDF8'];
  const roadmapsList = activeRoadmaps.slice(0, 3).map((r, idx) => ({
    name: r.title,
    progress: r.progressPercent ?? 0,
    color: palette[idx % palette.length],
  }));

  // Daily focus distribution for 7-day bar chart
  const focusDays =
    studyTime?.dailyTrend && studyTime.dailyTrend.length > 0
      ? studyTime.dailyTrend.slice(-7).map((d) => ({
          day: d.dayShort || d.day || 'Day',
          hours: d.focusHours || 0,
        }))
      : defaultTrendDays.map((day) => ({ day, hours: 0 }));

  const maxFocusHours = Math.max(...focusDays.map((d) => d.hours), 1.0);
  const todayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

  // Compact 4 x 12 Activity Heatmap data (from real activity heatmap days)
  const heatmapRows = 4;
  const heatmapCols = 12;
  const totalHeatmapCells = heatmapRows * heatmapCols; // 48
  const rawHeatmapDays = consistency?.heatmap?.days || [];
  const recentDays = rawHeatmapDays.slice(-totalHeatmapCells);

  const heatmapCells = Array.from({ length: totalHeatmapCells }, (_, i) => {
    const dayData = recentDays[i];
    if (!dayData) return 0;
    const count = dayData.count || dayData.completedTasksCount || 0;
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    return 3;
  });

  return (
    <div className="space-y-5">
      {/* 1. Top 4 Metric Cards (Exact replica of Reference Screen 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Progress */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs transition hover:border-[var(--border-strong)]">
          <div className="text-3xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
            {completionPct}%
          </div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
            Overall Progress
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>{completedTasks} completed</span>
            <ComparisonBadge comparison={overview.comparisons?.tasks} />
          </div>
        </div>

        {/* Card 2: Tasks Completed */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs transition hover:border-[var(--border-strong)]">
          <div className="text-3xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
            {completedTasks}
          </div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
            Tasks Completed
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)]">
            From active & archived roadmaps
          </div>
        </div>

        {/* Card 3: Current Streak */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs transition hover:border-[var(--border-strong)]">
          <div className="text-3xl font-bold font-mono tracking-tight text-[var(--text-primary)] flex items-baseline gap-1.5">
            <span>{streakDays}</span>
            <span className="text-lg font-semibold text-[var(--accent-primary)]">Days</span>
          </div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
            Current Streak
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
            <span>Target: 5 tasks/day</span>
          </div>
        </div>

        {/* Card 4: Focus Time */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs transition hover:border-[var(--border-strong)]">
          <div className="text-3xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
            {focusHours}h
          </div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
            Focus Time
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
            <span>{overview.totalCompletedFocusSessions || 0} sessions logged</span>
            <ComparisonBadge comparison={overview.comparisons?.studyTime} />
          </div>
        </div>
      </div>

      {/* 2. 4-Panel Analytics Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Learning Trend (Top-Left) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Learning Trend
            </h3>
            <span className="text-xs font-mono font-bold text-[var(--accent-primary)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-full">
              {completionPct}%
            </span>
          </div>

          <div className="relative w-full h-44 flex items-center justify-center">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map((v) => {
                const y = chartHeight - paddingY - (v / 100) * innerH;
                return (
                  <g key={v}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      className="text-[var(--border-subtle)]"
                      strokeDasharray="2 3"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-[var(--text-muted)] font-mono"
                    >
                      {v}%
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area */}
              <path d={areaD} fill="url(#trendGradient)" />

              {/* Glowing Line */}
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_2px_8px_rgba(242,169,59,0.4)]"
              />

              {/* Data points */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={idx === points.length - 1 ? '4' : '2.5'}
                    fill="var(--accent-primary)"
                    stroke="var(--bg-surface)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={pt.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className="text-[9px] fill-[var(--text-muted)] font-mono"
                  >
                    {pt.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Panel 2: Roadmap Progress Donut Chart (Top-Right) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Roadmap Progress
            </h3>
            <span className="text-xs text-[var(--text-muted)]">Active Tracks</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-44">
            {/* SVG Donut Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-[var(--border-subtle)]"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Track 1 Segment */}
                {roadmapsList[0] && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke={roadmapsList[0].color}
                    strokeWidth="10"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - (roadmapsList[0].progress || 0) / 100)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700"
                  />
                )}
                {/* Track 2 Segment */}
                {roadmapsList[1] && (
                  <circle
                    cx="50"
                    cy="50"
                    r="26"
                    stroke={roadmapsList[1].color}
                    strokeWidth="8"
                    strokeDasharray="163.3"
                    strokeDashoffset={163.3 * (1 - (roadmapsList[1].progress || 0) / 100)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700"
                  />
                )}
                {/* Track 3 Segment */}
                {roadmapsList[2] && (
                  <circle
                    cx="50"
                    cy="50"
                    r="16"
                    stroke={roadmapsList[2].color}
                    strokeWidth="6"
                    strokeDasharray="100.5"
                    strokeDashoffset={100.5 * (1 - (roadmapsList[2].progress || 0) / 100)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-lg font-bold font-mono text-[var(--text-primary)]">
                  {completionPct}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                  Avg
                </span>
              </div>
            </div>

            {/* Right Legend */}
            <div className="space-y-3 w-full max-w-[200px]">
              {roadmapsList.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic">No active roadmaps found</p>
              ) : (
                roadmapsList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-[var(--text-primary)] truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[var(--text-secondary)]">
                      {item.progress}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panel 3: Focus Time Weekly Bar Chart (Bottom-Left) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Focus Time
            </h3>
            <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">
              {focusHours}h this week
            </span>
          </div>

          <div className="h-40 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {focusDays.map((d, idx) => {
              const heightPct = d.hours > 0 ? Math.min(100, Math.max(15, (d.hours / maxFocusHours) * 100)) : 6;
              const isToday = d.day.toLowerCase() === todayShort.toLowerCase();
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full max-w-[28px] h-full flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isToday
                          ? 'bg-[var(--accent-primary)] shadow-[0_0_12px_rgba(242,169,59,0.35)]'
                          : 'bg-[var(--accent-primary)]/70 hover:bg-[var(--accent-primary)]'
                      }`}
                      title={`${d.day}: ${d.hours} hours`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 4: Activity Heatmap (Bottom-Right) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Activity Heatmap
            </h3>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Nov
            </span>
          </div>

          <div className="h-40 flex flex-col justify-center">
            <div className="grid grid-rows-4 grid-flow-col gap-1.5 justify-center">
              {heatmapCells.map((level, idx) => {
                let cellBg = 'bg-[var(--border-subtle)]/50';
                if (level === 1) cellBg = 'bg-[var(--accent-primary)]/30';
                if (level === 2) cellBg = 'bg-[var(--accent-primary)]/65';
                if (level === 3) cellBg = 'bg-[var(--accent-primary)]';

                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-xs transition hover:scale-125 ${cellBg}`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mt-4 px-4">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--border-subtle)]/50" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-primary)]/30" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-primary)]/65" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-primary)]" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
