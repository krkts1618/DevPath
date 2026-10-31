import api from './api';

export const revisionService = {
  getRevisions: (params = {}) => api.get('/revisions', { params }),
  getRevisionById: (id) => api.get(`/revisions/${id}`),
  createRevision: (data) => api.post('/revisions', data),
  updateRevision: (id, data) => api.put(`/revisions/${id}`, data),
  deleteRevision: (id) => api.delete(`/revisions/${id}`),
  completeSession: (id, data) => api.post(`/revisions/${id}/complete`, data),
  reschedule: (id, targetDate) => api.post(`/revisions/${id}/reschedule`, { targetDate }),
  pause: (id) => api.post(`/revisions/${id}/pause`),
  resume: (id) => api.post(`/revisions/${id}/resume`),
  getAnalytics: () => api.get('/revisions/analytics'),
};

export default revisionService;
