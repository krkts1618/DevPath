import { Router } from 'express';
import { DayController } from '../controllers/day.controller.js';
import { TaskController } from '../controllers/task.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateDaySchema } from '../validators/day.validator.js';
import { createTaskSchema } from '../validators/task.validator.js';

const router = Router();

router.post('/reorder', DayController.reorder);
router.get('/:id', DayController.getById);
router.patch('/:id', validate(updateDaySchema), DayController.update);
router.delete('/:id', DayController.delete);

// Nested tasks under day
router.get('/:id/tasks', TaskController.getByDayId);
router.post('/:id/tasks', validate(createTaskSchema), TaskController.create);

export default router;
