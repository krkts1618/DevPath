import { LifecycleService } from '../services/lifecycle.service.js';
import { successResponse } from '../utils/response.util.js';

export const CalendarController = {
  async getEvents(req, res, next) {
    try {
      const { start, end } = req.query;
      const events = await LifecycleService.getCalendarEvents(start, end);
      return successResponse(res, events, 'Calendar events retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getRestDays(req, res, next) {
    try {
      const { start, end } = req.query;
      const restDays = await LifecycleService.getRestDays(start, end);
      return successResponse(res, restDays, 'Rest days retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async setRestDay(req, res, next) {
    try {
      const { date, title, reason } = req.body;
      const restDay = await LifecycleService.setRestDay(date, title, reason);
      return successResponse(res, restDay, 'Planned rest day saved successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async deleteRestDay(req, res, next) {
    try {
      const { date } = req.params;
      await LifecycleService.removeRestDay(date);
      return successResponse(res, null, 'Planned rest day removed successfully');
    } catch (err) {
      next(err);
    }
  },
};
