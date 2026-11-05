import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarItem({
  to,
  icon: Icon,
  label,
  badge,
  isCollapsed,
  end = false,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
          isActive
            ? 'bg-amber-500/10 text-[#202620] dark:text-[#F3F4F6] font-semibold'
            : 'text-[#596258] hover:text-[#202620] hover:bg-[#F0F2ED] dark:text-[#B0B7C2] dark:hover:text-[#F3F4F6] dark:hover:bg-[#252C35]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active left indicator */}
          {isActive && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[var(--accent-primary)] rounded-r-md -ml-3" />
          )}

          {Icon && (
            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isActive
                  ? 'text-[var(--accent-primary)]'
                  : 'text-[#858D82] group-hover:text-[#202620] dark:text-[#7F8996] dark:group-hover:text-[#F3F4F6]'
              }`}
            />
          )}

          {!isCollapsed && <span className="truncate flex-1">{label}</span>}

          {!isCollapsed && badge !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                isActive
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : 'bg-[#E4E7E0] text-[#596258] dark:bg-[#252C35] dark:text-[#7F8996]'
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
