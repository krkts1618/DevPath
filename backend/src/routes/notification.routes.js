import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';

const router = Router();

// Notification endpoints
router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.get('/preferences', NotificationController.getPreferences);
router.put('/preferences', NotificationController.updatePreferences);
router.post('/test', NotificationController.createNotification);
router.patch('/mark-all-read', NotificationController.markAllAsRead);
router.delete('/clear-read', NotificationController.clearReadNotifications);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
