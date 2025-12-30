/**
 * Performance optimization middleware
 * Response compression, caching headers, query optimization
 */

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import type { CompressionOptions } from 'compression';

/**
 * Response compression middleware
 */
export function compressionMiddleware() {
  const options: CompressionOptions = {
    level: 6, // Balance between compression and CPU
    filter: (req: Request, res: Response) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false;
      }
      // Use compression for all text-based responses
      return compression.filter(req, res);
    },
  };
  return compression(options);
}

/**
 * Cache control middleware
 */
export function cacheControlMiddleware(
  maxAge: number = 3600, // 1 hour default
  publicCache: boolean = false
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET' && res.statusCode < 400) {
      const cacheControl = publicCache
        ? `public, max-age=${maxAge}`
        : `private, max-age=${maxAge}`;
      
      res.setHeader('Cache-Control', cacheControl);
      res.setHeader('ETag', `"${Date.now()}"`);
    }
    
    next();
  };
}

/**
 * Query optimization middleware
 * Adds pagination, sorting, filtering helpers
 */
export function queryOptimizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Add pagination helpers to request
  (req as any).pagination = {
    page: Math.max(1, parseInt(req.query.page as string) || 1),
    limit: Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20)),
    offset: 0,
  };
  
  (req as any).pagination.offset = ((req as any).pagination.page - 1) * (req as any).pagination.limit;
  
  // Add sorting
  (req as any).sort = req.query.sort || 'created_at';
  (req as any).order = req.query.order === 'asc' ? 'ASC' : 'DESC';
  
  next();
}
