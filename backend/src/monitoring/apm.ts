/**
 * AAAA-Grade Application Performance Monitoring (APM)
 * Integrates with Sentry, OpenTelemetry, and custom metrics
 */

import { logger } from '../utils/logger.js';
import { kpiTracker } from './kpiTracker.js';

export interface APMSpan {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags?: Record<string, string | number>;
  error?: Error;
}

class APMService {
  private spans: Map<string, APMSpan> = new Map();
  private traceId: string | null = null;

  /**
   * Start a performance span
   */
  startSpan(name: string, tags?: Record<string, string | number>): string {
    const spanId = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const span: APMSpan = {
      name,
      startTime: Date.now(),
      tags,
    };
    
    this.spans.set(spanId, span);
    return spanId;
  }

  /**
   * End a performance span
   */
  endSpan(spanId: string, error?: Error): void {
    const span = this.spans.get(spanId);
    if (!span) {
      logger.warn('Span not found', { spanId });
      return;
    }

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    if (error) {
      span.error = error;
    }

    // Track in KPI tracker
    if (span.duration) {
      kpiTracker.trackResponseTime(span.duration);
    }

    // Log slow spans (> 1 second)
    if (span.duration && span.duration > 1000) {
      logger.warn('Slow span detected', {
        name: span.name,
        duration: span.duration,
        tags: span.tags,
      });
    }

    // Send to Sentry if error
    if (error && typeof process !== 'undefined' && (process as any).Sentry) {
      try {
        (process as any).Sentry.captureException(error, {
          tags: span.tags,
          contexts: {
            span: {
              name: span.name,
              duration: span.duration,
            },
          },
        });
      } catch (e) {
        // Sentry not available
      }
    }

    this.spans.delete(spanId);
  }

  /**
   * Create a trace context
   */
  createTrace(): string {
    this.traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return this.traceId;
  }

  /**
   * Get current trace ID
   */
  getTraceId(): string | null {
    return this.traceId;
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(query: string, duration: number): void {
    logger.debug('Database query tracked', {
      query: query.substring(0, 100),
      duration,
    });

    // Track slow queries
    if (duration > 100) {
      logger.warn('Slow database query', {
        query: query.substring(0, 200),
        duration,
      });
    }
  }

  /**
   * Track external API call
   */
  trackExternalApi(service: string, duration: number, success: boolean): void {
    logger.debug('External API tracked', {
      service,
      duration,
      success,
    });

    if (!success) {
      kpiTracker.trackError();
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    activeSpans: number;
    slowSpans: APMSpan[];
    averageDuration: number;
  } {
    const spans = Array.from(this.spans.values());
    const completedSpans = spans.filter((s) => s.duration !== undefined) as APMSpan[];
    const slowSpans = completedSpans.filter((s) => s.duration && s.duration > 1000);
    
    const totalDuration = completedSpans.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageDuration = completedSpans.length > 0 ? totalDuration / completedSpans.length : 0;

    return {
      activeSpans: spans.length,
      slowSpans,
      averageDuration,
    };
  }
}

export const apmService = new APMService();
