/**
 * AAAA-Grade Alerting System
 * Real-time alerts for KPI thresholds, errors, and anomalies
 */

import { logger } from '../utils/logger.js';
import { kpiTracker } from '../monitoring/kpiTracker.js';

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  category: 'performance' | 'reliability' | 'security' | 'business';
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

class AlertingService {
  private alerts: Map<string, Alert> = new Map();
  private alertHandlers: Array<(alert: Alert) => Promise<void>> = [];

  /**
   * Register alert handler (e.g., send to Slack, email, PagerDuty)
   */
  registerHandler(handler: (alert: Alert) => Promise<void>): void {
    this.alertHandlers.push(handler);
  }

  /**
   * Check KPI thresholds and create alerts
   */
  async checkKPIs(): Promise<void> {
    const metrics = kpiTracker.getMetrics();
    const health = kpiTracker.getHealthStatus();

    // Check technical KPIs
    if (metrics.technical) {
      const tech = metrics.technical;
      
      if (tech.uptime < 99.9) {
        await this.createAlert({
          severity: 'error',
          title: 'Uptime Below Target',
          message: `Uptime is ${tech.uptime.toFixed(2)}%, target is 99.9%`,
          category: 'reliability',
        });
      }
      
      if (tech.apiResponseTimeP95 > 200) {
        await this.createAlert({
          severity: 'warning',
          title: 'High P95 Latency',
          message: `P95 latency is ${tech.apiResponseTimeP95.toFixed(0)}ms, target is < 200ms`,
          category: 'performance',
        });
      }
      
      if (tech.errorRate > 0.1) {
        await this.createAlert({
          severity: 'error',
          title: 'High Error Rate',
          message: `Error rate is ${tech.errorRate.toFixed(2)}%, target is < 0.1%`,
          category: 'reliability',
        });
      }
      
      if (tech.meanTimeToRecovery > 15) {
        await this.createAlert({
          severity: 'warning',
          title: 'High MTTR',
          message: `Mean time to recovery is ${tech.meanTimeToRecovery.toFixed(1)}min, target is < 15min`,
          category: 'reliability',
        });
      }
    }

    // Check reliability KPIs
    if (metrics.reliability) {
      const rel = metrics.reliability;
      
      if (rel.circuitBreakerTrips > 10) {
        await this.createAlert({
          severity: 'warning',
          title: 'High Circuit Breaker Trips',
          message: `Circuit breaker has tripped ${rel.circuitBreakerTrips} times`,
          category: 'reliability',
        });
      }
    }

    // Check security KPIs
    if (metrics.security) {
      const sec = metrics.security;
      
      if (sec.securityIncidents > 0) {
        await this.createAlert({
          severity: 'critical',
          title: 'Security Incident Detected',
          message: `${sec.securityIncidents} security incident(s) detected`,
          category: 'security',
        });
      }
      
      if (sec.dependencyVulnerabilities > 10) {
        await this.createAlert({
          severity: 'warning',
          title: 'High Dependency Vulnerabilities',
          message: `${sec.dependencyVulnerabilities} dependency vulnerabilities found`,
          category: 'security',
        });
      }
    }

    // Check overall health
    if (health.status === 'critical') {
      await this.createAlert({
        severity: 'critical',
        title: 'System Health Critical',
        message: `System health score is ${health.score}/100. Issues: ${health.issues.join('; ')}`,
        category: 'reliability',
      });
    }
  }

  /**
   * Create and dispatch alert
   */
  async createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      timestamp: new Date(),
      resolved: false,
    };

    // Check if similar alert already exists
    const existingAlert = Array.from(this.alerts.values()).find(
      (a) =>
        a.title === alert.title &&
        !a.resolved &&
        Date.now() - a.timestamp.getTime() < 3600000 // Within last hour
    );

    if (existingAlert) {
      logger.debug('Similar alert already exists', { alertId: existingAlert.id });
      return;
    }

    this.alerts.set(alert.id, alert);

    // Log alert
    logger.warn('Alert created', {
      id: alert.id,
      severity: alert.severity,
      title: alert.title,
      category: alert.category,
    });

    // Dispatch to handlers
    for (const handler of this.alertHandlers) {
      try {
        await handler(alert);
      } catch (error) {
        logger.error('Alert handler failed', error as Error, { alertId: alert.id });
      }
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      logger.info('Alert resolved', { alertId });
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => !a.resolved);
  }

  /**
   * Get alerts by category
   */
  getAlertsByCategory(category: Alert['category']): Alert[] {
    return Array.from(this.alerts.values()).filter(
      (a) => a.category === category && !a.resolved
    );
  }
}

export const alertingService = new AlertingService();

// Set up periodic KPI checking
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    alertingService.checkKPIs().catch((error) => {
      logger.error('KPI check failed', error as Error);
    });
  }, 60000); // Check every minute
}
