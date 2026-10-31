import api from './api';

export const personalTaskService = {
  getTasks: async (date = null) => {
    return api.get('/personal-tasks', { params: date ? { date } : {} });
  },

  createTask: async (data) => {
    return api.post('/personal-tasks', data);
  },

  updateTask: async (id, data) => {
    return api.put(`/personal-tasks/${id}`, data);
  },

  toggleTask: async (id) => {
    return api.patch(`/personal-tasks/${id}/toggle`);
  },

  deleteTask: async (id) => {
    return api.delete(`/personal-tasks/${id}`);
  },
};
