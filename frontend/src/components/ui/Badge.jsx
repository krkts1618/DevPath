import React from 'react';

const typeStyles = {
  // Task & Day types
  learn:      'bg-[#E8F0EB] text-[#244C3B] border-[#C5D9CB] dark:bg-[#393E46] dark:text-[#DFD0B8] dark:border-[#4F5561]',
  learning:   'bg-[#E8F0EB] text-[#244C3B] border-[#C5D9CB] dark:bg-[#393E46] dark:text-[#DFD0B8] dark:border-[#4F5561]',
  code:       'bg-[#EBF5F0] text-[#1D5C42] border-[#BFDFCD] dark:bg-[#393E46] dark:text-[#DFD0B8] dark:border-[#4F5561]',
  practice:   'bg-violet-50 text-violet-700 border-violet-200 dark:bg-[#393E46] dark:text-[#DFD0B8] dark:border-[#4F5561]',
  revise:     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  revision:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  project:    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  assessment: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',

  // Statuses
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  paused:    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  completed: 'bg-[#E8F0EB] text-[#244C3B] border-[#C5D9CB] dark:bg-[#393E46] dark:text-[#DFD0B8] dark:border-[#4F5561]',
  archived:  'bg-[#F0F0EB] text-[#737C74] border-[#D4D4CA] dark:bg-[#2A303A] dark:text-[#948979] dark:border-[#393E46]',
  planned:   'bg-[#F0F0EB] text-[#737C74] border-[#D4D4CA] dark:bg-[#2A303A] dark:text-[#948979] dark:border-[#393E46]',

  // General variants
  primary: 'bg-[#E8F0EB] text-[#244C3B] border-[#C5D9CB] dark:bg-[#393E46] dark:text-[#DFD0B8] dark:border-[#4F5561]',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  danger:  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
  neutral: 'bg-[#F0F0EB] text-[#737C74] border-[#D4D4CA] dark:bg-[#2A303A] dark:text-[#948979] dark:border-[#393E46]',
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
