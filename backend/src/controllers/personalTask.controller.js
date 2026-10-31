import { LifecycleService } from '../services/lifecycle.service.js';
import { successResponse } from '../utils/response.util.js';

export const PersonalTaskController = {
  async getTasks(req, res, next) {
    try {
      const { date } = req.query;
      const tasks = await LifecycleService.getPersonalTasks(date);
      return successResponse(res, tasks, 'Personal tasks retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async createTask(req, res, next) {
    try {
      const task = await LifecycleService.createPersonalTask(req.body);
      return successResponse(res, task, 'Personal task created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await LifecycleService.updatePersonalTask(id, req.body);
      return successResponse(res, task, 'Personal task updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async toggleTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await LifecycleService.togglePersonalTask(id);
      return successResponse(res, task, 'Personal task status toggled successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      await LifecycleService.deletePersonalTask(id);
      return successResponse(res, null, 'Personal task deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};
