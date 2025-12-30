/**
 * APM Middleware for automatic request tracing
 */

import { Request, Response, NextFunction } from 'express';
import { apmService } from '../monitoring/apm.js';
import { kpiTracker } from '../monitoring/kpiTracker.js';

export function apmMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Create trace for request
  const traceId = apmService.createTrace();
  req.headers['x-trace-id'] = traceId;

  // Start span for request
  const spanId = apmService.startSpan(`http.${req.method.toLowerCase()}.${req.path}`, {
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent'] || 'unknown',
    ip: req.ip,
  });

  const startTime = Date.now();

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // End span
    apmService.endSpan(spanId, res.statusCode >= 400 ? new Error(`HTTP ${res.statusCode}`) : undefined);

    // Track error if applicable
    if (res.statusCode >= 400) {
      kpiTracker.trackError();
    }

    // Track response time
    kpiTracker.trackResponseTime(duration);
  });

  // Track errors
  res.on('error', (error: Error) => {
    apmService.endSpan(spanId, error);
    kpiTracker.trackError();
  });

  next();
}
