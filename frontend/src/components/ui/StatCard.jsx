import React from 'react';

const colorThemes = {
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    highlight: 'text-amber-600 dark:text-amber-400',
  },
  green: {
    iconBg: 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border-[var(--accent-primary)]/20',
    highlight: 'text-[var(--accent-primary)]',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    highlight: 'text-emerald-600 dark:text-emerald-400',
  },
  rose: {
    iconBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    highlight: 'text-red-600 dark:text-red-400',
  },
  sky: {
    iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    highlight: 'text-sky-600 dark:text-sky-400',
  },
  slate: {
    iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    highlight: 'text-slate-600 dark:text-slate-400',
  },
  indigo: {
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    highlight: 'text-indigo-600 dark:text-indigo-400',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'amber',
  badgeText,
  className = '',
  children,
}) {
  const theme = colorThemes[color] || colorThemes.amber;

  return (
    <div
      className={`bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs transition-all duration-200 hover:border-[#D5DBD1] dark:hover:border-[#3A4552] ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-[#858D82] dark:text-[#7F8996] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${theme.iconBg}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-[#202620] dark:text-[#F3F4F6] font-mono">
          {value}
        </div>
        {badgeText && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-[#596258] dark:text-[#B0B7C2] mt-1 line-clamp-1">
          {subtitle}
        </p>
      )}

      {children && <div className="mt-3 pt-3 border-t border-[#E4E7E0] dark:border-[#303945]">{children}</div>}
    </div>
  );
}
