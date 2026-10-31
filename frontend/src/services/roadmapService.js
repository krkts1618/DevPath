import api from './api';

export const roadmapService = {
  async getRoadmaps(params = {}) {
    return api.get('/roadmaps', { params });
  },

  async getRoadmapById(id) {
    return api.get(`/roadmaps/${id}`);
  },

  async createRoadmap(data) {
    return api.post('/roadmaps', data);
  },

  async updateRoadmap(id, data) {
    return api.patch(`/roadmaps/${id}`, data);
  },

  async archiveRoadmap(id) {
    return api.delete(`/roadmaps/${id}`);
  },

  async restoreRoadmap(id) {
    return api.post(`/roadmaps/${id}/restore`);
  },

  async deleteRoadmapPermanently(id) {
    return api.delete(`/roadmaps/${id}?permanent=true&confirm=true`);
  },

  async pauseRoadmap(id, reason = null) {
    return api.post(`/roadmaps/${id}/pause`, { reason });
  },

  async resumeRoadmap(id) {
    return api.post(`/roadmaps/${id}/resume`);
  },

  async getPauseHistory(id) {
    return api.get(`/roadmaps/${id}/pause-history`);
  },

  // Modules under roadmap
  async createModule(roadmapId, data) {
    return api.post(`/roadmaps/${roadmapId}/modules`, data);
  },

  // Days under roadmap
  async createDay(roadmapId, data) {
    return api.post(`/roadmaps/${roadmapId}/days`, data);
  },
};
