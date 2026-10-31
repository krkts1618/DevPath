import { prisma } from '../config/db.js';
import {
  getKolkataDateString,
  addDaysToKolkataDate,
  calculateScheduledDate,
} from '../utils/date.util.js';

export const LifecycleService = {
  /**
   * Pause an individual roadmap with reason and timestamp.
   * Paused roadmaps are excluded from the active daily learning queue.
   */
  async pauseRoadmap(roadmapId, reason = null) {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
    });
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }
    if (roadmap.status === 'paused') {
      throw new Error('Roadmap is already paused');
    }

    const [updatedRoadmap, pauseRecord] = await prisma.$transaction([
      prisma.roadmap.update({
        where: { id: roadmapId },
        data: { status: 'paused' },
      }),
      prisma.roadmapPauseHistory.create({
        data: {
          roadmapId,
          pausedAt: new Date(),
          reason: reason || 'Paused by user',
        },
      }),
    ]);

    return {
      roadmap: updatedRoadmap,
      pauseRecord,
    };
  },

  /**
   * Resume an individual roadmap, closing the active pause period.
   */
  async resumeRoadmap(roadmapId) {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
    });
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }
    if (roadmap.status !== 'paused') {
      throw new Error('Roadmap is not currently paused');
    }

    // Find the latest open pause record
    const openPause = await prisma.roadmapPauseHistory.findFirst({
      where: { roadmapId, resumedAt: null },
      orderBy: { pausedAt: 'desc' },
    });

    const operations = [
      prisma.roadmap.update({
        where: { id: roadmapId },
        data: { status: 'active' },
      }),
    ];

    if (openPause) {
      operations.push(
        prisma.roadmapPauseHistory.update({
          where: { id: openPause.id },
          data: { resumedAt: new Date() },
        })
      );
    }

    const [updatedRoadmap, closedPause] = await prisma.$transaction(operations);

    return {
      roadmap: updatedRoadmap,
      pauseRecord: closedPause || null,
    };
  },

  /**
   * Get complete pause and resume history for a roadmap.
   */
  async getRoadmapPauseHistory(roadmapId) {
    return prisma.roadmapPauseHistory.findMany({
      where: { roadmapId },
      orderBy: { pausedAt: 'desc' },
    });
  },

  /**
   * Planned Rest Days Management
   */
  async getRestDays(startDate = null, endDate = null) {
    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }
    return prisma.plannedRestDay.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  },

  async setRestDay(dateStr, title = 'Planned Rest Day', reason = null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }
    return prisma.plannedRestDay.upsert({
      where: { date: dateStr },
      update: { title, reason },
      create: { date: dateStr, title, reason },
    });
  },

  async removeRestDay(dateStr) {
    return prisma.plannedRestDay.deleteMany({
      where: { date: dateStr },
    });
  },

  /**
   * Manual Personal Learning Tasks
   */
  async createPersonalTask(data) {
    const {
      title,
      description,
      scheduledDate,
      dueDate,
      priority = 'normal',
      estimatedDuration = 30,
      category = 'Personal Learning',
      roadmapId = null,
    } = data;

    if (!title || !title.trim()) {
      throw new Error('Personal task title is required');
    }

    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    const assignedPriority = validPriorities.includes(priority?.toLowerCase())
      ? priority.toLowerCase()
      : 'normal';

    const schedDate = scheduledDate || getKolkataDateString();

    return prisma.personalTask.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        scheduledDate: schedDate,
        dueDate: dueDate || null,
        priority: assignedPriority,
        estimatedDuration: Number(estimatedDuration) || 30,
        category: category || 'Personal Learning',
        roadmapId: roadmapId || null,
      },
      include: {
        roadmap: {
          select: { id: true, title: true },
        },
      },
    });
  },

  async updatePersonalTask(id, data) {
    const {
      title,
      description,
      scheduledDate,
      dueDate,
      priority,
      estimatedDuration,
      category,
      roadmapId,
    } = data;

    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (description !== undefined) updatePayload.description = description;
    if (scheduledDate !== undefined) updatePayload.scheduledDate = scheduledDate;
    if (dueDate !== undefined) updatePayload.dueDate = dueDate;
    if (priority !== undefined) {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (validPriorities.includes(priority.toLowerCase())) {
        updatePayload.priority = priority.toLowerCase();
      }
    }
    if (estimatedDuration !== undefined) {
      updatePayload.estimatedDuration = Number(estimatedDuration) || 30;
    }
    if (category !== undefined) updatePayload.category = category;
    if (roadmapId !== undefined) updatePayload.roadmapId = roadmapId || null;

    return prisma.personalTask.update({
      where: { id },
      data: updatePayload,
      include: {
        roadmap: { select: { id: true, title: true } },
      },
    });
  },

  async togglePersonalTask(id) {
    const existing = await prisma.personalTask.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Personal task not found');
    }

    const nextCompleted = !existing.completed;
    return prisma.personalTask.update({
      where: { id },
      data: {
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date() : null,
      },
      include: {
        roadmap: { select: { id: true, title: true } },
      },
    });
  },

  async deletePersonalTask(id) {
    return prisma.personalTask.delete({
      where: { id },
    });
  },

  async getPersonalTasks(dateStr = null) {
    const where = {};
    if (dateStr) {
      where.scheduledDate = dateStr;
    }
    return prisma.personalTask.findMany({
      where,
      orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
      include: {
        roadmap: { select: { id: true, title: true } },
      },
    });
  },

  /**
   * Update priority for standard roadmap tasks
   */
  async updateTaskPriority(taskId, priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority?.toLowerCase())) {
      throw new Error(`Priority must be one of: ${validPriorities.join(', ')}`);
    }
    return prisma.task.update({
      where: { id: taskId },
      data: { priority: priority.toLowerCase() },
    });
  },

  /**
   * Comprehensive Calendar Events Generator
   */
  async getCalendarEvents(startStr, endStr) {
    const todayStr = getKolkataDateString();
    const queryStart = startStr || addDaysToKolkataDate(todayStr, -15);
    const queryEnd = endStr || addDaysToKolkataDate(todayStr, 45);

    // Fetch active & paused roadmaps, rest days, personal tasks, and revision items
    const [roadmaps, restDays, personalTasks, revisions] = await Promise.all([
      prisma.roadmap.findMany({
        where: {
          status: { in: ['active', 'paused'] },
          startDate: { not: null },
        },
        include: {
          category: true,
          roadmapDays: {
            orderBy: { dayNumber: 'asc' },
            include: {
              tasks: {
                include: { completions: true },
              },
            },
          },
        },
      }),
      prisma.plannedRestDay.findMany({
        where: {
          date: { gte: queryStart, lte: queryEnd },
        },
      }),
      prisma.personalTask.findMany({
        where: {
          scheduledDate: { gte: queryStart, lte: queryEnd },
        },
        include: {
          roadmap: { select: { id: true, title: true } },
        },
      }),
      prisma.revisionSchedule.findMany({
        where: {
          scheduledDate: {
            gte: new Date(`${queryStart}T00:00:00.000Z`),
            lte: new Date(`${queryEnd}T23:59:59.999Z`),
          },
        },
        include: {
          roadmap: { select: { id: true, title: true } },
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    const eventsByDate = {};

    // Helper to push into eventsByDate
    const addEvent = (dStr, evt) => {
      if (!eventsByDate[dStr]) eventsByDate[dStr] = [];
      eventsByDate[dStr].push(evt);
    };

    // 1. Rest days
    restDays.forEach((r) => {
      addEvent(r.date, {
        id: `rest_${r.id}`,
        type: 'rest_day',
        title: r.title || 'Planned Rest Day',
        reason: r.reason,
        date: r.date,
        isNeutral: true,
      });
    });

    // 2. Roadmap Days
    roadmaps.forEach((rm) => {
      rm.roadmapDays.forEach((day) => {
        const sched = calculateScheduledDate(rm.startDate, day.dayNumber);
        if (!sched) return;
        const dStr = getKolkataDateString(sched);
        if (dStr < queryStart || dStr > queryEnd) return;

        const totalTasks = day.tasks.length;
        const completedTasks = day.tasks.filter(
          (t) => t.completions && t.completions.some((c) => c.completed)
        ).length;
        const isCompleted = totalTasks > 0 ? completedTasks === totalTasks : true;
        const isPastDue = dStr < todayStr && !isCompleted;

        addEvent(dStr, {
          id: `roadmap_day_${day.id}`,
          type: 'roadmap_day',
          roadmapId: rm.id,
          roadmapTitle: rm.title,
          roadmapStatus: rm.status,
          categoryName: rm.category?.name || 'General',
          dayId: day.id,
          dayNumber: day.dayNumber,
          dayTitle: day.title,
          dayType: day.dayType,
          totalTasks,
          completedTasks,
          isCompleted,
          isPastDue,
          estimatedStudyTime: day.estimatedStudyTime,
          tasks: day.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority || 'normal',
            taskType: t.taskType,
            completed: t.completions && t.completions.some((c) => c.completed),
          })),
        });
      });
    });

    // 3. Personal Tasks
    personalTasks.forEach((pt) => {
      addEvent(pt.scheduledDate, {
        id: `personal_${pt.id}`,
        type: 'personal_task',
        personalTaskId: pt.id,
        title: pt.title,
        priority: pt.priority,
        estimatedDuration: pt.estimatedDuration,
        completed: pt.completed,
        dueDate: pt.dueDate,
        roadmapId: pt.roadmapId,
        roadmapTitle: pt.roadmap?.title || null,
        category: pt.category,
      });
    });

    // 4. Revision Schedules
    revisions.forEach((rev) => {
      const dStr = getKolkataDateString(rev.scheduledDate);
      if (dStr >= queryStart && dStr <= queryEnd) {
        addEvent(dStr, {
          id: `revision_${rev.id}`,
          type: 'revision',
          title: `Revision #${rev.revisionNumber}: ${rev.task?.title || rev.roadmap.title}`,
          revisionNumber: rev.revisionNumber,
          completed: rev.completed,
          roadmapId: rev.roadmapId,
          roadmapTitle: rev.roadmap.title,
          notes: rev.notes,
        });
      }
    });

    return {
      queryStart,
      queryEnd,
      todayStr,
      eventsByDate,
    };
  },
};
