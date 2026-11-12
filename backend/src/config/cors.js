import { config } from './env.js';

/**
 * Strict Production CORS Configuration for DevPath
 * Supports:
 * - Production Vercel domain: https://dev-path-xi.vercel.app
 * - Any Vercel deployment preview: *.vercel.app
 * - Localhost dev environments
 * - Dynamic FRONTEND_URL or ADDITIONAL_CORS_ORIGINS environment variables
 */

export function isAllowedOrigin(origin) {
  if (!origin) return true; // non-browser clients (curl, server-to-server)
  const cleanOrigin = String(origin).trim().replace(/\/$/, '').toLowerCase();

  const knownOrigins = [
    'https://dev-path-xi.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    config.frontendUrl ? config.frontendUrl.trim().replace(/\/$/, '').toLowerCase() : null,
  ].filter(Boolean);

  if (process.env.ADDITIONAL_CORS_ORIGINS) {
    process.env.ADDITIONAL_CORS_ORIGINS.split(',').forEach((s) => {
      if (s.trim()) knownOrigins.push(s.trim().replace(/\/$/, '').toLowerCase());
    });
  }

  return (
    knownOrigins.includes(cleanOrigin) ||
    cleanOrigin.endsWith('.vercel.app') ||
    config.nodeEnv !== 'production'
  );
}

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    // Return callback(null, false) rather than throwing an Error so CORS rejection
    // adheres to standard browser preflight protocol without triggering 500 handler
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-app-access-secret',
    'Cache-Control',
    'Pragma',
    'X-Requested-With',
  ],
  exposedHeaders: ['Server-Timing', 'Content-Range', 'X-Total-Count'],
  maxAge: 86400, // 24 hours preflight cache
  optionsSuccessStatus: 200, // For legacy browser compatibility
};
