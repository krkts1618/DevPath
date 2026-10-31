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

export default function ActivityChart({ data = [] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData =
    data.length > 0
      ? data
      : [
          { day: 'Mon', completed: 0 },
          { day: 'Tue', completed: 0 },
          { day: 'Wed', completed: 0 },
          { day: 'Thu', completed: 0 },
          { day: 'Fri', completed: 0 },
          { day: 'Sat', completed: 0 },
          { day: 'Sun', completed: 0 },
        ];

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
          <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
            Weekly Learning Activity
          </h3>
        </div>
        <span className="text-[11px] text-[#737C74] dark:text-[#948979] font-mono">
          Last 7 Days
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#393E46' : '#E8E8DF'}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: isDark ? '#948979' : '#737C74',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{
                fill: isDark ? '#948979' : '#737C74',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#393E46' : '#FFFFFF',
                borderColor: isDark ? '#4F5561' : '#E8E8DF',
                borderRadius: '8px',
                color: isDark ? '#DFD0B8' : '#202A23',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(val) => [`${val} tasks`, 'Completed']}
            />
            <Bar
              dataKey="completed"
              fill={isDark ? '#DFD0B8' : '#244C3B'}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46] text-center">
        <p className="text-[11px] text-[#737C74] dark:text-[#948979] font-mono">
          Task completion velocity is recorded live from PostgreSQL completion logs.
        </p>
      </div>
    </div>
  );
}
