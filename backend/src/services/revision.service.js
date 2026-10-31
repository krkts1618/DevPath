import { prisma } from '../config/db.js';
import {
  getKolkataDateString,
  addDaysToKolkataDate,
} from '../utils/date.util.js';

// Default spaced repetition intervals in days
export const DEFAULT_SPACED_INTERVALS = {
  1: 1,   // Stage 1 -> 1 day
  2: 3,   // Stage 2 -> 3 days
  3: 7,   // Stage 3 -> 7 days
  4: 14,  // Stage 4 -> 14 days
  5: 30,  // Stage 5 -> 30 days
};

export const RevisionService = {
  /**
   * Calculate next due date and stage based on rating
   */
  calculateNextRevision(currentStage, rating, customIntervalDays = null) {
    if (customIntervalDays && Number(customIntervalDays) > 0) {
      return {
        nextStage: currentStage,
        nextIntervalDays: Number(customIntervalDays),
      };
    }

    let nextStage = currentStage;
    let nextIntervalDays = 1;

    switch (rating?.toLowerCase()) {
      case 'again':
        // Did not understand: reset to stage 1, review tomorrow
        nextStage = 1;
        nextIntervalDays = 1;
        break;
      case 'difficult':
        // Need more practice: review in 2 days, retain stage
        nextStage = Math.max(1, currentStage);
        nextIntervalDays = 2;
        break;
      case 'good':
        // Understood: advance to next stage
        nextStage = Math.min(5, currentStage + 1);
        nextIntervalDays = DEFAULT_SPACED_INTERVALS[nextStage] || 30;
        break;
      case 'easy':
        // Confident recall: advance stage with longer interval
        nextStage = Math.min(5, currentStage + 1);
        nextIntervalDays = Math.round((DEFAULT_SPACED_INTERVALS[nextStage] || 30) * 1.3);
        break;
      default:
        nextStage = Math.min(5, currentStage + 1);
        nextIntervalDays = DEFAULT_SPACED_INTERVALS[nextStage] || 3;
    }

    return { nextStage, nextIntervalDays };
  },

  /**
   * Create a revision item (from roadmap day, task, note, or general topic)
   */
  async createRevision(data) {
    const {
      topic,
      description,
      roadmapId = null,
      roadmapDayId = null,
      taskId = null,
      noteId = null,
      scheduledDate,
      priority = 'normal',
      intervalDays = 1,
    } = data;

    if (!topic || !topic.trim()) {
      throw new Error('Revision topic is required');
    }

    const todayStr = getKolkataDateString();
    const targetDateStr = scheduledDate || addDaysToKolkataDate(todayStr, Number(intervalDays) || 1);

    const revision = await prisma.revisionSchedule.create({
      data: {
        topic: topic.trim(),
        description: description ? description.trim() : null,
        roadmapId: roadmapId || null,
        roadmapDayId: roadmapDayId || null,
        taskId: taskId || null,
        noteId: noteId || null,
        scheduledDate: new Date(`${targetDateStr}T12:00:00Z`),
        stage: 1,
        intervalDays: Number(intervalDays) || 1,
        status: targetDateStr <= todayStr ? 'due' : 'upcoming',
        priority: priority || 'normal',
      },
      include: {
        roadmap: { select: { id: true, title: true } },
        roadmapDay: { select: { id: true, dayNumber: true, title: true } },
        task: { select: { id: true, title: true } },
        note: { select: { id: true, title: true } },
      },
    });

    return revision;
  },

  /**
   * Get all revisions classified into: Due Today, Overdue, Upcoming, Completed, Paused
   */
  async getRevisions(filters = {}) {
    const todayStr = getKolkataDateString();
    const { roadmapId, status } = filters;

    const where = {};
    if (roadmapId) where.roadmapId = roadmapId;
    if (status) where.status = status;

    const allRevisions = await prisma.revisionSchedule.findMany({
      where,
      include: {
        roadmap: { select: { id: true, title: true, categoryId: true, category: { select: { id: true, name: true } } } },
        roadmapDay: { select: { id: true, dayNumber: true, title: true } },
        task: { select: { id: true, title: true, taskType: true } },
        note: { select: { id: true, title: true } },
        sessions: {
          orderBy: { revisedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'desc' }],
    });

    const dueToday = [];
    const overdue = [];
    const upcoming = [];
    const completed = [];
    const paused = [];

    allRevisions.forEach((r) => {
      const schedStr = getKolkataDateString(r.scheduledDate);

      const formatted = {
        ...r,
        scheduledDateStr: schedStr,
        lastRevisedAtStr: r.lastRevisedAt ? getKolkataDateString(r.lastRevisedAt) : null,
        roadmapTitle: r.roadmap?.title || null,
        categoryName: r.roadmap?.category?.name || 'General',
        dayNumber: r.roadmapDay?.dayNumber || null,
        dayTitle: r.roadmapDay?.title || null,
        taskTitle: r.task?.title || null,
        noteTitle: r.note?.title || null,
        totalSessionsCount: r.sessions.length,
      };

      if (r.status === 'paused') {
        paused.push(formatted);
      } else if (r.completed) {
        completed.push(formatted);
      } else if (schedStr < todayStr) {
        overdue.push(formatted);
      } else if (schedStr === todayStr) {
        dueToday.push(formatted);
      } else {
        upcoming.push(formatted);
      }
    });

    return {
      todayStr,
      summary: {
        total: allRevisions.length,
        dueTodayCount: dueToday.length,
        overdueCount: overdue.length,
        upcomingCount: upcoming.length,
        completedCount: completed.length,
        pausedCount: paused.length,
      },
      dueToday,
      overdue,
      upcoming,
      completed,
      paused,
    };
  },

  /**
   * Get single revision item with full session history
   */
  async getRevisionById(id) {
    const revision = await prisma.revisionSchedule.findUnique({
      where: { id },
      include: {
        roadmap: { select: { id: true, title: true, category: { select: { id: true, name: true } } } },
        roadmapDay: { select: { id: true, dayNumber: true, title: true } },
        task: { select: { id: true, title: true } },
        note: true,
        sessions: {
          orderBy: { revisedAt: 'desc' },
        },
      },
    });

    if (!revision) throw new Error('Revision item not found');

    return {
      ...revision,
      scheduledDateStr: getKolkataDateString(revision.scheduledDate),
      lastRevisedAtStr: revision.lastRevisedAt ? getKolkataDateString(revision.lastRevisedAt) : null,
    };
  },

  /**
   * Record a completed revision session and calculate spaced repetition progression
   */
  async completeRevisionSession(id, data) {
    const { rating = 'good', notes = '', durationMinutes = 10, customIntervalDays = null } = data;

    const revision = await prisma.revisionSchedule.findUnique({
      where: { id },
    });
    if (!revision) throw new Error('Revision item not found');

    const todayStr = getKolkataDateString();
    const { nextStage, nextIntervalDays } = this.calculateNextRevision(
      revision.stage,
      rating,
      customIntervalDays
    );

    const nextScheduledDateStr = addDaysToKolkataDate(todayStr, nextIntervalDays);

    const [session, updatedRevision] = await prisma.$transaction([
      prisma.revisionSession.create({
        data: {
          revisionScheduleId: id,
          rating: rating.toLowerCase(),
          notes: notes || null,
          durationMinutes: Number(durationMinutes) || 10,
          revisedAt: new Date(),
        },
      }),
      prisma.revisionSchedule.update({
        where: { id },
        data: {
          stage: nextStage,
          intervalDays: nextIntervalDays,
          scheduledDate: new Date(`${nextScheduledDateStr}T12:00:00Z`),
          lastRevisedAt: new Date(),
          status: 'upcoming',
          difficultyRating: rating.toLowerCase(),
          revisionNumber: revision.revisionNumber + 1,
        },
        include: {
          roadmap: { select: { id: true, title: true } },
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    return {
      session,
      nextScheduledDate: nextScheduledDateStr,
      nextStage,
      nextIntervalDays,
      revision: updatedRevision,
    };
  },

  /**
   * Reschedule a revision item to a specific date
   */
  async rescheduleRevision(id, targetDateStr, reason = null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    const todayStr = getKolkataDateString();
    const newStatus = targetDateStr <= todayStr ? 'due' : 'upcoming';

    return prisma.revisionSchedule.update({
      where: { id },
      data: {
        scheduledDate: new Date(`${targetDateStr}T12:00:00Z`),
        status: newStatus,
        notes: reason ? reason : undefined,
      },
    });
  },

  /**
   * Pause revision
   */
  async pauseRevision(id) {
    const existing = await prisma.revisionSchedule.findUnique({ where: { id } });
    if (!existing) throw new Error('Revision item not found');

    return prisma.revisionSchedule.update({
      where: { id },
      data: { status: 'paused' },
    });
  },

  /**
   * Resume revision
   */
  async resumeRevision(id) {
    const existing = await prisma.revisionSchedule.findUnique({ where: { id } });
    if (!existing) throw new Error('Revision item not found');

    const todayStr = getKolkataDateString();
    const scheduledDateStr = existing.scheduledDate.toISOString().split('T')[0];
    const newStatus = scheduledDateStr <= todayStr ? 'due' : 'upcoming';

    return prisma.revisionSchedule.update({
      where: { id },
      data: { status: newStatus },
    });
  },

  /**
   * Pause / Resume revision
   */
  async togglePause(id) {
    const existing = await prisma.revisionSchedule.findUnique({ where: { id } });
    if (!existing) throw new Error('Revision item not found');

    const nextStatus = existing.status === 'paused' ? 'due' : 'paused';
    return prisma.revisionSchedule.update({
      where: { id },
      data: { status: nextStatus },
    });
  },

  /**
   * Delete revision item
   */
  async deleteRevision(id) {
    const existing = await prisma.revisionSchedule.findUnique({ where: { id } });
    if (!existing) throw new Error('Revision item not found');

    return prisma.revisionSchedule.delete({
      where: { id },
    });
  },

  /**
   * Revision Analytics & Trends
   */
  async getRevisionAnalytics() {
    const [allRevisions, allSessions] = await Promise.all([
      prisma.revisionSchedule.findMany(),
      prisma.revisionSession.findMany({
        orderBy: { revisedAt: 'desc' },
      }),
    ]);

    const todayStr = getKolkataDateString();
    let dueCount = 0;
    let overdueCount = 0;

    allRevisions.forEach((r) => {
      const dStr = getKolkataDateString(r.scheduledDate);
      if (r.status !== 'paused' && !r.completed) {
        if (dStr < todayStr) overdueCount++;
        else if (dStr === todayStr) dueCount++;
      }
    });

    const ratingDistribution = {
      again: 0,
      difficult: 0,
      good: 0,
      easy: 0,
    };

    allSessions.forEach((s) => {
      const r = s.rating?.toLowerCase();
      if (ratingDistribution[r] !== undefined) {
        ratingDistribution[r]++;
      }
    });

    return {
      totalRevisionsCount: allRevisions.length,
      totalSessionsCompleted: allSessions.length,
      dueCount,
      overdueCount,
      ratingDistribution,
    };
  },
};
