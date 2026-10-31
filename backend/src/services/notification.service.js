import { prisma } from '../config/db.js';
import {
  getKolkataTimeString,
  isTimeInQuietHours,
} from '../utils/date.util.js';

export const NotificationService = {
  /**
   * Get or initialize single-user notification preferences
   */
  async getPreferences() {
    let pref = await prisma.notificationPreference.findFirst();
    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: {
          dailyRemindersEnabled: true,
          missedTaskRemindersEnabled: true,
          revisionRemindersEnabled: true,
          streakRemindersEnabled: true,
          focusCompletionEnabled: true,
          projectDeadlineRemindersEnabled: true,
          dailyDigestEnabled: true,
          dailyDigestTime: '08:00',
          browserNotificationsEnabled: false,
          soundEnabled: true,
          quietHoursEnabled: false,
          quietHoursStart: '22:30',
          quietHoursEnd: '07:00',
          timezone: 'Asia/Kolkata',
        },
      });
    }
    return pref;
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(data) {
    const current = await this.getPreferences();

    const allowedFields = [
      'dailyRemindersEnabled',
      'missedTaskRemindersEnabled',
      'revisionRemindersEnabled',
      'streakRemindersEnabled',
      'focusCompletionEnabled',
      'projectDeadlineRemindersEnabled',
      'dailyDigestEnabled',
      'dailyDigestTime',
      'browserNotificationsEnabled',
      'soundEnabled',
      'quietHoursEnabled',
      'quietHoursStart',
      'quietHoursEnd',
      'timezone',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const updated = await prisma.notificationPreference.update({
      where: { id: current.id },
      data: updateData,
    });

    return updated;
  },

  /**
   * Check if quiet hours are currently in effect
   */
  async isQuietHoursActive(date = new Date()) {
    const pref = await this.getPreferences();
    if (!pref.quietHoursEnabled) return false;

    const currentTimeStr = getKolkataTimeString(date);
    return isTimeInQuietHours(currentTimeStr, pref.quietHoursStart, pref.quietHoursEnd);
  },

  /**
   * Create a notification with database-backed idempotency to prevent duplicates
   */
  async createNotification(data) {
    const {
      title,
      description,
      notificationType = 'system',
      priority = 'normal',
      relatedEntityType = null,
      relatedEntityId = null,
      actionUrl = null,
      idempotencyKey = null,
    } = data;

    if (!title || !title.trim()) {
      throw new Error('Notification title is required');
    }
    if (!description || !description.trim()) {
      throw new Error('Notification description is required');
    }

    // Idempotency check: if key already exists, return existing record
    if (idempotencyKey) {
      const existing = await prisma.notification.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return { notification: existing, isDuplicate: true };
      }
    }

    try {
      const notification = await prisma.notification.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          notificationType,
          priority,
          relatedEntityType,
          relatedEntityId: relatedEntityId ? String(relatedEntityId) : null,
          actionUrl,
          idempotencyKey,
        },
      });

      return { notification, isDuplicate: false };
    } catch (err) {
      // In case of race conditions with the unique index
      if (err.code === 'P2002' && idempotencyKey) {
        const existing = await prisma.notification.findUnique({
          where: { idempotencyKey },
        });
        return { notification: existing, isDuplicate: true };
      }
      throw err;
    }
  },

  /**
   * List notifications with pagination and filters
   */
  async getNotifications(filters = {}) {
    const page = Math.max(1, parseInt(filters.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const where = {};

    if (filters.type && filters.type !== 'all') {
      where.notificationType = filters.type;
    }

    if (filters.isRead !== undefined && filters.isRead !== 'all') {
      where.isRead = filters.isRead === true || filters.isRead === 'true';
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const unreadCount = await prisma.notification.count({
      where: { isRead: false },
    });
    return { unreadCount };
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.isRead) {
      return notification;
    }

    return prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const res = await prisma.notification.updateMany({
      where: { isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return { count: res.count };
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id) {
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Notification not found');
    }

    await prisma.notification.delete({ where: { id } });
    return { success: true, id };
  },

  /**
   * Clear all read notifications
   */
  async clearReadNotifications() {
    const res = await prisma.notification.deleteMany({
      where: { isRead: true },
    });
    return { deletedCount: res.count };
  },

  /**
   * Helper to trigger focus session completion notification
   */
  async triggerFocusCompletionNotification(session) {
    try {
      const pref = await this.getPreferences();
      if (!pref.focusCompletionEnabled) return null;

      const durationMinutes = Math.max(1, Math.round((session.actualDurationSeconds || 0) / 60));
      const title = 'Focus Session Completed';
      let description = `Great work! You completed a ${durationMinutes}-minute ${session.sessionType || 'focus'} session.`;

      if (session.task?.title) {
        description += ` Linked to: "${session.task.title}".`;
      } else if (session.project?.name) {
        description += ` Linked to project: "${session.project.name}".`;
      } else if (session.revisionSchedule?.topic) {
        description += ` Linked to revision: "${session.revisionSchedule.topic}".`;
      }

      return await this.createNotification({
        title,
        description,
        notificationType: 'focus_completed',
        priority: 'normal',
        relatedEntityType: 'study_session',
        relatedEntityId: session.id,
        actionUrl: '/focus',
        idempotencyKey: `focus_completed_${session.id}`,
      });
    } catch (err) {
      console.error('Failed to trigger focus completion notification:', err);
      return null;
    }
  },
};
