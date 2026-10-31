import { Router } from 'express';
import { StudySessionController } from '../controllers/studySession.controller.js';

const router = Router();

// Queries
router.get('/active', StudySessionController.getActive);
router.get('/analytics', StudySessionController.getAnalytics);
router.get('/history', StudySessionController.getHistory);
router.get('/tasks-focus', StudySessionController.getTasksFocus);
router.post('/tasks-focus', StudySessionController.getTasksFocus);

// Session Lifecycle
router.post('/start', StudySessionController.start);
router.post('/:id/pause', StudySessionController.pause);
router.post('/:id/resume', StudySessionController.resume);
router.post('/:id/complete', StudySessionController.complete);
router.post('/:id/interrupt', StudySessionController.interrupt);
router.post('/:id/discard', StudySessionController.discard);
router.post('/:id/resume-interrupted', StudySessionController.resumeInterrupted);

// Maintenance
router.patch('/:id/notes', StudySessionController.updateNotes);
router.delete('/:id', StudySessionController.deleteSession);

export default router;
