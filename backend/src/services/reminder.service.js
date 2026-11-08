import { prisma } from '../config/db.js';
import {
  getKolkataDateString,
  getPreviousKolkataDate,
  getKolkataTimeString,
  getKolkataDayOfWeek,
  addDaysToKolkataDate,
  isTimeInQuietHours,
} from '../utils/date.util.js';
import { NotificationService } from './notification.service.js';
import { ProgressionService } from './progression.service.js';
import { StreakService } from './streak.service.js';
import { RevisionService } from './revision.service.js';

/**
 * Calculates the next UTC Date when a schedule should trigger in Asia/Kolkata
 */
export function computeNextRunAt(reminderTime, weekdays = [0, 1, 2, 3, 4, 5, 6], fromDate = new Date()) {
  if (!reminderTime) return null;
  const [targetH, targetM] = reminderTime.split(':').map(Number);
  const currentKolkataTimeStr = getKolkataTimeString(fromDate);
  const currentKolkataDateStr = getKolkataDateString(fromDate);
  const currentDayOfWeek = getKolkataDayOfWeek(fromDate);

  const daysList = Array.isArray(weekdays) ? weekdays.map(Number) : [0, 1, 2, 3, 4, 5, 6];

  for (let offset = 0; offset <= 7; offset++) {
    const checkDateStr = addDaysToKolkataDate(currentKolkataDateStr, offset);
    const checkDate = new Date(`${checkDateStr}T12:00:00Z`);
    const checkDayOfWeek = getKolkataDayOfWeek(checkDate);

    if (daysList.includes(checkDayOfWeek)) {
      if (offset === 0) {
        // Same day: only if target time is in the future
        if (reminderTime > currentKolkataTimeStr) {
          // Construct UTC date matching Kolkata local time (UTC+05:30)
          const targetUtcMillis = new Date(`${checkDateStr}T00:00:00Z`).getTime() +
            (targetH * 3600 + targetM * 60 - (5 * 3600 + 30 * 60)) * 1000;
          return new Date(targetUtcMillis);
        }
      } else {
        const targetUtcMillis = new Date(`${checkDateStr}T00:00:00Z`).getTime() +
          (targetH * 3600 + targetM * 60 - (5 * 3600 + 30 * 60)) * 1000;
        return new Date(targetUtcMillis);
      }
    }
  }

  return null;
}

export const ReminderService = {
  /**
   * Get all configured reminder schedules
   */
  async getSchedules() {
    const schedules = await prisma.reminderSchedule.findMany({
      orderBy: [{ reminderTime: 'asc' }, { createdAt: 'desc' }],
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5,
        },
      },
    });

    const now = new Date();
    return schedules.map((s) => ({
      ...s,
      computedNextRun: computeNextRunAt(s.reminderTime, s.weekdays, now),
    }));
  },

  /**
   * Create a new reminder schedule
   */
  async createSchedule(data) {
    const {
      title,
      reminderTime,
      weekdays = [0, 1, 2, 3, 4, 5, 6],
      category = 'daily_study',
      customMessage = null,
      isActive = true,
      timezone = 'Asia/Kolkata',
    } = data;

    if (!title || !title.trim()) {
      throw new Error('Reminder title is required');
    }
    if (!reminderTime || !/^\d{2}:\d{2}$/.test(reminderTime)) {
      throw new Error('Valid reminder time in HH:mm format is required (e.g. "07:00")');
    }

    const nextRun = computeNextRunAt(reminderTime, weekdays);

    const schedule = await prisma.reminderSchedule.create({
      data: {
        title: title.trim(),
        reminderTime,
        weekdays: weekdays,
        category,
        customMessage: customMessage ? customMessage.trim() : null,
        isActive: Boolean(isActive),
        timezone,
        nextRunAt: nextRun,
      },
    });

    return schedule;
  },

  /**
   * Update an existing reminder schedule
   */
  async updateSchedule(id, data) {
    const existing = await prisma.reminderSchedule.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Reminder schedule not found');
    }

    const reminderTime = data.reminderTime || existing.reminderTime;
    const weekdays = data.weekdays !== undefined ? data.weekdays : existing.weekdays;
    const nextRun = computeNextRunAt(reminderTime, weekdays);

    const updated = await prisma.reminderSchedule.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : existing.title,
        reminderTime,
        weekdays,
        category: data.category || existing.category,
        customMessage: data.customMessage !== undefined ? (data.customMessage ? data.customMessage.trim() : null) : existing.customMessage,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
        timezone: data.timezone || existing.timezone,
        nextRunAt: nextRun,
      },
    });

    return updated;
  },

  /**
   * Delete a reminder schedule
   */
  async deleteSchedule(id) {
    const existing = await prisma.reminderSchedule.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Reminder schedule not found');
    }

    await prisma.reminderSchedule.delete({ where: { id } });
    return { success: true, id };
  },

  /**
   * Toggle schedule active state
   */
  async toggleSchedule(id) {
    const existing = await prisma.reminderSchedule.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Reminder schedule not found');
    }

    const nextRun = !existing.isActive ? computeNextRunAt(existing.reminderTime, existing.weekdays) : null;

    return prisma.reminderSchedule.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
        nextRunAt: nextRun,
      },
    });
  },

  /**
   * Generates the Daily Learning Digest from real database records
   */
  async getDailyDigest() {
    const todayStr = getKolkataDateString();
    const yesterdayStr = getPreviousKolkataDate(todayStr);

    // 1. Learning queue & active tasks
    const queueData = await ProgressionService.getDailyLearningQueue();
    const roadmapsQueue = queueData?.roadmaps || [];
    const scheduledTodayTasks = [];
    const carriedForwardTasks = [];

    for (const r of roadmapsQueue) {
      for (const t of r.activeTasks || []) {
        if (t.scheduledDate && t.scheduledDate < todayStr) {
          carriedForwardTasks.push(t);
        } else {
          scheduledTodayTasks.push(t);
        }
      }
    }

    // 2. Revisions
    const revisionsData = await RevisionService.getRevisions();
    const dueRevisions = revisionsData.dueToday || [];
    const overdueRevisions = revisionsData.overdue || [];

    // 3. Project deadlines
    const upcomingProjects = await prisma.project.findMany({
      where: {
        status: 'in_progress',
        targetDate: { not: null },
      },
      select: {
        id: true,
        name: true,
        targetDate: true,
        priority: true,
      },
      orderBy: { targetDate: 'asc' },
    });

    // 4. Streak status
    const streak = await StreakService.calculateOverallStreak();

    // 5. Tasks completed yesterday (within Asia/Kolkata boundary)
    const yesterdayStart = new Date(`${yesterdayStr}T00:00:00+05:30`);
    const yesterdayEnd = new Date(`${yesterdayStr}T23:59:59.999+05:30`);
    const completedYesterdayRecords = await prisma.taskCompletion.count({
      where: {
        completed: true,
        completedAt: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
      },
    });

    // 6. Active roadmaps target study time
    const activeRoadmaps = await prisma.roadmap.findMany({
      where: { status: 'active' },
      select: { id: true, title: true, targetDailyStudyTime: true },
    });
    const suggestedFocusMinutes = activeRoadmaps.reduce(
      (acc, r) => acc + (r.targetDailyStudyTime || 120),
      0
    ) || 120;

    return {
      todayStr,
      yesterdayStr,
      summary: {
        totalPendingTasks: scheduledTodayTasks.length + carriedForwardTasks.length,
        scheduledTodayCount: scheduledTodayTasks.length,
        carriedForwardCount: carriedForwardTasks.length,
        dueRevisionsCount: dueRevisions.length,
        overdueRevisionsCount: overdueRevisions.length,
        upcomingProjectsCount: upcomingProjects.length,
        completedYesterdayCount: completedYesterdayRecords,
        currentStreak: streak.currentStreak,
        bestStreak: streak.bestStreak,
        qualifiedToday: streak.qualifiedToday,
        completedToday: streak.todayCompletedCount,
        requiredToday: streak.todayRequiredTarget,
        suggestedFocusMinutes,
      },
      scheduledTodayTasks,
      carriedForwardTasks,
      dueRevisions,
      overdueRevisions,
      upcomingProjects,
      streak,
      activeRoadmaps,
    };
  },

  /**
   * Get upcoming reminder events for display - Highly optimized parallel query
   */
  async getUpcomingReminders() {
    const todayStr = getKolkataDateString();
    const now = new Date();
    const todayEndUtc = new Date(`${todayStr}T23:59:59.999+05:30`);

    const [schedules, dueRevisions, upcomingDeadlines] = await Promise.all([
      this.getSchedules(),
      prisma.revisionSchedule.findMany({
        where: {
          completed: false,
          status: { not: 'paused' },
          scheduledDate: { lte: todayEndUtc },
        },
        select: {
          id: true,
          topic: true,
          scheduledDate: true,
          status: true,
        },
        orderBy: { scheduledDate: 'asc' },
        take: 10,
      }),
      prisma.project.findMany({
        where: {
          status: 'in_progress',
          targetDate: { gte: now },
        },
        select: {
          id: true,
          name: true,
          targetDate: true,
        },
        orderBy: { targetDate: 'asc' },
        take: 5,
      }),
    ]);

    const activeSchedules = schedules.filter((s) => s.isActive);

    return {
      todayStr,
      activeSchedules: activeSchedules.map((s) => ({
        id: s.id,
        title: s.title,
        reminderTime: s.reminderTime,
        category: s.category,
        nextRunAt: s.computedNextRun,
      })),
      dueRevisions: dueRevisions.map((r) => {
        const schedStr = getKolkataDateString(r.scheduledDate);
        return {
          id: r.id,
          topic: r.topic,
          scheduledDate: r.scheduledDate,
          status: schedStr < todayStr ? 'overdue' : 'due',
        };
      }),
      upcomingDeadlines,
    };
  },

  /**
   * Process all due reminders and intelligent adaptive notifications.
   * Can be triggered by:
   * 1. Background recurring scheduler (every 60s)
   * 2. Manual trigger from API / Render Cron Job
   * 3. In-app heartbeat when user opens DevPath
   */
  async processDueReminders(manual = false) {
    const now = new Date();
    const todayStr = getKolkataDateString(now);
    const currentTimeStr = getKolkataTimeString(now);
    const currentDayOfWeek = getKolkataDayOfWeek(now);

    const pref = await NotificationService.getPreferences();
    const isQuiet = pref.quietHoursEnabled && isTimeInQuietHours(currentTimeStr, pref.quietHoursStart, pref.quietHoursEnd);

    const executionLog = {
      executedAt: now,
      manual,
      todayStr,
      currentTimeStr,
      currentDayOfWeek,
      isQuiet,
      notificationsCreated: 0,
      schedulesProcessed: 0,
    };

    // 1. Process explicit Reminder Schedules
    const activeSchedules = await prisma.reminderSchedule.findMany({
      where: { isActive: true },
    });

    for (const schedule of activeSchedules) {
      executionLog.schedulesProcessed++;
      const scheduleDays = Array.isArray(schedule.weekdays) ? schedule.weekdays.map(Number) : [0, 1, 2, 3, 4, 5, 6];

      // Check weekday
      if (!scheduleDays.includes(currentDayOfWeek)) {
        await prisma.reminderExecution.create({
          data: {
            scheduleId: schedule.id,
            executionType: manual ? 'manual' : 'scheduled',
            status: 'skipped_weekday',
            notificationsCreated: 0,
            details: { reason: `Current weekday ${currentDayOfWeek} not in schedule weekdays [${scheduleDays.join(',')}]` },
          },
        });
        continue;
      }

      // Check time window (if automated, only trigger if time has arrived and hasn't run today)
      const idempotencyKey = `schedule_${schedule.id}_${todayStr}`;
      if (!manual && schedule.reminderTime > currentTimeStr) {
        // Not yet due
        continue;
      }

      // Check if already executed today
      const alreadyRun = await prisma.notification.findUnique({
        where: { idempotencyKey },
      });

      if (alreadyRun && !manual) {
        continue;
      }

      // Generate notification content based on schedule category
      let notifTitle = schedule.title;
      let notifDesc = schedule.customMessage || '';
      let notifType = 'learning_reminder';
      let actionUrl = '/planner';

      if (schedule.category === 'daily_study') {
        const queueData = await ProgressionService.getDailyLearningQueue();
        const roadmapsQueue = queueData?.roadmaps || [];
        const totalQueueTasks = queueData?.summary?.totalTasksInQueue || 0;
        notifDesc = schedule.customMessage ||
          (totalQueueTasks > 0
            ? `You have ${totalQueueTasks} learning tasks ready in your active queue across ${roadmapsQueue.length} track(s).`
            : 'Ready for deep work? Open your daily planner to explore your engineering curriculum.');
        actionUrl = '/planner';
      } else if (schedule.category === 'pending_tasks') {
        notifType = 'missed_task';
        const queueData = await ProgressionService.getDailyLearningQueue();
        const roadmapsQueue = queueData?.roadmaps || [];
        const activeTasks = roadmapsQueue.flatMap((q) => q.activeTasks || []);
        if (activeTasks.length > 0) {
          const firstTask = activeTasks[0];
          notifDesc = schedule.customMessage ||
            `Pending: "${firstTask.title}" on Day ${firstTask.dayNumber} of ${firstTask.roadmapTitle}.`;
        } else {
          notifDesc = schedule.customMessage || 'No pending tasks at your current learning frontier!';
        }
        actionUrl = '/planner';
      } else if (schedule.category === 'revision') {
        notifType = 'revision_due';
        const revData = await RevisionService.getRevisions();
        const count = (revData.dueToday?.length || 0) + (revData.overdue?.length || 0);
        notifDesc = schedule.customMessage ||
          (count > 0
            ? `You have ${count} spaced revision topic(s) due for recall review.`
            : 'Your spaced repetition schedule is clear for today!');
        actionUrl = '/revision';
      } else if (schedule.category === 'streak') {
        notifType = 'streak_progress';
        const streak = await StreakService.calculateOverallStreak();
        if (streak.qualifiedToday) {
          notifDesc = schedule.customMessage || `Streak secured! You completed ${streak.todayCompletedCount} tasks today. Current streak: ${streak.currentStreak} days.`;
        } else {
          notifDesc = schedule.customMessage || `${streak.remainingToday} more completed task(s) needed to qualify today's streak (Goal: ${streak.todayRequiredTarget}).`;
        }
        actionUrl = '/';
      } else {
        notifDesc = schedule.customMessage || 'Scheduled learning reminder.';
      }

      const createResult = await NotificationService.createNotification({
        title: notifTitle,
        description: notifDesc,
        notificationType: notifType,
        priority: 'normal',
        relatedEntityType: 'reminder_schedule',
        relatedEntityId: schedule.id,
        actionUrl,
        idempotencyKey,
      });

      if (!createResult.isDuplicate) {
        executionLog.notificationsCreated++;
      }

      // Record execution
      await prisma.reminderExecution.create({
        data: {
          scheduleId: schedule.id,
          executionType: manual ? 'manual' : 'scheduled',
          status: isQuiet ? 'quiet_hours_recorded' : 'success',
          notificationsCreated: createResult.isDuplicate ? 0 : 1,
          details: {
            title: notifTitle,
            category: schedule.category,
            isQuiet,
          },
        },
      });

      // Update schedule last run & next run
      const nextRun = computeNextRunAt(schedule.reminderTime, scheduleDays, addDaysToKolkataDate(todayStr, 1));
      await prisma.reminderSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: now,
          lastStatus: isQuiet ? 'quiet_hours' : 'success',
          nextRunAt: nextRun,
        },
      });
    }

    // 2. Adaptive Streak Progress Reminders (if enabled)
    if (pref.streakRemindersEnabled) {
      try {
        const streak = await StreakService.calculateOverallStreak();
        if (!streak.qualifiedToday && streak.todayCompletedCount > 0) {
          const streakKey = `streak_progress_${todayStr}_${streak.todayCompletedCount}`;
          const remCount = streak.remainingToday;
          const createResult = await NotificationService.createNotification({
            title: 'Daily Streak Progress',
            description: `${remCount} more completed task${remCount > 1 ? 's are' : ' is'} needed to qualify today's streak (${streak.todayCompletedCount}/${streak.todayRequiredTarget}).`,
            notificationType: 'streak_progress',
            priority: 'normal',
            actionUrl: '/',
            idempotencyKey: streakKey,
          });
          if (!createResult.isDuplicate) executionLog.notificationsCreated++;
        }
      } catch (err) {
        console.error('Adaptive streak reminder check error:', err);
      }
    }

    // 3. Adaptive Revision Due Reminders (if enabled)
    if (pref.revisionRemindersEnabled) {
      try {
        const revKey = `revision_due_${todayStr}`;
        const overdueKey = `revision_overdue_${todayStr}`;
        const existingNotifs = await prisma.notification.findMany({
          where: { idempotencyKey: { in: [revKey, overdueKey] } },
          select: { idempotencyKey: true },
        });
        const existingKeys = new Set(existingNotifs.map((n) => n.idempotencyKey));

        if (!existingKeys.has(revKey) || !existingKeys.has(overdueKey)) {
          const revData = await RevisionService.getRevisions();
          // Due today
          if (!existingKeys.has(revKey) && revData.dueToday && revData.dueToday.length > 0) {
            const count = revData.dueToday.length;
            const createResult = await NotificationService.createNotification({
              title: 'Spaced Repetition Due Today',
              description: `You have ${count} topic${count > 1 ? 's' : ''} ready for review: "${revData.dueToday[0].topic}"${count > 1 ? ` and ${count - 1} more` : ''}.`,
              notificationType: 'revision_due',
              priority: 'normal',
              actionUrl: '/revision',
              idempotencyKey: revKey,
            });
            if (!createResult.isDuplicate) executionLog.notificationsCreated++;
          }

          // Overdue revisions
          if (!existingKeys.has(overdueKey) && revData.overdue && revData.overdue.length > 0) {
            const count = revData.overdue.length;
            const createResult = await NotificationService.createNotification({
              title: 'Overdue Revisions Waiting',
              description: `${count} revision topic${count > 1 ? 's remain' : ' remains'} incomplete past their scheduled date.`,
              notificationType: 'revision_overdue',
              priority: 'high',
              actionUrl: '/revision',
              idempotencyKey: overdueKey,
            });
            if (!createResult.isDuplicate) executionLog.notificationsCreated++;
          }
        }
      } catch (err) {
        console.error('Adaptive revision reminder check error:', err);
      }
    }

    // 4. Adaptive Pending Roadmap Tasks (if enabled and past 17:00 IST)
    if (pref.missedTaskRemindersEnabled && currentTimeStr >= '17:00') {
      try {
        const pendingKey = `pending_tasks_${todayStr}`;
        const existingPending = await prisma.notification.findUnique({
          where: { idempotencyKey: pendingKey },
          select: { id: true },
        });

        if (!existingPending) {
          const queueData = await ProgressionService.getDailyLearningQueue();
          const roadmapsQueue = queueData?.roadmaps || [];
          const activeTasks = roadmapsQueue.flatMap((q) => q.activeTasks || []);
          if (activeTasks.length > 0) {
            const createResult = await NotificationService.createNotification({
              title: 'Pending Active Learning Tasks',
              description: `You have ${activeTasks.length} pending task(s) at your active learning frontier for today.`,
              notificationType: 'missed_task',
              priority: 'normal',
              actionUrl: '/planner',
              idempotencyKey: pendingKey,
            });
            if (!createResult.isDuplicate) executionLog.notificationsCreated++;
          }
        }
      } catch (err) {
        console.error('Adaptive pending task check error:', err);
      }
    }

    // 5. Adaptive Project Deadline Reminders (if enabled)
    if (pref.projectDeadlineRemindersEnabled) {
      try {
        const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
        const approachingProjects = await prisma.project.findMany({
          where: {
            status: 'in_progress',
            targetDate: {
              gte: now,
              lte: threeDaysAhead,
            },
          },
        });

        for (const proj of approachingProjects) {
          const projKey = `project_deadline_${proj.id}_${todayStr}`;
          const targetStr = getKolkataDateString(proj.targetDate);
          const createResult = await NotificationService.createNotification({
            title: 'Upcoming Project Deadline',
            description: `Project "${proj.name}" target milestone is due on ${targetStr}.`,
            notificationType: 'project_deadline',
            priority: 'high',
            relatedEntityType: 'project',
            relatedEntityId: proj.id,
            actionUrl: '/projects',
            idempotencyKey: projKey,
          });
          if (!createResult.isDuplicate) executionLog.notificationsCreated++;
        }
      } catch (err) {
        console.error('Adaptive project deadline check error:', err);
      }
    }

    return executionLog;
  },
};
