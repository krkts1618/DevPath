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
        `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isActive
            ? 'bg-[#E8F0EB] text-[#244C3B] dark:bg-[#393E46] dark:text-[#DFD0B8] font-semibold'
            : 'text-[#4A5749] hover:text-[#202A23] hover:bg-[#F0F0EB] dark:text-[#C8BFB0] dark:hover:text-[#DFD0B8] dark:hover:bg-[#393E46]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {Icon && (
            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isActive
                  ? 'text-[#244C3B] dark:text-[#DFD0B8]'
                  : 'text-[#91A88E] group-hover:text-[#4A5749] dark:text-[#948979] dark:group-hover:text-[#DFD0B8]'
              }`}
            />
          )}

          {!isCollapsed && <span className="truncate flex-1">{label}</span>}

          {!isCollapsed && badge !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                isActive
                  ? 'bg-[#C5D9CB] text-[#1A3B2C] dark:bg-[#4F5561] dark:text-[#DFD0B8]'
                  : 'bg-[#E8E8DF] text-[#737C74] dark:bg-[#393E46] dark:text-[#948979]'
              }`}
            >
              {badge}
            </span>
          )}

          {/* Active indicator bar on left */}
          {isActive && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#244C3B] dark:bg-[#DFD0B8] rounded-r-md -ml-3" />
          )}
        </>
      )}
    </NavLink>
  );
}
