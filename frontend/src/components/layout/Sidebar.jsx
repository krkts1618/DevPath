import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Compass,
  BarChart2,
  FileText,
  Clock,
  FolderGit2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Timer,
  Bell,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import DevPathLogo from '../common/DevPathLogo';
import SidebarItem from './SidebarItem';
import LearningTracksNav from './LearningTracksNav';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  categories = [],
  roadmaps = [],
}) {
  const { unreadCount } = useNotifications();

  const mainNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/planner', label: 'Daily Planner', icon: CalendarCheck },
    { to: '/focus', label: 'Focus Timer', icon: Timer },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/roadmaps', label: 'My Roadmaps', icon: Compass, badge: roadmaps.length || undefined },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/revision', label: 'Revision Schedule', icon: Clock },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

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
          className="fixed inset-0 bg-[#202A23]/50 dark:bg-black/70 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#FFFFFF] dark:bg-[#222831] border-r border-[#E8E8DF] dark:border-[#393E46] transition-all duration-200 ease-in-out flex flex-col justify-between ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#E8E8DF] dark:border-[#393E46]">
            <NavLink
              to="/"
              onClick={handleLinkClick}
              className="flex items-center gap-3 overflow-hidden group"
              title="DevPath • Engineering Learning Tracker"
            >
              <DevPathLogo compact={isCollapsed} />
            </NavLink>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div className="space-y-0.5">
              {mainNavItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  isCollapsed={isCollapsed}
                  end={item.end}
                  onClick={handleLinkClick}
                />
              ))}
            </div>

            {/* Dynamic Learning Tracks Section */}
            <LearningTracksNav
              categories={categories}
              roadmaps={roadmaps}
              isCollapsed={isCollapsed}
              onItemClick={handleLinkClick}
            />
          </div>
        </div>

        {/* Footer / System Status */}
        <div className="p-3 border-t border-[#E8E8DF] dark:border-[#393E46] bg-[#F7F7F2] dark:bg-[#1D222A]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between text-[11px] text-[#737C74] dark:text-[#948979]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="truncate">Supabase PostgreSQL</span>
              </div>
              <span className="font-mono text-[10px] text-[#737C74] dark:text-[#948979] flex-shrink-0">
                IST (UTC+5:30)
              </span>
            </div>
          ) : (
            <div className="flex justify-center" title="PostgreSQL Connected • Asia/Kolkata">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
