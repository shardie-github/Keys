/**
 * AAAA-Grade KPI Tracking System
 * Tracks all key performance indicators across technical and business metrics
 */

import { logger } from '../utils/logger.js';

export interface KPIMetrics {
  // Technical KPIs
  technical: {
    uptime: number; // Percentage (99.9+ target)
    apiResponseTimeP50: number; // milliseconds (< 200ms target)
    apiResponseTimeP95: number; // milliseconds (< 200ms target)
    apiResponseTimeP99: number; // milliseconds
    errorRate: number; // Percentage (< 0.1% target)
    requestRate: number; // Requests per second
    testCoverage: number; // Percentage (80%+ backend, 70%+ frontend)
    buildSuccessRate: number; // Percentage
    deploymentFrequency: number; // Deployments per day
    meanTimeToRecovery: number; // Minutes (< 15min target)
  };
  
  // Business KPIs
  business: {
    userActivationRate: number; // Percentage (60%+ target)
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    featureAdoptionRate: Record<string, number>; // Feature name -> adoption %
    userSatisfactionNPS: number; // Net Promoter Score (50+ target)
    churnRate: number; // Percentage
    revenuePerUser: number; // If applicable
    costPerUser: number; // LLM API costs
  };
  
  // Reliability KPIs
  reliability: {
    circuitBreakerTrips: number;
    retrySuccessRate: number; // Percentage
    cacheHitRate: number; // Percentage
    databaseQueryTimeP95: number; // milliseconds
    externalApiLatencyP95: number; // milliseconds
    deadLetterQueueSize: number;
  };
  
  // Security KPIs
  security: {
    securityIncidents: number;
    dependencyVulnerabilities: number;
    failedAuthAttempts: number;
    rateLimitHits: number;
    securityScanPassRate: number; // Percentage
  };
}

class KPITracker {
  private metrics: Partial<KPIMetrics> = {
    technical: {
      uptime: 100,
      apiResponseTimeP50: 0,
      apiResponseTimeP95: 0,
      apiResponseTimeP99: 0,
      errorRate: 0,
      requestRate: 0,
      testCoverage: 0,
      buildSuccessRate: 100,
      deploymentFrequency: 0,
      meanTimeToRecovery: 0,
    },
    business: {
      userActivationRate: 0,
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      featureAdoptionRate: {},
      userSatisfactionNPS: 0,
      churnRate: 0,
      revenuePerUser: 0,
      costPerUser: 0,
    },
    reliability: {
      circuitBreakerTrips: 0,
      retrySuccessRate: 100,
      cacheHitRate: 0,
      databaseQueryTimeP95: 0,
      externalApiLatencyP95: 0,
      deadLetterQueueSize: 0,
    },
    security: {
      securityIncidents: 0,
      dependencyVulnerabilities: 0,
      failedAuthAttempts: 0,
      rateLimitHits: 0,
      securityScanPassRate: 100,
    },
  };

  private responseTimeHistory: number[] = [];
  private errorCount = 0;
  private requestCount = 0;
  private startTime = Date.now();

  /**
   * Track API response time
   */
  trackResponseTime(latencyMs: number): void {
    this.responseTimeHistory.push(latencyMs);
    this.requestCount++;
    
    // Keep only last 1000 measurements for performance
    if (this.responseTimeHistory.length > 1000) {
      this.responseTimeHistory.shift();
    }
    
    this.updatePercentiles();
  }

  /**
   * Track error occurrence
   */
  trackError(): void {
    this.errorCount++;
    this.updateErrorRate();
  }

  /**
   * Update percentile calculations
   */
  private updatePercentiles(): void {
    if (this.responseTimeHistory.length === 0) return;
    
    const sorted = [...this.responseTimeHistory].sort((a, b) => a - b);
    const p50Index = Math.floor(sorted.length * 0.5);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);
    
    if (this.metrics.technical) {
      this.metrics.technical.apiResponseTimeP50 = sorted[p50Index] || 0;
      this.metrics.technical.apiResponseTimeP95 = sorted[p95Index] || 0;
      this.metrics.technical.apiResponseTimeP99 = sorted[p99Index] || 0;
      this.metrics.technical.requestRate = this.requestCount / ((Date.now() - this.startTime) / 1000);
    }
  }

  /**
   * Update error rate
   */
  private updateErrorRate(): void {
    if (this.metrics.technical && this.requestCount > 0) {
      this.metrics.technical.errorRate = (this.errorCount / this.requestCount) * 100;
    }
  }

  /**
   * Track circuit breaker trip
   */
  trackCircuitBreakerTrip(): void {
    if (this.metrics.reliability) {
      this.metrics.reliability.circuitBreakerTrips++;
    }
    logger.warn('Circuit breaker tripped', {
      totalTrips: this.metrics.reliability?.circuitBreakerTrips,
    });
  }

  /**
   * Track retry success
   */
  trackRetry(success: boolean): void {
    // This would be tracked over time
    // For now, we'll log it
    logger.debug('Retry tracked', { success });
  }

  /**
   * Track cache hit
   */
  trackCacheHit(hit: boolean): void {
    // Track cache hit rate over time
    logger.debug('Cache access tracked', { hit });
  }

  /**
   * Track security event
   */
  trackSecurityEvent(type: 'failed_auth' | 'rate_limit' | 'vulnerability' | 'incident'): void {
    if (!this.metrics.security) return;
    
    switch (type) {
      case 'failed_auth':
        this.metrics.security.failedAuthAttempts++;
        break;
      case 'rate_limit':
        this.metrics.security.rateLimitHits++;
        break;
      case 'vulnerability':
        this.metrics.security.dependencyVulnerabilities++;
        break;
      case 'incident':
        this.metrics.security.securityIncidents++;
        break;
    }
  }

  /**
   * Get current KPI metrics
   */
  getMetrics(): Partial<KPIMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get KPI health status
   */
  getHealthStatus(): {
    status: 'excellent' | 'good' | 'warning' | 'critical';
    issues: string[];
    score: number; // 0-100
  } {
    const issues: string[] = [];
    let score = 100;
    
    // Check technical KPIs
    if (this.metrics.technical) {
      const tech = this.metrics.technical;
      
      if (tech.uptime < 99.9) {
        issues.push(`Uptime below target: ${tech.uptime.toFixed(2)}%`);
        score -= 10;
      }
      
      if (tech.apiResponseTimeP95 > 200) {
        issues.push(`P95 latency above target: ${tech.apiResponseTimeP95.toFixed(0)}ms`);
        score -= 15;
      }
      
      if (tech.errorRate > 0.1) {
        issues.push(`Error rate above target: ${tech.errorRate.toFixed(2)}%`);
        score -= 20;
      }
      
      if (tech.testCoverage < 80) {
        issues.push(`Test coverage below target: ${tech.testCoverage.toFixed(1)}%`);
        score -= 5;
      }
      
      if (tech.meanTimeToRecovery > 15) {
        issues.push(`MTTR above target: ${tech.meanTimeToRecovery.toFixed(1)}min`);
        score -= 10;
      }
    }
    
    // Check reliability KPIs
    if (this.metrics.reliability) {
      const rel = this.metrics.reliability;
      
      if (rel.circuitBreakerTrips > 10) {
        issues.push(`High circuit breaker trips: ${rel.circuitBreakerTrips}`);
        score -= 5;
      }
      
      if (rel.retrySuccessRate < 80) {
        issues.push(`Low retry success rate: ${rel.retrySuccessRate.toFixed(1)}%`);
        score -= 5;
      }
    }
    
    // Check security KPIs
    if (this.metrics.security) {
      const sec = this.metrics.security;
      
      if (sec.securityIncidents > 0) {
        issues.push(`Security incidents detected: ${sec.securityIncidents}`);
        score -= 30;
      }
      
      if (sec.dependencyVulnerabilities > 10) {
        issues.push(`High dependency vulnerabilities: ${sec.dependencyVulnerabilities}`);
        score -= 10;
      }
    }
    
    let status: 'excellent' | 'good' | 'warning' | 'critical';
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 60) status = 'warning';
    else status = 'critical';
    
    return { status, issues, score };
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): Record<string, unknown> {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      health: this.getHealthStatus(),
    };
  }
}

export const kpiTracker = new KPITracker();
