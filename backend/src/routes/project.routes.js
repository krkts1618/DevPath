import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';

const router = Router();

// Projects CRUD
router.get('/', ProjectController.getProjects);
router.post('/', ProjectController.create);
router.get('/:id', ProjectController.getById);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);

// Milestones
router.post('/:id/milestones', ProjectController.addMilestone);
router.put('/milestones/:milestoneId', ProjectController.updateMilestone);
router.patch('/milestones/:milestoneId/toggle', ProjectController.toggleMilestone);
router.delete('/milestones/:milestoneId', ProjectController.deleteMilestone);

// Project Tasks
router.post('/:id/tasks', ProjectController.addTask);
router.put('/tasks/:taskId', ProjectController.updateTask);
router.patch('/tasks/:taskId/toggle', ProjectController.toggleTask);
router.delete('/tasks/:taskId', ProjectController.deleteTask);

// Resources
router.post('/:id/resources', ProjectController.addResource);
router.delete('/resources/:resourceId', ProjectController.deleteResource);

export default router;
