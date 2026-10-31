import { NotificationService } from '../services/notification.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const NotificationController = {
  /**
   * GET /api/notifications
   */
  async getNotifications(req, res) {
    try {
      const data = await NotificationService.getNotifications(req.query);
      return successResponse(res, data, 'Notifications retrieved successfully');
    } catch (err) {
      console.error('getNotifications error:', err);
      return errorResponse(res, err.message, 500);
    }
  },

  /**
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res) {
    try {
      const data = await NotificationService.getUnreadCount();
      return successResponse(res, data, 'Unread notification count retrieved');
    } catch (err) {
      console.error('getUnreadCount error:', err);
      return errorResponse(res, err.message, 500);
    }
  },

  /**
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(req, res) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id);
      return successResponse(res, notification, 'Notification marked as read');
    } catch (err) {
      console.error('markAsRead error:', err);
      const status = err.message === 'Notification not found' ? 404 : 500;
      return errorResponse(res, err.message, status);
    }
  },

  /**
   * PATCH /api/notifications/mark-all-read
   */
  async markAllAsRead(req, res) {
    try {
      const result = await NotificationService.markAllAsRead();
      return successResponse(res, result, 'All notifications marked as read');
    } catch (err) {
      console.error('markAllAsRead error:', err);
      return errorResponse(res, err.message, 500);
    }
  },

  /**
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res) {
    try {
      const result = await NotificationService.deleteNotification(req.params.id);
      return successResponse(res, result, 'Notification deleted');
    } catch (err) {
      console.error('deleteNotification error:', err);
      const status = err.message === 'Notification not found' ? 404 : 500;
      return errorResponse(res, err.message, status);
    }
  },

  /**
   * DELETE /api/notifications/clear-read
   */
  async clearReadNotifications(req, res) {
    try {
      const result = await NotificationService.clearReadNotifications();
      return successResponse(res, result, 'Read notifications cleared');
    } catch (err) {
      console.error('clearReadNotifications error:', err);
      return errorResponse(res, err.message, 500);
    }
  },

  /**
   * GET /api/notifications/preferences
   */
  async getPreferences(req, res) {
    try {
      const preferences = await NotificationService.getPreferences();
      return successResponse(res, preferences, 'Notification preferences retrieved');
    } catch (err) {
      console.error('getPreferences error:', err);
      return errorResponse(res, err.message, 500);
    }
  },

  /**
   * PUT /api/notifications/preferences
   */
  async updatePreferences(req, res) {
    try {
      const updated = await NotificationService.updatePreferences(req.body);
      return successResponse(res, updated, 'Notification preferences updated');
    } catch (err) {
      console.error('updatePreferences error:', err);
      return errorResponse(res, err.message, 400);
    }
  },

  /**
   * POST /api/notifications/test
   * Create a manual test notification
   */
  async createNotification(req, res) {
    try {
      const result = await NotificationService.createNotification(req.body);
      return successResponse(res, result.notification, 'Notification created successfully', 201);
    } catch (err) {
      console.error('createNotification error:', err);
      return errorResponse(res, err.message, 400);
    }
  },
};
