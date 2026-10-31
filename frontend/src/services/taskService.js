import api from './api';

export const taskService = {
  async getTaskById(taskId) {
    return api.get(`/tasks/${taskId}`);
  },

  async getTaskHistory(taskId) {
    return api.get(`/tasks/${taskId}/history`);
  },

  async updateTask(taskId, data) {
    return api.patch(`/tasks/${taskId}`, data);
  },

  async deleteTask(taskId) {
    return api.delete(`/tasks/${taskId}`);
  },

  async reorderTasks(items) {
    return api.post('/tasks/reorder', { items });
  },

  async toggleCompletion(taskId, completed, notes = null) {
    return api.post(`/tasks/${taskId}/complete`, { completed, notes });
  },

  async reassignTask(taskId, newRoadmapDayId, reason = null) {
    return api.post(`/tasks/${taskId}/reassign`, { newRoadmapDayId, reason });
  },

  async rescheduleToDate(taskId, targetDate, reason = null) {
    return api.post(`/tasks/${taskId}/reschedule`, { targetDate, reason });
  },

  async cancelReassignment(taskId) {
    return api.delete(`/tasks/${taskId}/reassign`);
  },

  async updatePriority(taskId, priority) {
    return api.patch(`/tasks/${taskId}/priority`, { priority });
  },
};
