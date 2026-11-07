import { WeekendReviewService } from '../services/weekendReview.service.js';
import { successResponse } from '../utils/response.util.js';

export const WeekendReviewController = {
  async getRecollection(req, res, next) {
    try {
      const { weekStartDate } = req.query;
      const data = await WeekendReviewService.getRecollectionData(weekStartDate);
      return successResponse(res, data, 'Saturday Recollection data retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getAssessment(req, res, next) {
    try {
      const { weekStartDate } = req.query;
      const data = await WeekendReviewService.getAssessmentData(weekStartDate);
      return successResponse(res, data, 'Sunday Assessment data retrieved');
    } catch (err) {
      next(err);
    }
  },

  async saveReview(req, res, next) {
    try {
      const result = await WeekendReviewService.saveReview(req.body);
      return successResponse(res, result, 'Weekend review saved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getWeakTopics(req, res, next) {
    try {
      const topics = await WeekendReviewService.getWeakTopics();
      return successResponse(res, topics, 'Weak topics retrieved successfully');
    } catch (err) {
      next(err);
    }
  },
};
