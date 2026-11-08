import { prisma } from '../config/db.js';
import { getKolkataDateString, addDaysToKolkataDate } from '../utils/date.util.js';
import { NotificationService } from './notification.service.js';

export const StudySessionService = {
  /**
   * Start a new focus session
   */
  async startSession(data) {
    const {
      sessionType = 'pomodoro',
      title = null,
      roadmapId = null,
      roadmapDayId = null,
      taskId = null,
      revisionScheduleId = null,
      projectId = null,
      projectTaskId = null,
      targetDurationMinutes = null,
      notes = null,
    } = data;

    // 1. Strict single active session constraint:
    // Check if there is already an active or paused session
    const existing = await prisma.studySession.findFirst({
      where: {
        status: { in: ['active', 'paused'] },
      },
      include: {
        roadmap: { select: { id: true, title: true } },
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        revisionSchedule: { select: { id: true, topic: true } },
      },
    });

    if (existing) {
      const err = new Error('Another focus session is already active or paused. Complete or discard it first.');
      err.statusCode = 409;
      err.activeSession = existing;
      throw err;
    }

    // 2. Determine target duration based on type
    let targetMinutes = targetDurationMinutes ? Number(targetDurationMinutes) : null;
    if (sessionType === 'pomodoro' && !targetMinutes) {
      targetMinutes = 25;
    } else if (sessionType === 'short_break' && !targetMinutes) {
      targetMinutes = 5;
    } else if (sessionType === 'long_break' && !targetMinutes) {
      targetMinutes = 15;
    } else if (sessionType === 'custom') {
      targetMinutes = Math.max(1, Math.min(180, targetMinutes || 25));
    } else if (sessionType === 'stopwatch') {
      targetMinutes = null;
    }

    // 3. Resolve title if not provided
    let sessionTitle = title ? title.trim() : null;
    if (!sessionTitle) {
      if (taskId) {
        const t = await prisma.task.findUnique({ where: { id: taskId }, select: { title: true } });
        if (t) sessionTitle = `Task: ${t.title}`;
      } else if (revisionScheduleId) {
        const r = await prisma.revisionSchedule.findUnique({ where: { id: revisionScheduleId }, select: { topic: true } });
        if (r) sessionTitle = `Revision: ${r.topic}`;
      } else if (projectTaskId) {
        const pt = await prisma.projectTask.findUnique({ where: { id: projectTaskId }, select: { title: true } });
        if (pt) sessionTitle = `Project Task: ${pt.title}`;
      } else if (projectId) {
        const p = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
        if (p) sessionTitle = `Project: ${p.name}`;
      } else if (roadmapId) {
        const rm = await prisma.roadmap.findUnique({ where: { id: roadmapId }, select: { title: true } });
        if (rm) sessionTitle = `Roadmap: ${rm.title}`;
      } else {
        sessionTitle = sessionType === 'stopwatch' ? 'Stopwatch Session' : 'General Focus Session';
      }
    }

    const session = await prisma.studySession.create({
      data: {
        sessionType,
        title: sessionTitle,
        roadmapId: roadmapId || null,
        roadmapDayId: roadmapDayId || null,
        taskId: taskId || null,
        revisionScheduleId: revisionScheduleId || null,
        projectId: projectId || null,
        projectTaskId: projectTaskId || null,
        targetDurationMinutes: targetMinutes,
        actualDurationSeconds: 0,
        pausedDurationSeconds: 0,
        status: 'active',
        startedAt: new Date(),
        notes: notes?.trim() || null,
      },
      include: {
        roadmap: { select: { id: true, title: true } },
        roadmapDay: { select: { id: true, dayNumber: true, title: true } },
        task: { select: { id: true, title: true, taskType: true, estimatedDuration: true } },
        revisionSchedule: { select: { id: true, topic: true } },
        project: { select: { id: true, name: true } },
        projectTask: { select: { id: true, title: true } },
      },
    });

    return session;
  },

  /**
   * Pause an active session
   */
  async pauseSession(id) {
    const session = await prisma.studySession.findUnique({ where: { id } });
    if (!session) throw new Error('Study session not found');
    if (session.status !== 'active') {
      throw new Error(`Cannot pause a session with status "${session.status}"`);
    }

    const now = new Date();
    // Calculate current accumulated focused seconds up to this moment
    const totalElapsedSec = Math.max(0, Math.floor((now.getTime() - session.startedAt.getTime()) / 1000));
    const activeSec = Math.max(0, totalElapsedSec - session.pausedDurationSeconds);

    return prisma.studySession.update({
      where: { id },
      data: {
        status: 'paused',
        pausedAt: now,
        actualDurationSeconds: activeSec,
      },
      include: {
        roadmap: { select: { id: true, title: true } },
        task: { select: { id: true, title: true } },
      },
    });
  },

  /**
   * Resume a paused session
   */
  async resumeSession(id) {
    const session = await prisma.studySession.findUnique({ where: { id } });
    if (!session) throw new Error('Study session not found');
    if (session.status !== 'paused') {
      throw new Error(`Cannot resume a session with status "${session.status}"`);
    }

    const now = new Date();
    let additionalPause = 0;
    if (session.pausedAt) {
      additionalPause = Math.max(0, Math.floor((now.getTime() - session.pausedAt.getTime()) / 1000));
    }

    return prisma.studySession.update({
      where: { id },
      data: {
        status: 'active',
        pausedAt: null,
        pausedDurationSeconds: session.pausedDurationSeconds + additionalPause,
      },
      include: {
        roadmap: { select: { id: true, title: true } },
        task: { select: { id: true, title: true } },
      },
    });
  },

  /**
   * Complete a session with server-side duration validation
   */
  async completeSession(id, data = {}) {
    const session = await prisma.studySession.findUnique({ where: { id } });
    if (!session) throw new Error('Study session not found');
    if (session.status !== 'active' && session.status !== 'paused') {
      throw new Error(`Session is already ${session.status}`);
    }

    const now = new Date();
    let pausedSec = session.pausedDurationSeconds;
    if (session.status === 'paused' && session.pausedAt) {
      pausedSec += Math.max(0, Math.floor((now.getTime() - session.pausedAt.getTime()) / 1000));
    }

    // Maximum possible physical focused seconds between startedAt and now minus paused time
    const maxPossibleFocus = Math.max(
      0,
      Math.floor((now.getTime() - session.startedAt.getTime()) / 1000) - pausedSec
    );

    // If client supplied a validated actualDurationSeconds, ensure it does not exceed wall-clock limit
    let finalActualSeconds = maxPossibleFocus;
    if (data.actualDurationSeconds !== undefined && Number(data.actualDurationSeconds) >= 0) {
      finalActualSeconds = Math.min(Number(data.actualDurationSeconds), maxPossibleFocus + 5);
    }

    const completedSession = await prisma.studySession.update({
      where: { id },
      data: {
        status: 'completed',
        endedAt: now,
        completedAt: now,
        actualDurationSeconds: finalActualSeconds,
        pausedDurationSeconds: pausedSec,
        notes: data.notes !== undefined ? (data.notes ? data.notes.trim() : null) : session.notes,
      },
      include: {
        roadmap: { select: { id: true, title: true } },
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        revisionSchedule: { select: { id: true, topic: true } },
      },
    });

    // Trigger focus completed notification
    NotificationService.triggerFocusCompletionNotification(completedSession).catch((err) => {
      console.error('Non-critical focus completion notification error:', err);
    });

    return completedSession;
  },

  /**
   * Interrupt a session (e.g. browser crash, user walked away, interrupted)
   */
  async interruptSession(id, data = {}) {
    const session = await prisma.studySession.findUnique({ where: { id } });
    if (!session) throw new Error('Study session not found');

    const now = new Date();
    let pausedSec = session.pausedDurationSeconds;
    if (session.status === 'paused' && session.pausedAt) {
      pausedSec += Math.max(0, Math.floor((now.getTime() - session.pausedAt.getTime()) / 1000));
    }
    const maxPossible = Math.max(
      0,
      Math.floor((now.getTime() - session.startedAt.getTime()) / 1000) - pausedSec
    );

    const actualSec = data.actualDurationSeconds !== undefined
      ? Math.min(Number(data.actualDurationSeconds), maxPossible)
      : Math.min(session.actualDurationSeconds || maxPossible, maxPossible);

    return prisma.studySession.update({
      where: { id },
      data: {
        status: 'interrupted',
        endedAt: now,
        actualDurationSeconds: actualSec,
        pausedDurationSeconds: pausedSec,
        notes: data.notes !== undefined ? data.notes?.trim() || null : session.notes,
      },
    });
  },

  /**
   * Discard a session
   */
  async discardSession(id) {
    const session = await prisma.studySession.findUnique({ where: { id } });
    if (!session) throw new Error('Study session not found');

    return prisma.studySession.update({
      where: { id },
      data: {
        status: 'discarded',
        endedAt: new Date(),
      },
    });
  },

  /**
   * Get currently active or paused session for recovery
   */
  async getActiveSession() {
    const active = await prisma.studySession.findFirst({
      where: {
        status: { in: ['active', 'paused'] },
      },
      include: {
        roadmap: { select: { id: true, title: true, categoryId: true, category: { select: { id: true, name: true } } } },
        roadmapDay: { select: { id: true, dayNumber: true, title: true } },
        task: { select: { id: true, title: true, taskType: true, estimatedDuration: true } },
        revisionSchedule: { select: { id: true, topic: true } },
        project: { select: { id: true, name: true } },
        projectTask: { select: { id: true, title: true } },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!active) return null;

    const now = new Date();
    let currentPausedSec = active.pausedDurationSeconds;
    if (active.status === 'paused' && active.pausedAt) {
      currentPausedSec += Math.max(0, Math.floor((now.getTime() - active.pausedAt.getTime()) / 1000));
    }

    const totalElapsedSec = Math.max(0, Math.floor((now.getTime() - active.startedAt.getTime()) / 1000));
    const liveFocusedSec = Math.max(0, totalElapsedSec - currentPausedSec);

    // Stale detection: if session has been running for > 12 hours, flag as stale
    const isStale = totalElapsedSec > 12 * 3600;

    return {
      ...active,
      liveFocusedSeconds: active.status === 'paused' ? active.actualDurationSeconds : liveFocusedSec,
      totalElapsedSeconds: totalElapsedSec,
      currentPausedSeconds: currentPausedSec,
      serverTimestamp: now.toISOString(),
      isStale,
    };
  },

  /**
   * Resume an interrupted session
   */
  async resumeInterruptedSession(id) {
    const session = await prisma.studySession.findUnique({ where: { id } });
    if (!session) throw new Error('Study session not found');

    // Ensure no other active session exists
    const active = await prisma.studySession.findFirst({
      where: { status: { in: ['active', 'paused'] } },
    });
    if (active && active.id !== id) {
      throw new Error('Another session is already running. Complete or discard it first.');
    }

    return prisma.studySession.update({
      where: { id },
      data: {
        status: 'active',
        endedAt: null,
      },
    });
  },

  /**
   * Get session history with filters and pagination
   */
  async getHistory(filters = {}, pagination = { page: 1, limit: 20 }) {
    const page = Math.max(1, parseInt(pagination.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(pagination.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const { status, sessionType, roadmapId, taskId, projectId, startDate, endDate } = filters;

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (sessionType && sessionType !== 'all') {
      where.sessionType = sessionType;
    }
    if (roadmapId) {
      where.roadmapId = roadmapId;
    }
    if (taskId) {
      where.taskId = taskId;
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) where.startedAt.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const [totalCount, sessions] = await Promise.all([
      prisma.studySession.count({ where }),
      prisma.studySession.findMany({
        where,
        include: {
          roadmap: { select: { id: true, title: true } },
          roadmapDay: { select: { id: true, dayNumber: true, title: true } },
          task: { select: { id: true, title: true, taskType: true, estimatedDuration: true } },
          revisionSchedule: { select: { id: true, topic: true } },
          project: { select: { id: true, name: true } },
          projectTask: { select: { id: true, title: true } },
        },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  },

  /**
   * Update session notes
   */
  async updateNotes(id, notes) {
    return prisma.studySession.update({
      where: { id },
      data: { notes: notes ? notes.trim() : null },
    });
  },

  /**
   * Delete a session
   */
  async deleteSession(id) {
    await prisma.studySession.delete({ where: { id } });
    return { success: true };
  },

  /**
   * Compute comprehensive study time analytics in Asia/Kolkata timezone
   */
  async getAnalytics(options = {}) {
    const todayStr = getKolkataDateString();
    // Monday of current week in Asia/Kolkata
    const todayDate = new Date();
    // Calculate week start
    const dayOfWeek = (todayDate.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    const weekStartStr = addDaysToKolkataDate(todayStr, -dayOfWeek);
    const monthStartStr = `${todayStr.substring(0, 7)}-01`;

    // Only count completed focus sessions (exclude breaks and non-completed statuses)
    // Select only scalar fields needed to compute metrics, preventing memory bloat on Render
    const completedSessions = await prisma.studySession.findMany({
      where: {
        status: 'completed',
        sessionType: { in: ['pomodoro', 'custom', 'stopwatch'] },
      },
      select: {
        id: true,
        actualDurationSeconds: true,
        startedAt: true,
        roadmapId: true,
        projectId: true,
        roadmap: {
          select: {
            id: true,
            title: true,
            category: { select: { id: true, name: true } },
          },
        },
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    let todaySeconds = 0;
    let weekSeconds = 0;
    let monthSeconds = 0;
    let totalSeconds = 0;
    let longestSessionSeconds = 0;

    const roadmapMap = new Map();
    const categoryMap = new Map();
    const projectMap = new Map();
    const dailyMap = new Map();

    // Initialize the last 14 days in dailyMap with 0
    for (let i = 13; i >= 0; i--) {
      const dStr = addDaysToKolkataDate(todayStr, -i);
      dailyMap.set(dStr, { date: dStr, focusMinutes: 0, sessionsCount: 0 });
    }

    for (const s of completedSessions) {
      const sec = s.actualDurationSeconds || 0;
      totalSeconds += sec;
      if (sec > longestSessionSeconds) {
        longestSessionSeconds = sec;
      }

      const sessionDateStr = getKolkataDateString(s.startedAt);

      if (sessionDateStr === todayStr) {
        todaySeconds += sec;
      }
      if (sessionDateStr >= weekStartStr) {
        weekSeconds += sec;
      }
      if (sessionDateStr >= monthStartStr) {
        monthSeconds += sec;
      }

      // Group by Roadmap
      if (s.roadmapId && s.roadmap) {
        const current = roadmapMap.get(s.roadmapId) || {
          roadmapId: s.roadmapId,
          title: s.roadmap.title,
          categoryName: s.roadmap.category?.name || 'Uncategorized',
          seconds: 0,
          sessionsCount: 0,
        };
        current.seconds += sec;
        current.sessionsCount += 1;
        roadmapMap.set(s.roadmapId, current);

        // Group by Category
        const catName = s.roadmap.category?.name || 'General';
        const catCurrent = categoryMap.get(catName) || { name: catName, seconds: 0, sessionsCount: 0 };
        catCurrent.seconds += sec;
        catCurrent.sessionsCount += 1;
        categoryMap.set(catName, catCurrent);
      }

      // Group by Project
      if (s.projectId && s.project) {
        const pCurrent = projectMap.get(s.projectId) || {
          projectId: s.projectId,
          name: s.project.name,
          seconds: 0,
          sessionsCount: 0,
        };
        pCurrent.seconds += sec;
        pCurrent.sessionsCount += 1;
        projectMap.set(s.projectId, pCurrent);
      }

      // Daily Trend
      if (dailyMap.has(sessionDateStr)) {
        const dayEntry = dailyMap.get(sessionDateStr);
        dayEntry.focusMinutes += Math.round(sec / 60);
        dayEntry.sessionsCount += 1;
      }
    }

    // Format results
    const todayMinutes = Math.round(todaySeconds / 60);
    const weekMinutes = Math.round(weekSeconds / 60);
    const monthMinutes = Math.round(monthSeconds / 60);
    const totalMinutes = Math.round(totalSeconds / 60);
    const completedCount = completedSessions.length;

    // Distinct study days
    const activeDaysCount = new Set(completedSessions.map((s) => getKolkataDateString(s.startedAt))).size;
    const averageDailyFocusMinutes = activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;

    const byRoadmap = Array.from(roadmapMap.values())
      .map((r) => ({
        ...r,
        focusMinutes: Math.round(r.seconds / 60),
      }))
      .sort((a, b) => b.seconds - a.seconds);

    const byCategory = Array.from(categoryMap.values())
      .map((c) => ({
        ...c,
        focusMinutes: Math.round(c.seconds / 60),
      }))
      .sort((a, b) => b.seconds - a.seconds);

    const byProject = Array.from(projectMap.values())
      .map((p) => ({
        ...p,
        focusMinutes: Math.round(p.seconds / 60),
      }))
      .sort((a, b) => b.seconds - a.seconds);

    const dailyTrend = Array.from(dailyMap.values());

    return {
      todayFocusMinutes: todayMinutes,
      todayFocusSeconds: todaySeconds,
      weekFocusMinutes: weekMinutes,
      monthFocusMinutes: monthMinutes,
      totalFocusMinutes: totalMinutes,
      completedSessionsCount: completedCount,
      averageDailyFocusMinutes,
      longestSessionMinutes: Math.round(longestSessionSeconds / 60),
      byRoadmap,
      byCategory,
      byProject,
      dailyTrend,
      activeDaysCount,
    };
  },

  /**
   * Get accumulated focus time for specific tasks
   */
  async getTasksFocusDuration(taskIds = []) {
    if (!taskIds || taskIds.length === 0) return {};

    const sessions = await prisma.studySession.findMany({
      where: {
        taskId: { in: taskIds },
        status: 'completed',
      },
      select: {
        taskId: true,
        actualDurationSeconds: true,
      },
    });

    const result = {};
    for (const s of sessions) {
      if (!result[s.taskId]) {
        result[s.taskId] = { focusSeconds: 0, focusMinutes: 0 };
      }
      result[s.taskId].focusSeconds += s.actualDurationSeconds || 0;
      result[s.taskId].focusMinutes = Math.round(result[s.taskId].focusSeconds / 60);
    }

    return result;
  },
};
