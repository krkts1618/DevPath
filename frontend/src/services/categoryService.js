import api from './api';

export const categoryService = {
  async getCategories(params = {}) {
    return api.get('/categories', { params });
  },

  async getCategoryById(id) {
    return api.get(`/categories/${id}`);
  },

  async createCategory(data) {
    return api.post('/categories', data);
  },

  async updateCategory(id, data) {
    return api.patch(`/categories/${id}`, data);
  },

  async archiveCategory(id, targetCategoryId = null) {
    return api.post(`/categories/${id}/archive`, { targetCategoryId });
  },

  async restoreCategory(id) {
    return api.post(`/categories/${id}/restore`);
  },

  async reorderCategories(items) {
    return api.post('/categories/reorder', { items });
  },

  async deleteCategory(id, cascade = false, permanent = false) {
    const query = new URLSearchParams();
    if (cascade) query.set('cascade', 'true');
    if (permanent) {
      query.set('permanent', 'true');
      query.set('confirm', 'true');
    }
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return api.delete(`/categories/${id}${qStr}`);
  },
};
