import { TaskService } from '../services/task.service.js';
import { LifecycleService } from '../services/lifecycle.service.js';
import { successResponse } from '../utils/response.util.js';

export const TaskController = {
  async getByDayId(req, res, next) {
    try {
      const tasks = await TaskService.getTasksByDayId(req.params.id);
      return successResponse(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      return successResponse(res, task, 'Task retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req, res, next) {
    try {
      const history = await TaskService.getTaskHistory(req.params.id);
      return successResponse(res, history, 'Task history retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const task = await TaskService.createTask(req.params.id, req.body);
      return successResponse(res, task, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const task = await TaskService.updateTask(req.params.id, req.body);
      return successResponse(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await TaskService.deleteTask(req.params.id);
      return successResponse(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async reorder(req, res, next) {
    try {
      const { items } = req.body;
      const result = await TaskService.reorderTasks(items);
      return successResponse(res, result, 'Tasks reordered successfully');
    } catch (error) {
      next(error);
    }
  },

  async toggleCompletion(req, res, next) {
    try {
      const completion = await TaskService.toggleCompletion(req.params.id, req.body);
      return successResponse(res, completion, 'Task completion status updated');
    } catch (error) {
      next(error);
    }
  },

  async reassign(req, res, next) {
    try {
      const { newRoadmapDayId, reason } = req.body;
      const task = await TaskService.reassignTask(req.params.id, newRoadmapDayId, reason);
      return successResponse(res, task, 'Task reassigned successfully');
    } catch (error) {
      next(error);
    }
  },

  async reschedule(req, res, next) {
    try {
      const { targetDate, reason } = req.body;
      const task = await TaskService.rescheduleToDate(req.params.id, targetDate, reason);
      return successResponse(res, task, 'Task rescheduled successfully');
    } catch (error) {
      next(error);
    }
  },

  async cancelReassignment(req, res, next) {
    try {
      const task = await TaskService.cancelReassignment(req.params.id);
      return successResponse(res, task, 'Task reassignment cancelled and reverted');
    } catch (error) {
      next(error);
    }
  },

  async updatePriority(req, res, next) {
    try {
      const { priority } = req.body;
      const task = await LifecycleService.updateTaskPriority(req.params.id, priority);
      return successResponse(res, task, 'Task priority updated successfully');
    } catch (error) {
      next(error);
    }
  },
};
