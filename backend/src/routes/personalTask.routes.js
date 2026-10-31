import { Router } from 'express';
import { PersonalTaskController } from '../controllers/personalTask.controller.js';

const router = Router();

router.get('/', PersonalTaskController.getTasks);
router.post('/', PersonalTaskController.createTask);
router.put('/:id', PersonalTaskController.updateTask);
router.patch('/:id/toggle', PersonalTaskController.toggleTask);
router.delete('/:id', PersonalTaskController.deleteTask);

export default router;
