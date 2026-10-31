#!/usr/bin/env node
/**
 * Standalone Reminder Processing Script for DevPath
 * 
 * Can be executed via:
 * 1. Render Cron Job (e.g. every 15 or 30 minutes)
 * 2. GitHub Actions scheduled workflow
 * 3. System crontab / Task Scheduler
 * 4. Manual CLI: node src/scripts/process-reminders.js [--force]
 */

import { prisma } from '../config/db.js';
import { ReminderService } from '../services/reminder.service.js';

const isForce = process.argv.includes('--force');

async function main() {
  console.log(`[${new Date().toISOString()}] 🔔 Starting DevPath Reminder Processing...`);
  if (isForce) {
    console.log(`⚡ Force mode enabled: executing all active reminders regardless of time window.`);
  }

  try {
    const result = await ReminderService.processDueReminders(isForce);
    console.log(`✅ Reminder processing complete.`);
    console.log(`   - Schedules Processed: ${result.schedulesProcessed}`);
    console.log(`   - Notifications Created: ${result.notificationsCreated}`);
    console.log(`   - Quiet Hours Active: ${result.isQuiet}`);
    console.log(`   - Execution Mode: ${result.manual ? 'Manual/Force' : 'Scheduled'}`);
  } catch (error) {
    console.error(`❌ Error during reminder processing:`, error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log(`[${new Date().toISOString()}] 🏁 Script completed.`);
    process.exit(process.exitCode || 0);
  }
}

main();
