import api from './api';

export const dashboardService = {
  async getStats(options = {}) {
    return api.get('/dashboard/stats', options);
  },

  async getDailyPlanner(date = null, options = {}) {
    const params = date ? { date, ...(options.params || {}) } : options.params;
    return api.get('/dashboard/planner', { ...options, params });
  },
};
