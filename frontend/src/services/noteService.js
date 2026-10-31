import api from './api';

export const noteService = {
  getNotes: (params = {}) => api.get('/notes', { params }),
  getNoteById: (id) => api.get(`/notes/${id}`),
  createNote: (data) => api.post('/notes', data),
  updateNote: (id, data) => api.put(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  duplicateNote: (id) => api.post(`/notes/${id}/duplicate`),
  togglePin: (id) => api.patch(`/notes/${id}/pin`),
  toggleFavorite: (id) => api.patch(`/notes/${id}/favorite`),
  toggleArchive: (id) => api.patch(`/notes/${id}/archive`),
  getTags: () => api.get('/notes/tags'),
  createTag: (data) => api.post('/notes/tags', data),
  deleteTag: (id) => api.delete(`/notes/tags/${id}`),
  uploadAttachment: (noteId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/notes/${noteId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteAttachment: (noteId, attachmentId) =>
    api.delete(`/notes/${noteId}/attachments/${attachmentId}`),
};

export default noteService;
