import { prisma } from '../config/db.js';
import {
  getKolkataDateString,
  getPreviousKolkataDate,
  addDaysToKolkataDate,
  calculateScheduledDate,
} from '../utils/date.util.js';

export const DEFAULT_STREAK_TARGET = 5;

/**
 * Streak Calculation Engine adhering to:
 * - 5-task default daily qualification (configurable per effective date)
 * - Asia/Kolkata timezone
 * - Distinct completed tasks per local calendar day
 * - Neutral planned rest days (does not break streak, does not increment streak unless completed >= target)
 * - Mid-day pending state (never prematurely breaks streak on current day)
 * - Isolated roadmap-specific streaks (threshold = 1 task/day)
 */
export const StreakService = {
  /**
   * Retrieves effective streak target for a specific date (YYYY-MM-DD)
   * based on historical configurations.
   */
  async getTargetForDate(dateStr, configs = null) {
    let targetConfigs = configs;
    if (!targetConfigs) {
      targetConfigs = await prisma.streakTargetConfig.findMany({
        orderBy: { effectiveFrom: 'asc' },
      });
    }
    if (!targetConfigs || targetConfigs.length === 0) {
      return DEFAULT_STREAK_TARGET;
    }

    let effectiveTarget = DEFAULT_STREAK_TARGET;
    for (const cfg of targetConfigs) {
      if (cfg.effectiveFrom <= dateStr) {
        effectiveTarget = cfg.target;
      }
    }
    return effectiveTarget;
  },

  /**
   * Retrieves all target configurations or updates/creates one.
   */
  async getStreakTargetConfig() {
    const configs = await prisma.streakTargetConfig.findMany({
      orderBy: { effectiveFrom: 'desc' },
    });
    const todayStr = getKolkataDateString();
    const currentTarget = await this.getTargetForDate(todayStr, configs.slice().reverse());
    return {
      currentTarget,
      todayStr,
      history: configs,
    };
  },

  async setStreakTargetConfig(target, effectiveFrom = null) {
    const parsedTarget = parseInt(target, 10);
    if (isNaN(parsedTarget) || parsedTarget < 1 || parsedTarget > 50) {
      throw new Error('Streak target must be an integer between 1 and 50.');
    }
    const effDate = effectiveFrom || getKolkataDateString();

    const config = await prisma.streakTargetConfig.create({
      data: {
        target: parsedTarget,
        effectiveFrom: effDate,
      },
    });
    return config;
  },

  /**
   * Calculate overall application streak across roadmap task completions and personal tasks.
   */
  async calculateOverallStreak(cutoffDays = 365) {
    const todayStr = getKolkataDateString();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);

    // Fetch completions, personal tasks, rest days, and target configs concurrently
    const [completions, personalCompletions, restDaysList, targetConfigs] = await Promise.all([
      prisma.taskCompletion.findMany({
        where: {
          completed: true,
          completedAt: { gte: cutoffDate },
        },
        select: {
          taskId: true,
          completedAt: true,
        },
      }),
      prisma.personalTask.findMany({
        where: {
          completed: true,
          completedAt: { gte: cutoffDate },
        },
        select: {
          id: true,
          completedAt: true,
        },
      }),
      prisma.plannedRestDay.findMany({
        select: { date: true, title: true, reason: true },
      }),
      prisma.streakTargetConfig.findMany({
        orderBy: { effectiveFrom: 'asc' },
      }),
    ]);

    // Build rest day lookup
    const restDayMap = new Map();
    restDaysList.forEach((r) => restDayMap.set(r.date, r));

    // Aggregate distinct completed task IDs per local Kolkata date
    const tasksPerDate = new Map();

    completions.forEach((c) => {
      if (!c.completedAt) return;
      const dStr = getKolkataDateString(c.completedAt);
      if (!tasksPerDate.has(dStr)) {
        tasksPerDate.set(dStr, new Set());
      }
      tasksPerDate.get(dStr).add(`task_${c.taskId}`);
    });

    personalCompletions.forEach((p) => {
      if (!p.completedAt) return;
      const dStr = getKolkataDateString(p.completedAt);
      if (!tasksPerDate.has(dStr)) {
        tasksPerDate.set(dStr, new Set());
      }
      tasksPerDate.get(dStr).add(`personal_${p.id}`);
    });

    // Helper to get effective target for a given date
    const getTarget = (dStr) => {
      if (!targetConfigs || targetConfigs.length === 0) return DEFAULT_STREAK_TARGET;
      let tgt = DEFAULT_STREAK_TARGET;
      for (const cfg of targetConfigs) {
        if (cfg.effectiveFrom <= dStr) tgt = cfg.target;
      }
      return tgt;
    };

    // Identify qualifying dates
    const qualifyingDates = new Set();
    let lastQualifyingDate = null;
    const allKnownDates = new Set([...tasksPerDate.keys()]);

    allKnownDates.forEach((dStr) => {
      const distinctCount = tasksPerDate.get(dStr)?.size || 0;
      const target = getTarget(dStr);
      if (distinctCount >= target) {
        qualifyingDates.add(dStr);
        if (!lastQualifyingDate || dStr > lastQualifyingDate) {
          lastQualifyingDate = dStr;
        }
      }
    });

    // Today's metrics
    const completedToday = tasksPerDate.get(todayStr)?.size || 0;
    const requiredToday = getTarget(todayStr);
    const qualifiedToday = completedToday >= requiredToday;
    const remainingToday = Math.max(0, requiredToday - completedToday);

    // Current Streak calculation with neutral rest days
    let currentStreak = 0;
    let isPendingToday = false;

    if (qualifiedToday) {
      currentStreak = 1;
      let checkDate = getPreviousKolkataDate(todayStr);
      while (true) {
        if (qualifyingDates.has(checkDate)) {
          currentStreak++;
          checkDate = getPreviousKolkataDate(checkDate);
        } else if (restDayMap.has(checkDate)) {
          // Neutral rest day: skip without incrementing or breaking
          checkDate = getPreviousKolkataDate(checkDate);
        } else {
          // Non-qualifying active day -> streak boundary reached
          break;
        }
      }
    } else {
      // Today not yet qualified: check prior active day
      let checkDate = getPreviousKolkataDate(todayStr);
      // Skip backwards over rest days
      while (restDayMap.has(checkDate) && !qualifyingDates.has(checkDate)) {
        checkDate = getPreviousKolkataDate(checkDate);
      }

      if (qualifyingDates.has(checkDate)) {
        // Prior active day qualified! Streak remains intact and pending today
        while (true) {
          if (qualifyingDates.has(checkDate)) {
            currentStreak++;
            checkDate = getPreviousKolkataDate(checkDate);
          } else if (restDayMap.has(checkDate)) {
            checkDate = getPreviousKolkataDate(checkDate);
          } else {
            break;
          }
        }
        isPendingToday = currentStreak > 0;
      } else {
        // Previous day was not a rest day and failed to qualify -> streak broken
        currentStreak = 0;
      }
    }

    // Best Streak calculation across history (allowing neutral rest days)
    const sortedQualifyingDates = Array.from(qualifyingDates).sort();
    let bestStreak = 0;
    if (sortedQualifyingDates.length > 0) {
      let tempStreak = 0;
      let prevDate = null;

      for (const dStr of sortedQualifyingDates) {
        if (!prevDate) {
          tempStreak = 1;
        } else {
          // Check if every day between prevDate and dStr is a rest day
          let cur = addDaysToKolkataDate(prevDate, 1);
          let allInBetweenAreRest = true;
          while (cur < dStr) {
            if (!restDayMap.has(cur)) {
              allInBetweenAreRest = false;
              break;
            }
            cur = addDaysToKolkataDate(cur, 1);
          }

          if (cur === dStr && allInBetweenAreRest) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        prevDate = dStr;
      }
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    return {
      currentStreak,
      bestStreak,
      completedToday,
      requiredToday,
      qualifiedToday,
      isPendingToday,
      lastQualifyingDate,
      totalQualifyingDays: qualifyingDates.size,
      streakTarget: requiredToday,
      remainingToday,
      todayStr,
      isTodayRestDay: restDayMap.has(todayStr),
    };
  },

  /**
   * Calculate roadmap-specific streak (threshold = at least 1 task completed in roadmap per day).
   */
  async calculateRoadmapStreak(roadmapId, cutoffDays = 365) {
    const todayStr = getKolkataDateString();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);

    const [completions, personalCompletions, restDaysList] = await Promise.all([
      prisma.taskCompletion.findMany({
        where: {
          completed: true,
          completedAt: { gte: cutoffDate },
          task: {
            roadmapDay: {
              roadmapId,
            },
          },
        },
        select: {
          taskId: true,
          completedAt: true,
        },
      }),
      prisma.personalTask.findMany({
        where: {
          completed: true,
          completedAt: { gte: cutoffDate },
          roadmapId,
        },
        select: {
          id: true,
          completedAt: true,
        },
      }),
      prisma.plannedRestDay.findMany({
        select: { date: true },
      }),
    ]);

    const restDaySet = new Set(restDaysList.map((r) => r.date));

    const tasksPerDate = new Map();
    completions.forEach((c) => {
      if (!c.completedAt) return;
      const dStr = getKolkataDateString(c.completedAt);
      if (!tasksPerDate.has(dStr)) tasksPerDate.set(dStr, new Set());
      tasksPerDate.get(dStr).add(c.taskId);
    });

    personalCompletions.forEach((p) => {
      if (!p.completedAt) return;
      const dStr = getKolkataDateString(p.completedAt);
      if (!tasksPerDate.has(dStr)) tasksPerDate.set(dStr, new Set());
      tasksPerDate.get(dStr).add(p.id);
    });

    const qualifyingDates = new Set();
    let lastQualifyingDate = null;
    tasksPerDate.forEach((tasks, dStr) => {
      if (tasks.size >= 1) {
        qualifyingDates.add(dStr);
        if (!lastQualifyingDate || dStr > lastQualifyingDate) {
          lastQualifyingDate = dStr;
        }
      }
    });

    const completedToday = tasksPerDate.get(todayStr)?.size || 0;
    const qualifiedToday = completedToday >= 1;

    let currentStreak = 0;
    let isPendingToday = false;

    if (qualifiedToday) {
      currentStreak = 1;
      let checkDate = getPreviousKolkataDate(todayStr);
      while (true) {
        if (qualifyingDates.has(checkDate)) {
          currentStreak++;
          checkDate = getPreviousKolkataDate(checkDate);
        } else if (restDaySet.has(checkDate)) {
          checkDate = getPreviousKolkataDate(checkDate);
        } else {
          break;
        }
      }
    } else {
      let checkDate = getPreviousKolkataDate(todayStr);
      while (restDaySet.has(checkDate) && !qualifyingDates.has(checkDate)) {
        checkDate = getPreviousKolkataDate(checkDate);
      }

      if (qualifyingDates.has(checkDate)) {
        while (true) {
          if (qualifyingDates.has(checkDate)) {
            currentStreak++;
            checkDate = getPreviousKolkataDate(checkDate);
          } else if (restDaySet.has(checkDate)) {
            checkDate = getPreviousKolkataDate(checkDate);
          } else {
            break;
          }
        }
        isPendingToday = currentStreak > 0;
      } else {
        currentStreak = 0;
      }
    }

    // Best streak
    const sorted = Array.from(qualifyingDates).sort();
    let bestStreak = 0;
    let tempStreak = 0;
    let prev = null;
    for (const d of sorted) {
      if (!prev) {
        tempStreak = 1;
      } else {
        let cur = addDaysToKolkataDate(prev, 1);
        let allRest = true;
        while (cur < d) {
          if (!restDaySet.has(cur)) {
            allRest = false;
            break;
          }
          cur = addDaysToKolkataDate(cur, 1);
        }
        if (cur === d && allRest) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) bestStreak = tempStreak;
      prev = d;
    }

    if (currentStreak > bestStreak) bestStreak = currentStreak;

    return {
      roadmapId,
      currentStreak,
      bestStreak,
      completedToday,
      qualifiedToday,
      isPendingToday,
      lastQualifyingDate,
      totalQualifyingDays: qualifyingDates.size,
    };
  },

  /**
   * 12-Month GitHub-style Activity Heatmap
   */
  async getActivityHeatmap(months = 12) {
    const todayStr = getKolkataDateString();
    const daysCount = months * 30;
    const startDateStr = addDaysToKolkataDate(todayStr, -daysCount);

    const [completions, personalCompletions, restDaysList, targetConfigs] = await Promise.all([
      prisma.taskCompletion.findMany({
        where: {
          completed: true,
          completedAt: {
            gte: new Date(`${startDateStr}T00:00:00.000Z`),
          },
        },
        select: {
          taskId: true,
          completedAt: true,
        },
      }),
      prisma.personalTask.findMany({
        where: {
          completed: true,
          completedAt: {
            gte: new Date(`${startDateStr}T00:00:00.000Z`),
          },
        },
        select: {
          id: true,
          completedAt: true,
        },
      }),
      prisma.plannedRestDay.findMany({
        select: { date: true, title: true, reason: true },
      }),
      prisma.streakTargetConfig.findMany({
        orderBy: { effectiveFrom: 'asc' },
      }),
    ]);

    const restDayMap = new Map();
    restDaysList.forEach((r) => restDayMap.set(r.date, r));

    const tasksPerDate = new Map();
    completions.forEach((c) => {
      if (!c.completedAt) return;
      const dStr = getKolkataDateString(c.completedAt);
      if (!tasksPerDate.has(dStr)) tasksPerDate.set(dStr, new Set());
      tasksPerDate.get(dStr).add(`t_${c.taskId}`);
    });
    personalCompletions.forEach((p) => {
      if (!p.completedAt) return;
      const dStr = getKolkataDateString(p.completedAt);
      if (!tasksPerDate.has(dStr)) tasksPerDate.set(dStr, new Set());
      tasksPerDate.get(dStr).add(`p_${p.id}`);
    });

    const getTarget = (dStr) => {
      if (!targetConfigs || targetConfigs.length === 0) return DEFAULT_STREAK_TARGET;
      let tgt = DEFAULT_STREAK_TARGET;
      for (const cfg of targetConfigs) {
        if (cfg.effectiveFrom <= dStr) tgt = cfg.target;
      }
      return tgt;
    };

    const days = [];
    let cur = startDateStr;
    let totalCompletedTasks = 0;
    let totalActiveDays = 0;
    let maxTasksInDay = 0;

    while (cur <= todayStr) {
      const count = tasksPerDate.get(cur)?.size || 0;
      const target = getTarget(cur);
      const isRestDay = restDayMap.has(cur);
      const restDayInfo = restDayMap.get(cur) || null;
      const qualified = count >= target;

      if (count > 0) {
        totalCompletedTasks += count;
        totalActiveDays++;
        if (count > maxTasksInDay) maxTasksInDay = count;
      }

      // Activity level: 0 to 4
      let level = 0;
      if (count === 0) level = 0;
      else if (count <= 2) level = 1;
      else if (count <= 4) level = 2;
      else if (count <= 7) level = 3;
      else level = 4;

      days.push({
        date: cur,
        count,
        target,
        qualified,
        isRestDay,
        restDayTitle: restDayInfo?.title || null,
        level,
      });

      cur = addDaysToKolkataDate(cur, 1);
    }

    const overallStreak = await this.calculateOverallStreak();

    return {
      days,
      summary: {
        totalDays: days.length,
        totalActiveDays,
        totalCompletedTasks,
        maxTasksInDay,
        currentStreak: overallStreak.currentStreak,
        bestStreak: overallStreak.bestStreak,
        totalQualifyingDays: overallStreak.totalQualifyingDays,
      },
    };
  },

  /**
   * Daily Progress Summary for any given date
   */
  async getDailyProgressSummary(dateStr = getKolkataDateString()) {
    const todayStr = getKolkataDateString();
    const queryDate = dateStr || todayStr;

    // Time boundary for completedAt in Asia/Kolkata
    const [y, m, d] = queryDate.split('-').map(Number);
    const startUtc = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - (5 * 60 + 30) * 60 * 1000);
    const endUtc = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - (5 * 60 + 30) * 60 * 1000);

    const [completions, personalCompleted, restDay, roadmaps, personalScheduled, reassignments] =
      await Promise.all([
        prisma.taskCompletion.findMany({
          where: {
            completed: true,
            completedAt: { gte: startUtc, lte: endUtc },
          },
          include: {
            task: {
              include: {
                roadmapDay: {
                  include: {
                    roadmap: { select: { id: true, title: true, startDate: true } },
                  },
                },
              },
            },
          },
        }),
        prisma.personalTask.findMany({
          where: {
            completed: true,
            completedAt: { gte: startUtc, lte: endUtc },
          },
        }),
        prisma.plannedRestDay.findUnique({
          where: { date: queryDate },
        }),
        prisma.roadmap.findMany({
          where: { status: 'active', startDate: { not: null } },
          include: {
            roadmapDays: {
              include: {
                tasks: {
                  include: { completions: true },
                },
              },
            },
          },
        }),
        prisma.personalTask.findMany({
          where: { scheduledDate: queryDate },
        }),
        prisma.taskReassignment.findMany({
          where: {
            reassignedAt: { gte: startUtc, lte: endUtc },
          },
          include: {
            task: true,
            originalDay: true,
            newDay: true,
          },
        }),
      ]);

    // Calculate scheduled roadmap tasks for this date:
    // Scheduled if calculateScheduledDate(roadmap.startDate, day.dayNumber) === queryDate
    let scheduledRoadmapTasksCount = 0;
    let studyDurationMinutes = 0;

    roadmaps.forEach((rm) => {
      rm.roadmapDays.forEach((day) => {
        const sched = calculateScheduledDate(rm.startDate, day.dayNumber);
        if (sched && getKolkataDateString(sched) === queryDate) {
          scheduledRoadmapTasksCount += day.tasks.length;
        }
      });
    });

    const totalScheduled = scheduledRoadmapTasksCount + personalScheduled.length;

    // Completed tasks
    completions.forEach((c) => {
      if (c.task?.estimatedDuration) studyDurationMinutes += c.task.estimatedDuration;
    });
    personalCompleted.forEach((p) => {
      if (p.estimatedDuration) studyDurationMinutes += p.estimatedDuration;
    });

    const totalCompleted = completions.length + personalCompleted.length;
    const pendingCount = Math.max(0, totalScheduled - totalCompleted);

    const completionPercentage =
      totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : totalCompleted > 0 ? 100 : 0;

    const target = await this.getTargetForDate(queryDate);

    return {
      date: queryDate,
      isRestDay: !!restDay,
      restDayInfo: restDay || null,
      scheduled: totalScheduled,
      completed: totalCompleted,
      pending: pendingCount,
      rescheduled: reassignments.length,
      studyDurationMinutes,
      completionPercentage,
      streakTarget: target,
      qualifiedForStreak: totalCompleted >= target,
    };
  },

  /**
   * Filterable, searchable, paginated Learning History
   */
  async getLearningHistory(filters = {}, pagination = { page: 1, limit: 20 }) {
    const page = Math.max(1, parseInt(pagination.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(pagination.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const { status, roadmapId, categoryId, taskType, search, startDate, endDate } = filters;

    const completionWhere = { completed: true };

    if (roadmapId) {
      completionWhere.task = {
        roadmapDay: {
          roadmapId,
        },
      };
    }

    if (categoryId) {
      completionWhere.task = {
        ...completionWhere.task,
        roadmapDay: {
          ...(completionWhere.task?.roadmapDay || {}),
          roadmap: {
            categoryId,
          },
        },
      };
    }

    if (taskType) {
      completionWhere.task = {
        ...(completionWhere.task || {}),
        taskType,
      };
    }

    if (search) {
      completionWhere.task = {
        ...(completionWhere.task || {}),
        title: { contains: search, mode: 'insensitive' },
      };
    }

    if (startDate || endDate) {
      completionWhere.completedAt = {};
      if (startDate) {
        const [y, m, d] = startDate.split('-').map(Number);
        completionWhere.completedAt.gte = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - (5 * 60 + 30) * 60 * 1000);
      }
      if (endDate) {
        const [y, m, d] = endDate.split('-').map(Number);
        completionWhere.completedAt.lte = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - (5 * 60 + 30) * 60 * 1000);
      }
    }

    const [totalCount, completions] = await Promise.all([
      prisma.taskCompletion.count({ where: completionWhere }),
      prisma.taskCompletion.findMany({
        where: completionWhere,
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
        skip,
        take: limit,
      }),
    ]);

    const records = completions.map((c) => ({
      id: c.id,
      taskId: c.taskId,
      title: c.task.title,
      description: c.task.description,
      taskType: c.task.taskType,
      priority: c.task.priority || 'normal',
      estimatedDuration: c.task.estimatedDuration,
      completedAt: c.completedAt,
      completedDateStr: c.completedAt ? getKolkataDateString(c.completedAt) : null,
      notes: c.notes,
      roadmapId: c.task.roadmapDay.roadmap.id,
      roadmapTitle: c.task.roadmapDay.roadmap.title,
      categoryName: c.task.roadmapDay.roadmap.category?.name || 'General',
      categoryId: c.task.roadmapDay.roadmap.categoryId,
      dayNumber: c.task.roadmapDay.dayNumber,
      dayTitle: c.task.roadmapDay.title,
    }));

    return {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      records,
    };
  },
};
