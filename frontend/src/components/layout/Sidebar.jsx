import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Compass,
  BarChart2,
  FileText,
  RotateCcw,
  FolderGit2,
  Settings,
  Timer,
  Bell,
  X,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import DevPathLogo from '../common/DevPathLogo';
import SidebarItem from './SidebarItem';

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  roadmaps = [],
}) {
  const { unreadCount } = useNotifications();

  // All 10 functional pages with names & icons
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/planner', label: 'Daily Planner', icon: CalendarCheck },
    { to: '/roadmaps', label: 'My Roadmaps', icon: Compass, badge: roadmaps.length || undefined },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/revision', label: 'Revision Schedule', icon: RotateCcw },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/focus', label: 'Focus Timer', icon: Timer },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
  ];

  const settingsNavItem = { to: '/settings', label: 'Settings', icon: Settings };

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar: Width 240px with Page Names */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#FFFFFF] dark:bg-[#171B21] border-r border-[#E4E7E0] dark:border-[#303945] transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Branding */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between h-14 px-4 border-b border-[#E4E7E0] dark:border-[#303945]">
            <NavLink
              to="/"
              onClick={handleLinkClick}
              className="flex items-center gap-3 overflow-hidden group"
              title="DevPath • Engineering Learning Tracker"
            >
              <DevPathLogo />
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="p-3 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#858D82] dark:text-[#7F8996] font-mono">
              Workspace
            </div>

            {navItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
                end={item.end}
                onClick={handleLinkClick}
              />
            ))}
          </div>

          {/* Settings pinned near bottom */}
          <div className="p-3 border-t border-[#E4E7E0] dark:border-[#303945]">
            <SidebarItem
              to={settingsNavItem.to}
              icon={settingsNavItem.icon}
              label={settingsNavItem.label}
              onClick={handleLinkClick}
            />
          </div>
        </div>

        {/* Footer / Database Status */}
        <div className="p-3 border-t border-[#E4E7E0] dark:border-[#303945] bg-[#F8F9F6] dark:bg-[#12151A]/80">
          <div className="flex items-center justify-between text-[11px] text-[#858D82] dark:text-[#7F8996]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate font-medium">PostgreSQL Live</span>
            </div>
            <span className="font-mono text-[10px] shrink-0">IST (+5:30)</span>
          </div>
        </div>
      </aside>
    </>
  );
}
