import { errorResponse } from '../utils/response.util.js';
import { isAllowedOrigin } from '../config/cors.js';

export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function attachCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,x-app-access-secret,Cache-Control,Pragma,X-Requested-With'
    );
  }
}

export function notFoundHandler(req, res, next) {
  attachCorsHeaders(req, res);
  next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err, req, res, next) {
  attachCorsHeaders(req, res);

  // Never expose internal database errors or secrets
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Multer upload errors safely
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds maximum allowed limit (15MB).';
    }
    return errorResponse(res, message, statusCode);
  }

  // Handle custom upload filter errors
  if (err.message && (err.message.includes('Invalid file type') || err.message.includes('Supported types'))) {
    return errorResponse(res, err.message, 400);
  }

  // Handle Prisma Known Errors safely
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return errorResponse(res, `A record with this ${target} already exists.`, 409);
  }

  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found in database.', 404);
  }

  if (err.code === 'P2003') {
    return errorResponse(res, 'Foreign key constraint failed. Related record does not exist or cannot be removed.', 400);
  }

  if (!err.isOperational && statusCode === 500) {
    console.error('Unhandled Server Error:', err);
    message = 'An unexpected server error occurred.';
  }

  return errorResponse(res, message, statusCode, err.details || null);
}
