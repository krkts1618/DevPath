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
   * Get the active adaptive learning queue across all active roadmaps.
   * Optimized with lean queries and fast SQL aggregation to avoid loading entire curriculums.
   */
  async getDailyLearningQueue() {
    // 1. Fetch active roadmaps metadata
    const activeRoadmaps = await prisma.roadmap.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        title: true,
        slug: true,
        iconIdentifier: true,
        themeIdentifier: true,
        duration: true,
        startDate: true,
        status: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const roadmapQueues = [];
    let totalQueueTasks = 0;
    let estimatedTotalMinutes = 0;

    try {
      // 2. Compute aggregate counts & earliest incomplete active days directly in Postgres
      const [aggregates, activeDays] = await Promise.all([
        prisma.$queryRaw`
          SELECT 
            rd.roadmap_id,
            COUNT(t.id)::int as total_tasks,
            COUNT(DISTINCT CASE WHEN tc.completed = true THEN tc.task_id END)::int as completed_tasks
          FROM roadmap_days rd
          JOIN tasks t ON t.roadmap_day_id = rd.id
          LEFT JOIN task_completions tc ON tc.task_id = t.id AND tc.completed = true
          JOIN roadmaps r ON r.id = rd.roadmap_id AND r.status = 'active'
          GROUP BY rd.roadmap_id
        `,
        prisma.$queryRaw`
          WITH day_task_status AS (
            SELECT 
              rd.roadmap_id,
              rd.id as day_id,
              rd.day_number,
              rd.title as day_title,
              COUNT(t.id)::int as total_day_tasks,
              COUNT(CASE WHEN tc.completed = true THEN 1 END)::int as completed_day_tasks
            FROM roadmap_days rd
            JOIN tasks t ON t.roadmap_day_id = rd.id
            LEFT JOIN task_completions tc ON tc.task_id = t.id AND tc.completed = true
            JOIN roadmaps r ON r.id = rd.roadmap_id AND r.status = 'active'
            GROUP BY rd.roadmap_id, rd.id, rd.day_number, rd.title
          ),
          earliest_incomplete_day AS (
            SELECT 
              roadmap_id,
              MIN(day_number) as min_pending_day
            FROM day_task_status
            WHERE completed_day_tasks < total_day_tasks
            GROUP BY roadmap_id
          )
          SELECT 
            dts.roadmap_id,
            dts.day_id,
            dts.day_number,
            dts.day_title,
            dts.total_day_tasks,
            dts.completed_day_tasks,
            (dts.total_day_tasks - dts.completed_day_tasks)::int as remaining_day_tasks
          FROM day_task_status dts
          JOIN earliest_incomplete_day eid 
            ON eid.roadmap_id = dts.roadmap_id 
            AND eid.min_pending_day = dts.day_number
        `,
      ]);

      const aggMap = new Map(aggregates.map((a) => [a.roadmap_id, a]));
      const activeDayMap = new Map(activeDays.map((d) => [d.roadmap_id, d]));

      // 3. Query ONLY the incomplete tasks of the active days (at most ~20 tasks)
      const activeDayIds = activeDays.map((d) => d.day_id);
      const queueTasks = activeDayIds.length > 0 ? await prisma.task.findMany({
        where: {
          roadmapDayId: { in: activeDayIds },
          completions: { none: { completed: true } },
        },
        select: {
          id: true,
          title: true,
          description: true,
          taskType: true,
          priority: true,
          estimatedDuration: true,
          isRequired: true,
          displayOrder: true,
          roadmapDayId: true,
          roadmapDay: {
            select: {
              id: true,
              dayNumber: true,
              title: true,
              dayType: true,
              module: { select: { title: true } },
              roadmap: {
                select: {
                  id: true,
                  title: true,
                  startDate: true,
                  category: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      }) : [];

      const queueTasksByRoadmap = new Map();
      queueTasks.forEach((t) => {
        const rId = t.roadmapDay.roadmap.id;
        if (!queueTasksByRoadmap.has(rId)) queueTasksByRoadmap.set(rId, []);
        queueTasksByRoadmap.get(rId).push({
          id: t.id,
          title: t.title,
          description: t.description,
          taskType: t.taskType,
          priority: t.priority || 'normal',
          estimatedDuration: t.estimatedDuration,
          isRequired: t.isRequired,
          displayOrder: t.displayOrder,
          completed: false,
          completedAt: null,
          roadmapId: t.roadmapDay.roadmap.id,
          roadmapTitle: t.roadmapDay.roadmap.title,
          categoryName: t.roadmapDay.roadmap.category?.name || 'General',
          dayId: t.roadmapDay.id,
          dayNumber: t.roadmapDay.dayNumber,
          dayTitle: t.roadmapDay.title,
          dayType: t.roadmapDay.dayType,
          moduleTitle: t.roadmapDay.module?.title || null,
          scheduledDate: calculateScheduledDate(t.roadmapDay.roadmap.startDate, t.roadmapDay.dayNumber),
        });
      });

      for (const r of activeRoadmaps) {
        const agg = aggMap.get(r.id) || { total_tasks: 0, completed_tasks: 0 };
        const activeDay = activeDayMap.get(r.id);
        const dayNumber = activeDay ? activeDay.day_number : (r.duration || 1);
        const dayTitle = activeDay ? activeDay.day_title : `Day ${dayNumber}`;
        const dayTotalTasks = activeDay ? activeDay.total_day_tasks : 0;
        const dayCompletedTasks = activeDay ? activeDay.completed_day_tasks : 0;
        const activeTasks = queueTasksByRoadmap.get(r.id) || [];
        const progressPercent = agg.total_tasks > 0 ? Math.round((agg.completed_tasks / agg.total_tasks) * 100) : 0;

        if (activeTasks.length > 0) {
          roadmapQueues.push({
            roadmapId: r.id,
            title: r.title,
            slug: r.slug,
            iconIdentifier: r.iconIdentifier,
            themeIdentifier: r.themeIdentifier,
            categoryName: r.category?.name || 'General',
            currentDayNumber: dayNumber,
            currentDayTitle: dayTitle,
            totalRoadmapTasks: agg.total_tasks,
            completedRoadmapTasks: agg.completed_tasks,
            progressPercent,
            dayTotalTasks,
            dayCompletedTasks,
            activeTasks,
          });

          totalQueueTasks += activeTasks.length;
          activeTasks.forEach((t) => {
            if (t.estimatedDuration) estimatedTotalMinutes += t.estimatedDuration;
          });
        }
      }
    } catch (sqlErr) {
      console.warn('[ProgressionService] SQL queue fallback:', sqlErr.message);
      // Graceful fallback
      const fullRoadmaps = await prisma.roadmap.findMany({
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
                  completions: { select: { completed: true, completedAt: true } },
                },
              },
            },
          },
        },
        orderBy: { displayOrder: 'asc' },
      });

      for (const r of fullRoadmaps) {
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

    // Run queue calculation followed by date-scoped records in lean batches
    const adaptiveQueue = await this.getDailyLearningQueue();

    const [completedRecords, reassignments, restDay, personalTasks] = await Promise.all([
      prisma.taskCompletion.findMany({
        where: {
          completed: true,
          completedAt: {
            gte: startUtc,
            lte: endUtc,
          },
        },
        select: {
          id: true,
          completedAt: true,
          notes: true,
          task: {
            select: {
              id: true,
              title: true,
              description: true,
              taskType: true,
              priority: true,
              estimatedDuration: true,
              isRequired: true,
              roadmapDay: {
                select: {
                  id: true,
                  dayNumber: true,
                  title: true,
                  roadmap: {
                    select: {
                      id: true,
                      title: true,
                      startDate: true,
                      category: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 100,
      }),
      prisma.taskReassignment.findMany({
        take: 50,
        select: {
          id: true,
          reason: true,
          reassignedAt: true,
          originalDay: { select: { dayNumber: true, title: true } },
          newDay: { select: { dayNumber: true, title: true } },
          task: {
            select: {
              id: true,
              title: true,
              description: true,
              taskType: true,
              priority: true,
              estimatedDuration: true,
              completions: { select: { completed: true } },
              roadmapDay: {
                select: {
                  roadmap: {
                    select: {
                      id: true,
                      title: true,
                      category: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
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
        take: 100,
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
