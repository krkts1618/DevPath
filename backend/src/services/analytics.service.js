import { prisma } from '../config/db.js';
import {
  getKolkataDateString,
  addDaysToKolkataDate,
  calculateScheduledDate,
} from '../utils/date.util.js';
import { StreakService } from './streak.service.js';
import { computeProgressionFromRoadmap } from './progression.service.js';
import { calculateProjectProgress } from './project.service.js';

/**
 * Resolve timeframe into start & end date strings in Asia/Kolkata
 */
export function resolveTimeframeDates(timeframe = '30d', customStart = null, customEnd = null) {
  const todayStr = getKolkataDateString();

  if (timeframe === 'custom' && customStart && customEnd) {
    const startStr = customStart <= customEnd ? customStart : customEnd;
    const endStr = customStart <= customEnd ? customEnd : customStart;
    
    // Calculate previous period of equal duration
    const [y1, m1, d1] = startStr.split('-').map(Number);
    const [y2, m2, d2] = endStr.split('-').map(Number);
    const durationDays = Math.max(1, Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / (86400000)) + 1);
    const prevEndStr = addDaysToKolkataDate(startStr, -1);
    const prevStartStr = addDaysToKolkataDate(prevEndStr, -(durationDays - 1));

    return {
      timeframe: 'custom',
      startDate: startStr,
      endDate: endStr,
      prevStartDate: prevStartStr,
      prevEndDate: prevEndStr,
      durationDays,
    };
  }

  let durationDays = 30;
  switch (timeframe) {
    case '7d':
      durationDays = 7;
      break;
    case '30d':
      durationDays = 30;
      break;
    case '90d':
      durationDays = 90;
      break;
    case '6m':
      durationDays = 180;
      break;
    case '12m':
      durationDays = 365;
      break;
    case 'all':
      durationDays = 3650; // 10 years
      break;
    default:
      durationDays = 30;
  }

  const startDate = addDaysToKolkataDate(todayStr, -(durationDays - 1));
  const endDate = todayStr;

  const prevEndDate = addDaysToKolkataDate(startDate, -1);
  const prevStartDate = addDaysToKolkataDate(prevEndDate, -(durationDays - 1));

  return {
    timeframe,
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    durationDays,
  };
}

/**
 * Convert Kolkata date string (YYYY-MM-DD) to UTC Date boundaries (UTC+5:30)
 */
export function getKolkataDateUtcRange(startStr, endStr) {
  const [y1, m1, d1] = startStr.split('-').map(Number);
  const [y2, m2, d2] = endStr.split('-').map(Number);

  const startUtc = new Date(Date.UTC(y1, m1 - 1, d1, 0, 0, 0) - (5 * 60 + 30) * 60 * 1000);
  const endUtc = new Date(Date.UTC(y2, m2 - 1, d2, 23, 59, 59, 999) - (5 * 60 + 30) * 60 * 1000);

  return { startUtc, endUtc };
}

/**
 * Compare two numerical periods safely
 */
function calculateComparison(currentVal, prevVal) {
  if (prevVal === 0 && currentVal === 0) {
    return { status: 'no_change', percentChange: 0, text: 'No change' };
  }
  if (prevVal === 0) {
    return { status: 'improvement', percentChange: 100, text: '+100% vs previous period' };
  }
  const diff = currentVal - prevVal;
  const pct = Math.round((diff / prevVal) * 100);
  if (pct > 0) {
    return { status: 'improvement', percentChange: pct, text: `+${pct}% vs previous period` };
  } else if (pct < 0) {
    return { status: 'decline', percentChange: pct, text: `${pct}% vs previous period` };
  }
  return { status: 'no_change', percentChange: 0, text: 'No change vs previous period' };
}

export const AnalyticsService = {
  /**
   * Unified, high-performance comprehensive analytics aggregator
   */
  async getComprehensiveAnalytics(params = {}) {
    const { timeframe = '30d', startDate: customStart, endDate: customEnd } = params;
    const dateRange = resolveTimeframeDates(timeframe, customStart, customEnd);
    const { startUtc, endUtc } = getKolkataDateUtcRange(dateRange.startDate, dateRange.endDate);
    const { startUtc: prevStartUtc, endUtc: prevEndUtc } = getKolkataDateUtcRange(
      dateRange.prevStartDate,
      dateRange.prevEndDate
    );

    // 1. Parallel execute core domain queries
    const [
      allRoadmaps,
      streakData,
      completionsInPeriod,
      completionsInPrevPeriod,
      allCompletions,
      studySessionsInPeriod,
      studySessionsPrevPeriod,
      allStudySessions,
      allRevisions,
      revisionSessionsInPeriod,
      allProjects,
      carriedForwardCount,
      plannedRestDays,
    ] = await Promise.all([
      // A. All Roadmaps with complete structural hierarchy for independent progression
      prisma.roadmap.findMany({
        include: {
          category: { select: { id: true, name: true, slug: true } },
          roadmapDays: {
            orderBy: { dayNumber: 'asc' },
            select: {
              id: true,
              dayNumber: true,
              title: true,
              estimatedStudyTime: true,
              dayType: true,
              tasks: {
                select: {
                  id: true,
                  title: true,
                  taskType: true,
                  priority: true,
                  estimatedDuration: true,
                  isRequired: true,
                  displayOrder: true,
                  completions: {
                    select: { completed: true, completedAt: true },
                  },
                },
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      }),

      // B. Overall streak calculation
      StreakService.calculateOverallStreak(),

      // C. Task completions in current period
      prisma.taskCompletion.findMany({
        where: {
          completed: true,
          completedAt: { gte: startUtc, lte: endUtc },
        },
        select: {
          id: true,
          taskId: true,
          completedAt: true,
          task: {
            select: {
              id: true,
              title: true,
              priority: true,
              taskType: true,
              estimatedDuration: true,
              roadmapDay: {
                select: {
                  dayNumber: true,
                  roadmap: { select: { id: true, title: true, categoryId: true } },
                },
              },
            },
          },
        },
        orderBy: { completedAt: 'asc' },
      }),

      // D. Task completions in previous period (for comparison)
      prisma.taskCompletion.findMany({
        where: {
          completed: true,
          completedAt: { gte: prevStartUtc, lte: prevEndUtc },
        },
        select: { id: true, completedAt: true },
      }),

      // E. All-time completed tasks
      prisma.taskCompletion.findMany({
        where: { completed: true },
        select: { id: true, taskId: true, completedAt: true },
      }),

      // F. Completed study sessions in current period (excluding paused & discarded)
      prisma.studySession.findMany({
        where: {
          status: 'completed',
          sessionType: { in: ['pomodoro', 'custom', 'stopwatch'] },
          startedAt: { gte: startUtc, lte: endUtc },
        },
        include: {
          roadmap: { select: { id: true, title: true, category: { select: { id: true, name: true } } } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { startedAt: 'asc' },
      }),

      // G. Completed study sessions in previous period
      prisma.studySession.findMany({
        where: {
          status: 'completed',
          sessionType: { in: ['pomodoro', 'custom', 'stopwatch'] },
          startedAt: { gte: prevStartUtc, lte: prevEndUtc },
        },
        select: { actualDurationSeconds: true },
      }),

      // H. All completed study sessions
      prisma.studySession.findMany({
        where: {
          status: 'completed',
          sessionType: { in: ['pomodoro', 'custom', 'stopwatch'] },
        },
        select: { actualDurationSeconds: true, startedAt: true },
      }),

      // I. All revision items
      prisma.revisionSchedule.findMany({
        include: {
          roadmap: { select: { id: true, title: true, category: { select: { id: true, name: true } } } },
          sessions: {
            orderBy: { revisedAt: 'desc' },
          },
        },
        orderBy: { scheduledDate: 'asc' },
      }),

      // J. Revision review sessions in current period
      prisma.revisionSession.findMany({
        where: {
          revisedAt: { gte: startUtc, lte: endUtc },
        },
        select: {
          id: true,
          rating: true,
          revisedAt: true,
          durationMinutes: true,
          revisionScheduleId: true,
        },
      }),

      // K. Projects with milestones and tasks
      prisma.project.findMany({
        include: {
          roadmap: { select: { id: true, title: true } },
          milestones: { orderBy: { displayOrder: 'asc' } },
          tasks: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),

      // L. Carried forward tasks count
      prisma.taskReassignment.count(),

      // M. Planned rest days in period
      prisma.plannedRestDay.findMany({
        where: {
          date: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),
    ]);

    // ==========================================
    // 2. OVERVIEW & METRICS COMPUTATION
    // ==========================================
    let totalCurriculumTasks = 0;
    let completedCurriculumTasks = 0;
    const activeRoadmaps = allRoadmaps.filter((r) => r.status === 'active');
    const archivedRoadmaps = allRoadmaps.filter((r) => r.status === 'archived');
    const pausedRoadmaps = allRoadmaps.filter((r) => r.status === 'paused');

    // Build independent roadmap progression list
    const roadmapCards = [];
    for (const rm of allRoadmaps) {
      const prog = computeProgressionFromRoadmap(rm);
      if (rm.status === 'active') {
        totalCurriculumTasks += prog.totalTasks;
        completedCurriculumTasks += prog.completedTasks;
      }

      // Calculate total study time for this roadmap
      let roadmapStudySeconds = 0;
      allStudySessions.forEach((s) => {
        if (s.roadmapId === rm.id) roadmapStudySeconds += (s.actualDurationSeconds || 0);
      });

      // Find last activity
      let lastActivityDate = null;
      (rm.roadmapDays || []).forEach((d) => {
        (d.tasks || []).forEach((t) => {
          (t.completions || []).forEach((c) => {
            if (c.completed && c.completedAt) {
              if (!lastActivityDate || new Date(c.completedAt) > new Date(lastActivityDate)) {
                lastActivityDate = c.completedAt;
              }
            }
          });
        });
      });

      // Calculate remaining tasks and duration
      const pendingTasksCount = Math.max(0, prog.totalTasks - prog.completedTasks);
      let estimatedRemainingMinutes = 0;
      (rm.roadmapDays || []).forEach((d) => {
        (d.tasks || []).forEach((t) => {
          const isDone = t.completions && t.completions.some((c) => c.completed);
          if (!isDone && t.estimatedDuration) {
            estimatedRemainingMinutes += t.estimatedDuration;
          }
        });
      });

      roadmapCards.push({
        id: rm.id,
        title: rm.title,
        slug: rm.slug,
        status: rm.status,
        category: rm.category,
        categoryId: rm.categoryId,
        categoryName: rm.category?.name || 'General',
        totalTasks: prog.totalTasks,
        completedTasks: prog.completedTasks,
        pendingTasks: pendingTasksCount,
        progressPercent: prog.progressPercent,
        currentDayNumber: prog.currentLearningDayNumber,
        currentDayTitle: prog.currentLearningDay?.title || `Day ${prog.currentLearningDayNumber}`,
        lastActivityDate,
        totalStudyHours: Math.round((roadmapStudySeconds / 3600) * 10) / 10,
        estimatedRemainingMinutes,
        estimatedRemainingHours: Math.round((estimatedRemainingMinutes / 60) * 10) / 10,
      });
    }

    const overallCompletionPercent =
      totalCurriculumTasks > 0
        ? Math.round((completedCurriculumTasks / totalCurriculumTasks) * 100)
        : 0;

    // Study Time totals
    let currentPeriodStudySeconds = 0;
    studySessionsInPeriod.forEach((s) => {
      currentPeriodStudySeconds += (s.actualDurationSeconds || 0);
    });
    let prevPeriodStudySeconds = 0;
    studySessionsPrevPeriod.forEach((s) => {
      prevPeriodStudySeconds += (s.actualDurationSeconds || 0);
    });
    let allTimeStudySeconds = 0;
    allStudySessions.forEach((s) => {
      allTimeStudySeconds += (s.actualDurationSeconds || 0);
    });

    const focusedHoursPeriod = Math.round((currentPeriodStudySeconds / 3600) * 10) / 10;
    const focusedHoursPrev = Math.round((prevPeriodStudySeconds / 3600) * 10) / 10;
    const focusedHoursAllTime = Math.round((allTimeStudySeconds / 3600) * 10) / 10;

    // Revisions totals
    const completedRevisionsCount = allRevisions.filter((r) => r.completed || r.status === 'completed').length;
    const dueRevisionsCount = allRevisions.filter((r) => r.status === 'due').length;
    const overdueRevisionsCount = allRevisions.filter((r) => r.status === 'overdue').length;
    const upcomingRevisionsCount = allRevisions.filter((r) => r.status === 'upcoming').length;

    // Active projects count
    const activeProjectsCount = allProjects.filter((p) => p.status === 'active').length;

    // Period Comparisons
    const hasHistoricalData = dateRange.timeframe !== 'all' && (completionsInPrevPeriod.length > 0 || studySessionsPrevPeriod.length > 0);
    const taskComparison = hasHistoricalData
      ? calculateComparison(completionsInPeriod.length, completionsInPrevPeriod.length)
      : { status: 'insufficient_data', percentChange: 0, text: 'Insufficient historical data' };

    const studyTimeComparison = hasHistoricalData
      ? calculateComparison(focusedHoursPeriod, focusedHoursPrev)
      : { status: 'insufficient_data', percentChange: 0, text: 'Insufficient historical data' };

    const sessionsComparison = hasHistoricalData
      ? calculateComparison(studySessionsInPeriod.length, studySessionsPrevPeriod.length)
      : { status: 'insufficient_data', percentChange: 0, text: 'Insufficient historical data' };

    const overview = {
      activeRoadmapsCount: activeRoadmaps.length,
      archivedRoadmapsCount: archivedRoadmaps.length,
      pausedRoadmapsCount: pausedRoadmaps.length,
      totalCurriculumTasks,
      totalCompletedCurriculumTasks: completedCurriculumTasks,
      pendingTasks: Math.max(0, totalCurriculumTasks - completedCurriculumTasks),
      carriedForwardTasks: carriedForwardCount,
      totalCompletionPercentage: overallCompletionPercent,
      currentOverallStreak: streakData.currentStreak,
      bestOverallStreak: streakData.bestStreak,
      totalQualifyingStreakDays: streakData.qualifyingDaysCount || 0,
      totalFocusedStudyHours: focusedHoursPeriod,
      allTimeFocusedStudyHours: focusedHoursAllTime,
      totalCompletedFocusSessions: studySessionsInPeriod.length,
      allTimeFocusSessionsCount: allStudySessions.length,
      totalRevisionsCompleted: completedRevisionsCount,
      activeProjectsCount,
      comparisons: {
        tasks: taskComparison,
        studyTime: studyTimeComparison,
        sessions: sessionsComparison,
      },
    };

    // ==========================================
    // 3. STUDY TIME ANALYTICS & TRENDS
    // ==========================================
    const dailyStudyMap = new Map();
    const roadmapStudyMap = new Map();
    const categoryStudyMap = new Map();
    const projectStudyMap = new Map();
    let longestSessionSeconds = 0;

    // Initialize daily map for all dates in dateRange
    let curDate = dateRange.startDate;
    while (curDate <= dateRange.endDate) {
      dailyStudyMap.set(curDate, { date: curDate, focusMinutes: 0, sessionsCount: 0 });
      curDate = addDaysToKolkataDate(curDate, 1);
    }

    // Duration distribution buckets
    const durationBuckets = {
      '< 15m': 0,
      '15 - 25m': 0,
      '25 - 45m': 0,
      '45 - 60m': 0,
      '> 60m': 0,
    };

    for (const session of studySessionsInPeriod) {
      const sec = session.actualDurationSeconds || 0;
      if (sec > longestSessionSeconds) longestSessionSeconds = sec;

      const durMins = Math.round(sec / 60);
      if (durMins < 15) durationBuckets['< 15m']++;
      else if (durMins <= 25) durationBuckets['15 - 25m']++;
      else if (durMins <= 45) durationBuckets['25 - 45m']++;
      else if (durMins <= 60) durationBuckets['45 - 60m']++;
      else durationBuckets['> 60m']++;

      const sessionDate = getKolkataDateString(session.startedAt);
      if (dailyStudyMap.has(sessionDate)) {
        const item = dailyStudyMap.get(sessionDate);
        item.focusMinutes += durMins;
        item.sessionsCount += 1;
      }

      // Group by Roadmap
      if (session.roadmapId && session.roadmap) {
        const existing = roadmapStudyMap.get(session.roadmapId) || {
          id: session.roadmapId,
          name: session.roadmap.title,
          categoryName: session.roadmap.category?.name || 'General',
          focusMinutes: 0,
          sessionsCount: 0,
        };
        existing.focusMinutes += durMins;
        existing.sessionsCount += 1;
        roadmapStudyMap.set(session.roadmapId, existing);

        const catName = session.roadmap.category?.name || 'General';
        const catExisting = categoryStudyMap.get(catName) || { name: catName, focusMinutes: 0, sessionsCount: 0 };
        catExisting.focusMinutes += durMins;
        catExisting.sessionsCount += 1;
        categoryStudyMap.set(catName, catExisting);
      }

      // Group by Project
      if (session.projectId && session.project) {
        const pExisting = projectStudyMap.get(session.projectId) || {
          id: session.projectId,
          name: session.project.name,
          focusMinutes: 0,
          sessionsCount: 0,
        };
        pExisting.focusMinutes += durMins;
        pExisting.sessionsCount += 1;
        projectStudyMap.set(session.projectId, pExisting);
      }
    }

    const dailyTrend = Array.from(dailyStudyMap.values()).map((d) => ({
      ...d,
      focusHours: Math.round((d.focusMinutes / 60) * 10) / 10,
    }));

    // Weekly Trend (aggregate by calendar week)
    const weeklyTrendMap = new Map();
    dailyTrend.forEach((day) => {
      const d = new Date(day.date);
      const dayOfWeek = (d.getDay() + 6) % 7; // Monday = 0
      const weekStart = addDaysToKolkataDate(day.date, -dayOfWeek);
      const existing = weeklyTrendMap.get(weekStart) || { weekStart, focusMinutes: 0, sessionsCount: 0 };
      existing.focusMinutes += day.focusMinutes;
      existing.sessionsCount += day.sessionsCount;
      weeklyTrendMap.set(weekStart, existing);
    });
    const weeklyTrend = Array.from(weeklyTrendMap.values()).map((w) => ({
      ...w,
      weekLabel: `Wk of ${w.weekStart.substring(5)}`,
      focusHours: Math.round((w.focusMinutes / 60) * 10) / 10,
    }));

    // Monthly Trend
    const monthlyTrendMap = new Map();
    dailyTrend.forEach((day) => {
      const monthKey = day.date.substring(0, 7); // YYYY-MM
      const existing = monthlyTrendMap.get(monthKey) || { month: monthKey, focusMinutes: 0, sessionsCount: 0 };
      existing.focusMinutes += day.focusMinutes;
      existing.sessionsCount += day.sessionsCount;
      monthlyTrendMap.set(monthKey, existing);
    });
    const monthlyTrend = Array.from(monthlyTrendMap.values()).map((m) => ({
      ...m,
      monthLabel: m.month,
      focusHours: Math.round((m.focusMinutes / 60) * 10) / 10,
    }));

    // Distinct active study days in period
    const activeStudyDaysCount = dailyTrend.filter((d) => d.focusMinutes > 0).length;
    const totalFocusMinsPeriod = Math.round(currentPeriodStudySeconds / 60);
    const avgDailyFocusMins = activeStudyDaysCount > 0 ? Math.round(totalFocusMinsPeriod / activeStudyDaysCount) : 0;
    const avgSessionDurationMins = studySessionsInPeriod.length > 0 ? Math.round(totalFocusMinsPeriod / studySessionsInPeriod.length) : 0;

    const studyTime = {
      totalFocusedHours: focusedHoursPeriod,
      totalFocusedMinutes: totalFocusMinsPeriod,
      averageDailyFocusedMinutes: avgDailyFocusMins,
      averageSessionDurationMinutes: avgSessionDurationMins,
      longestSessionMinutes: Math.round(longestSessionSeconds / 60),
      completedSessionsCount: studySessionsInPeriod.length,
      dailyTrend,
      weeklyTrend,
      monthlyTrend,
      roadmapDistribution: Array.from(roadmapStudyMap.values()).sort((a, b) => b.focusMinutes - a.focusMinutes),
      categoryDistribution: Array.from(categoryStudyMap.values()).sort((a, b) => b.focusMinutes - a.focusMinutes),
      projectDistribution: Array.from(projectStudyMap.values()).sort((a, b) => b.focusMinutes - a.focusMinutes),
      durationDistribution: Object.entries(durationBuckets).map(([bucket, count]) => ({
        bucket,
        count,
      })),
    };

    // ==========================================
    // 4. CONSISTENCY & HEATMAP ANALYTICS
    // ==========================================
    // Fetch heatmap records using StreakService
    const heatmap = await StreakService.getActivityHeatmap(12);

    // Roadmap-specific streaks
    const roadmapStreaks = [];
    for (const rm of activeRoadmaps) {
      const s = await StreakService.calculateRoadmapStreak(rm.id);
      roadmapStreaks.push({
        roadmapId: rm.id,
        title: rm.title,
        categoryName: rm.category?.name || 'General',
        currentStreak: s.currentStreak,
        bestStreak: s.bestStreak,
        completedToday: s.completedToday,
        lastActiveDate: s.lastActiveDate,
      });
    }

    const consistency = {
      currentOverallStreak: streakData.currentStreak,
      bestOverallStreak: streakData.bestStreak,
      streakTarget: streakData.streakTarget || 5,
      completedToday: streakData.completedToday,
      remainingToday: streakData.remainingToday,
      qualifiedToday: streakData.qualifiedToday,
      isPendingToday: streakData.isPendingToday,
      overallQualifyingDays: streakData.qualifyingDaysCount || 0,
      roadmapStreaks,
      heatmap,
      activeLearningDaysInPeriod: activeStudyDaysCount,
      plannedRestDaysInPeriod: plannedRestDays.length,
    };

    // ==========================================
    // 5. TASK PERFORMANCE ANALYTICS
    // ==========================================
    const weekdayCounts = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const priorityCounts = { urgent: 0, high: 0, normal: 0, low: 0 };
    const dailyCompletionMap = new Map();

    curDate = dateRange.startDate;
    while (curDate <= dateRange.endDate) {
      dailyCompletionMap.set(curDate, { date: curDate, completedTasks: 0 });
      curDate = addDaysToKolkataDate(curDate, 1);
    }

    for (const c of completionsInPeriod) {
      const dateStr = getKolkataDateString(c.completedAt);
      if (dailyCompletionMap.has(dateStr)) {
        dailyCompletionMap.get(dateStr).completedTasks += 1;
      }

      const dayIndex = new Date(c.completedAt).getDay();
      weekdayCounts[weekdayNames[dayIndex]] += 1;

      const prio = (c.task?.priority || 'normal').toLowerCase();
      if (priorityCounts[prio] !== undefined) {
        priorityCounts[prio] += 1;
      } else {
        priorityCounts.normal += 1;
      }
    }

    let mostProductiveDay = 'None';
    let maxDayCount = -1;
    let leastProductiveDay = 'None';
    let minDayCount = Infinity;

    Object.entries(weekdayCounts).forEach(([day, count]) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        mostProductiveDay = day;
      }
      if (count < minDayCount) {
        minDayCount = count;
        leastProductiveDay = day;
      }
    });

    const activeDaysWithCompletions = Array.from(dailyCompletionMap.values()).filter((d) => d.completedTasks > 0).length;
    const avgTasksPerActiveDay = activeDaysWithCompletions > 0
      ? Math.round((completionsInPeriod.length / activeDaysWithCompletions) * 10) / 10
      : 0;

    // Roadmaps with most pending tasks
    const pendingRoadmapsList = roadmapCards
      .filter((r) => r.status === 'active' && r.pendingTasks > 0)
      .sort((a, b) => b.pendingTasks - a.pendingTasks);

    // Categories with low completion rates
    const categoryTotals = new Map();
    roadmapCards.forEach((r) => {
      const cat = r.categoryName;
      const existing = categoryTotals.get(cat) || { name: cat, totalTasks: 0, completedTasks: 0 };
      existing.totalTasks += r.totalTasks;
      existing.completedTasks += r.completedTasks;
      categoryTotals.set(cat, existing);
    });
    const categoryPerformance = Array.from(categoryTotals.values())
      .map((c) => ({
        ...c,
        completionRate: c.totalTasks > 0 ? Math.round((c.completedTasks / c.totalTasks) * 100) : 0,
      }))
      .sort((a, b) => a.completionRate - b.completionRate);

    const taskPerformance = {
      tasksScheduled: totalCurriculumTasks,
      tasksCompletedPeriod: completionsInPeriod.length,
      tasksCompletedAllTime: completedCurriculumTasks,
      tasksPending: Math.max(0, totalCurriculumTasks - completedCurriculumTasks),
      tasksCarriedForward: carriedForwardCount,
      completionRate: overallCompletionPercent,
      averageTasksPerActiveDay: avgTasksPerActiveDay,
      mostProductiveWeekday: completionsInPeriod.length > 0 ? `${mostProductiveDay} (${maxDayCount} tasks)` : 'N/A',
      leastProductiveWeekday: completionsInPeriod.length > 0 ? `${leastProductiveDay} (${minDayCount} tasks)` : 'N/A',
      weekdayDistribution: Object.entries(weekdayCounts).map(([day, count]) => ({ day, count })),
      priorityDistribution: Object.entries(priorityCounts).map(([priority, count]) => ({ priority, count })),
      dailyCompletionTrend: Array.from(dailyCompletionMap.values()),
      roadmapsWithMostPending: pendingRoadmapsList.slice(0, 5),
      categoryPerformance,
    };

    // ==========================================
    // 6. REVISION PERFORMANCE
    // ==========================================
    const ratingDistribution = { again: 0, difficult: 0, good: 0, easy: 0 };
    const topicsNeedingPractice = [];

    for (const rev of allRevisions) {
      let againOrDiffCount = 0;
      (rev.sessions || []).forEach((s) => {
        const r = (s.rating || '').toLowerCase();
        if (ratingDistribution[r] !== undefined) ratingDistribution[r] += 1;
        if (['again', 'difficult'].includes(r)) againOrDiffCount += 1;
      });

      if (againOrDiffCount >= 1) {
        topicsNeedingPractice.push({
          id: rev.id,
          topic: rev.topic,
          roadmapTitle: rev.roadmap?.title || 'General',
          stage: rev.stage,
          ratingIssuesCount: againOrDiffCount,
          lastRating: rev.sessions?.[0]?.rating || 'difficult',
          scheduledDate: rev.scheduledDate,
        });
      }
    }

    const revisionPerformance = {
      totalTopics: allRevisions.length,
      revisionsCompleted: completedRevisionsCount,
      revisionsDue: dueRevisionsCount,
      revisionsOverdue: overdueRevisionsCount,
      revisionsUpcoming: upcomingRevisionsCount,
      ratingDistribution: Object.entries(ratingDistribution).map(([rating, count]) => ({
        rating,
        count,
      })),
      topicsNeedingPractice: topicsNeedingPractice.sort((a, b) => b.ratingIssuesCount - a.ratingIssuesCount),
    };

    // ==========================================
    // 7. PROJECT PERFORMANCE
    // ==========================================
    const projectCards = [];
    let totalMilestones = 0;
    let completedMilestones = 0;
    let pendingMilestones = 0;
    let overdueMilestones = 0;
    const todayKolkata = getKolkataDateString();

    for (const proj of allProjects) {
      const pMilestones = proj.milestones || [];
      const pTasks = proj.tasks || [];
      const calculatedProgress = calculateProjectProgress(pMilestones, pTasks);

      pMilestones.forEach((m) => {
        totalMilestones += 1;
        const isDone = m.status === 'completed' || m.completedAt !== null;
        if (isDone) {
          completedMilestones += 1;
        } else {
          pendingMilestones += 1;
          if (m.dueDate && getKolkataDateString(m.dueDate) < todayKolkata) {
            overdueMilestones += 1;
          }
        }
      });

      projectCards.push({
        id: proj.id,
        name: proj.name,
        status: proj.status,
        priority: proj.priority,
        targetDate: proj.targetDate,
        progressPercent: calculatedProgress,
        totalMilestones: pMilestones.length,
        completedMilestones: pMilestones.filter((m) => m.status === 'completed' || m.completedAt !== null).length,
        totalTasks: pTasks.length,
        completedTasks: pTasks.filter((t) => t.status === 'completed' || t.completedAt !== null).length,
        roadmapTitle: proj.roadmap?.title || null,
      });
    }

    const projectPerformance = {
      totalProjects: allProjects.length,
      activeProjects: allProjects.filter((p) => p.status === 'active').length,
      plannedProjects: allProjects.filter((p) => p.status === 'planned').length,
      onHoldProjects: allProjects.filter((p) => p.status === 'on_hold').length,
      completedProjects: allProjects.filter((p) => p.status === 'completed').length,
      archivedProjects: allProjects.filter((p) => p.status === 'archived').length,
      totalMilestones,
      completedMilestones,
      pendingMilestones,
      overdueMilestones,
      projects: projectCards,
    };

    // ==========================================
    // 8. DETERMINISTIC ENGINEERING INSIGHTS
    // ==========================================
    const insights = [];

    // 1. Consistency Insight
    if (activeStudyDaysCount > 0) {
      insights.push({
        id: 'insight-consistency',
        type: 'consistency',
        category: 'Consistency',
        title: 'Learning Consistency',
        description: `You logged learning activity on ${activeStudyDaysCount} of the ${dateRange.durationDays} days in this timeframe.`,
        level: activeStudyDaysCount >= Math.min(5, dateRange.durationDays) ? 'success' : 'info',
        actionUrl: '/analytics?tab=consistency',
        actionText: 'View Streak Heatmap',
      });
    } else {
      insights.push({
        id: 'insight-consistency-start',
        type: 'consistency',
        category: 'Consistency',
        title: 'Start Your Streak',
        description: 'Complete 5 tasks in a calendar day to qualify for and build your daily engineering streak.',
        level: 'info',
        actionUrl: '/planner',
        actionText: 'Open Daily Planner',
      });
    }

    // 2. Technology Progress Insight
    const topRoadmap = roadmapCards
      .filter((r) => r.status === 'active' && r.progressPercent > 0)
      .sort((a, b) => b.progressPercent - a.progressPercent)[0];
    if (topRoadmap) {
      insights.push({
        id: 'insight-tech-progress',
        type: 'technology',
        category: 'Curriculum Velocity',
        title: `${topRoadmap.title} Leading Track`,
        description: `${topRoadmap.title} has reached ${topRoadmap.progressPercent}% completion (${topRoadmap.completedTasks} of ${topRoadmap.totalTasks} tasks).`,
        level: 'success',
        actionUrl: `/roadmaps/${topRoadmap.id}`,
        actionText: 'Inspect Roadmap',
      });
    }

    // 3. Pending Work / Carry-Forward Alert
    if (carriedForwardCount > 0) {
      insights.push({
        id: 'insight-carry-forward',
        type: 'tasks',
        category: 'Workflow Pacing',
        title: 'Carried-Forward Tasks',
        description: `You have ${carriedForwardCount} carried-forward tasks across active roadmaps. Prioritize completing them in your queue.`,
        level: 'warning',
        actionUrl: '/planner',
        actionText: 'Manage Queue',
      });
    }

    // 4. Study Time Allocation Insight
    if (studyTime.roadmapDistribution.length > 0) {
      const topStudy = studyTime.roadmapDistribution[0];
      const hours = Math.round((topStudy.focusMinutes / 60) * 10) / 10;
      insights.push({
        id: 'insight-focus-allocation',
        type: 'study-time',
        category: 'Deep Work Pacing',
        title: `Primary Focus: ${topStudy.name}`,
        description: `You logged ${hours} hours of focused deep work on ${topStudy.name} across ${topStudy.sessionsCount} sessions.`,
        level: 'info',
        actionUrl: '/focus',
        actionText: 'Open Focus Timer',
      });
    }

    // 5. Spaced Repetition Practice Alert
    if (topicsNeedingPractice.length > 0) {
      insights.push({
        id: 'insight-revision-review',
        type: 'revision',
        category: 'Knowledge Retention',
        title: 'Spaced Recall Review Due',
        description: `${topicsNeedingPractice.length} revision topics have received 'Again' or 'Difficult' recall ratings and need practice.`,
        level: 'warning',
        actionUrl: '/revision',
        actionText: 'Review Topics',
      });
    }

    // 6. Project Work Alert
    const activeProjectWithMilestones = projectCards.find((p) => p.status === 'active' && p.totalMilestones > p.completedMilestones);
    if (activeProjectWithMilestones) {
      const remainingMilestones = activeProjectWithMilestones.totalMilestones - activeProjectWithMilestones.completedMilestones;
      insights.push({
        id: 'insight-project-milestone',
        type: 'project',
        category: 'Engineering Projects',
        title: `Project: ${activeProjectWithMilestones.name}`,
        description: `Project '${activeProjectWithMilestones.name}' has ${remainingMilestones} pending milestones remaining (${activeProjectWithMilestones.progressPercent}% complete).`,
        level: 'info',
        actionUrl: '/projects',
        actionText: 'Open Project',
      });
    }

    return {
      timeframe: dateRange.timeframe,
      dateRange: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        prevStartDate: dateRange.prevStartDate,
        prevEndDate: dateRange.prevEndDate,
        durationDays: dateRange.durationDays,
      },
      overview,
      roadmaps: roadmapCards,
      studyTime,
      consistency,
      taskPerformance,
      revisionPerformance,
      projectPerformance,
      insights,
    };
  },

  /**
   * Export database analytics as formatted CSV
   */
  async exportCsv(type = 'tasks', params = {}) {
    const { timeframe = '30d', startDate: customStart, endDate: customEnd } = params;
    const dateRange = resolveTimeframeDates(timeframe, customStart, customEnd);
    const { startUtc, endUtc } = getKolkataDateUtcRange(dateRange.startDate, dateRange.endDate);

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    switch (type) {
      case 'tasks': {
        const completions = await prisma.taskCompletion.findMany({
          where: { completed: true, completedAt: { gte: startUtc, lte: endUtc } },
          include: {
            task: {
              include: {
                roadmapDay: {
                  include: {
                    roadmap: { select: { title: true } },
                  },
                },
              },
            },
          },
          orderBy: { completedAt: 'desc' },
        });

        const headers = ['Completion ID', 'Date', 'Task Title', 'Roadmap', 'Day Number', 'Priority', 'Status'];
        const rows = completions.map((c) => [
          escapeCsv(c.id),
          escapeCsv(getKolkataDateString(c.completedAt)),
          escapeCsv(c.task.title),
          escapeCsv(c.task.roadmapDay.roadmap.title),
          escapeCsv(c.task.roadmapDay.dayNumber),
          escapeCsv(c.task.priority || 'normal'),
          escapeCsv('Completed'),
        ]);

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      }

      case 'roadmaps': {
        const roadmaps = await prisma.roadmap.findMany({
          include: {
            category: { select: { name: true } },
            roadmapDays: {
              include: {
                tasks: {
                  include: { completions: true },
                },
              },
            },
          },
          orderBy: { displayOrder: 'asc' },
        });

        const headers = ['Roadmap Name', 'Category', 'Status', 'Total Tasks', 'Completed Tasks', 'Progress %', 'Current Day'];
        const rows = roadmaps.map((r) => {
          const prog = computeProgressionFromRoadmap(r);
          return [
            escapeCsv(r.title),
            escapeCsv(r.category?.name || 'General'),
            escapeCsv(r.status),
            escapeCsv(prog.totalTasks),
            escapeCsv(prog.completedTasks),
            escapeCsv(prog.progressPercent),
            escapeCsv(prog.currentLearningDayNumber),
          ];
        });

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      }

      case 'sessions': {
        const sessions = await prisma.studySession.findMany({
          where: { startedAt: { gte: startUtc, lte: endUtc } },
          include: {
            roadmap: { select: { title: true } },
            project: { select: { name: true } },
          },
          orderBy: { startedAt: 'desc' },
        });

        const headers = ['Date', 'Session Title', 'Type', 'Target (Mins)', 'Actual Duration (Mins)', 'Status', 'Roadmap', 'Project'];
        const rows = sessions.map((s) => [
          escapeCsv(getKolkataDateString(s.startedAt)),
          escapeCsv(s.title || 'General Focus Session'),
          escapeCsv(s.sessionType),
          escapeCsv(s.targetDurationMinutes || 0),
          escapeCsv(Math.round((s.actualDurationSeconds || 0) / 60)),
          escapeCsv(s.status),
          escapeCsv(s.roadmap?.title || ''),
          escapeCsv(s.project?.name || ''),
        ]);

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      }

      case 'revisions': {
        const revisions = await prisma.revisionSchedule.findMany({
          include: {
            roadmap: { select: { title: true } },
            sessions: { orderBy: { revisedAt: 'desc' }, take: 1 },
          },
          orderBy: { scheduledDate: 'asc' },
        });

        const headers = ['Topic', 'Roadmap', 'Stage', 'Status', 'Scheduled Date', 'Last Rating', 'Total Reviews'];
        const rows = revisions.map((r) => [
          escapeCsv(r.topic),
          escapeCsv(r.roadmap?.title || 'General'),
          escapeCsv(r.stage),
          escapeCsv(r.status),
          escapeCsv(getKolkataDateString(r.scheduledDate)),
          escapeCsv(r.sessions?.[0]?.rating || 'None'),
          escapeCsv(r.sessions?.length || 0),
        ]);

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      }

      case 'projects': {
        const projects = await prisma.project.findMany({
          include: {
            roadmap: { select: { title: true } },
            milestones: true,
            tasks: true,
          },
          orderBy: { updatedAt: 'desc' },
        });

        const headers = ['Project Name', 'Status', 'Priority', 'Progress %', 'Completed Milestones', 'Total Milestones', 'Target Date'];
        const rows = projects.map((p) => {
          const prog = calculateProjectProgress(p.milestones, p.tasks);
          const doneM = (p.milestones || []).filter((m) => m.status === 'completed' || m.completedAt !== null).length;
          return [
            escapeCsv(p.name),
            escapeCsv(p.status),
            escapeCsv(p.priority),
            escapeCsv(prog),
            escapeCsv(doneM),
            escapeCsv(p.milestones?.length || 0),
            escapeCsv(p.targetDate ? getKolkataDateString(p.targetDate) : 'None'),
          ];
        });

        return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      }

      default:
        throw new Error(`Unsupported export type: ${type}`);
    }
  },
};
