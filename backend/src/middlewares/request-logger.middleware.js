/**
 * High-precision Development Request Timing & Server-Timing Middleware
 */
export function requestLogger(req, res, next) {
  const start = performance.now();

  // Attach timing container for route handlers to record internal sub-timings (e.g. DB query time)
  req.timings = {
    start,
    dbDuration: 0,
    addDbTime(ms) {
      this.dbDuration += ms;
    },
  };

  const originalEnd = res.end;
  res.end = function (...args) {
    const totalDuration = performance.now() - start;
    const dbDuration = req.timings?.dbDuration || 0;

    // Set Server-Timing header before flushing
    if (!res.headersSent) {
      try {
        res.setHeader(
          'Server-Timing',
          `total;dur=${totalDuration.toFixed(1)}, db;dur=${dbDuration.toFixed(1)}`
        );
      } catch {
        // Headers already sent
      }
    }

    if (process.env.NODE_ENV !== 'test') {
      const dbInfo = dbDuration > 0 ? ` (DB: ${dbDuration.toFixed(1)}ms)` : '';
      console.log(
        `[PERF] ${req.method.padEnd(6)} ${req.originalUrl.padEnd(35)} ${res.statusCode} - ${totalDuration.toFixed(1)}ms${dbInfo}`
      );
    }

    return originalEnd.apply(this, args);
  };

  next();
}
