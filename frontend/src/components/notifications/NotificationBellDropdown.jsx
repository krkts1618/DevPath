import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Flame,
  Clock,
  AlertTriangle,
  AlertCircle,
  Timer,
  FolderGit2,
  BookOpen,
  Settings,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export function getNotificationMeta(type) {
  switch (type) {
    case 'learning_reminder':
      return { icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' };
    case 'missed_task':
      return { icon: AlertCircle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
    case 'streak_progress':
      return { icon: Flame, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' };
    case 'revision_due':
      return { icon: Clock, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800' };
    case 'revision_overdue':
      return { icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' };
    case 'focus_completed':
      return { icon: Timer, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' };
    case 'project_deadline':
      return { icon: FolderGit2, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' };
    default:
      return { icon: Bell, color: 'text-[#596258] bg-[#F0F0EB] dark:text-[#F3F4F6] dark:bg-[#303945] border-[#E4E7E0] dark:border-[#303945]' };
  }
}

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export default function NotificationBellDropdown() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Fetch recent notifications when dropdown opens
  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications({ limit: 10 });
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const displayedNotifications = (notifications || []).filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F0EB] dark:hover:bg-[#303945] transition-colors cursor-pointer"
        aria-label="Open notifications"
        title="Notifications"
      >
        <Bell className="w-4 h-4 text-[#596258] dark:text-[#F3F4F6]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center border-2 border-[#F7F7F2] dark:border-[#222831] shadow-xs animate-in zoom-in-75">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] shadow-xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E7E0] dark:border-[#303945] bg-[#F7F7F2] dark:bg-[#222831]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/10 dark:bg-[#F3F4F6]/10 text-[var(--accent-primary)] dark:text-[#F3F4F6] text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] p-1 rounded hover:bg-[#E4E7E0] dark:hover:bg-[#303945] transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications?tab=preferences');
                }}
                className="p-1 text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] rounded hover:bg-[#E4E7E0] dark:hover:bg-[#303945] transition"
                title="Notification preferences"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#E4E7E0] dark:border-[#303945] bg-[#FFFFFF] dark:bg-[#1D232B] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-[var(--accent-primary)] text-white dark:bg-[#F3F4F6] dark:text-[#222831]'
                  : 'text-[#858D82] dark:text-[#7F8996] hover:bg-[#F0F0EB] dark:hover:bg-[#303945]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                filter === 'unread'
                  ? 'bg-[var(--accent-primary)] text-white dark:bg-[#F3F4F6] dark:text-[#222831]'
                  : 'text-[#858D82] dark:text-[#7F8996] hover:bg-[#F0F0EB] dark:hover:bg-[#303945]'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E4E7E0] dark:divide-[#303945]">
            {displayedNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#858D82] dark:text-[#7F8996]">
                <Bell className="w-6 h-6 mx-auto mb-2 text-[#91A88E] opacity-50" />
                <p className="font-medium">No notifications</p>
                <p className="text-[11px] mt-0.5 opacity-75">
                  {filter === 'unread' ? 'All caught up!' : 'Reminders and alerts will appear here.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const meta = getNotificationMeta(notif.notificationType);
                const IconComponent = meta.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative p-3 flex items-start gap-3 transition cursor-pointer ${
                      notif.isRead
                        ? 'bg-transparent hover:bg-[#F7F7F2] dark:hover:bg-[#222831]'
                        : 'bg-[#F0F5F2] dark:bg-[#243128]/40 hover:bg-[#E8F0EB] dark:hover:bg-[#29382F]'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${meta.color}`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs truncate ${
                            notif.isRead
                              ? 'font-medium text-[#596258] dark:text-[#B0B7C2]'
                              : 'font-bold text-[#202620] dark:text-[#F3F4F6]'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#858D82] dark:text-[#7F8996] shrink-0 font-mono">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#858D82] dark:text-[#7F8996] line-clamp-2 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>

                    {/* Right action dots / delete */}
                    <div className="shrink-0 flex items-center gap-1 mt-1">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] dark:bg-[#F3F4F6] shrink-0" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#858D82] hover:text-rose-500 rounded transition"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-[#E4E7E0] dark:border-[#303945] bg-[#F7F7F2] dark:bg-[#222831] text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="w-full py-1.5 text-xs font-semibold text-[var(--accent-primary)] dark:text-[#F3F4F6] hover:underline cursor-pointer"
            >
              View All Notifications &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
