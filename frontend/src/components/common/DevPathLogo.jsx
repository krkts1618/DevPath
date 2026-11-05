import React from 'react';

/**
 * DevPath Official Logo & Symbol Component
 * Styled with warm amber and modern technical geometry.
 */
export default function DevPathLogo({
  compact = false,
  size = 'md',
  className = '',
}) {
  const sizeMap = {
    sm: { symbol: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { symbol: 'w-9 h-9', text: 'text-base', sub: 'text-[11px]' },
    lg: { symbol: 'w-11 h-11', text: 'text-xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (compact) {
    return (
      <div
        className={`${currentSize.symbol} rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] flex items-center justify-center flex-shrink-0 shadow-xs transition-transform duration-150 group-hover:scale-105 ${className}`}
        title="DevPath • Engineering Learning Tracker"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-5 h-5"
        >
          {/* Ascending Roadmap Pathway */}
          <path
            d="M6 23L12 17L18 20L25 9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Forward Precision Arrowhead */}
          <path
            d="M20 9H25V14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Milestone Nodes */}
          <circle cx="6" cy="23" r="2" fill="currentColor" />
          <circle cx="12" cy="17" r="1.8" fill="currentColor" />
          <circle cx="18" cy="20" r="1.8" fill="currentColor" />
          <circle cx="25" cy="9" r="2.5" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 overflow-hidden ${className}`}>
      {/* Brand Geometric Symbol */}
      <div
        className={`${currentSize.symbol} rounded-xl bg-[var(--accent-primary)] text-[var(--accent-text)] flex items-center justify-center flex-shrink-0 shadow-xs transition-transform duration-150 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-5 h-5"
        >
          <path
            d="M6 23L12 17L18 20L25 9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 9H25V14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="23" r="2" fill="currentColor" />
          <circle cx="12" cy="17" r="1.8" fill="currentColor" />
          <circle cx="18" cy="20" r="1.8" fill="currentColor" />
          <circle cx="25" cy="9" r="2.5" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col truncate">
        <span
          className={`font-bold ${currentSize.text} tracking-tight text-[#202620] dark:text-[#F3F4F6] leading-none`}
        >
          Dev<span className="text-[var(--accent-primary)] font-semibold">Path</span>
        </span>
        <span
          className={`${currentSize.sub} text-[#858D82] dark:text-[#7F8996] font-medium tracking-wider mt-1 font-mono uppercase`}
        >
          Engineering Tracker
        </span>
      </div>
    </div>
  );
}
