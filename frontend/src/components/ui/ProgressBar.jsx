import React from 'react';

export default function ProgressBar({
  value = 0,
  showLabel = false,
  size = 'md',
  color = 'amber',
  className = '',
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  const sizeStyles = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  const colorStyles = {
    amber:   'bg-[var(--accent-primary)]',
    primary: 'bg-[var(--accent-primary)]',
    green:   'bg-[var(--accent-primary)]', // migration compat
    indigo:  'bg-[var(--accent-primary)]', // migration compat
    emerald: 'bg-emerald-500',
    rose:    'bg-red-500',
    blue:    'bg-blue-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="text-[#858D82] dark:text-[#7F8996] font-medium">Progress</span>
          <span className="text-[#202620] dark:text-[#F3F4F6] font-mono font-semibold">{clamped}%</span>
        </div>
      )}
      <div
        className={`w-full bg-[#E4E7E0] dark:bg-[#252C35] rounded-full overflow-hidden ${
          sizeStyles[size] || sizeStyles.md
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            colorStyles[color] || colorStyles.amber
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
