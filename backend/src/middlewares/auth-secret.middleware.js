/**
 * Application Access Secret Middleware (Single-User Production Protection)
 *
 * Protects write/mutation operations (POST, PUT, PATCH, DELETE) against unauthorized
 * public internet requests when deployed on cloud hosting (Render), without requiring
 * user login / registration.
 *
 * If APP_ACCESS_SECRET is configured in backend environment:
 * - Read requests (GET, HEAD, OPTIONS) are permitted.
 * - Health checks (/api/health) and auth verification (/api/auth/verify) are always permitted.
 * - Mutation requests must supply header `x-app-access-secret` or bearer token matching APP_ACCESS_SECRET.
 *
 * If APP_ACCESS_SECRET is NOT configured (local development):
 * - All requests are permitted.
 */
import crypto from 'crypto';
import { errorResponse } from '../utils/response.util.js';

/**
 * Constant-time comparison between client-supplied token and server secret.
 * Automatically trims whitespace and removes accidental wrapping quotes.
 */
export function verifySecretMatch(clientSecret, serverSecret) {
  if (!clientSecret || !serverSecret) return false;

  const cleanClient = String(clientSecret).trim().replace(/^["']|["']$/g, '');
  const cleanServer = String(serverSecret).trim().replace(/^["']|["']$/g, '');

  if (!cleanClient || !cleanServer) return false;

  const bufClient = Buffer.from(cleanClient, 'utf8');
  const bufServer = Buffer.from(cleanServer, 'utf8');

  if (bufClient.length !== bufServer.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(bufClient, bufServer);
  } catch {
    return false;
  }
}

export function appAccessSecretGuard(req, res, next) {
  const secret = process.env.APP_ACCESS_SECRET;

  // In local development or if no secret is configured, allow all
  if (!secret) {
    return next();
  }

  // Always permit read operations and safe inspection routes
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Allow health checks and auth status/verification to bypass write guard
  const reqPath = req.path || '';
  if (
    reqPath === '/health' ||
    reqPath === '/api/health' ||
    reqPath === '/auth/verify' ||
    reqPath === '/api/auth/verify' ||
    reqPath === '/auth/status' ||
    reqPath === '/api/auth/status'
  ) {
    return next();
  }

  // Extract client-provided secret from header, Authorization Bearer, or query parameter
  const clientSecret =
    req.headers['x-app-access-secret'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null) ||
    req.query.accessSecret ||
    req.query.access_secret;

  if (!verifySecretMatch(clientSecret, secret)) {
    return errorResponse(
      res,
      'Unauthorized: Valid application access secret is required for write operations.',
      401,
      { code: 'ACCESS_SECRET_REQUIRED' }
    );
  }

  next();
}
