import React from 'react';

/**
 * DevPath Official Logo & Symbol Component
 * 
 * Represents an engineer's continuous learning journey, technical growth,
 * structured learning, and progress.
 * 
 * @param {boolean} [compact=false] - When true, renders only the geometric symbol (e.g. collapsed sidebar, mobile)
 * @param {'sm'|'md'|'lg'} [size='md'] - Scaling preset
 * @param {string} [className=''] - Additional container classes
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
        className={`${currentSize.symbol} rounded-xl bg-[#244C3B] dark:bg-[#DFD0B8] flex items-center justify-center flex-shrink-0 shadow-xs transition-colors group-hover:bg-[#1A3B2C] dark:group-hover:bg-[#ECE3D4] ${className}`}
        title="DevPath • Engineering Learning Tracker"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-5 h-5 text-[#DFD0B8] dark:text-[#222831]"
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
          <circle cx="6" cy="23" r="2.2" fill="#10B981" />
          <circle cx="12" cy="17" r="1.8" fill="currentColor" />
          <circle cx="18" cy="20" r="1.8" fill="currentColor" />
          <circle cx="25" cy="9" r="2.5" fill="#10B981" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 overflow-hidden ${className}`}>
      {/* Brand Geometric Symbol */}
      <div
        className={`${currentSize.symbol} rounded-xl bg-[#244C3B] dark:bg-[#DFD0B8] flex items-center justify-center flex-shrink-0 shadow-xs transition-colors group-hover:bg-[#1A3B2C] dark:group-hover:bg-[#ECE3D4]`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-5 h-5 text-[#DFD0B8] dark:text-[#222831]"
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
          <circle cx="6" cy="23" r="2.2" fill="#10B981" />
          <circle cx="12" cy="17" r="1.8" fill="currentColor" />
          <circle cx="18" cy="20" r="1.8" fill="currentColor" />
          <circle cx="25" cy="9" r="2.5" fill="#10B981" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col truncate">
        <span
          className={`font-bold ${currentSize.text} tracking-tight text-[#202A23] dark:text-[#DFD0B8] leading-none`}
        >
          Dev<span className="text-[#244C3B] dark:text-[#DFD0B8] font-semibold">Path</span>
        </span>
        <span
          className={`${currentSize.sub} text-[#737C74] dark:text-[#948979] font-medium tracking-wide mt-1 font-mono uppercase`}
        >
          Engineering Tracker
        </span>
      </div>
    </div>
  );
}
