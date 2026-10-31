import api from './api';

export const dayService = {
  async getDayById(id) {
    return api.get(`/days/${id}`);
  },

  async updateDay(id, data) {
    return api.patch(`/days/${id}`, data);
  },

  async deleteDay(id) {
    return api.delete(`/days/${id}`);
  },

  async reorderDays(items) {
    return api.post('/days/reorder', { items });
  },

  // Tasks under day
  async createTask(dayId, data) {
    return api.post(`/days/${dayId}/tasks`, data);
  },
};
