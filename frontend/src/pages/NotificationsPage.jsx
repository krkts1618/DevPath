import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Clock,
  Flame,
  Check,
  CheckCheck,
  Trash2,
  Plus,
  Settings,
  BookOpen,
  AlertCircle,
  AlertTriangle,
  FolderGit2,
  Timer,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Moon,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { notificationService } from '../services/notificationService';
import { getNotificationMeta, formatTimeAgo } from '../components/notifications/NotificationBellDropdown';
import Button from '../components/ui/Button';

const WEEKDAY_NAMES = [
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
];

export default function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'notifications';

  const {
    notifications,
    unreadCount,
    preferences,
    browserPermission,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
    updatePreferences,
    requestBrowserPermission,
    sendBrowserNotification,
    playNotificationSound,
  } = useNotifications();

  // Filters & Pagination for Notifications
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Schedules state
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    reminderTime: '07:00',
    weekdays: [1, 2, 3, 4, 5],
    category: 'daily_study',
    customMessage: '',
    isActive: true,
  });

  // Daily Digest state
  const [digest, setDigest] = useState(null);
  const [digestLoading, setDigestLoading] = useState(false);

  // Load notifications when tab or filters change
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        isRead: readFilter !== 'all' ? readFilter === 'read' : undefined,
        search: searchQuery.trim() || undefined,
        page,
        limit: 15,
      }).then((data) => {
        if (data) setTotalPages(data.totalPages || 1);
      });
    } else if (activeTab === 'schedules') {
      loadSchedules();
    } else if (activeTab === 'digest') {
      loadDailyDigest();
    }
  }, [activeTab, typeFilter, readFilter, searchQuery, page]);

  const loadSchedules = async () => {
    setSchedulesLoading(true);
    try {
      const res = await notificationService.getSchedules();
      setSchedules(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const loadDailyDigest = async () => {
    setDigestLoading(true);
    try {
      const res = await notificationService.getDailyDigest();
      setDigest(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load daily digest:', err);
    } finally {
      setDigestLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  // Schedule Modal Handlers
  const handleOpenAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({
      title: '',
      reminderTime: '07:00',
      weekdays: [1, 2, 3, 4, 5],
      category: 'daily_study',
      customMessage: '',
      isActive: true,
    });
    setShowScheduleModal(true);
  };

  const handleOpenEditSchedule = (s) => {
    setEditingSchedule(s);
    setScheduleForm({
      title: s.title,
      reminderTime: s.reminderTime,
      weekdays: Array.isArray(s.weekdays) ? s.weekdays : [0, 1, 2, 3, 4, 5, 6],
      category: s.category,
      customMessage: s.customMessage || '',
      isActive: s.isActive,
    });
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await notificationService.updateSchedule(editingSchedule.id, scheduleForm);
      } else {
        await notificationService.createSchedule(scheduleForm);
      }
      setShowScheduleModal(false);
      loadSchedules();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this reminder schedule?')) return;
    try {
      await notificationService.deleteSchedule(id);
      loadSchedules();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleToggleSchedule = async (id) => {
    try {
      await notificationService.toggleSchedule(id);
      loadSchedules();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const toggleWeekday = (dayNum) => {
    setScheduleForm((prev) => {
      const current = prev.weekdays || [];
      if (current.includes(dayNum)) {
        if (current.length === 1) return prev; // Keep at least one
        return { ...prev, weekdays: current.filter((d) => d !== dayNum) };
      } else {
        return { ...prev, weekdays: [...current, dayNum].sort((a, b) => a - b) };
      }
    });
  };

  // Preferences Toggles
  const handleTogglePreference = async (field, value) => {
    try {
      await updatePreferences({ [field]: value });
    } catch (err) {
      console.error('Failed to update preference:', err);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      await notificationService.createTestNotification({
        title: 'DevPath Test Reminder',
        description: 'Your notification system is fully operational in Asia/Kolkata.',
        notificationType: 'system',
        actionUrl: '/notifications',
      });
      playNotificationSound();
      sendBrowserNotification('DevPath Test Reminder', {
        body: 'Your notification system is fully operational in Asia/Kolkata.',
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#202A23] dark:text-[#DFD0B8]">
              Notification Center & Reminders
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-xs font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#737C74] dark:text-[#948979] mt-1">
            Manage learning reminders, spaced repetition alerts, quiet hours, and daily digests in Asia/Kolkata.
          </p>
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2">
          {activeTab === 'schedules' && (
            <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddSchedule}>
              New Schedule
            </Button>
          )}
          {activeTab === 'notifications' && unreadCount > 0 && (
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          {activeTab === 'notifications' && (
            <Button variant="outline" size="sm" icon={Trash2} onClick={clearRead}>
              Clear Read
            </Button>
          )}
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E8DF] dark:border-[#393E46] overflow-x-auto pb-px">
        <button
          onClick={() => handleTabChange('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-[#244C3B] dark:border-[#DFD0B8] text-[#244C3B] dark:text-[#DFD0B8]'
              : 'border-transparent text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => handleTabChange('schedules')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'schedules'
              ? 'border-[#244C3B] dark:border-[#DFD0B8] text-[#244C3B] dark:text-[#DFD0B8]'
              : 'border-transparent text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Schedules</span>
        </button>

        <button
          onClick={() => handleTabChange('digest')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'digest'
              ? 'border-[#244C3B] dark:border-[#DFD0B8] text-[#244C3B] dark:text-[#DFD0B8]'
              : 'border-transparent text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Daily Digest</span>
        </button>

        <button
          onClick={() => handleTabChange('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-[#244C3B] dark:border-[#DFD0B8] text-[#244C3B] dark:text-[#DFD0B8]'
              : 'border-transparent text-[#737C74] dark:text-[#948979] hover:text-[#202A23] dark:hover:text-[#DFD0B8]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferences & Quiet Hours</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NOTIFICATIONS LIST                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737C74] dark:text-[#948979]" />
              <input
                type="text"
                placeholder="Search alerts by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden focus:border-[#244C3B] dark:focus:border-[#DFD0B8]"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden"
              >
                <option value="all">All Types</option>
                <option value="learning_reminder">Learning Reminders</option>
                <option value="missed_task">Pending Tasks</option>
                <option value="streak_progress">Streak Progress</option>
                <option value="revision_due">Revision Due</option>
                <option value="revision_overdue">Revision Overdue</option>
                <option value="focus_completed">Focus Sessions</option>
                <option value="project_deadline">Project Deadlines</option>
                <option value="system">System Alerts</option>
              </select>

              <select
                value={readFilter}
                onChange={(e) => {
                  setReadFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl overflow-hidden divide-y divide-[#E8E8DF] dark:divide-[#393E46] shadow-xs">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#737C74] dark:text-[#948979]">
                <Bell className="w-8 h-8 mx-auto mb-3 text-[#91A88E] opacity-50" />
                <p className="text-sm font-semibold text-[#202A23] dark:text-[#DFD0B8]">
                  No notifications match your filters
                </p>
                <p className="mt-1">
                  Alerts generated by your learning progress and scheduled reminders appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const meta = getNotificationMeta(notif.notificationType);
                const IconComponent = meta.icon;

                return (
                  <div
                    key={notif.id}
                    className={`p-4 flex items-start gap-4 transition group ${
                      notif.isRead
                        ? 'bg-transparent hover:bg-[#F7F7F2] dark:hover:bg-[#222831]'
                        : 'bg-[#F0F5F2] dark:bg-[#243128]/40 hover:bg-[#E8F0EB] dark:hover:bg-[#29382F]'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${meta.color}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm ${
                              notif.isRead
                                ? 'font-medium text-[#202A23] dark:text-[#DFD0B8]'
                                : 'font-bold text-[#202A23] dark:text-[#DFD0B8]'
                            }`}
                          >
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8E8DF] text-[#4A5749] dark:bg-[#393E46] dark:text-[#DFD0B8] uppercase">
                            {notif.notificationType.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-[#737C74] dark:text-[#948979] font-mono">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-[#4A5749] dark:text-[#C8BFB0] leading-relaxed mb-2.5">
                        {notif.description}
                      </p>

                      {/* Action Links & Footer */}
                      <div className="flex items-center gap-3">
                        {notif.actionUrl && (
                          <button
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif.id);
                              navigate(notif.actionUrl);
                            }}
                            className="text-xs font-semibold text-[#244C3B] dark:text-[#DFD0B8] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open in App</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        {!notif.isRead ? (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-xs text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] flex items-center gap-1 transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark read</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#737C74] dark:text-[#948979] flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Read</span>
                          </span>
                        )}

                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-xs text-[#737C74] hover:text-rose-500 dark:text-[#948979] dark:hover:text-rose-400 flex items-center gap-1 transition ml-auto cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#737C74] dark:text-[#948979]">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REMINDER SCHEDULES                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#202A23] dark:text-[#DFD0B8]">
                Recurring Study Schedules
              </h3>
              <p className="text-xs text-[#737C74] dark:text-[#948979] mt-0.5">
                Configure automatic study time reminders evaluated within the Asia/Kolkata timezone.
              </p>
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddSchedule}>
              Add Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((s) => (
              <div
                key={s.id}
                className={`bg-[#FFFFFF] dark:bg-[#2A303A] border rounded-xl p-5 transition shadow-xs flex flex-col justify-between ${
                  s.isActive
                    ? 'border-[#E8E8DF] dark:border-[#393E46]'
                    : 'border-dashed border-[#E8E8DF] dark:border-[#393E46] opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-bold text-[#244C3B] dark:text-[#DFD0B8]">
                        {s.reminderTime}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0F0EB] text-[#4A5749] dark:bg-[#393E46] dark:text-[#DFD0B8] uppercase">
                        {s.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleSchedule(s.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        s.isActive ? 'bg-[#244C3B] dark:bg-[#DFD0B8]' : 'bg-[#E8E8DF] dark:bg-[#393E46]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#222831] shadow-sm ring-0 transition duration-200 ease-in-out ${
                          s.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                    {s.title}
                  </h4>
                  {s.customMessage && (
                    <p className="text-xs text-[#737C74] dark:text-[#948979] mb-3 line-clamp-2">
                      "{s.customMessage}"
                    </p>
                  )}

                  {/* Weekday indicators */}
                  <div className="flex items-center gap-1.5 my-3">
                    {WEEKDAY_NAMES.map(({ day, label }) => {
                      const isSelected = Array.isArray(s.weekdays) && s.weekdays.includes(day);
                      return (
                        <span
                          key={day}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                              : 'bg-[#F0F0EB] text-[#737C74] dark:bg-[#222831] dark:text-[#948979]'
                          }`}
                        >
                          {label[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E8DF] dark:border-[#393E46] flex items-center justify-between text-[11px] text-[#737C74] dark:text-[#948979]">
                  <span>
                    Status: <strong className="capitalize">{s.lastStatus || 'active'}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditSchedule(s)}
                      className="text-[#244C3B] dark:text-[#DFD0B8] font-semibold hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="text-rose-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {schedules.length === 0 && (
            <div className="py-12 text-center text-xs text-[#737C74] dark:text-[#948979] bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl">
              <Clock className="w-8 h-8 mx-auto mb-2 text-[#91A88E] opacity-50" />
              <p className="font-semibold text-sm text-[#202A23] dark:text-[#DFD0B8]">
                No reminder schedules configured
              </p>
              <p className="mt-1">
                Create a recurring daily reminder (e.g. 7:00 AM study kickoff).
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DAILY DIGEST                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'digest' && (
        <div className="space-y-6">
          {digestLoading ? (
            <div className="py-16 text-center text-xs text-[#737C74] dark:text-[#948979]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#91A88E]" />
              Compiling daily learning digest...
            </div>
          ) : digest ? (
            <>
              {/* Digest Overview Card */}
              <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E8DF] dark:border-[#393E46]">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#91A88E] dark:text-[#A4B99C]">
                      Engineering Daily Briefing
                    </span>
                    <h3 className="text-lg font-bold text-[#202A23] dark:text-[#DFD0B8]">
                      Today's Learning Digest ({digest.todayStr})
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#737C74] dark:text-[#948979]">
                      Digest Time: <strong>{preferences?.dailyDigestTime || '08:00'} IST</strong>
                    </span>
                    <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadDailyDigest}>
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* 4-Stat Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                  <div className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                    <span className="text-[10px] font-bold text-[#737C74] dark:text-[#948979] uppercase block">
                      Scheduled Today
                    </span>
                    <span className="text-lg font-mono font-bold text-[#244C3B] dark:text-[#DFD0B8]">
                      {digest.summary.scheduledTodayCount} tasks
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                    <span className="text-[10px] font-bold text-[#737C74] dark:text-[#948979] uppercase block">
                      Carried Forward
                    </span>
                    <span className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400">
                      {digest.summary.carriedForwardCount} tasks
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                    <span className="text-[10px] font-bold text-[#737C74] dark:text-[#948979] uppercase block">
                      Due Revisions
                    </span>
                    <span className="text-lg font-mono font-bold text-sky-600 dark:text-sky-400">
                      {digest.summary.dueRevisionsCount + digest.summary.overdueRevisionsCount} topics
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                    <span className="text-[10px] font-bold text-[#737C74] dark:text-[#948979] uppercase block">
                      Recommended Focus
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {digest.summary.suggestedFocusMinutes} mins
                    </span>
                  </div>
                </div>

                {/* Progress Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Active tasks in queue */}
                  <div className="p-4 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                    <h4 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider mb-2.5">
                      Active Frontier Tasks ({digest.scheduledTodayTasks.length})
                    </h4>
                    {digest.scheduledTodayTasks.length === 0 ? (
                      <p className="text-xs text-[#737C74] dark:text-[#948979]">
                        All active learning tracks are caught up!
                      </p>
                    ) : (
                      <ul className="space-y-2 max-h-48 overflow-y-auto">
                        {digest.scheduledTodayTasks.slice(0, 5).map((t) => (
                          <li
                            key={t.id}
                            className="text-xs flex items-center justify-between p-2 rounded bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46]"
                          >
                            <span className="truncate font-medium text-[#202A23] dark:text-[#DFD0B8]">
                              {t.title}
                            </span>
                            <span className="text-[10px] text-[#737C74] dark:text-[#948979] shrink-0 font-mono ml-2">
                              Day {t.dayNumber}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Right: Yesterday's Achievements & Streak Status */}
                  <div className="p-4 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
                    <h4 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider mb-2.5">
                      Velocity & Continuity
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#737C74] dark:text-[#948979]">
                          Tasks completed yesterday ({digest.yesterdayStr}):
                        </span>
                        <span className="font-mono font-bold text-[#202A23] dark:text-[#DFD0B8]">
                          {digest.summary.completedYesterdayCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#737C74] dark:text-[#948979]">
                          Current Consecutive Streak:
                        </span>
                        <span className="font-mono font-bold text-orange-500">
                          {digest.summary.currentStreak} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#737C74] dark:text-[#948979]">
                          Today's Qualification Status:
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {digest.summary.qualifiedToday ? 'Qualified' : 'Pending (Complete 5 tasks)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PREFERENCES & QUIET HOURS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'preferences' && preferences && (
        <div className="space-y-6">
          {/* Notification Categories Grid */}
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider mb-4 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
              Category Delivery Controls
            </h3>

            <div className="space-y-4">
              {[
                {
                  id: 'dailyRemindersEnabled',
                  label: 'Daily Study Reminders',
                  desc: 'Scheduled kickoffs and recurring study reminders.',
                },
                {
                  id: 'missedTaskRemindersEnabled',
                  label: 'Pending & Carried-Forward Task Alerts',
                  desc: 'Reminders for unfinished tasks on the active learning day (never locked future days).',
                },
                {
                  id: 'revisionRemindersEnabled',
                  label: 'Spaced Repetition & Revision Alerts',
                  desc: 'Reminders when topics are due or overdue for recall review.',
                },
                {
                  id: 'streakRemindersEnabled',
                  label: 'Streak Continuity & Progress Alerts',
                  desc: 'Updates on remaining tasks needed to qualify today’s 5-task streak.',
                },
                {
                  id: 'focusCompletionEnabled',
                  label: 'Focus Session Completion Alerts',
                  desc: 'Notification and audio chime when a Pomodoro or deep-work timer finishes.',
                },
                {
                  id: 'projectDeadlineRemindersEnabled',
                  label: 'Project Milestone Deadlines',
                  desc: 'Alerts before upcoming milestones and engineering task due dates.',
                },
                {
                  id: 'soundEnabled',
                  label: 'Melodic Sound Chime',
                  desc: 'Pleasant Web Audio API chime synthesized upon alert arrival.',
                },
              ].map(({ id, label, desc }) => (
                <div key={id} className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-semibold text-[#202A23] dark:text-[#DFD0B8]">
                      {label}
                    </span>
                    <p className="text-xs text-[#737C74] dark:text-[#948979] mt-0.5">
                      {desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleTogglePreference(id, !preferences[id])}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      preferences[id] ? 'bg-[#244C3B] dark:bg-[#DFD0B8]' : 'bg-[#E8E8DF] dark:bg-[#393E46]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#222831] shadow-sm ring-0 transition duration-200 ease-in-out ${
                        preferences[id] ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Browser Notifications Permissions Card */}
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
                <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
                  Desktop Browser Notifications
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  browserPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : browserPermission === 'denied'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                Permission: {browserPermission}
              </span>
            </div>

            <p className="text-xs text-[#4A5749] dark:text-[#C8BFB0] leading-relaxed mb-4">
              Browser notifications allow DevPath to alert you when a focus session ends or when a scheduled study sprint kicks off, even if you are on another browser tab. Explicit browser permission is required.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {browserPermission !== 'granted' ? (
                <Button variant="primary" size="sm" onClick={requestBrowserPermission}>
                  Enable Browser Notifications
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleSendTestNotification}>
                  Send Test Notification
                </Button>
              )}

              {browserPermission === 'denied' && (
                <span className="text-[11px] text-rose-600 dark:text-rose-400">
                  Permission is currently blocked in your browser. To enable, click the lock icon in your browser's address bar.
                </span>
              )}
            </div>
          </div>

          {/* Quiet Hours Card */}
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
                <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
                  Quiet Hours (Asia/Kolkata)
                </h3>
              </div>

              <button
                onClick={() => handleTogglePreference('quietHoursEnabled', !preferences.quietHoursEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  preferences.quietHoursEnabled ? 'bg-[#244C3B] dark:bg-[#DFD0B8]' : 'bg-[#E8E8DF] dark:bg-[#393E46]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-[#222831] shadow-sm ring-0 transition duration-200 ease-in-out ${
                    preferences.quietHoursEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-[#737C74] dark:text-[#948979] mb-4">
              During quiet hours, audible chimes and browser popups are suppressed. All alerts continue to be recorded quietly in your in-app notification center.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Quiet Hours Start (HH:mm)
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => handleTogglePreference('quietHoursStart', e.target.value)}
                  disabled={!preferences.quietHoursEnabled}
                  className="px-3 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Quiet Hours End (HH:mm)
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => handleTogglePreference('quietHoursEnd', e.target.value)}
                  disabled={!preferences.quietHoursEnabled}
                  className="px-3 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Render Cloud Deployment Architecture Card */}
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#E8E8DF] dark:border-[#393E46]">
              <Info className="w-4 h-4 text-sky-500" />
              <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
                Deployment Architecture & Limitations
              </h3>
            </div>
            <p className="text-xs text-[#737C74] dark:text-[#948979] leading-relaxed">
              <strong>Render Web Service Background Engine:</strong> DevPath executes background reminder evaluations every 60 seconds on the backend. When deployed on Render free instances, the web service may spin down after 15 minutes of inactivity. When you open the application, an automatic catch-up check runs immediately. To guarantee closed-browser background delivery on Render without web traffic, a scheduled Render Cron Job invoking <code className="text-[11px] font-mono bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">POST /api/reminders/process-due</code> can be configured without paid add-ons.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT REMINDER SCHEDULE                                   */}
      {/* ========================================================================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#202A23] dark:text-[#DFD0B8] mb-4">
              {editingSchedule ? 'Edit Reminder Schedule' : 'Create Reminder Schedule'}
            </h3>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Schedule Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Study Sprint"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden"
                />
              </div>

              {/* Time & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                    Reminder Time (HH:mm) *
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.reminderTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, reminderTime: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                    Category *
                  </label>
                  <select
                    value={scheduleForm.category}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden"
                  >
                    <option value="daily_study">Daily Study Kickoff</option>
                    <option value="pending_tasks">Pending Tasks Check</option>
                    <option value="revision">Spaced Revision Due</option>
                    <option value="streak">Streak Maintenance</option>
                    <option value="custom">Custom Message</option>
                  </select>
                </div>
              </div>

              {/* Weekday Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1.5">
                  Selected Weekdays *
                </label>
                <div className="flex items-center justify-between gap-1">
                  {WEEKDAY_NAMES.map(({ day, label }) => {
                    const isSelected = scheduleForm.weekdays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(day)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#244C3B] text-white dark:bg-[#DFD0B8] dark:text-[#222831]'
                            : 'bg-[#F0F0EB] text-[#737C74] dark:bg-[#222831] dark:text-[#948979] hover:bg-[#E8E8DF] dark:hover:bg-[#393E46]'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] mb-1">
                  Custom Reminder Message (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional motivational or contextual message..."
                  value={scheduleForm.customMessage}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, customMessage: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46] text-[#202A23] dark:text-[#DFD0B8] focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingSchedule ? 'Save Changes' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
