import { prisma } from '../config/db.js';
import {
  getKolkataDateString,
  getPreviousKolkataDate,
  addDaysToKolkataDate,
  calculateScheduledDate,
  isKolkataWeekend,
  getKolkataDayOfWeek,
  getKolkataWeekRange,
} from '../utils/date.util.js';
import { StreakService } from './streak.service.js';
import { WeekendReviewService } from './weekendReview.service.js';

export const DAILY_STREAK_TARGET = 5;

/**
 * Pure synchronous in-memory progression computation for a roadmap object.
 * Avoids extra database roundtrips.
 */
export function computeProgressionFromRoadmap(roadmap) {
  if (!roadmap) return null;

  let totalTasks = 0;
  let completedTasks = 0;
  let currentLearningDay = null;
  const dayProgressList = [];

  const days = roadmap.roadmapDays || [];

  for (const day of days) {
    const dayTasks = day.tasks || [];
    const totalDayTasks = dayTasks.length;
    let completedDayTasks = 0;
    const pendingTasks = [];

    dayTasks.forEach((task) => {
      totalTasks++;
      const isDone = task.completions && task.completions.some((c) => c.completed);
      if (isDone) {
        completedTasks++;
        completedDayTasks++;
      } else {
        pendingTasks.push(task);
      }
    });

    const isDayCompleted = totalDayTasks > 0 ? completedDayTasks === totalDayTasks : true;

    const daySummary = {
      id: day.id,
      dayNumber: day.dayNumber,
      title: day.title,
      objective: day.objective,
      estimatedStudyTime: day.estimatedStudyTime,
      dayType: day.dayType,
      moduleId: day.moduleId,
      moduleTitle: day.module?.title || null,
      totalTasks: totalDayTasks,
      completedTasks: completedDayTasks,
      pendingTasksCount: pendingTasks.length,
      isDayCompleted,
      scheduledDate: calculateScheduledDate(roadmap.startDate, day.dayNumber),
      tasks: dayTasks.map((t) => ({
        ...t,
        completed: t.completions && t.completions.some((c) => c.completed),
        completedAt: t.completions?.find((c) => c.completed)?.completedAt || null,
      })),
      pendingTasks: pendingTasks.map((t) => ({
        ...t,
        completed: false,
        roadmapId: roadmap.id,
        roadmapTitle: roadmap.title,
        categoryName: roadmap.category?.name || 'General',
        dayId: day.id,
        dayNumber: day.dayNumber,
        dayTitle: day.title,
        dayType: day.dayType,
        moduleTitle: day.module?.title || null,
        scheduledDate: calculateScheduledDate(roadmap.startDate, day.dayNumber),
      })),
    };

    dayProgressList.push(daySummary);

    // Earliest day with pending tasks becomes currentLearningDay
    if (!currentLearningDay && !isDayCompleted && totalDayTasks > 0) {
      currentLearningDay = daySummary;
    }
  }

  // If all days completed, set to last day or completed state
  if (!currentLearningDay && dayProgressList.length > 0) {
    currentLearningDay = dayProgressList[dayProgressList.length - 1];
  }

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const annotatedDays = dayProgressList.map((d) => {
    let status = 'upcoming';
    if (d.isDayCompleted) {
      status = 'completed';
    } else if (currentLearningDay && d.dayNumber === currentLearningDay.dayNumber) {
      status = 'active';
    }
    return {
      ...d,
      progressionStatus: status,
    };
  });

  return {
    roadmapId: roadmap.id,
    title: roadmap.title,
    slug: roadmap.slug,
    iconIdentifier: roadmap.iconIdentifier,
    themeIdentifier: roadmap.themeIdentifier,
    duration: roadmap.duration,
    startDate: roadmap.startDate,
    status: roadmap.status,
    category: roadmap.category,
    totalTasks,
    completedTasks,
    progressPercent,
    currentLearningDayNumber: currentLearningDay ? currentLearningDay.dayNumber : 1,
    currentLearningDay,
    activeTasks: currentLearningDay ? currentLearningDay.pendingTasks : [],
    days: annotatedDays,
    modules: roadmap.modules || [],
  };
}

export const ProgressionService = {
  /**
   * Calculate overall user streak based on the streak engine.
   */
  async calculateDailyStreak() {
    return StreakService.calculateOverallStreak();
  },

  /**
   * Compute independent progression for a single roadmap by ID.
   */
  async getRoadmapProgression(roadmapId) {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        category: true,
        modules: {
          orderBy: [{ displayOrder: 'asc' }, { startingDay: 'asc' }],
        },
        roadmapDays: {
          orderBy: { dayNumber: 'asc' },
          include: {
            module: { select: { id: true, title: true } },
            tasks: {
              orderBy: { displayOrder: 'asc' },
              select: {
                id: true,
                title: true,
                taskType: true,
                estimatedDuration: true,
                isRequired: true,
                displayOrder: true,
                completions: {
                  select: { completed: true, completedAt: true },
                },
              },
            },
          },
        },
      },
    });

    return computeProgressionFromRoadmap(roadmap);
  },

  /**
   * Get the active adaptive learning queue across all active roadmaps in ONE single query.
   */
  async getDailyLearningQueue() {
    const activeRoadmaps = await prisma.roadmap.findMany({
      where: { status: 'active' },
      include: {
        category: true,
        roadmapDays: {
          orderBy: { dayNumber: 'asc' },
          include: {
            module: { select: { id: true, title: true } },
            tasks: {
              orderBy: { displayOrder: 'asc' },
              select: {
                id: true,
                title: true,
                taskType: true,
                estimatedDuration: true,
                isRequired: true,
                displayOrder: true,
                completions: {
                  select: { completed: true, completedAt: true },
                },
              },
            },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    const roadmapQueues = [];
    let totalQueueTasks = 0;
    let estimatedTotalMinutes = 0;

    for (const r of activeRoadmaps) {
      const prog = computeProgressionFromRoadmap(r);
      if (prog && prog.activeTasks.length > 0) {
        roadmapQueues.push({
          roadmapId: prog.roadmapId,
          title: prog.title,
          slug: prog.slug,
          iconIdentifier: prog.iconIdentifier,
          themeIdentifier: prog.themeIdentifier,
          categoryName: prog.category?.name || 'General',
          currentDayNumber: prog.currentLearningDayNumber,
          currentDayTitle: prog.currentLearningDay?.title || `Day ${prog.currentLearningDayNumber}`,
          totalRoadmapTasks: prog.totalTasks,
          completedRoadmapTasks: prog.completedTasks,
          progressPercent: prog.progressPercent,
          dayTotalTasks: prog.currentLearningDay?.totalTasks || 0,
          dayCompletedTasks: prog.currentLearningDay?.completedTasks || 0,
          activeTasks: prog.activeTasks,
        });

        totalQueueTasks += prog.activeTasks.length;
        prog.activeTasks.forEach((t) => {
          if (t.estimatedDuration) estimatedTotalMinutes += t.estimatedDuration;
        });
      }
    }

    const streakData = await this.calculateDailyStreak();

    return {
      summary: {
        activeRoadmapsCount: roadmapQueues.length,
        totalTasksInQueue: totalQueueTasks,
        estimatedTotalMinutes,
        ...streakData,
      },
      roadmaps: roadmapQueues,
    };
  },

  /**
   * Unified Daily Planner data aggregator
   */
  async getDailyPlannerData(targetDateStr = null) {
    const todayStr = getKolkataDateString();
    const queryDate = targetDateStr || todayStr;
    const isToday = queryDate === todayStr;

    // Calculate exact start & end of queryDate in Asia/Kolkata (UTC+5:30)
    const [y, m, d] = queryDate.split('-').map(Number);
    const startUtc = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - (5 * 60 + 30) * 60 * 1000);
    const endUtc = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - (5 * 60 + 30) * 60 * 1000);

    // Run queue calculation, date-scoped completions, reassignments, rest day, and personal tasks concurrently
    const [adaptiveQueue, completedRecords, reassignments, restDay, personalTasks] = await Promise.all([
      this.getDailyLearningQueue(),
      prisma.taskCompletion.findMany({
        where: {
          completed: true,
          completedAt: {
            gte: startUtc,
            lte: endUtc,
          },
        },
        include: {
          task: {
            include: {
              roadmapDay: {
                include: {
                  roadmap: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      }),
      prisma.taskReassignment.findMany({
        include: {
          task: {
            include: {
              completions: true,
              roadmapDay: {
                include: {
                  roadmap: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
          originalDay: true,
          newDay: true,
        },
        orderBy: { reassignedAt: 'desc' },
      }),
      prisma.plannedRestDay.findUnique({
        where: { date: queryDate },
      }),
      prisma.personalTask.findMany({
        where: {
          OR: [
            { scheduledDate: queryDate },
            {
              completed: true,
              completedAt: {
                gte: startUtc,
                lte: endUtc,
              },
            },
          ],
        },
        include: {
          roadmap: { select: { id: true, title: true } },
        },
        orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    const streak = adaptiveQueue.summary;

    const completedTasksForDate = completedRecords.map((rec) => ({
      id: rec.task.id,
      title: rec.task.title,
      description: rec.task.description,
      taskType: rec.task.taskType,
      priority: rec.task.priority || 'normal',
      estimatedDuration: rec.task.estimatedDuration,
      isRequired: rec.task.isRequired,
      completed: true,
      completedAt: rec.completedAt,
      notes: rec.notes,
      roadmapId: rec.task.roadmapDay.roadmap.id,
      roadmapTitle: rec.task.roadmapDay.roadmap.title,
      categoryName: rec.task.roadmapDay.roadmap.category?.name || 'General',
      dayId: rec.task.roadmapDay.id,
      dayNumber: rec.task.roadmapDay.dayNumber,
      dayTitle: rec.task.roadmapDay.title,
      scheduledDate: calculateScheduledDate(
        rec.task.roadmapDay.roadmap.startDate,
        rec.task.roadmapDay.dayNumber
      ),
    }));

    const rescheduledTasks = reassignments.map((r) => ({
      id: r.task.id,
      title: r.task.title,
      description: r.task.description,
      taskType: r.task.taskType,
      priority: r.task.priority || 'normal',
      estimatedDuration: r.task.estimatedDuration,
      completed: r.task.completions && r.task.completions.some((c) => c.completed),
      reassignmentId: r.id,
      reason: r.reason,
      reassignedAt: r.reassignedAt,
      originalDayNumber: r.originalDay?.dayNumber,
      originalDayTitle: r.originalDay?.title,
      newDayNumber: r.newDay?.dayNumber,
      newDayTitle: r.newDay?.title,
      roadmapId: r.task.roadmapDay?.roadmap?.id,
      roadmapTitle: r.task.roadmapDay?.roadmap?.title,
      categoryName: r.task.roadmapDay?.roadmap?.category?.name || 'General',
    }));

    const activeTasksFlat = [];
    adaptiveQueue.roadmaps.forEach((rm) => {
      rm.activeTasks.forEach((t) => activeTasksFlat.push(t));
    });

    const isWeekend = isKolkataWeekend(queryDate);
    const dayOfWeek = getKolkataDayOfWeek(queryDate);
    const isWeekendRevisionDay = isWeekend;
    const weekendReviewType = isWeekend ? (dayOfWeek === 6 ? 'recollection' : 'assessment') : null;

    let weekendData = null;
    if (isWeekend) {
      if (weekendReviewType === 'recollection') {
        weekendData = await WeekendReviewService.getRecollectionData(queryDate);
      } else {
        weekendData = await WeekendReviewService.getAssessmentData(queryDate);
      }
    }

    // Workload analysis: DevPath target 5 tasks, overload threshold 7 tasks
    const totalScheduled = activeTasksFlat.length + personalTasks.length;
    const isOverloaded = totalScheduled > 7;
    const overloadMessage = isOverloaded
      ? `Workload alert: ${totalScheduled} tasks scheduled for today. Recommended maximum is 7. Would you like to reschedule non-essential tasks to lighter days?`
      : null;

    return {
      date: queryDate,
      isToday,
      todayStr,
      isRestDay: !!restDay,
      restDayInfo: restDay || null,
      isWeekendRevisionDay,
      weekendReviewType,
      weekendData,
      workload: {
        totalScheduled,
        threshold: 7,
        isOverloaded,
        message: overloadMessage,
      },
      streak: {
        currentStreak: streak.currentStreak,
        bestStreak: streak.bestStreak,
        completedToday: streak.completedToday,
        streakTarget: streak.streakTarget,
        remainingToday: streak.remainingToday,
        qualifiedToday: streak.qualifiedToday,
        isPendingToday: streak.isPendingToday,
        streakFreezes: streak.streakFreezes,
        freezeStatus: streak.freezeStatus,
      },
      summary: {
        activeRoadmapsCount: adaptiveQueue.roadmaps.length,
        totalTasksInQueue: activeTasksFlat.length,
        estimatedTotalMinutes: streak.estimatedTotalMinutes,
        completedCountToday: completedTasksForDate.length + personalTasks.filter((p) => p.completed).length,
        rescheduledCount: rescheduledTasks.length,
        personalTasksCount: personalTasks.length,
      },
      roadmapsQueue: adaptiveQueue.roadmaps,
      activeTasks: activeTasksFlat,
      completedTasks: completedTasksForDate,
      personalTasks,
      rescheduledTasks,
    };
  },
};
