import api from './api';

export const moduleService = {
  async updateModule(id, data) {
    return api.patch(`/modules/${id}`, data);
  },

  async deleteModule(id) {
    return api.delete(`/modules/${id}`);
  },

  async reorderModules(items) {
    return api.post('/modules/reorder', { items });
  },
};
