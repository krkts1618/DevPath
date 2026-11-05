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

  // Primary navigation items
  const mainNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/planner', label: 'Daily Planner', icon: CalendarCheck },
    { to: '/focus', label: 'Focus Timer', icon: Timer },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  const learningNavItems = [
    { to: '/roadmaps', label: 'My Roadmaps', icon: Compass, badge: roadmaps.length || undefined },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/revision', label: 'Revision Schedule', icon: Clock },
  ];

  const workspaceNavItems = [
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
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

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#FFFFFF] dark:bg-[#171B21] border-r border-[#E4E7E0] dark:border-[#303945] transition-all duration-200 ease-in-out flex flex-col justify-between ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Branding */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#E4E7E0] dark:border-[#303945]">
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
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="p-3 space-y-4 overflow-y-auto flex-1">
            {/* Core Management */}
            <div className="space-y-0.5">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-[#858D82] dark:text-[#7F8996] uppercase tracking-wider font-mono">
                  Main
                </span>
              )}
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

            {/* Learning Workspace */}
            <div className="space-y-0.5">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-[#858D82] dark:text-[#7F8996] uppercase tracking-wider font-mono">
                  Learning
                </span>
              )}
              {learningNavItems.map((item) => (
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

            {/* Workspace / Projects */}
            <div className="space-y-0.5">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold text-[#858D82] dark:text-[#7F8996] uppercase tracking-wider font-mono">
                  Workspace
                </span>
              )}
              {workspaceNavItems.map((item) => (
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

          {/* Preferences / Settings pinned before footer */}
          <div className="p-3 pt-2 border-t border-[#E4E7E0] dark:border-[#303945]">
            <SidebarItem
              to={settingsNavItem.to}
              icon={settingsNavItem.icon}
              label={settingsNavItem.label}
              isCollapsed={isCollapsed}
              onClick={handleLinkClick}
            />
          </div>
        </div>

        {/* Footer / System Status */}
        <div className="p-3 border-t border-[#E4E7E0] dark:border-[#303945] bg-[#F8F9F6] dark:bg-[#12151A]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between text-[11px] text-[#858D82] dark:text-[#7F8996]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="truncate font-medium">Supabase PostgreSQL</span>
              </div>
              <span className="font-mono text-[10px] text-[#858D82] dark:text-[#7F8996] flex-shrink-0">
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
