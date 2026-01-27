/**
 * Moat Metrics Routes
 * 
 * Provides endpoints for tracking lock-in metrics, churn prediction, and infrastructure signals
 */

import type { Request, Response } from 'express';
import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { moatMetricsService } from '../services/moatMetricsService.js';

const router = Router() as Router;

/**
 * Get lock-in metrics for current user
 * GET /moat-metrics/lock-in
 */
router.get(
  '/lock-in',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const metrics = await moatMetricsService.getLockInMetrics(userId);
    res.json(metrics);
  })
);

/**
 * Get churn prediction for current user
 * GET /moat-metrics/churn-prediction
 */
router.get(
  '/churn-prediction',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const prediction = await moatMetricsService.getChurnPrediction(userId);
    res.json(prediction);
  })
);

/**
 * Get infrastructure signals for current user
 * GET /moat-metrics/infrastructure
 */
router.get(
  '/infrastructure',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const signals = await moatMetricsService.getInfrastructureSignals(userId);
    res.json(signals);
  })
);

/**
 * Get institutional memory value for current user
 * GET /moat-metrics/institutional-memory-value
 */
router.get(
  '/institutional-memory-value',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const value = await moatMetricsService.getInstitutionalMemoryValue(userId);
    res.json(value);
  })
);

/**
 * Get all moat metrics for current user
 * GET /moat-metrics/all
 */
router.get(
  '/all',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const [lockIn, churnPrediction, infrastructure, memoryValue] = await Promise.all([
      moatMetricsService.getLockInMetrics(userId),
      moatMetricsService.getChurnPrediction(userId),
      moatMetricsService.getInfrastructureSignals(userId),
      moatMetricsService.getInstitutionalMemoryValue(userId),
    ]);

    res.json({
      lockIn,
      churnPrediction,
      infrastructure,
      memoryValue,
      summary: {
        lockInLevel: lockIn.lockInLevel,
        churnRiskLevel: churnPrediction.churnRiskLevel,
        infrastructureStatus: infrastructure.infrastructureStatus,
        totalInstitutionalMemoryValue: memoryValue.totalValue,
        estimatedSwitchingCost: memoryValue.estimatedSwitchingCost,
      },
    });
  })
);

export { router as moatMetricsRouter };
