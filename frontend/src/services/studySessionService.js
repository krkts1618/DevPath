import api from './api';

export const studySessionService = {
  getActiveSession: () => api.get('/study-sessions/active'),
  getAnalytics: (params = {}) => api.get('/study-sessions/analytics', { params }),
  getHistory: (params = {}) => api.get('/study-sessions/history', { params }),
  getTasksFocusDuration: (taskIds = []) =>
    api.post('/study-sessions/tasks-focus', { taskIds }),

  startSession: (data) => api.post('/study-sessions/start', data),
  pauseSession: (id) => api.post(`/study-sessions/${id}/pause`),
  resumeSession: (id) => api.post(`/study-sessions/${id}/resume`),
  completeSession: (id, data = {}) => api.post(`/study-sessions/${id}/complete`, data),
  interruptSession: (id, data = {}) => api.post(`/study-sessions/${id}/interrupt`, data),
  discardSession: (id) => api.post(`/study-sessions/${id}/discard`),
  resumeInterrupted: (id) => api.post(`/study-sessions/${id}/resume-interrupted`),

  updateNotes: (id, notes) => api.patch(`/study-sessions/${id}/notes`, { notes }),
  deleteSession: (id) => api.delete(`/study-sessions/${id}`),
};

export default studySessionService;
