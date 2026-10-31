import React from 'react';

const colorThemes = {
  // Primary accent
  green: {
    iconBg: 'bg-[#E8F0EB] dark:bg-[#393E46] text-[#244C3B] dark:text-[#DFD0B8] border-[#C5D9CB] dark:border-[#4F5561]',
    highlight: 'text-[#244C3B] dark:text-[#DFD0B8]',
  },
  // Keep indigo as alias for migration compat
  indigo: {
    iconBg: 'bg-[#E8F0EB] dark:bg-[#393E46] text-[#244C3B] dark:text-[#DFD0B8] border-[#C5D9CB] dark:border-[#4F5561]',
    highlight: 'text-[#244C3B] dark:text-[#DFD0B8]',
  },
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50',
    highlight: 'text-emerald-700 dark:text-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
    highlight: 'text-amber-700 dark:text-amber-400',
  },
  rose: {
    iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50',
    highlight: 'text-rose-700 dark:text-rose-400',
  },
  sky: {
    iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/50',
    highlight: 'text-sky-700 dark:text-sky-400',
  },
  slate: {
    iconBg: 'bg-[#F0F0EB] dark:bg-[#393E46] text-[#737C74] dark:text-[#948979] border-[#D4D4CA] dark:border-[#4F5561]',
    highlight: 'text-[#737C74] dark:text-[#948979]',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'green',
  badgeText,
  className = '',
}) {
  const theme = colorThemes[color] || colorThemes.green;

  return (
    <div
      className={`bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs transition-all duration-200 hover:border-[#D4D4CA] dark:hover:border-[#4F5561] ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-[#737C74] dark:text-[#948979] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center border ${theme.iconBg}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#202A23] dark:text-[#DFD0B8] font-mono">
          {value}
        </span>
        {badgeText && (
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#737C74] dark:text-[#948979] truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
