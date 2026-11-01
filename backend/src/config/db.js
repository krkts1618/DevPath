import './env.js';
import { PrismaClient } from '@prisma/client';
import { normalizePrismaUrl } from '../utils/db-url.util.js';

const globalForPrisma = globalThis;

const rawDbUrl = process.env.DATABASE_URL;
const normalizedDbUrl = normalizePrismaUrl(rawDbUrl);

const basePrisma =
  globalForPrisma.basePrisma ||
  new PrismaClient({
    datasources: normalizedDbUrl
      ? {
          db: {
            url: normalizedDbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// Always maintain singleton across all environments (production & development)
globalForPrisma.basePrisma = basePrisma;

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
 * Strips sensitive connection strings, tokens, and credentials from database errors.
 */
function sanitizeDbErrorMessage(message) {
  if (!message || typeof message !== 'string') return 'Database error';
  return message
    .replace(/(postgres(?:ql)?:\/\/[^:]+:)[^@]+(@)/g, '$1*****$2')
    .replace(/(password=)[^&;\s]+/gi, '$1*****')
    .replace(/aws-[0-9a-z-]+(?:\.pooler)?\.supabase\.com/gi, 'pooler.supabase.com')
    .replace(/db\.[0-9a-z-]+\.supabase\.co/gi, 'db.supabase.co');
}

/**
 * Perform a database health check by querying `SELECT 1 as healthy;`.
 * @returns {Promise<{ healthy: boolean, latencyMs: number, error?: string }>}
 */
export async function checkDatabaseHealth() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1 as healthy;`;
    const latencyMs = Date.now() - start;
    return {
      healthy: true,
      latencyMs,
    };
  } catch (error) {
    return {
      healthy: false,
      latencyMs: Date.now() - start,
      error: sanitizeDbErrorMessage(error.message),
    };
  }
}
