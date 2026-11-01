import React from 'react';
import {
  BarChart,
  Bar,
  Cell,
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
          <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
            Weekly Learning Activity
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8] border border-[#C5D9CB] dark:border-[#4F5561]">
            {totalWeeklyCompleted} completed (7d)
          </span>
        </div>
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
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{
                fill: isDark ? '#948979' : '#737C74',
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
                    <div className="bg-[#FFFFFF] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] p-2.5 rounded-lg shadow-md text-xs">
                      <div className="font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-0.5">
                        {dateLabel} {item.isToday ? '(Today)' : ''}
                      </div>
                      <div className="font-mono text-[#244C3B] dark:text-[#DFD0B8] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            >
              {chartData.map((entry, index) => {
                let barColor = isDark ? '#DFD0B8' : '#244C3B';
                if (entry.isToday) {
                  barColor = '#10B981'; // Vibrant emerald highlight for today
                } else if (entry.completed >= 5) {
                  barColor = isDark ? '#ECE3D4' : '#1A3B2C';
                }
                return <Cell key={`cell-${index}`} fill={barColor} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46] flex items-center justify-between text-[11px] text-[#737C74] dark:text-[#948979] font-mono">
        <span>Kolkata Standard Time (IST)</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Today's bar highlighted</span>
        </span>
      </div>
    </div>
  );
}
