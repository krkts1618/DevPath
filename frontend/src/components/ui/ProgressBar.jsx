import React from 'react';

export default function ProgressBar({
  value = 0,
  showLabel = false,
  size = 'md',
  color = 'green',
  className = '',
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  const sizeStyles = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorStyles = {
    green:   'bg-[#244C3B] dark:bg-[#DFD0B8]',
    indigo:  'bg-[#244C3B] dark:bg-[#DFD0B8]',  // migration compat
    emerald: 'bg-emerald-600 dark:bg-emerald-400',
    amber:   'bg-amber-500 dark:bg-amber-400',
    rose:    'bg-rose-600 dark:bg-rose-400',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="text-[#737C74] dark:text-[#948979] font-medium">Progress</span>
          <span className="text-[#202A23] dark:text-[#DFD0B8] font-semibold">{clamped}%</span>
        </div>
      )}
      <div
        className={`w-full bg-[#E8E8DF] dark:bg-[#393E46] rounded-full overflow-hidden ${
          sizeStyles[size] || sizeStyles.md
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            colorStyles[color] || colorStyles.green
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
