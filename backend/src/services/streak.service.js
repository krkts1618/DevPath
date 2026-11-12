import { prisma } from '../config/db.js';
import {
  getKolkataDateString,
  getPreviousKolkataDate,
  addDaysToKolkataDate,
  calculateScheduledDate,
  isKolkataWeekday,
  isKolkataWeekend,
  getKolkataYearMonth,
  getKolkataDayOfWeek,
} from '../utils/date.util.js';

export const DEFAULT_STREAK_TARGET = 5;
export const MAX_MONTHLY_FREEZES = 4;

let streakCache = null;
let streakCacheTimestamp = 0;
const STREAK_CACHE_TTL_MS = 15000; // 15 seconds

let heatmapCache = null;
let heatmapCacheTimestamp = 0;

export function invalidateStreakCache() {
  streakCache = null;
  streakCacheTimestamp = 0;
  heatmapCache = null;
  heatmapCacheTimestamp = 0;
}

/**
 * Streak Calculation Engine adhering to:
 * - 5-task default daily qualification (configurable per effective date)
 * - Five-Day Learning Week (Monday–Friday learning days; Saturday & Sunday dedicated revision)
 * - Weekends are neutral: they never reset or increment weekday learning streak
 * - Four Monthly Streak Freezes (resets to 4 on calendar month boundary in Asia/Kolkata)
 * - Automatic streak protection on missed weekdays when freezes available
 * - Idempotent, duplicate-preventing freeze consumption
 * - Distinct completed tasks per local calendar day
 * - Neutral planned rest days
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
   * Adheres to 5-day learning week and 4 monthly streak freezes.
   */
  async calculateOverallStreak(cutoffDays = 365) {
    const todayStr = getKolkataDateString();
    const currentYearMonth = getKolkataYearMonth(todayStr);

    if (cutoffDays === 365 && streakCache && Date.now() - streakCacheTimestamp < STREAK_CACHE_TTL_MS) {
      return { ...streakCache };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);

    // Fetch in 2 small batches to prevent Supabase connection pool exhaustion (10054 ConnectionReset)
    const [completions, personalCompletions] = await Promise.all([
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
    ]);

    const [restDaysList, targetConfigs, streakFreezes] = await Promise.all([
      prisma.plannedRestDay.findMany({
        select: { date: true, title: true, reason: true },
      }),
      prisma.streakTargetConfig.findMany({
        orderBy: { effectiveFrom: 'asc' },
      }),
      prisma.streakFreeze.findMany({
        orderBy: { date: 'asc' },
      }),
    ]);

    // Build rest day lookup
    const restDayMap = new Map();
    restDaysList.forEach((r) => restDayMap.set(r.date, r));

    // Build frozen dates lookup and monthly freeze usage
    const frozenDateSet = new Set(streakFreezes.map((f) => f.date));
    const monthlyFreezeCounts = new Map();
    streakFreezes.forEach((f) => {
      monthlyFreezeCounts.set(f.yearMonth, (monthlyFreezeCounts.get(f.yearMonth) || 0) + 1);
    });

    const getFreezesRemaining = (ym) =>
      Math.max(0, MAX_MONTHLY_FREEZES - (monthlyFreezeCounts.get(ym) || 0));

    const newFreezesToCreate = [];
    const tryConsumeFreeze = (dateStr) => {
      if (isKolkataWeekend(dateStr)) return false; // Weekends never consume freezes
      if (frozenDateSet.has(dateStr)) return true; // Already protected by freeze
      const ym = dateStr.slice(0, 7);
      if (getFreezesRemaining(ym) > 0) {
        newFreezesToCreate.push({
          date: dateStr,
          yearMonth: ym,
          reason: `Missed weekday learning target on ${dateStr} automatically protected`,
        });
        frozenDateSet.add(dateStr);
        monthlyFreezeCounts.set(ym, (monthlyFreezeCounts.get(ym) || 0) + 1);
        return true;
      }
      return false;
    };

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

    // Identify qualifying dates: Monday–Friday weekdays count towards learning streak
    const qualifyingDates = new Set();
    const weekendActivityDates = new Set();
    let lastQualifyingDate = null;
    const allKnownDates = new Set([...tasksPerDate.keys()]);

    allKnownDates.forEach((dStr) => {
      const distinctCount = tasksPerDate.get(dStr)?.size || 0;
      const target = getTarget(dStr);
      if (distinctCount >= target) {
        if (isKolkataWeekday(dStr)) {
          qualifyingDates.add(dStr);
          if (!lastQualifyingDate || dStr > lastQualifyingDate) {
            lastQualifyingDate = dStr;
          }
        } else {
          weekendActivityDates.add(dStr);
        }
      } else if (distinctCount > 0 && isKolkataWeekend(dStr)) {
        weekendActivityDates.add(dStr);
      }
    });

    // Today's metrics
    const isTodayWeekday = isKolkataWeekday(todayStr);
    const isTodayWeekend = isKolkataWeekend(todayStr);
    const dailyTarget = getTarget(todayStr);
    const completedToday = tasksPerDate.get(todayStr)?.size || 0;
    const requiredToday = isTodayWeekday ? dailyTarget : 0;
    const qualifiedToday = isTodayWeekday && completedToday >= requiredToday;
    const remainingToday = isTodayWeekday ? Math.max(0, requiredToday - completedToday) : 0;

    // Current Streak calculation with neutral weekends, neutral rest days, and streak freezes
    let currentStreak = 0;
    let isPendingToday = false;

    if (qualifiedToday) {
      currentStreak = 1;
      let checkDate = getPreviousKolkataDate(todayStr);
      while (true) {
        if (isKolkataWeekend(checkDate)) {
          // Weekend revision day: neutral, does not break or increment streak
          checkDate = getPreviousKolkataDate(checkDate);
        } else if (restDayMap.has(checkDate)) {
          // Planned rest day: neutral
          checkDate = getPreviousKolkataDate(checkDate);
        } else if (qualifyingDates.has(checkDate)) {
          currentStreak++;
          checkDate = getPreviousKolkataDate(checkDate);
        } else if (tryConsumeFreeze(checkDate)) {
          // Protected by streak freeze: preserves streak without incrementing count
          checkDate = getPreviousKolkataDate(checkDate);
        } else {
          // Unprotected missed weekday: streak boundary reached
          break;
        }
      }
    } else {
      // Today not yet qualified (mid-day pending weekday, or today is a weekend, or a rest day)
      let checkDate = getPreviousKolkataDate(todayStr);
      while (isKolkataWeekend(checkDate) || restDayMap.has(checkDate)) {
        checkDate = getPreviousKolkataDate(checkDate);
      }

      // Check if latest past weekday qualified or was protected by freeze
      const isCheckDateProtected = qualifyingDates.has(checkDate) || tryConsumeFreeze(checkDate);
      if (isCheckDateProtected) {
        while (true) {
          if (isKolkataWeekend(checkDate)) {
            checkDate = getPreviousKolkataDate(checkDate);
          } else if (restDayMap.has(checkDate)) {
            checkDate = getPreviousKolkataDate(checkDate);
          } else if (qualifyingDates.has(checkDate)) {
            currentStreak++;
            checkDate = getPreviousKolkataDate(checkDate);
          } else if (tryConsumeFreeze(checkDate)) {
            checkDate = getPreviousKolkataDate(checkDate);
          } else {
            break;
          }
        }
        isPendingToday = isTodayWeekday && currentStreak > 0;
      } else {
        currentStreak = 0;
        isPendingToday = false;
      }
    }

    // Persist any newly consumed streak freezes safely
    if (newFreezesToCreate.length > 0) {
      try {
        await prisma.streakFreeze.createMany({
          data: newFreezesToCreate,
          skipDuplicates: true,
        });
      } catch (err) {
        console.warn('Non-blocking streak freeze persistence notice:', err.message);
      }
    }

    // Best Streak calculation across historical weekdays (neutral weekends, rest days, and freezes)
    const sortedQualifyingDates = Array.from(qualifyingDates).sort();
    let bestStreak = 0;
    if (sortedQualifyingDates.length > 0) {
      let tempStreak = 0;
      let prevDate = null;

      for (const dStr of sortedQualifyingDates) {
        if (!prevDate) {
          tempStreak = 1;
        } else {
          let cur = addDaysToKolkataDate(prevDate, 1);
          let allInBetweenAreNeutral = true;
          while (cur < dStr) {
            const isNeutral =
              isKolkataWeekend(cur) || restDayMap.has(cur) || frozenDateSet.has(cur);
            if (!isNeutral) {
              allInBetweenAreNeutral = false;
              break;
            }
            cur = addDaysToKolkataDate(cur, 1);
          }

          if (cur === dStr && allInBetweenAreNeutral) {
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

    const currentMonthUsed = monthlyFreezeCounts.get(currentYearMonth) || 0;
    const currentMonthRemaining = Math.max(0, MAX_MONTHLY_FREEZES - currentMonthUsed);

    const freezeHistory = streakFreezes.map((f) => ({
      id: f.id,
      date: f.date,
      yearMonth: f.yearMonth,
      reason: f.reason,
      consumedAt: f.consumedAt,
    }));

    const result = {
      currentStreak,
      bestStreak,
      completedToday,
      requiredToday,
      qualifiedToday,
      isPendingToday,
      lastQualifyingDate,
      totalQualifyingDays: qualifyingDates.size,
      streakTarget: dailyTarget,
      remainingToday,
      todayStr,
      isTodayRestDay: restDayMap.has(todayStr),
      isTodayWeekend,
      isTodayWeekday,
      freezes: {
        allowance: MAX_MONTHLY_FREEZES,
        used: currentMonthUsed,
        remaining: currentMonthRemaining,
        month: currentYearMonth,
        isFrozenToday: frozenDateSet.has(todayStr),
        history: freezeHistory,
      },
      streakFreezes: {
        allowance: MAX_MONTHLY_FREEZES,
        used: currentMonthUsed,
        remaining: currentMonthRemaining,
        month: currentYearMonth,
        isFrozenToday: frozenDateSet.has(todayStr),
        history: freezeHistory,
      },
      freezeStatus: {
        allowance: MAX_MONTHLY_FREEZES,
        used: currentMonthUsed,
        remaining: currentMonthRemaining,
        badgeText: `❄️ ${currentMonthRemaining}/${MAX_MONTHLY_FREEZES} Freezes Available`,
      },
      weekendActivityDates: Array.from(weekendActivityDates),
    };

    if (cutoffDays === 365) {
      streakCache = { ...result };
      streakCacheTimestamp = Date.now();
    }

    return result;
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
   * Batch Calculate Roadmap-Specific Streaks across all active roadmaps in a single SQL operation.
   * Completely avoids N*3 serial database roundtrips.
   */
  async calculateAllRoadmapStreaks(activeRoadmaps = []) {
    if (!activeRoadmaps || activeRoadmaps.length === 0) return [];
    const todayStr = getKolkataDateString();

    const [completions, personalCompletions, restDaysList] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          rd.roadmap_id as "roadmapId",
          (tc.completed_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date::text as "dateStr",
          COUNT(DISTINCT tc.task_id)::int as "count"
        FROM task_completions tc
        JOIN tasks t ON t.id = tc.task_id
        JOIN roadmap_days rd ON rd.id = t.roadmap_day_id
        WHERE tc.completed = true AND tc.completed_at >= NOW() - INTERVAL '365 days'
        GROUP BY rd.roadmap_id, "dateStr"
      `,
      prisma.$queryRaw`
        SELECT 
          roadmap_id as "roadmapId",
          (completed_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date::text as "dateStr",
          COUNT(DISTINCT id)::int as "count"
        FROM personal_tasks
        WHERE completed = true AND roadmap_id IS NOT NULL AND completed_at >= NOW() - INTERVAL '365 days'
        GROUP BY roadmap_id, "dateStr"
      `,
      prisma.plannedRestDay.findMany({ select: { date: true } }),
    ]);

    const restDaySet = new Set(restDaysList.map((r) => r.date));
    const roadmapActivityMap = new Map();
    activeRoadmaps.forEach((rm) => roadmapActivityMap.set(rm.id, new Map()));

    completions.forEach((c) => {
      if (!roadmapActivityMap.has(c.roadmapId)) roadmapActivityMap.set(c.roadmapId, new Map());
      const dateMap = roadmapActivityMap.get(c.roadmapId);
      dateMap.set(c.dateStr, (dateMap.get(c.dateStr) || 0) + c.count);
    });

    personalCompletions.forEach((p) => {
      if (!roadmapActivityMap.has(p.roadmapId)) roadmapActivityMap.set(p.roadmapId, new Map());
      const dateMap = roadmapActivityMap.get(p.roadmapId);
      dateMap.set(p.dateStr, (dateMap.get(p.dateStr) || 0) + p.count);
    });

    return activeRoadmaps.map((rm) => {
      const activity = roadmapActivityMap.get(rm.id) || new Map();
      const qualifyingDates = new Set();
      let lastActiveDate = null;

      activity.forEach((cnt, dStr) => {
        if (cnt >= 1) {
          qualifyingDates.add(dStr);
          if (!lastActiveDate || dStr > lastActiveDate) lastActiveDate = dStr;
        }
      });

      const completedToday = (activity.get(todayStr) || 0) >= 1;

      let currentStreak = 0;
      if (completedToday) {
        currentStreak = 1;
        let check = getPreviousKolkataDate(todayStr);
        while (true) {
          if (qualifyingDates.has(check)) {
            currentStreak++;
            check = getPreviousKolkataDate(check);
          } else if (restDaySet.has(check)) {
            check = getPreviousKolkataDate(check);
          } else {
            break;
          }
        }
      } else {
        let check = getPreviousKolkataDate(todayStr);
        while (restDaySet.has(check) && !qualifyingDates.has(check)) {
          check = getPreviousKolkataDate(check);
        }
        if (qualifyingDates.has(check)) {
          while (true) {
            if (qualifyingDates.has(check)) {
              currentStreak++;
              check = getPreviousKolkataDate(check);
            } else if (restDaySet.has(check)) {
              check = getPreviousKolkataDate(check);
            } else {
              break;
            }
          }
        }
      }

      // Best streak
      const sorted = Array.from(qualifyingDates).sort();
      let bestStreak = 0;
      let temp = 0;
      let prev = null;
      for (const d of sorted) {
        if (!prev) {
          temp = 1;
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
            temp++;
          } else {
            temp = 1;
          }
        }
        if (temp > bestStreak) bestStreak = temp;
        prev = d;
      }
      if (currentStreak > bestStreak) bestStreak = currentStreak;

      return {
        roadmapId: rm.id,
        title: rm.title,
        categoryName: rm.category?.name || rm.categoryName || 'General',
        currentStreak,
        bestStreak,
        completedToday,
        lastActiveDate,
      };
    });
  },

  /**
   * 12-Month GitHub-style Activity Heatmap
   */
  async getActivityHeatmap(months = 12) {
    if (months === 12 && heatmapCache && Date.now() - heatmapCacheTimestamp < STREAK_CACHE_TTL_MS) {
      return JSON.parse(JSON.stringify(heatmapCache));
    }

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

    const result = {
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

    if (months === 12) {
      heatmapCache = JSON.parse(JSON.stringify(result));
      heatmapCacheTimestamp = Date.now();
    }

    return result;
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
