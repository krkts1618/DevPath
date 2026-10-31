import { StreakService } from '../services/streak.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import { getKolkataDateString } from '../utils/date.util.js';

export const AnalyticsController = {
  async getComprehensiveAnalytics(req, res, next) {
    try {
      const { timeframe = '30d', startDate, endDate } = req.query;
      const data = await AnalyticsService.getComprehensiveAnalytics({
        timeframe,
        startDate,
        endDate,
      });
      return successResponse(res, data, 'Comprehensive analytics retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async exportCsv(req, res, next) {
    try {
      const { type = 'tasks' } = req.params;
      const { timeframe = '30d', startDate, endDate } = req.query;
      const csv = await AnalyticsService.exportCsv(type, {
        timeframe,
        startDate,
        endDate,
      });
      const today = getKolkataDateString();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="devpath-${type}-${today}.csv"`
      );
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  },

  async getOverallStreak(req, res, next) {
    try {
      const streak = await StreakService.calculateOverallStreak();
      return successResponse(res, streak, 'Overall streak retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getRoadmapStreak(req, res, next) {
    try {
      const { id } = req.params;
      const streak = await StreakService.calculateRoadmapStreak(id);
      return successResponse(res, streak, 'Roadmap streak retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getDailySummary(req, res, next) {
    try {
      const { date } = req.query;
      const summary = await StreakService.getDailyProgressSummary(date);
      return successResponse(res, summary, 'Daily progress summary retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getActivityHeatmap(req, res, next) {
    try {
      const months = req.query.months ? parseInt(req.query.months, 10) : 12;
      const heatmap = await StreakService.getActivityHeatmap(months);
      return successResponse(res, heatmap, 'Activity heatmap retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getLearningHistory(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        roadmapId,
        categoryId,
        taskType,
        search,
        startDate,
        endDate,
      } = req.query;

      const history = await StreakService.getLearningHistory(
        { status, roadmapId, categoryId, taskType, search, startDate, endDate },
        { page, limit }
      );
      return successResponse(res, history, 'Learning history retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getStreakTarget(req, res, next) {
    try {
      const config = await StreakService.getStreakTargetConfig();
      return successResponse(res, config, 'Streak target configuration retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateStreakTarget(req, res, next) {
    try {
      const { target, effectiveFrom } = req.body;
      const config = await StreakService.setStreakTargetConfig(target, effectiveFrom);
      return successResponse(res, config, 'Streak target updated successfully', 201);
    } catch (err) {
      next(err);
    }
  },
};
