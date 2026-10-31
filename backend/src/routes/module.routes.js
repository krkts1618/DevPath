import { Router } from 'express';
import { ModuleController } from '../controllers/module.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateModuleSchema } from '../validators/module.validator.js';

const router = Router();

router.post('/reorder', ModuleController.reorder);
router.patch('/:id', validate(updateModuleSchema), ModuleController.update);
router.delete('/:id', ModuleController.delete);

export default router;
