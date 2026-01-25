import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  deleteApiKey,
  getApiKey,
} from '../services/apiKeyService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/api-keys
 * List all API keys for the authenticated user (metadata only, no tokens)
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const apiKeys = await listApiKeys(req.userId);

    res.json({ apiKeys });
  } catch (error) {
    logger.error('Failed to list API keys', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to list API keys' });
  }
});

/**
 * POST /api/api-keys
 * Create a new API key
 * Returns the full token ONCE - it will never be shown again
 */
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, prefix, scopes, expires_at } = req.body;

    // Validate inputs
    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required and must be a string' });
      return;
    }

    if (prefix && !['kx_live', 'kx_test'].includes(prefix)) {
      res.status(400).json({ error: 'prefix must be either "kx_live" or "kx_test"' });
      return;
    }

    if (scopes && !Array.isArray(scopes)) {
      res.status(400).json({ error: 'scopes must be an array' });
      return;
    }

    const expiresAt = expires_at ? new Date(expires_at) : undefined;

    const result = await createApiKey({
      userId: req.userId,
      name,
      prefix: prefix || 'kx_live',
      scopes: scopes || [],
      expiresAt,
    });

    // Return token ONCE
    res.status(201).json({
      token: result.token,
      api_key: result.metadata,
      warning: 'This token will only be shown once. Please save it securely.',
    });
  } catch (error) {
    logger.error('Failed to create API key', error as Error, {
      userId: req.userId,
      name: req.body.name,
    });
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

/**
 * POST /api/api-keys/:id/revoke
 * Revoke an API key
 */
router.post('/:id/revoke', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    await revokeApiKey(req.userId, id);

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    logger.error('Failed to revoke API key', error as Error, {
      userId: req.userId,
      apiKeyId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

/**
 * DELETE /api/api-keys/:id
 * Delete an API key permanently
 */
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    await deleteApiKey(req.userId, id);

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete API key', error as Error, {
      userId: req.userId,
      apiKeyId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

/**
 * GET /api/api-keys/:id
 * Get API key metadata (no token)
 */
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const apiKey = await getApiKey(req.userId, id);

    if (!apiKey) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }

    res.json({ apiKey });
  } catch (error) {
    logger.error('Failed to get API key', error as Error, {
      userId: req.userId,
      apiKeyId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to get API key' });
  }
});

export default router;
