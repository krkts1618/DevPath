import { ReminderService } from '../services/reminder.service.js';

let intervalId = null;

export function startReminderScheduler() {
  if (intervalId) return;

  console.log('[ReminderScheduler] Initializing background reminder scheduler (60s tick, Asia/Kolkata)...');

  // Run initial evaluation after 5 seconds to allow DB initialization
  setTimeout(async () => {
    try {
      console.log('[ReminderScheduler] Executing initial catch-up check...');
      await ReminderService.processDueReminders(false);
    } catch (err) {
      console.error('[ReminderScheduler] Initial check error:', err.message);
    }
  }, 5000);

  // Periodic evaluation every 60 seconds
  intervalId = setInterval(async () => {
    try {
      await ReminderService.processDueReminders(false);
    } catch (err) {
      console.error('[ReminderScheduler] Periodic evaluation tick error:', err.message);
    }
  }, 60 * 1000);
}

export function stopReminderScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[ReminderScheduler] Background reminder scheduler stopped.');
  }
}
