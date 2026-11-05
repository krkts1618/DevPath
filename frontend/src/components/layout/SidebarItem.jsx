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
      className={({ isActive }) =>
        `group relative flex items-center transition-all duration-150 ${
          isCollapsed
            ? `w-10 h-10 mx-auto justify-center rounded-xl ${
                isActive
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] shadow-xs border border-[var(--accent-primary)]/30'
                  : 'text-[#858D82] dark:text-[#7F8996] hover:text-[#202620] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
              }`
            : `gap-3 px-3 py-2 rounded-xl text-xs font-medium ${
                isActive
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-semibold border border-[var(--accent-primary)]/20'
                  : 'text-[#596258] dark:text-[#B0B7C2] hover:text-[#202620] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35]'
              }`
        }`
      }
    >
      {({ isActive }) => (
        <>
          {Icon && (
            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isActive
                  ? 'text-[var(--accent-primary)]'
                  : 'text-[#858D82] dark:text-[#7F8996] group-hover:text-[#202620] dark:group-hover:text-[#F3F4F6]'
              }`}
            />
          )}

          {!isCollapsed && <span className="truncate flex-1">{label}</span>}

          {!isCollapsed && badge !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-medium ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-text)]'
                  : 'bg-[#E4E7E0] dark:bg-[#252C35] text-[#596258] dark:text-[#7F8996]'
              }`}
            >
              {badge}
            </span>
          )}

          {/* Floating Tooltip in collapsed mode */}
          {isCollapsed && (
            <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-[#1D232B] text-white text-[11px] font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 border border-[#303945]">
              {label}
              {badge !== undefined && ` (${badge})`}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}
