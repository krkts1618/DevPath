import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { formatKolkataDate } from '../../utils/date.util';

export default function ActivityChart({ data = [] }) {
  const { isDark } = useTheme();

  const chartData =
    data.length > 0
      ? data
      : [
          { day: 'Mon', completed: 0, date: '' },
          { day: 'Tue', completed: 0, date: '' },
          { day: 'Wed', completed: 0, date: '' },
          { day: 'Thu', completed: 0, date: '' },
          { day: 'Fri', completed: 0, date: '' },
          { day: 'Sat', completed: 0, date: '' },
          { day: 'Sun', completed: 0, date: '' },
        ];

  const totalWeeklyCompleted = chartData.reduce((acc, item) => acc + (item.completed || 0), 0);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono">
            Weekly Consistency
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            {totalWeeklyCompleted} completed
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#303945' : '#E4E7E0'}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: isDark ? '#7F8996' : '#858D82',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{
                fill: isDark ? '#7F8996' : '#858D82',
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const dateLabel = item.date
                    ? formatKolkataDate(item.date, { weekday: 'short', month: 'short', day: 'numeric' })
                    : item.day;
                  return (
                    <div className="bg-[#FFFFFF] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] p-2.5 rounded-lg shadow-lg text-xs font-mono">
                      <div className="font-semibold text-[#202620] dark:text-[#F3F4F6] mb-0.5">
                        {dateLabel} {item.isToday ? '(Today)' : ''}
                      </div>
                      <div className="text-[var(--accent-primary)] flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                        <span>{item.completed} {item.completed === 1 ? 'task' : 'tasks'} completed</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="completed"
              fill={isDark ? '#F2A93B' : '#C77B16'}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
