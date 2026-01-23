/**
 * Request Timeout Middleware
 *
 * Enforces a timeout on all requests to prevent hanging connections
 * and resource exhaustion.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface TimeoutOptions {
  /**
   * Timeout in milliseconds (default: 30000 = 30 seconds)
   */
  timeoutMs?: number;

  /**
   * Custom error message
   */
  message?: string;
}

const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Creates a timeout middleware
 */
export function timeoutMiddleware(options: TimeoutOptions = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const message = options.message ?? `Request timeout after ${timeoutMs}ms`;

  return (req: Request, res: Response, next: NextFunction) => {
    // Don't set timeout on SSE/WebSocket connections
    if (req.headers.accept === 'text/event-stream' || req.headers.upgrade === 'websocket') {
      return next();
    }

    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        const requestId = Array.isArray(req.headers['x-request-id'])
          ? req.headers['x-request-id'][0]
          : req.headers['x-request-id'];

        logger.warn('Request timeout', {
          url: req.url,
          method: req.method,
          timeoutMs,
          requestId,
        });

        res.status(408).json({
          status: 'error',
          code: 'REQUEST_TIMEOUT',
          message,
          requestId,
        });
      }
    }, timeoutMs);

    // Clear timeout when response finishes
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    // Clear timeout on error
    res.on('error', () => {
      clearTimeout(timeout);
    });

    next();
  };
}
