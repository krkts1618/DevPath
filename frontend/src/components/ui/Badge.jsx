import React from 'react';

const typeStyles = {
  // Task & Day types
  learn:      'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  learning:   'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  code:       'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  practice:   'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  revise:     'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  revision:   'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  project:    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  assessment: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',

  // Statuses
  active:    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium',
  paused:    'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  archived:  'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  planned:   'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',

  // General variants
  primary: 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border-[var(--accent-primary)]/30',
  amber:   'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  danger:  'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  neutral: 'bg-[#F0F2ED] text-[#596258] border-[#E4E7E0] dark:bg-[#252C35] dark:text-[#B0B7C2] dark:border-[#303945]',
};

export default function Badge({
  children,
  variant,
  type,
  size = 'sm',
  className = '',
}) {
  const key = (type || variant || 'neutral').toLowerCase();
  const colorClass = typeStyles[key] || typeStyles.neutral;
  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass} tracking-wide uppercase font-mono ${className}`}
    >
      {children || key}
    </span>
  );
}
