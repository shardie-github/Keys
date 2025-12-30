/**
 * Response time tracking middleware
 * Tracks and logs response times for performance monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { kpiTracker } from '../monitoring/kpiTracker.js';
import { apmService } from '../monitoring/apm.js';

export function responseTimeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const spanId = apmService.startSpan(`http.${req.method}.${req.path}`, {
    method: req.method,
    path: req.path,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Track in KPI system
    kpiTracker.trackResponseTime(duration);
    
    // End APM span
    apmService.endSpan(spanId, res.statusCode >= 400 ? new Error(`HTTP ${res.statusCode}`) : undefined);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
}
