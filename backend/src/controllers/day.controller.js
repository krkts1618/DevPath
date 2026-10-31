import { DayService } from '../services/day.service.js';
import { successResponse } from '../utils/response.util.js';

export const DayController = {
  async getByRoadmapId(req, res, next) {
    try {
      const days = await DayService.getDaysByRoadmapId(req.params.id);
      return successResponse(res, days, 'Roadmap days retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const day = await DayService.getDayById(req.params.id);
      return successResponse(res, day, 'Roadmap day retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const day = await DayService.createDay(req.params.id, req.body);
      return successResponse(res, day, 'Roadmap day created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const day = await DayService.updateDay(req.params.id, req.body);
      return successResponse(res, day, 'Roadmap day updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await DayService.deleteDay(req.params.id);
      return successResponse(res, null, 'Roadmap day deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async reorder(req, res, next) {
    try {
      const { items } = req.body;
      const result = await DayService.reorderDays(items);
      return successResponse(res, result, 'Roadmap days reordered successfully');
    } catch (error) {
      next(error);
    }
  },
};
