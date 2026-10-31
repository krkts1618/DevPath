import React, { useState } from 'react';
import {
  Clock,
  Timer,
  Calendar,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const PIE_COLORS = ['#244C3B', '#4E6C50', '#91A88E', '#DFD0B8', '#393E46', '#B2B2B2'];

export default function StudyTimeSection({ studyTime }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [trendGranularity, setTrendGranularity] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  if (!studyTime) return null;

  const trendData =
    trendGranularity === 'weekly'
      ? studyTime.weeklyTrend
      : trendGranularity === 'monthly'
      ? studyTime.monthlyTrend
      : studyTime.dailyTrend;

  const xKey =
    trendGranularity === 'weekly'
      ? 'weekLabel'
      : trendGranularity === 'monthly'
      ? 'monthLabel'
      : 'date';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
            Study Time & Deep Work Analytics
          </h2>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-0.5">
            Focus duration from completed study sessions (excluding paused time & discarded sessions)
          </p>
        </div>

        {/* Granularity Toggle */}
        <div className="inline-flex p-0.5 rounded-lg bg-[#E8E8DF]/60 dark:bg-[#393E46]/60 border border-[#E8E8DF] dark:border-[#393E46]">
          {['daily', 'weekly', 'monthly'].map((g) => (
            <button
              key={g}
              onClick={() => setTrendGranularity(g)}
              className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition cursor-pointer ${
                trendGranularity === g
                  ? 'bg-[#FFFFFF] dark:bg-[#2A303A] text-[#244C3B] dark:text-[#DFD0B8] shadow-xs'
                  : 'text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979]">Total Focus Time</div>
          <div className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-1">
            {studyTime.totalFocusedHours}h
          </div>
          <div className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5 font-mono">
            {studyTime.totalFocusedMinutes} minutes recorded
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979]">Daily Average</div>
          <div className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-1">
            {studyTime.averageDailyFocusedMinutes}m
          </div>
          <div className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
            Per active study day
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979]">Avg Session Duration</div>
          <div className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-1">
            {studyTime.averageSessionDurationMinutes}m
          </div>
          <div className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
            Across {studyTime.completedSessionsCount} sessions
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979]">Longest Session</div>
          <div className="text-2xl font-bold font-mono text-[#202A23] dark:text-[#DFD0B8] mt-1">
            {studyTime.longestSessionMinutes}m
          </div>
          <div className="text-[11px] text-[#737C74] dark:text-[#948979] mt-0.5">
            Continuous deep work
          </div>
        </div>
      </div>

      {/* Main Focus Trend Chart */}
      <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
              Focus Duration Trend ({trendGranularity})
            </h3>
          </div>
          <span className="text-xs font-mono text-[#737C74] dark:text-[#948979]">
            Hours logged
          </span>
        </div>

        <div className="h-64 w-full">
          {trendData && trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? '#91A88E' : '#244C3B'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isDark ? '#91A88E' : '#244C3B'} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#393E46' : '#E8E8DF'} vertical={false} />
                <XAxis
                  dataKey={xKey}
                  stroke={isDark ? '#948979' : '#737C74'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (val && val.length > 7 ? val.substring(5) : val)}
                />
                <YAxis stroke={isDark ? '#948979' : '#737C74'} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FFFFFF] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] p-2.5 rounded-lg shadow-md text-xs">
                          <p className="font-bold text-[#202A23] dark:text-[#DFD0B8]">
                            {data[xKey]}
                          </p>
                          <p className="text-[#244C3B] dark:text-[#DFD0B8] font-mono mt-1">
                            Focus: {data.focusHours}h ({data.focusMinutes}m)
                          </p>
                          <p className="text-[#737C74] dark:text-[#948979] text-[10px]">
                            {data.sessionsCount} sessions
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="focusHours"
                  stroke={isDark ? '#91A88E' : '#244C3B'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#focusGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#737C74] dark:text-[#948979]">
              No focus session records found in this timeframe.
            </div>
          )}
        </div>
      </div>

      {/* Grid: 2 Side-by-Side Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Focus Session Duration Histogram */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
              Session Duration Distribution
            </h3>
            <span className="text-xs text-[#737C74] dark:text-[#948979]">
              Session counts
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyTime.durationDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#393E46' : '#E8E8DF'} vertical={false} />
                <XAxis dataKey="bucket" stroke={isDark ? '#948979' : '#737C74'} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? '#948979' : '#737C74'} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FFFFFF] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] p-2 rounded shadow-md text-xs">
                          <p className="font-bold text-[#202A23] dark:text-[#DFD0B8]">{data.bucket}</p>
                          <p className="text-[#244C3B] dark:text-[#DFD0B8] font-mono">{data.count} sessions</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill={isDark ? '#91A88E' : '#244C3B'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Focus Time by Category / Roadmap */}
        <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#202A23] dark:text-[#DFD0B8]">
              Study Time by Domain Category
            </h3>
            <span className="text-xs text-[#737C74] dark:text-[#948979]">
              Minutes distribution
            </span>
          </div>

          {studyTime.categoryDistribution && studyTime.categoryDistribution.length > 0 ? (
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studyTime.categoryDistribution}
                    dataKey="focusMinutes"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {studyTime.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#FFFFFF] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] p-2 rounded shadow-md text-xs">
                            <p className="font-bold text-[#202A23] dark:text-[#DFD0B8]">{data.name}</p>
                            <p className="text-[#244C3B] dark:text-[#DFD0B8] font-mono">
                              {data.focusMinutes}m ({Math.round(data.focusMinutes / 60 * 10) / 10}h)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-[11px] text-[#202A23] dark:text-[#DFD0B8]">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-[#737C74] dark:text-[#948979]">
              No category study time recorded in this period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
