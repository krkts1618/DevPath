import { Router } from 'express';
import { WeekendReviewController } from '../controllers/weekendReview.controller.js';

const router = Router();

router.get('/recollection', WeekendReviewController.getRecollection);
router.get('/assessment', WeekendReviewController.getAssessment);
router.get('/weak-topics', WeekendReviewController.getWeakTopics);
router.post('/', WeekendReviewController.saveReview);

export default router;
