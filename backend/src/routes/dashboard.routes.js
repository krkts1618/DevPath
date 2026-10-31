import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/stats', DashboardController.getStats);
router.get('/queue', DashboardController.getLearningQueue);
router.get('/planner', DashboardController.getDailyPlanner);
router.get('/daily-planner', DashboardController.getDailyPlanner);

export default router;
