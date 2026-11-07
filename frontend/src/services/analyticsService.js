import api from './api';

export const analyticsService = {
  getComprehensiveAnalytics: async (params = {}, options = {}) => {
    return api.get('/analytics/comprehensive', { ...options, params });
  },

  downloadCsv: async (type = 'tasks', params = {}) => {
    const query = new URLSearchParams(params).toString();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const url = `${baseUrl}/analytics/export/${type}${query ? `?${query}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to download CSV export');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `devpath-${type}-${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  },

  getOverallStreak: async () => {
    return api.get('/analytics/streak');
  },

  getRoadmapStreak: async (roadmapId) => {
    return api.get(`/analytics/roadmaps/${roadmapId}/streak`);
  },

  getDailySummary: async (date = null) => {
    return api.get('/analytics/summary', { params: date ? { date } : {} });
  },

  getActivityHeatmap: async (months = 12) => {
    return api.get('/analytics/heatmap', { params: { months } });
  },

  getLearningHistory: async (filters = {}, pagination = {}) => {
    return api.get('/analytics/history', {
      params: { ...filters, ...pagination },
    });
  },

  getStreakTarget: async () => {
    return api.get('/analytics/streak-target');
  },

  updateStreakTarget: async (target, effectiveFrom = null) => {
    return api.post('/analytics/streak-target', { target, effectiveFrom });
  },

  getWeeklyReport: async (weekStartDate = null) => {
    return api.get('/analytics/weekly-report', {
      params: weekStartDate ? { weekStartDate } : {},
    });
  },
};
