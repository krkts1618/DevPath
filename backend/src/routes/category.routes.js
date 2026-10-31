import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';

const router = Router();

router.get('/', CategoryController.getAll);
router.post('/', validate(createCategorySchema), CategoryController.create);
router.post('/reorder', CategoryController.reorder);
router.get('/:id', CategoryController.getById);
router.patch('/:id', validate(updateCategorySchema), CategoryController.update);
router.put('/:id', validate(updateCategorySchema), CategoryController.update);
router.post('/:id/archive', CategoryController.archive);
router.post('/:id/restore', CategoryController.restore);
router.delete('/:id', CategoryController.delete);

export default router;
