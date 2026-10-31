import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  updateTaskSchema,
  toggleTaskCompletionSchema,
  reassignTaskSchema,
} from '../validators/task.validator.js';

const router = Router();

router.post('/reorder', TaskController.reorder);
router.get('/:id', TaskController.getById);
router.get('/:id/history', TaskController.getHistory);
router.patch('/:id', validate(updateTaskSchema), TaskController.update);
router.patch('/:id/priority', TaskController.updatePriority);
router.put('/:id', validate(updateTaskSchema), TaskController.update);
router.delete('/:id', TaskController.delete);
router.post('/:id/complete', validate(toggleTaskCompletionSchema), TaskController.toggleCompletion);
router.post('/:id/toggle', validate(toggleTaskCompletionSchema), TaskController.toggleCompletion);
router.post('/:id/reassign', validate(reassignTaskSchema), TaskController.reassign);
router.post('/:id/reschedule', TaskController.reschedule);
router.delete('/:id/reassign', TaskController.cancelReassignment);

export default router;
