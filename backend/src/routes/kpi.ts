/**
 * KPI Metrics Endpoint
 * Provides real-time KPI metrics for monitoring dashboards
 */

import { Router } from 'express';
import { kpiTracker } from '../monitoring/kpiTracker.js';
import { apmService } from '../monitoring/apm.js';
import { businessMetricsService } from '../services/businessMetrics.js';
import { alertingService } from '../services/alerting.js';
import { requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * Get current KPI metrics
 * GET /kpi/metrics
 */
router.get(
  '/metrics',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const metrics = kpiTracker.getMetrics();
    const health = kpiTracker.getHealthStatus();
    const performance = apmService.getPerformanceSummary();

    res.json({
      timestamp: new Date().toISOString(),
      metrics,
      health,
      performance,
    });
  })
);

/**
 * Get KPI health status
 * GET /kpi/health
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const health = kpiTracker.getHealthStatus();
    res.json(health);
  })
);

/**
 * Export metrics for external systems
 * GET /kpi/export
 */
router.get(
  '/export',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const exported = kpiTracker.exportMetrics();
    res.json(exported);
  })
);

/**
 * Get business metrics
 * GET /kpi/business
 */
router.get(
  '/business',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const metrics = await businessMetricsService.getAllMetrics();
    res.json(metrics);
  })
);

/**
 * Get active alerts
 * GET /kpi/alerts
 */
router.get(
  '/alerts',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const category = req.query.category as string | undefined;
    const alerts = category
      ? alertingService.getAlertsByCategory(category as any)
      : alertingService.getActiveAlerts();
    res.json(alerts);
  })
);

/**
 * Resolve alert
 * POST /kpi/alerts/:alertId/resolve
 */
router.post(
  '/alerts/:alertId/resolve',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    alertingService.resolveAlert(req.params.alertId);
    res.json({ success: true });
  })
);

export { router as kpiRouter };
