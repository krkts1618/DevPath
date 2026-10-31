import { Router } from 'express';
import { checkDatabaseHealth } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import categoryRoutes from './category.routes.js';
import roadmapRoutes from './roadmap.routes.js';
import moduleRoutes from './module.routes.js';
import dayRoutes from './day.routes.js';
import taskRoutes from './task.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import analyticsRoutes from './analytics.routes.js';
import calendarRoutes from './calendar.routes.js';
import personalTaskRoutes from './personalTask.routes.js';
import noteRoutes from './note.routes.js';
import revisionRoutes from './revision.routes.js';
import projectRoutes from './project.routes.js';
import studySessionRoutes from './studySession.routes.js';
import notificationRoutes from './notification.routes.js';
import reminderRoutes from './reminder.routes.js';

const router = Router();

// Health Check Endpoint (Includes PostgreSQL database connectivity & latency)
router.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  if (!dbHealth.healthy) {
    return errorResponse(res, 'Database health check failed', 503, {
      status: 'DOWN',
      database: 'unhealthy',
      timestamp: new Date().toISOString(),
    });
  }
  return successResponse(
    res,
    {
      status: 'UP',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        healthy: true,
        latencyMs: dbHealth.latencyMs,
      },
    },
    'DevPath API & Database are healthy'
  );
});

// Domain Routes
router.use('/categories', categoryRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/modules', moduleRoutes);
router.use('/days', dayRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/calendar', calendarRoutes);
router.use('/personal-tasks', personalTaskRoutes);
router.use('/notes', noteRoutes);
router.use('/revisions', revisionRoutes);
router.use('/projects', projectRoutes);
router.use('/study-sessions', studySessionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reminders', reminderRoutes);

export default router;
