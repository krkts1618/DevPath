import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmap.controller.js';
import { ModuleController } from '../controllers/module.controller.js';
import { DayController } from '../controllers/day.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createRoadmapSchema, updateRoadmapSchema } from '../validators/roadmap.validator.js';
import { createModuleSchema } from '../validators/module.validator.js';
import { createDaySchema } from '../validators/day.validator.js';

const router = Router();

// Roadmap base CRUD
router.get('/', RoadmapController.getAll);
router.post('/', validate(createRoadmapSchema), RoadmapController.create);
router.get('/:id', RoadmapController.getById);
router.patch('/:id', validate(updateRoadmapSchema), RoadmapController.update);
router.put('/:id', validate(updateRoadmapSchema), RoadmapController.update);
router.delete('/:id', RoadmapController.delete);
router.post('/:id/restore', RoadmapController.restore);
router.post('/:id/pause', RoadmapController.pause);
router.post('/:id/resume', RoadmapController.resume);
router.get('/:id/pause-history', RoadmapController.getPauseHistory);

// Nested modules under roadmap
router.get('/:id/modules', ModuleController.getByRoadmapId);
router.post('/:id/modules', validate(createModuleSchema), ModuleController.create);

// Nested days under roadmap
router.get('/:id/days', DayController.getByRoadmapId);
router.post('/:id/days', validate(createDaySchema), DayController.create);

export default router;
