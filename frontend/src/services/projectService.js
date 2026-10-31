import api from './api';

export const projectService = {
  getProjects: (params = {}) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),

  // Milestones
  addMilestone: (projectId, data) => api.post(`/projects/${projectId}/milestones`, data),
  updateMilestone: (milestoneId, data) => api.put(`/projects/milestones/${milestoneId}`, data),
  toggleMilestone: (milestoneId) => api.patch(`/projects/milestones/${milestoneId}/toggle`),
  deleteMilestone: (milestoneId) => api.delete(`/projects/milestones/${milestoneId}`),

  // Tasks
  addTask: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  updateTask: (taskId, data) => api.put(`/projects/tasks/${taskId}`, data),
  toggleTask: (taskId) => api.patch(`/projects/tasks/${taskId}/toggle`),
  deleteTask: (taskId) => api.delete(`/projects/tasks/${taskId}`),

  // Resources
  addResource: (projectId, data) => api.post(`/projects/${projectId}/resources`, data),
  deleteResource: (resourceId) => api.delete(`/projects/resources/${resourceId}`),
};

export default projectService;
