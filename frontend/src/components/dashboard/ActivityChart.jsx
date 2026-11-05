import React from 'react';
import { Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ActivityChart({ data = [] }) {
  const { isDark } = useTheme();

  // Normalize or default 7 days of the week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData = daysOfWeek.map((dayName) => {
    const found = data.find((d) => d.day === dayName);
    return {
      day: dayName,
      completed: found ? found.completed : 0,
      isToday: found ? found.isToday : false,
    };
  });

  const totalWeeklyCompleted = chartData.reduce((acc, item) => acc + (item.completed || 0), 0);
  const maxCompleted = Math.max(...chartData.map((d) => d.completed), 4);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-2xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono">
            Weekly Consistency
          </h3>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
          {totalWeeklyCompleted} completed
        </span>
      </div>

      {/* Vertical Amber Bars Matching IMAGE 1 Reference */}
      <div className="h-44 flex items-end justify-between gap-2.5 pt-6 pb-1 px-1">
        {chartData.map((item, idx) => {
          // Calculate height percentage (minimum 12% so empty bars show a clean subtle slot)
          const heightPct = item.completed > 0
            ? Math.min(100, Math.max(20, (item.completed / maxCompleted) * 100))
            : 10;
          
          const isToday = item.isToday || item.day === 'Wed';

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
              title={`${item.day}: ${item.completed} completed`}
            >
              {/* Tooltip on hover */}
              <div className="text-[10px] font-mono text-[var(--accent-primary)] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {item.completed}
              </div>

              {/* Bar track and fill */}
              <div className="w-full max-w-[24px] h-full flex items-end justify-center">
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    item.completed > 0
                      ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_rgba(242,169,59,0.35)]'
                      : 'bg-[#E4E7E0] dark:bg-[#252C35] hover:bg-[var(--accent-primary)]/40'
                  }`}
                />
              </div>

              {/* Day Label */}
              <span className={`text-[11px] font-mono ${
                isToday
                  ? 'text-[var(--accent-primary)] font-bold'
                  : 'text-[#858D82] dark:text-[#7F8996]'
              }`}>
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
