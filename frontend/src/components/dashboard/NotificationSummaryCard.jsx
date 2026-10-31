import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  Clock,
  FolderGit2,
  Flame,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { notificationService } from '../../services/notificationService';

export default function NotificationSummaryCard({ stats }) {
  const navigate = useNavigate();
  const { unreadCount, fetchUnreadCount } = useNotifications();
  const [upcoming, setUpcoming] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUpcoming = async () => {
    try {
      const res = await notificationService.getUpcoming();
      setUpcoming(res?.activeSchedules !== undefined ? res : (res?.data?.data || res || null));
    } catch (err) {
      console.error('Failed to fetch upcoming reminders:', err);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const handleManualCheck = async () => {
    setRefreshing(true);
    try {
      await notificationService.processDueReminders();
      await Promise.all([fetchUnreadCount(), fetchUpcoming()]);
    } catch (err) {
      console.error('Manual check failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const nextSchedule = upcoming?.activeSchedules?.[0];
  const dueRevisionsCount = upcoming?.dueRevisions?.length || 0;
  const upcomingDeadlinesCount = upcoming?.upcomingDeadlines?.length || 0;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#2A303A] border border-[#E8E8DF] dark:border-[#393E46] rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-[#E8E8DF] dark:border-[#393E46]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#244C3B] dark:text-[#DFD0B8]" />
          <h3 className="text-xs font-bold text-[#202A23] dark:text-[#DFD0B8] uppercase tracking-wider">
            Reminders & Alerts
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualCheck}
            disabled={refreshing}
            className="p-1 rounded text-[#737C74] hover:text-[#202A23] dark:text-[#948979] dark:hover:text-[#DFD0B8] hover:bg-[#F0F0EB] dark:hover:bg-[#393E46] transition disabled:opacity-50 cursor-pointer"
            title="Evaluate due reminders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="text-[11px] font-semibold text-[#244C3B] dark:text-[#DFD0B8] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>Center</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Next Scheduled Reminder Banner */}
      <div className="mb-3 p-3 rounded-lg bg-[#F7F7F2] dark:bg-[#222831] border border-[#E8E8DF] dark:border-[#393E46]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-semibold text-[#202A23] dark:text-[#DFD0B8] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#91A88E]" />
            Next Scheduled Reminder:
          </span>
          <span className="font-mono font-bold text-[#244C3B] dark:text-[#DFD0B8]">
            {nextSchedule ? nextSchedule.reminderTime : 'None active'}
          </span>
        </div>
        <p className="text-[11px] text-[#737C74] dark:text-[#948979] truncate">
          {nextSchedule ? nextSchedule.title : 'Configure recurring study schedules in Notifications.'}
        </p>
      </div>

      {/* Quick Action Matrix */}
      <div className="space-y-2">
        {/* Today's Tasks in Queue */}
        <div
          onClick={() => navigate('/planner')}
          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F7F7F2] dark:hover:bg-[#222831] transition cursor-pointer border border-transparent hover:border-[#E8E8DF] dark:hover:border-[#393E46]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-[#244C3B]/10 dark:bg-[#DFD0B8]/10 text-[#244C3B] dark:text-[#DFD0B8] flex items-center justify-center shrink-0">
              <CalendarCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] block truncate">
                Today's Learning Queue
              </span>
              <span className="text-[10px] text-[#737C74] dark:text-[#948979]">
                {stats?.todayScheduledTasks || 0} active frontier tasks
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#244C3B] dark:text-[#DFD0B8]">
            View &rarr;
          </span>
        </div>

        {/* Due Revisions */}
        <div
          onClick={() => navigate('/revision')}
          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F7F7F2] dark:hover:bg-[#222831] transition cursor-pointer border border-transparent hover:border-[#E8E8DF] dark:hover:border-[#393E46]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-500 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] block truncate">
                Spaced Revision Topics
              </span>
              <span className="text-[10px] text-[#737C74] dark:text-[#948979]">
                {dueRevisionsCount} due or overdue for review
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
            Review &rarr;
          </span>
        </div>

        {/* Project Deadlines */}
        <div
          onClick={() => navigate('/projects')}
          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F7F7F2] dark:hover:bg-[#222831] transition cursor-pointer border border-transparent hover:border-[#E8E8DF] dark:hover:border-[#393E46]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-500 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#202A23] dark:text-[#DFD0B8] block truncate">
                Project Deadlines
              </span>
              <span className="text-[10px] text-[#737C74] dark:text-[#948979]">
                {upcomingDeadlinesCount} active milestones approaching
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
            Projects &rarr;
          </span>
        </div>
      </div>

      {/* Streak Qualification Mini Meter */}
      <div className="mt-3.5 pt-3 border-t border-[#E8E8DF] dark:border-[#393E46]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-[#737C74] dark:text-[#948979] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Streak Qualification:
          </span>
          <span className="font-mono font-bold text-[#202A23] dark:text-[#DFD0B8]">
            {stats?.completedToday ?? 0} / {stats?.requiredToday ?? 5} tasks
          </span>
        </div>
        <div className="w-full bg-[#E8E8DF] dark:bg-[#393E46] h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              stats?.qualifiedToday ? 'bg-emerald-500' : 'bg-orange-500'
            }`}
            style={{
              width: `${Math.min(100, Math.round(((stats?.completedToday ?? 0) / (stats?.requiredToday ?? 5)) * 100))}%`,
            }}
          />
        </div>
        <p className="text-[10px] text-[#737C74] dark:text-[#948979] mt-1.5">
          {stats?.qualifiedToday
            ? 'Today is qualified! Streak incremented.'
            : `${stats?.remainingToday ?? 5} more completed task(s) needed today.`}
        </p>
      </div>
    </div>
  );
}
