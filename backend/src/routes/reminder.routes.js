import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller.js';

const router = Router();

// Reminder schedule & processing endpoints
router.get('/schedules', ReminderController.getSchedules);
router.post('/schedules', ReminderController.createSchedule);
router.put('/schedules/:id', ReminderController.updateSchedule);
router.delete('/schedules/:id', ReminderController.deleteSchedule);
router.patch('/schedules/:id/toggle', ReminderController.toggleSchedule);

router.get('/daily-digest', ReminderController.getDailyDigest);
router.get('/upcoming', ReminderController.getUpcoming);
router.post('/process-due', ReminderController.processDue);

export default router;
