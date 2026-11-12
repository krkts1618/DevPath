import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { corsOptions, isAllowedOrigin } from './config/cors.js';
import { requestLogger } from './middlewares/request-logger.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import { appAccessSecretGuard } from './middlewares/auth-secret.middleware.js';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure Trust Proxy for Render & Reverse Proxies (Resolves ERR_ERL_UNEXPECTED_X_FORWARDED_FOR)
// Render passes traffic through 1 reverse proxy hop before hitting the container.
// Setting trust proxy to 1 ensures express-rate-limit and req.ip read the client IP correctly.
const trustProxyConfig = process.env.TRUST_PROXY
  ? isNaN(process.env.TRUST_PROXY)
    ? process.env.TRUST_PROXY
    : parseInt(process.env.TRUST_PROXY, 10)
  : 1;
app.set('trust proxy', trustProxyConfig);

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // API service only; frontend served via Vercel
  })
);

// Strict Production CORS Configuration
app.use(cors(corsOptions));
// Handle preflight OPTIONS requests across all routes
app.options('*', cors(corsOptions));

// Rate Limiting (Protects Render instance against DoS & excessive queries)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this client. Please try again after 15 minutes.',
  },
});
app.use('/api', apiLimiter);

// Body Parsing Middlewares with safe limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Request Timing & Server-Timing Logger
app.use(requestLogger);

// Graceful fallback rewrite if client requests without /api prefix (e.g. /categories, /dashboard/stats)
app.use((req, res, next) => {
  const apiPrefixes = [
    '/health',
    '/auth',
    '/categories',
    '/roadmaps',
    '/modules',
    '/days',
    '/tasks',
    '/dashboard',
    '/analytics',
    '/calendar',
    '/personal-tasks',
    '/notes',
    '/revisions',
    '/projects',
    '/study-sessions',
    '/notifications',
    '/reminders',
  ];
  if (apiPrefixes.some((p) => req.path === p || req.path.startsWith(`${p}/`))) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Prevent stale proxy caching for mutable API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-cache');
  next();
});

// Single-user Application Access Secret Protection for Mutation Requests
app.use('/api', appAccessSecretGuard);

// API Base Route
app.use('/api', apiRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'DevPath API',
    version: '1.0.0',
    description: 'Dynamic Software Engineering Roadmap & Task Management Engine',
    documentation: '/api/health',
  });
});

// Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
