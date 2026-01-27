import type { Request, Response } from 'express';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import {
  createSecret,
  listSecrets,
  rotateSecret,
  deleteSecret,
  getSecret,
  isVaultConfigured,
} from '../services/vaultService.js';
import { logger } from '../utils/logger.js';
import { redactSecrets } from '../utils/redaction.js';

const router = Router() as Router;

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/secrets
 * List all secrets for the authenticated user (metadata only, no plaintext)
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!isVaultConfigured()) {
      res.status(200).json({
        secrets: [],
        vault_configured: false,
        message: 'Vault not configured. Set KEYS_VAULT_MASTER_KEY to enable secrets management.',
      });
      return;
    }

    const secrets = await listSecrets(req.userId);

    res.json({
      secrets,
      vault_configured: true,
    });
  } catch (error) {
    logger.error('Failed to list secrets', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to list secrets' });
  }
});

/**
 * POST /api/secrets
 * Create a new secret
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!isVaultConfigured()) {
      res.status(503).json({
        error: 'Vault not configured. Set KEYS_VAULT_MASTER_KEY to enable secrets management.',
      });
      return;
    }

    const { name, kind, plaintext, description } = req.body;

    // Validate inputs
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required and must be a string' });
      return;
    }

    if (!kind || typeof kind !== 'string') {
      res.status(400).json({ error: 'kind is required and must be a string' });
      return;
    }

    if (!plaintext || typeof plaintext !== 'string') {
      res.status(400).json({ error: 'plaintext is required and must be a string' });
      return;
    }

    const secret = await createSecret({
      userId: req.userId,
      name,
      kind,
      plaintext,
      description,
    });

    // Return metadata only (no plaintext)
    res.status(201).json({
      secret: {
        id: secret.id,
        name: secret.name,
        kind: secret.kind,
        description: secret.description,
        created_at: secret.created_at,
      },
    });
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes('already exists')) {
      res.status(409).json({ error: errorMessage });
      return;
    }

    logger.error('Failed to create secret', error as Error, {
      userId: req.userId,
      name: redactSecrets(req.body.name),
    });
    res.status(500).json({ error: 'Failed to create secret' });
  }
});

/**
 * POST /api/secrets/:id/rotate
 * Rotate a secret (create new version, deactivate old)
 */
router.post('/:id/rotate', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!isVaultConfigured()) {
      res.status(503).json({ error: 'Vault not configured' });
      return;
    }

    const { id } = req.params;
    const { plaintext } = req.body;

    if (!plaintext || typeof plaintext !== 'string') {
      res.status(400).json({ error: 'plaintext is required' });
      return;
    }

    const newVersion = await rotateSecret({
      userId: req.userId,
      secretId: id,
      plaintext,
    });

    res.json({
      version: newVersion.version,
      status: newVersion.status,
      created_at: newVersion.created_at,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes('not found')) {
      res.status(404).json({ error: 'Secret not found' });
      return;
    }

    logger.error('Failed to rotate secret', error as Error, {
      userId: req.userId,
      secretId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to rotate secret' });
  }
});

/**
 * DELETE /api/secrets/:id
 * Delete a secret (and all its versions)
 */
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    await deleteSecret(req.userId, id);

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete secret', error as Error, {
      userId: req.userId,
      secretId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to delete secret' });
  }
});

/**
 * GET /api/secrets/:id
 * Get secret metadata (no plaintext)
 */
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const secret = await getSecret(req.userId, id);

    if (!secret) {
      res.status(404).json({ error: 'Secret not found' });
      return;
    }

    res.json({ secret });
  } catch (error) {
    logger.error('Failed to get secret', error as Error, {
      userId: req.userId,
      secretId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to get secret' });
  }
});

export default router;
