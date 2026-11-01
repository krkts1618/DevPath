import { Router } from 'express';
import { successResponse, errorResponse } from '../utils/response.util.js';
import { verifySecretMatch } from '../middlewares/auth-secret.middleware.js';

const router = Router();

/**
 * GET /api/auth/status
 * Check if the backend requires an access secret and whether the request includes a valid one.
 */
router.get('/status', (req, res) => {
  const secret = process.env.APP_ACCESS_SECRET;
  if (!secret) {
    return successResponse(
      res,
      { required: false, authorized: true },
      'Open single-user development mode'
    );
  }

  const clientSecret =
    req.headers['x-app-access-secret'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null) ||
    req.query.accessSecret ||
    req.query.access_secret;

  const isAuthorized = verifySecretMatch(clientSecret, secret);
  return successResponse(
    res,
    { required: true, authorized: isAuthorized },
    isAuthorized ? 'Authenticated' : 'Access secret required'
  );
});

/**
 * POST /api/auth/verify
 * Allows the frontend (Settings or Unlock Modal) to test and verify a secret candidate.
 */
router.post('/verify', (req, res) => {
  const secret = process.env.APP_ACCESS_SECRET;
  if (!secret) {
    return successResponse(
      res,
      { valid: true, required: false },
      'No application access secret is configured in this environment'
    );
  }

  const candidate =
    req.body?.secret ||
    req.headers['x-app-access-secret'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!candidate || !verifySecretMatch(candidate, secret)) {
    return errorResponse(
      res,
      'Invalid application access secret',
      401,
      { code: 'INVALID_ACCESS_SECRET' }
    );
  }

  return successResponse(
    res,
    { valid: true, required: true },
    'Application access secret successfully verified'
  );
});

export default router;
