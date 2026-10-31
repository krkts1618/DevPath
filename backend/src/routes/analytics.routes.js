import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/comprehensive', AnalyticsController.getComprehensiveAnalytics);
router.get('/export/:type', AnalyticsController.exportCsv);
router.get('/streak', AnalyticsController.getOverallStreak);
router.get('/roadmaps/:id/streak', AnalyticsController.getRoadmapStreak);
router.get('/summary', AnalyticsController.getDailySummary);
router.get('/heatmap', AnalyticsController.getActivityHeatmap);
router.get('/history', AnalyticsController.getLearningHistory);
router.get('/streak-target', AnalyticsController.getStreakTarget);
router.post('/streak-target', AnalyticsController.updateStreakTarget);

export default router;
