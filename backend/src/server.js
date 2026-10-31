import app from './app.js';
import { config } from './config/env.js';
import { prisma, checkDatabaseHealth } from './config/db.js';
import { startReminderScheduler, stopReminderScheduler } from './schedulers/reminderScheduler.js';

const server = app.listen(config.port, async () => {
  console.log(`🚀 DevPath Backend running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  
  // Verify DB on boot
  const dbHealth = await checkDatabaseHealth();
  if (dbHealth.healthy) {
    console.log(`✅ Supabase PostgreSQL connected (${dbHealth.latencyMs}ms latency) [${dbHealth.database}]`);
    // Start background reminder scheduler
    startReminderScheduler();
  } else {
    console.error(`❌ Database connection failed:`, dbHealth.error);
  }
});

// Graceful Shutdown
async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  stopReminderScheduler();
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Process exited.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
