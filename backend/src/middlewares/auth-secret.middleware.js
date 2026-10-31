/**
 * Application Access Secret Middleware (Single-User Production Protection)
 *
 * Protects write/mutation operations (POST, PUT, PATCH, DELETE) against unauthorized
 * public internet requests when deployed on cloud hosting (Render), without requiring
 * user login / registration.
 *
 * If APP_ACCESS_SECRET is configured in backend environment:
 * - Read requests (GET, HEAD, OPTIONS) are permitted.
 * - Health checks (/api/health) are always permitted.
 * - Mutation requests must supply header `x-app-access-secret` or bearer token matching APP_ACCESS_SECRET.
 *
 * If APP_ACCESS_SECRET is NOT configured (local development):
 * - All requests are permitted.
 */
import { errorResponse } from '../utils/response.util.js';

export function appAccessSecretGuard(req, res, next) {
  const secret = process.env.APP_ACCESS_SECRET;

  // In local development or if no secret is configured, allow all
  if (!secret) {
    return next();
  }

  // Always permit read operations and health checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.path === '/health') {
    return next();
  }

  // Extract client-provided secret from header, Authorization Bearer, or query
  const clientSecret =
    req.headers['x-app-access-secret'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null) ||
    req.query.accessSecret;

  if (!clientSecret || clientSecret !== secret) {
    return errorResponse(
      res,
      'Unauthorized: Valid application access secret is required for write operations.',
      401
    );
  }

  next();
}
