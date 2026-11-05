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

  // Primary navigation items matching IMAGE 1 reference icons
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

      {/* Sidebar Container: 68px when collapsed, 240px when expanded */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#FFFFFF] dark:bg-[#171B21] border-r border-[#E4E7E0] dark:border-[#303945] transition-all duration-200 ease-in-out flex flex-col justify-between ${
          isCollapsed ? 'w-[68px]' : 'w-60'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Branding */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between h-14 px-3 border-b border-[#E4E7E0] dark:border-[#303945]">
            <NavLink
              to="/"
              onClick={handleLinkClick}
              className={`flex items-center gap-2.5 overflow-hidden group ${isCollapsed ? 'mx-auto justify-center' : ''}`}
              title="DevPath • Engineering Learning Tracker"
            >
              <DevPathLogo compact={isCollapsed} />
            </NavLink>

            {/* Desktop collapse toggle */}
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="p-2 space-y-1.5 overflow-y-auto flex-1">
            {navItems.map((item) => (
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

            {/* If expanded, optionally show learning tracks hierarchy */}
            {!isCollapsed && (
              <div className="pt-3 border-t border-[#E4E7E0] dark:border-[#303945] mt-2">
                <LearningTracksNav
                  categories={categories}
                  roadmaps={roadmaps}
                  isCollapsed={isCollapsed}
                  onItemClick={handleLinkClick}
                />
              </div>
            )}
          </div>

          {/* Settings pinned at bottom of nav */}
          <div className="p-2 border-t border-[#E4E7E0] dark:border-[#303945]">
            <SidebarItem
              to={settingsNavItem.to}
              icon={settingsNavItem.icon}
              label={settingsNavItem.label}
              isCollapsed={isCollapsed}
              onClick={handleLinkClick}
            />
          </div>
        </div>

        {/* Footer / Expand Toggle when collapsed */}
        {isCollapsed && (
          <div className="p-2 border-t border-[#E4E7E0] dark:border-[#303945] flex justify-center">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
