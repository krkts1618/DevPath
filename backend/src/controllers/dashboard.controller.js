import { DashboardService } from '../services/dashboard.service.js';
import { successResponse } from '../utils/response.util.js';

export const DashboardController = {
  async getStats(req, res, next) {
    try {
      const stats = await DashboardService.getStats();
      return successResponse(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getDailyPlanner(req, res, next) {
    try {
      const { date } = req.query;
      const planner = await DashboardService.getDailyPlanner(date);
      return successResponse(res, planner, 'Daily planner retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getLearningQueue(req, res, next) {
    try {
      const queue = await DashboardService.getLearningQueue();
      return successResponse(res, queue, 'Adaptive learning queue retrieved successfully');
    } catch (err) {
      next(err);
    }
  },
};
