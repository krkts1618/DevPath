import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller.js';

const router = Router();

router.get('/events', CalendarController.getEvents);
router.get('/rest-days', CalendarController.getRestDays);
router.post('/rest-days', CalendarController.setRestDay);
router.delete('/rest-days/:date', CalendarController.deleteRestDay);

export default router;
