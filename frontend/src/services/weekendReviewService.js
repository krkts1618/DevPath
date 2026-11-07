import api from './api';

export const weekendReviewService = {
  getRecollection: async (weekStartDate = null) => {
    return api.get('/weekend-reviews/recollection', {
      params: weekStartDate ? { weekStartDate } : {},
    });
  },

  getAssessment: async (weekStartDate = null) => {
    return api.get('/weekend-reviews/assessment', {
      params: weekStartDate ? { weekStartDate } : {},
    });
  },

  saveReview: async (reviewData) => {
    return api.post('/weekend-reviews', reviewData);
  },

  getWeakTopics: async () => {
    return api.get('/weekend-reviews/weak-topics');
  },
};
