import { Router } from 'express';
import { RevisionController } from '../controllers/revision.controller.js';

const router = Router();

router.get('/analytics', RevisionController.getAnalytics);
router.get('/', RevisionController.getRevisions);
router.post('/', RevisionController.create);
router.get('/:id', RevisionController.getById);
router.put('/:id', RevisionController.update);
router.delete('/:id', RevisionController.delete);

// Actions
router.post('/:id/complete', RevisionController.completeSession);
router.post('/:id/reschedule', RevisionController.reschedule);
router.post('/:id/pause', RevisionController.pause);
router.post('/:id/resume', RevisionController.resume);

export default router;
