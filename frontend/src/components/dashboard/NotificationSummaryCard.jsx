import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  Clock,
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
    <div className="bg-[#FFFFFF] dark:bg-[#1D232B] border border-[#E4E7E0] dark:border-[#303945] rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-[#E4E7E0] dark:border-[#303945]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="text-xs font-bold text-[#202620] dark:text-[#F3F4F6] uppercase tracking-wider font-mono">
            Reminders & Alerts
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualCheck}
            disabled={refreshing}
            className="p-1 rounded text-[#858D82] hover:text-[#202620] dark:text-[#7F8996] dark:hover:text-[#F3F4F6] hover:bg-[#F0F2ED] dark:hover:bg-[#252C35] transition disabled:opacity-50 cursor-pointer"
            title="Evaluate due reminders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="text-[11px] font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer flex items-center gap-0.5 font-mono"
          >
            <span>Center</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2.5">
        {nextSchedule ? (
          <div className="p-3 rounded-lg bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-amber-500/10 text-[var(--accent-primary)] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#202620] dark:text-[#F3F4F6]">
                  {nextSchedule.title}
                </div>
                <div className="text-[10px] font-mono text-[#858D82] dark:text-[#7F8996]">
                  Scheduled daily at {nextSchedule.reminderTime}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>
        ) : null}

        {dueRevisionsCount > 0 ? (
          <div
            onClick={() => navigate('/revision')}
            className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:opacity-90 transition"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-900 dark:text-amber-200">
                {dueRevisionsCount} {dueRevisionsCount === 1 ? 'revision' : 'revisions'} due for review
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
        ) : null}

        {!nextSchedule && dueRevisionsCount === 0 && (
          <div className="p-4 rounded-lg bg-[#F8F9F6] dark:bg-[#171B21] border border-[#E4E7E0] dark:border-[#303945] text-center">
            <p className="text-xs text-[#858D82] dark:text-[#7F8996]">
              All reminders clear. Create study schedules in Notifications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
