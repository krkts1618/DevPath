import api from './api';

export const notificationService = {
  // Notifications
  async getNotifications(params = {}) {
    return api.get('/notifications', { params });
  },

  async getUnreadCount() {
    return api.get('/notifications/unread-count');
  },

  async markAsRead(id) {
    return api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return api.patch('/notifications/mark-all-read');
  },

  async deleteNotification(id) {
    return api.delete(`/notifications/${id}`);
  },

  async clearReadNotifications() {
    return api.delete('/notifications/clear-read');
  },

  async getPreferences() {
    return api.get('/notifications/preferences');
  },

  async updatePreferences(data) {
    return api.put('/notifications/preferences', data);
  },

  async createTestNotification(data) {
    return api.post('/notifications/test', data);
  },

  // Schedules
  async getSchedules() {
    return api.get('/reminders/schedules');
  },

  async createSchedule(data) {
    return api.post('/reminders/schedules', data);
  },

  async updateSchedule(id, data) {
    return api.put(`/reminders/schedules/${id}`, data);
  },

  async deleteSchedule(id) {
    return api.delete(`/reminders/schedules/${id}`);
  },

  async toggleSchedule(id) {
    return api.patch(`/reminders/schedules/${id}/toggle`);
  },

  // Digest & Processing
  async getDailyDigest() {
    return api.get('/reminders/daily-digest');
  },

  async getUpcoming() {
    return api.get('/reminders/upcoming');
  },

  async processDueReminders() {
    return api.post('/reminders/process-due');
  },
};
