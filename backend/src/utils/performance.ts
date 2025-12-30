/**
 * AAAA-Grade Performance Utilities
 * Response streaming, query optimization helpers, caching strategies
 */

import { Response } from 'express';
import { apmService } from '../monitoring/apm.js';

/**
 * Stream response for long-running operations
 */
export async function streamResponse(
  res: Response,
  generator: AsyncGenerator<string, void, unknown>,
  contentType: string = 'text/event-stream'
): Promise<void> {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const spanId = apmService.startSpan('stream_response');

  try {
    for await (const chunk of generator) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
    apmService.endSpan(spanId);
  } catch (error) {
    apmService.endSpan(spanId, error as Error);
    res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
    res.end();
  }
}

/**
 * Optimize database query with pagination
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export function getPaginationParams(options: PaginationOptions): {
  offset: number;
  limit: number;
} {
  const page = Math.max(1, options.page || 1);
  const maxLimit = options.maxLimit || 100;
  const limit = Math.min(maxLimit, Math.max(1, options.limit || 20));
  const offset = (page - 1) * limit;

  return { offset, limit };
}

/**
 * Cache key generator with TTL strategy
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, string | number>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}

/**
 * Performance-aware batch processing
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayMs: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    // Delay between batches to avoid overwhelming systems
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Debounce function calls for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, waitMs);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limitMs) {
      lastCall = now;
      func(...args);
    }
  };
}
