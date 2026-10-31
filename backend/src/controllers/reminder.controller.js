import { ReminderService } from '../services/reminder.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const ReminderController = {
  /**
   * GET /api/reminders/schedules
   */
  async getSchedules(req, res) {
    try {
      const schedules = await ReminderService.getSchedules();
      return successResponse(res, schedules, 'Reminder schedules retrieved');
    } catch (err) {
      console.error('getSchedules error:', err);
      return errorResponse(res, err.message, 500);
    }
  },

  /**
   * POST /api/reminders/schedules
   */
  async createSchedule(req, res) {
    try {
      const schedule = await ReminderService.createSchedule(req.body);
      return successResponse(res, schedule, 'Reminder schedule created', 201);
    } catch (err) {
      console.error('createSchedule error:', err);
      return errorResponse(res, err.message, 400);
    }
  },

  /**
   * PUT /api/reminders/schedules/:id
   */
  async updateSchedule(req, res) {
    try {
      const schedule = await ReminderService.updateSchedule(req.params.id, req.body);
      return successResponse(res, schedule, 'Reminder schedule updated');
    } catch (err) {
      console.error('updateSchedule error:', err);
      const status = err.message === 'Reminder schedule not found' ? 404 : 400;
      return errorResponse(res, err.message, status);
    }
  },

  /**
   * DELETE /api/reminders/schedules/:id
   */
  async deleteSchedule(req, res) {
    try {
      const result = await ReminderService.deleteSchedule(req.params.id);
      return successResponse(res, result, 'Reminder schedule deleted');
    } catch (err) {
      console.error('deleteSchedule error:', err);
      const status = err.message === 'Reminder schedule not found' ? 404 : 500;
      return errorResponse(res, err.message, status);
    }
  },

  /**
   * PATCH /api/reminders/schedules/:id/toggle
   */
  async toggleSchedule(req, res) {
    try {
      const schedule = await ReminderService.toggleSchedule(req.params.id);
      return successResponse(res, schedule, 'Reminder schedule status toggled');
    } catch (err) {
      console.error('toggleSchedule error:', err);
      const status = err.message === 'Reminder schedule not found' ? 404 : 500;
      return errorResponse(res, err.message, status);
    }
  },

  /**
   * GET /api/reminders/daily-digest
   */
  async getDailyDigest(req, res) {
    try {
      const digest = await ReminderService.getDailyDigest();
      return successResponse(res, digest, 'Daily learning digest generated');
    } catch (err) {
      console.error('getDailyDigest error:', err);
      return errorResponse(res, err.message, 500);
    }
  },

  /**
   * GET /api/reminders/upcoming
   */
  async getUpcoming(req, res) {
    try {
      const upcoming = await ReminderService.getUpcomingReminders();
      return successResponse(res, upcoming, 'Upcoming reminders retrieved');
    } catch (err) {
      console.error('getUpcoming error:', err);
      return errorResponse(res, err.message, 500);
    }
  },

  /**
   * POST /api/reminders/process-due
   * Evaluates due reminder schedules & adaptive alerts
   */
  async processDue(req, res) {
    try {
      const result = await ReminderService.processDueReminders(true);
      return successResponse(res, result, 'Due reminders processed successfully');
    } catch (err) {
      console.error('processDue error:', err);
      return errorResponse(res, err.message, 500);
    }
  },
};
