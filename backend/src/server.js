import app from './app.js';
import { config } from './config/env.js';
import { prisma, checkDatabaseHealth } from './config/db.js';
import { startReminderScheduler, stopReminderScheduler } from './schedulers/reminderScheduler.js';
import { logMemory, startPeriodicMemoryLogging, stopPeriodicMemoryLogging } from './utils/memory-monitor.util.js';

logMemory('startup');

const server = app.listen(config.port, async () => {
  console.log(`🚀 DevPath Backend running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  logMemory('server_listen');
  
  // Verify DB on boot
  const dbHealth = await checkDatabaseHealth();
  if (dbHealth.healthy) {
    console.log(`✅ Supabase PostgreSQL connected (${dbHealth.latencyMs}ms latency) [${dbHealth.database}]`);
    logMemory('db_connected');
    
    // Start background reminder scheduler
    startReminderScheduler();
    logMemory('scheduler_started');

    // Start periodic memory monitoring (every 5 mins in production, 1 min in dev)
    const monitorInterval = config.nodeEnv === 'production' ? 5 * 60 * 1000 : 60 * 1000;
    startPeriodicMemoryLogging(monitorInterval);
  } else {
    console.error(`❌ Database connection failed:`, dbHealth.error);
  }
});

// Graceful Shutdown
async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  stopPeriodicMemoryLogging();
  stopReminderScheduler();
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Process exited.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
