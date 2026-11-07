import { prisma } from '../config/db.js';
import {
  getKolkataDateString,
  addDaysToKolkataDate,
  getKolkataWeekRange,
  getKolkataDayOfWeek,
  isKolkataWeekend,
  DEFAULT_TIMEZONE,
} from '../utils/date.util.js';

export const WeekendReviewService = {
  /**
   * Fetches data for Saturday Weekly Recollection:
   * - Mon–Fri completed tasks grouped by roadmap
   * - Notes created or updated during this week
   * - Weak topics flagged in previous assessments (for revision suggestions)
   * - Saved recollection record (if already submitted/saved)
   */
  async getRecollectionData(targetDate = null) {
    const todayStr = getKolkataDateString();
    const refDate = targetDate || todayStr;
    const { weekStartDate, weekEndDate } = getKolkataWeekRange(refDate);

    // Mon–Fri date bounds in UTC+5:30
    const fridayStr = addDaysToKolkataDate(weekStartDate, 4); // Friday
    const [sy, sm, sd] = weekStartDate.split('-').map(Number);
    const [fy, fm, fd] = fridayStr.split('-').map(Number);

    const startUtc = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0) - (5 * 60 + 30) * 60 * 1000);
    const endUtc = new Date(Date.UTC(fy, fm - 1, fd, 23, 59, 59, 999) - (5 * 60 + 30) * 60 * 1000);

    const [completions, personalTasks, weekNotes, savedReview, weakTopicAssessments] = await Promise.all([
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
        orderBy: { completedAt: 'asc' },
      }),
      prisma.personalTask.findMany({
        where: {
          completed: true,
          completedAt: {
            gte: startUtc,
            lte: endUtc,
          },
        },
        include: {
          roadmap: { select: { id: true, title: true } },
        },
        orderBy: { completedAt: 'asc' },
      }),
      prisma.note.findMany({
        where: {
          updatedAt: {
            gte: startUtc,
            lte: endUtc,
          },
        },
        include: {
          roadmap: { select: { id: true, title: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.weekendReview.findUnique({
        where: {
          weekStartDate_reviewType: {
            weekStartDate,
            reviewType: 'recollection',
          },
        },
      }),
      prisma.topicAssessment.findMany({
        where: {
          understanding: { in: ['needs_revision', 'difficult'] },
        },
        include: {
          roadmap: { select: { id: true, title: true } },
        },
        orderBy: { assessedDate: 'desc' },
        take: 15,
      }),
    ]);

    // Group completed tasks by roadmap
    const roadmapMap = new Map();

    completions.forEach((c) => {
      const task = c.task;
      if (!task || !task.roadmapDay || !task.roadmapDay.roadmap) return;
      const rm = task.roadmapDay.roadmap;
      if (!roadmapMap.has(rm.id)) {
        roadmapMap.set(rm.id, {
          roadmapId: rm.id,
          roadmapTitle: rm.title,
          categoryName: rm.category?.name || 'General',
          tasks: [],
        });
      }
      roadmapMap.get(rm.id).tasks.push({
        id: task.id,
        title: task.title,
        taskType: task.taskType,
        priority: task.priority,
        dayNumber: task.roadmapDay.dayNumber,
        dayTitle: task.roadmapDay.title,
        completedAt: c.completedAt,
        notes: c.notes,
      });
    });

    // Also include personal tasks if they have a roadmap or separate group
    if (personalTasks.length > 0) {
      if (!roadmapMap.has('personal')) {
        roadmapMap.set('personal', {
          roadmapId: 'personal',
          roadmapTitle: 'Personal & Scheduled Engineering Tasks',
          categoryName: 'Personal',
          tasks: [],
        });
      }
      personalTasks.forEach((pt) => {
        roadmapMap.get('personal').tasks.push({
          id: pt.id,
          title: pt.title,
          taskType: pt.taskType || 'custom',
          priority: pt.priority,
          dayNumber: null,
          dayTitle: 'Personal Milestone',
          completedAt: pt.completedAt,
          notes: pt.description,
        });
      });
    }

    // Deduplicate weak topics
    const seenTopics = new Set();
    const revisionSuggestions = [];
    weakTopicAssessments.forEach((item) => {
      if (!seenTopics.has(item.topic.toLowerCase())) {
        seenTopics.add(item.topic.toLowerCase());
        revisionSuggestions.push({
          id: item.id,
          topic: item.topic,
          understanding: item.understanding,
          notes: item.notes,
          assessedDate: item.assessedDate,
          roadmapId: item.roadmapId,
          roadmapTitle: item.roadmap?.title || 'Engineering',
        });
      }
    });

    return {
      weekStartDate,
      weekEndDate,
      reviewType: 'recollection',
      roadmaps: Array.from(roadmapMap.values()),
      totalCompletedTasks: completions.length + personalTasks.length,
      notes: weekNotes.map((n) => ({
        id: n.id,
        title: n.title,
        roadmapTitle: n.roadmap?.title || 'General',
        updatedAt: n.updatedAt,
      })),
      revisionSuggestions,
      savedReview: savedReview || null,
    };
  },

  /**
   * Fetches data for Sunday Weekly Self-Assessment:
   * - All topics covered this week across roadmaps
   * - Saved assessment record with topic ratings, reflection, questions, mistakes, and goals
   */
  async getAssessmentData(targetDate = null) {
    const todayStr = getKolkataDateString();
    const refDate = targetDate || todayStr;
    const { weekStartDate, weekEndDate } = getKolkataWeekRange(refDate);

    const fridayStr = addDaysToKolkataDate(weekStartDate, 4);
    const [sy, sm, sd] = weekStartDate.split('-').map(Number);
    const [fy, fm, fd] = fridayStr.split('-').map(Number);

    const startUtc = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0) - (5 * 60 + 30) * 60 * 1000);
    const endUtc = new Date(Date.UTC(fy, fm - 1, fd, 23, 59, 59, 999) - (5 * 60 + 30) * 60 * 1000);

    const [completions, savedReview] = await Promise.all([
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
                  roadmap: true,
                },
              },
            },
          },
        },
        orderBy: { completedAt: 'asc' },
      }),
      prisma.weekendReview.findUnique({
        where: {
          weekStartDate_reviewType: {
            weekStartDate,
            reviewType: 'assessment',
          },
        },
        include: {
          topicAssessments: {
            include: {
              roadmap: { select: { id: true, title: true } },
              task: { select: { id: true, title: true } },
            },
          },
        },
      }),
    ]);

    // Unique topics covered this week
    const topicsCoveredMap = new Map();
    completions.forEach((c) => {
      const task = c.task;
      if (!task) return;
      const topicName = task.title;
      if (!topicsCoveredMap.has(topicName)) {
        topicsCoveredMap.set(topicName, {
          taskId: task.id,
          topic: topicName,
          roadmapId: task.roadmapDay?.roadmap?.id || null,
          roadmapTitle: task.roadmapDay?.roadmap?.title || 'Engineering',
          dayNumber: task.roadmapDay?.dayNumber || 1,
        });
      }
    });

    return {
      weekStartDate,
      weekEndDate,
      reviewType: 'assessment',
      topicsCovered: Array.from(topicsCoveredMap.values()),
      savedReview: savedReview || null,
    };
  },

  /**
   * Save or update a weekend review record (Recollection or Assessment).
   * Also creates historical TopicAssessment records without overwriting past history.
   */
  async saveReview(data) {
    const {
      weekStartDate,
      reviewDate,
      reviewType, // 'recollection' | 'assessment'
      reflection = '',
      mistakes = '',
      questions = '',
      weakAreas = '',
      nextWeekGoals = '',
      checklistItems = [],
      topicAssessments = [],
    } = data;

    if (!weekStartDate || !reviewType) {
      throw new Error('weekStartDate and reviewType are required');
    }

    const assignedReviewDate = reviewDate || getKolkataDateString();

    const review = await prisma.weekendReview.upsert({
      where: {
        weekStartDate_reviewType: {
          weekStartDate,
          reviewType,
        },
      },
      update: {
        reviewDate: assignedReviewDate,
        reflection,
        mistakes,
        questions,
        weakAreas,
        nextWeekGoals,
        checklistItems,
      },
      create: {
        weekStartDate,
        reviewDate: assignedReviewDate,
        reviewType,
        reflection,
        mistakes,
        questions,
        weakAreas,
        nextWeekGoals,
        checklistItems,
      },
    });

    // If topicAssessments provided in Sunday assessment, create historical records
    if (Array.isArray(topicAssessments) && topicAssessments.length > 0) {
      const recordsToCreate = topicAssessments.map((ta) => ({
        weekendReviewId: review.id,
        roadmapId: ta.roadmapId || null,
        taskId: ta.taskId || null,
        topic: ta.topic,
        understanding: ta.understanding, // 'understood' | 'needs_revision' | 'difficult'
        notes: ta.notes || null,
        assessedDate: assignedReviewDate,
      }));

      await prisma.topicAssessment.createMany({
        data: recordsToCreate,
      });
    }

    return prisma.weekendReview.findUnique({
      where: { id: review.id },
      include: {
        topicAssessments: {
          include: {
            roadmap: { select: { id: true, title: true } },
          },
        },
      },
    });
  },

  /**
   * Get all weak topics across time to prioritize revisions
   */
  async getWeakTopics() {
    const list = await prisma.topicAssessment.findMany({
      where: {
        understanding: { in: ['needs_revision', 'difficult'] },
      },
      include: {
        roadmap: { select: { id: true, title: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { assessedDate: 'desc' },
      take: 30,
    });

    // Deduplicate by lowercase topic name
    const seen = new Set();
    const uniqueList = [];
    list.forEach((item) => {
      const key = item.topic.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(item);
      }
    });

    return uniqueList;
  },
};
