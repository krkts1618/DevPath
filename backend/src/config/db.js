import './env.js';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const basePrisma =
  globalForPrisma.basePrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.basePrisma = basePrisma;
}

export const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      try {
        return await query(args);
      } catch (error) {
        if (
          error.code === 'P1017' ||
          error.code === 'P2024' ||
          error.message?.includes('closed the connection') ||
          error.message?.includes('10054') ||
          error.message?.includes('connection pool')
        ) {
          console.warn(`[Prisma] Connection issue (${error.code || 'timeout'}) in ${model || 'raw'}.${operation}, retrying once...`);
          await new Promise((r) => setTimeout(r, 1000));
          return await query(args);
        }
        throw error;
      }
    },
  },
});

/**
 * Perform a database health check by querying Postgres timestamp & version.
 * @returns {Promise<{ healthy: boolean, latencyMs: number, database: string, timestamp: Date }>}
 */
export async function checkDatabaseHealth() {
  const start = Date.now();
  try {
    const result = await prisma.$queryRaw`SELECT current_database() as db, NOW() as now, version() as version;`;
    const latencyMs = Date.now() - start;
    return {
      healthy: true,
      latencyMs,
      database: result[0]?.db || 'postgres',
      timestamp: result[0]?.now || new Date(),
      version: result[0]?.version || 'PostgreSQL',
    };
  } catch (error) {
    return {
      healthy: false,
      latencyMs: Date.now() - start,
      error: error.message,
    };
  }
}
