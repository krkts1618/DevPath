import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarItem({
  to,
  icon: Icon,
  label,
  badge,
  end = false,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
          isActive
            ? 'bg-amber-500/10 text-[#202620] dark:text-[#F3F4F6] font-semibold border border-amber-500/20 shadow-xs'
            : 'text-[#596258] dark:text-[#B0B7C2] hover:text-[#202620] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3 min-w-0">
            {/* Active Left Indicator Bar */}
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 bg-[var(--accent-primary)] rounded-r-md" />
            )}

            {Icon && (
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[#858D82] dark:text-[#7F8996] group-hover:text-[#202620] dark:group-hover:text-[#F3F4F6]'
                }`}
              />
            )}

            {/* Name of the page */}
            <span className="truncate">{label}</span>
          </div>

          {/* Optional Badge */}
          {badge !== undefined && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)]'
                  : 'bg-[#E4E7E0] dark:bg-[#252C35] text-[#596258] dark:text-[#7F8996]'
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
