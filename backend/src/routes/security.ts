/**
 * Security Audit Endpoint
 * Provides security audit results and recommendations
 */

import { Router } from 'express';
import { securityAuditor } from '../security/securityAudit.js';
import { requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * Run security audit
 * GET /security/audit
 */
router.get(
  '/audit',
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const auditResult = await securityAuditor.runAudit();
    res.json(auditResult);
  })
);

export { router as securityRouter };
