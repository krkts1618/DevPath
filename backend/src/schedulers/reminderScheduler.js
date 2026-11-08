import { ReminderService } from '../services/reminder.service.js';
import { logMemory } from '../utils/memory-monitor.util.js';

// Global singleton tracker to prevent duplicate intervals across hot reloads / imports
const schedulerState = globalThis.__devpath_scheduler__ || {
  intervalId: null,
  timeoutId: null,
  isProcessing: false,
};
globalThis.__devpath_scheduler__ = schedulerState;

export function startReminderScheduler() {
  if (schedulerState.intervalId) {
    console.log('[ReminderScheduler] Scheduler is already active (singleton retained).');
    return;
  }

  console.log('[ReminderScheduler] Initializing background reminder scheduler (60s tick, Asia/Kolkata)...');

  const executeTick = async (isInitial = false) => {
    if (schedulerState.isProcessing) {
      console.warn('[ReminderScheduler] Previous execution still active. Skipping tick to prevent memory/connection overlap.');
      return;
    }

    schedulerState.isProcessing = true;
    const start = Date.now();
    try {
      if (isInitial) {
        console.log('[ReminderScheduler] Executing initial catch-up check...');
      }
      await ReminderService.processDueReminders(false);
      const duration = Date.now() - start;
      if (duration > 3000) {
        console.log(`[ReminderScheduler] Tick completed in ${duration}ms.`);
      }
    } catch (err) {
      console.error('[ReminderScheduler] Periodic evaluation tick error:', err.message);
    } finally {
      schedulerState.isProcessing = false;
    }
  };

  // Run initial evaluation after 5 seconds to allow DB initialization
  schedulerState.timeoutId = setTimeout(() => {
    executeTick(true);
    schedulerState.timeoutId = null;
  }, 5000);

  // Periodic evaluation every 60 seconds
  schedulerState.intervalId = setInterval(() => {
    executeTick(false);
  }, 60 * 1000);

  if (schedulerState.intervalId.unref) {
    schedulerState.intervalId.unref();
  }
}

export function stopReminderScheduler() {
  if (schedulerState.timeoutId) {
    clearTimeout(schedulerState.timeoutId);
    schedulerState.timeoutId = null;
  }
  if (schedulerState.intervalId) {
    clearInterval(schedulerState.intervalId);
    schedulerState.intervalId = null;
    schedulerState.isProcessing = false;
    console.log('[ReminderScheduler] Background reminder scheduler stopped.');
  }
}

export function getSchedulerStatus() {
  return {
    isRunning: !!schedulerState.intervalId,
    isProcessing: schedulerState.isProcessing,
  };
}
