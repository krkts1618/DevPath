import { DashboardRepository } from '../repositories/dashboard.repository.js';
import { ProgressionService } from './progression.service.js';

export const DashboardService = {
  async getStats() {
    return DashboardRepository.getStats();
  },

  async getDailyPlanner(date) {
    return DashboardRepository.getDailyPlanner(date);
  },

  async getLearningQueue() {
    return ProgressionService.getDailyLearningQueue();
  },
};
