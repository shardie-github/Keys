/**
 * Disaster Recovery Management Endpoint
 */

import { Router } from 'express';
import { disasterRecoveryService } from '../utils/disasterRecovery.js';
import { requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * Get disaster recovery status
 * GET /disaster-recovery/status
 */
router.get(
  '/status',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const status = disasterRecoveryService.getDRStatus();
    res.json(status);
  })
);

/**
 * Execute backup
 * POST /disaster-recovery/backup
 */
router.post(
  '/backup',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const result = await disasterRecoveryService.executeBackup();
    res.json(result);
  })
);

/**
 * Test restore
 * POST /disaster-recovery/test-restore
 */
router.post(
  '/test-restore',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { backupId } = req.body;
    if (!backupId) {
      return res.status(400).json({ error: 'backupId required' });
    }
    
    const result = await disasterRecoveryService.testRestore(backupId);
    res.json(result);
  })
);

/**
 * Get backup configuration
 * GET /disaster-recovery/config
 */
router.get(
  '/config',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const config = disasterRecoveryService.getConfig();
    res.json(config);
  })
);

/**
 * Update backup configuration
 * PUT /disaster-recovery/config
 */
router.put(
  '/config',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    disasterRecoveryService.updateConfig(req.body);
    const config = disasterRecoveryService.getConfig();
    res.json(config);
  })
);

export { router as disasterRecoveryRouter };
