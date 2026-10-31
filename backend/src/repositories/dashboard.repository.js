import { prisma } from '../config/db.js';
import { getKolkataDateString } from '../utils/date.util.js';
import {
  ProgressionService,
  computeProgressionFromRoadmap,
} from '../services/progression.service.js';

export const DashboardRepository = {
  /**
   * Get high-level statistics across roadmaps, tasks, and streaks.
   * Completely asynchronous, efficient in-memory progression calculations.
   */
  async getStats() {
    // 1. Fetch roadmaps with lean selective fields, streak metrics, and counts all in parallel
    const [roadmaps, streakData, totalRoadmapsCount, completedCount, archivedCount] = await Promise.all([
      prisma.roadmap.findMany({
        where: { status: 'active' },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          roadmapDays: {
            orderBy: { dayNumber: 'asc' },
            select: {
              id: true,
              dayNumber: true,
              title: true,
              objective: true,
              estimatedStudyTime: true,
              dayType: true,
              moduleId: true,
              tasks: {
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
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      ProgressionService.calculateDailyStreak(),
      prisma.roadmap.count(),
      prisma.roadmap.count({ where: { status: 'completed' } }),
      prisma.roadmap.count({ where: { status: 'archived' } }),
    ]);

    const activeRoadmaps = roadmaps;

    let totalTasks = 0;
    let completedTasks = 0;

    const roadmapProgress = [];
    const learningQueue = [];
    let queueTotalTasks = 0;

    for (const r of activeRoadmaps) {
      // Synchronous in-memory computation
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

    const overallProgressPercent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
      roadmaps: roadmapProgress,
      learningQueue,
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
