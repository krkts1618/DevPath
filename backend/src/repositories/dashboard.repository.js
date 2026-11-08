import { prisma } from '../config/db.js';
import {
  getKolkataDateString,
  addDaysToKolkataDate,
  calculateScheduledDate,
  DEFAULT_TIMEZONE,
} from '../utils/date.util.js';
import {
  ProgressionService,
  computeProgressionFromRoadmap,
} from '../services/progression.service.js';
import { StreakService } from '../services/streak.service.js';

export const DashboardRepository = {
  /**
   * Get high-level statistics across roadmaps, tasks, streaks, weekly activity, and recent events.
   * Optimized with lean queries, SQL aggregates, and zero redundant full-curriculum memory allocation.
   */
  async getStats() {
    const todayStr = getKolkataDateString();
    const sevenDaysAgoStr = addDaysToKolkataDate(todayStr, -6);
    const [sYear, sMonth, sDay] = sevenDaysAgoStr.split('-').map(Number);
    const sevenDaysAgoUtc = new Date(Date.UTC(sYear, sMonth - 1, sDay, 0, 0, 0));

    // 1. Fetch metadata & counts concurrently with small batching to preserve Supabase connection pool
    const [
      statusCounts,
      recentCompletions,
      last7DaysCompletions,
      streakData,
    ] = await Promise.all([
      prisma.roadmap.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.taskCompletion.findMany({
        where: { completed: true },
        orderBy: { completedAt: 'desc' },
        take: 8,
        select: {
          id: true,
          taskId: true,
          completedAt: true,
          task: {
            select: {
              id: true,
              title: true,
              taskType: true,
              priority: true,
              roadmapDay: {
                select: {
                  dayNumber: true,
                  roadmap: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      }),
      prisma.taskCompletion.findMany({
        where: {
          completed: true,
          completedAt: { gte: sevenDaysAgoUtc },
        },
        select: { completedAt: true },
      }),
      StreakService.calculateOverallStreak(),
    ]);

    let totalRoadmapsCount = 0;
    let completedCount = 0;
    let archivedCount = 0;
    let activeRoadmapsCount = 0;
    statusCounts.forEach((s) => {
      totalRoadmapsCount += s._count.id;
      if (s.status === 'completed') completedCount = s._count.id;
      if (s.status === 'archived') archivedCount = s._count.id;
      if (s.status === 'active') activeRoadmapsCount = s._count.id;
    });

    // 2. Fetch active roadmaps metadata (lean select, no deep nested relations)
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

    let roadmapProgress = [];
    let learningQueue = [];
    let queueTotalTasks = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    try {
      // 3. Fast SQL aggregates and active day identification
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

      // 4. Fetch ONLY the tasks of the active days for the queue (at most ~20 tasks total)
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
        const rTotal = agg.total_tasks;
        const rCompleted = agg.completed_tasks;
        totalTasks += rTotal;
        completedTasks += rCompleted;

        const activeDay = activeDayMap.get(r.id);
        const dayNumber = activeDay ? activeDay.day_number : (r.duration || 1);
        const dayTitle = activeDay ? activeDay.day_title : `Day ${dayNumber}`;
        const dayTotalTasks = activeDay ? activeDay.total_day_tasks : 0;
        const dayCompletedTasks = activeDay ? activeDay.completed_day_tasks : 0;
        const dayRemainingTasks = activeDay ? activeDay.remaining_day_tasks : 0;
        const progressPercent = rTotal > 0 ? Math.round((rCompleted / rTotal) * 100) : 0;
        const activeTasks = queueTasksByRoadmap.get(r.id) || [];

        roadmapProgress.push({
          id: r.id,
          title: r.title,
          slug: r.slug,
          iconIdentifier: r.iconIdentifier,
          themeIdentifier: r.themeIdentifier,
          duration: r.duration,
          startDate: r.startDate,
          status: r.status,
          category: r.category,
          totalTasks: rTotal,
          completedTasks: rCompleted,
          progressPercent,
          currentDayNumber: dayNumber,
          currentDayTitle: dayTitle,
          currentDayTotalTasks: dayTotalTasks,
          currentDayRemainingTasks: dayRemainingTasks,
        });

        if (activeTasks.length > 0) {
          learningQueue.push({
            roadmapId: r.id,
            title: r.title,
            slug: r.slug,
            iconIdentifier: r.iconIdentifier,
            themeIdentifier: r.themeIdentifier,
            categoryName: r.category?.name || 'General',
            currentDayNumber: dayNumber,
            currentDayTitle: dayTitle,
            totalRoadmapTasks: rTotal,
            completedRoadmapTasks: rCompleted,
            progressPercent,
            dayTotalTasks,
            dayCompletedTasks,
            activeTasks,
          });
          queueTotalTasks += activeTasks.length;
        }
      }
    } catch (sqlErr) {
      console.warn('[DashboardRepository] Fast SQL aggregate fallback:', sqlErr.message);
      // Graceful fallback for non-Postgres environments
      const fullRoadmaps = await prisma.roadmap.findMany({
        where: { status: 'active' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          roadmapDays: {
            orderBy: { dayNumber: 'asc' },
            select: {
              id: true,
              dayNumber: true,
              title: true,
              tasks: {
                select: {
                  id: true,
                  title: true,
                  taskType: true,
                  estimatedDuration: true,
                  isRequired: true,
                  displayOrder: true,
                  completions: { select: { completed: true, completedAt: true } },
                },
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
        },
      });

      for (const r of fullRoadmaps) {
        const prog = computeProgressionFromRoadmap(r);
        totalTasks += prog.totalTasks;
        completedTasks += prog.completedTasks;
        roadmapProgress.push({
          id: prog.roadmapId,
          title: prog.title,
          slug: prog.slug,
          iconIdentifier: prog.iconIdentifier,
          themeIdentifier: prog.themeIdentifier,
          duration: prog.duration,
          startDate: prog.startDate,
          status: prog.status,
          category: prog.category,
          totalTasks: prog.totalTasks,
          completedTasks: prog.completedTasks,
          progressPercent: prog.progressPercent,
          currentDayNumber: prog.currentLearningDayNumber,
          currentDayTitle: prog.currentLearningDay?.title || `Day ${prog.currentLearningDayNumber}`,
          currentDayTotalTasks: prog.currentLearningDay?.totalTasks || 0,
          currentDayRemainingTasks: prog.currentLearningDay?.pendingTasksCount || 0,
        });
        if (prog.activeTasks && prog.activeTasks.length > 0) {
          learningQueue.push({
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
          queueTotalTasks += prog.activeTasks.length;
        }
      }
    }

    const overallProgressPercent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate weekly activity grouped by Asia/Kolkata date
    const dailyCounts = new Map();
    last7DaysCompletions.forEach((c) => {
      if (c.completedAt) {
        const dStr = getKolkataDateString(c.completedAt);
        dailyCounts.set(dStr, (dailyCounts.get(dStr) || 0) + 1);
      }
    });

    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const dStr = addDaysToKolkataDate(todayStr, -i);
      const [year, month, day] = dStr.split('-').map(Number);
      const tempDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      const dayLabel = new Intl.DateTimeFormat('en-US', {
        timeZone: DEFAULT_TIMEZONE,
        weekday: 'short',
      }).format(tempDate);

      weeklyActivity.push({
        day: dayLabel,
        date: dStr,
        completed: dailyCounts.get(dStr) || 0,
        isToday: dStr === todayStr,
      });
    }

    // Format recent activity items with IST timestamps
    const recentActivity = recentCompletions.map((c) => ({
      id: c.id,
      taskId: c.taskId,
      title: c.task?.title || 'Curriculum Task',
      taskType: c.task?.taskType || 'task',
      priority: c.task?.priority || 'normal',
      roadmapId: c.task?.roadmapDay?.roadmap?.id || null,
      roadmapTitle: c.task?.roadmapDay?.roadmap?.title || 'Engineering Curriculum',
      dayNumber: c.task?.roadmapDay?.dayNumber || 1,
      completedAt: c.completedAt,
    }));

    return {
      activeRoadmapsCount: activeRoadmaps.length,
      completedRoadmapsCount: completedCount,
      archivedRoadmapsCount: archivedCount,
      totalRoadmapsCount,
      totalTasks,
      completedTasks,
      overallProgressPercent,
      todayScheduledTasks: queueTotalTasks,
      todayCompletedTasks: streakData.completedToday,
      currentStreak: streakData.currentStreak,
      bestStreak: streakData.bestStreak,
      completedToday: streakData.completedToday,
      streakTarget: streakData.streakTarget,
      remainingToday: streakData.remainingToday,
      qualifiedToday: streakData.qualifiedToday,
      isPendingToday: streakData.isPendingToday,
      streakFreezes: streakData.streakFreezes,
      freezeStatus: streakData.freezeStatus,
      roadmaps: roadmapProgress,
      learningQueue,
      weeklyActivity,
      recentActivity,
    };
  },

  /**
   * Get planner tasks for a specific date in Asia/Kolkata
   */
  async getDailyPlanner(targetDateStr) {
    const plannerData = await ProgressionService.getDailyPlannerData(targetDateStr);

    let estimatedStudyTimeMinutes = 0;
    plannerData.activeTasks.forEach((t) => {
      if (t.estimatedDuration) estimatedStudyTimeMinutes += t.estimatedDuration;
    });

    return {
      date: plannerData.date,
      isToday: plannerData.isToday,
      todayStr: plannerData.todayStr,
      streak: plannerData.streak,
      summary: {
        totalScheduled: plannerData.activeTasks.length,
        completed: plannerData.completedTasks.length,
        pending: plannerData.activeTasks.length,
        missed: 0,
        rescheduled: plannerData.rescheduledTasks.length,
        estimatedStudyTimeMinutes,
        completedToday: plannerData.streak.completedToday,
        streakTarget: plannerData.streak.streakTarget,
        remainingToday: plannerData.streak.remainingToday,
        qualifiedToday: plannerData.streak.qualifiedToday,
      },
      roadmaps: plannerData.roadmapsQueue,
      roadmapsQueue: plannerData.roadmapsQueue,
      activeTasks: plannerData.activeTasks,
      scheduledTasks: plannerData.activeTasks,
      completedTasks: plannerData.completedTasks,
      pendingTasks: plannerData.activeTasks,
      missedTasks: [],
      rescheduledTasks: plannerData.rescheduledTasks,
    };
  },
};
