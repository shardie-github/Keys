import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import {
  importPersonaPack,
  listPersonaPacks,
  getPersonaPack,
  exportPersonaPack,
  activatePersona,
  deletePersonaPack,
  getActivePersona,
} from '../services/personaService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/personas
 * List all persona packs for the authenticated user
 */
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const personas = await listPersonaPacks(req.userId);

    res.json({ personas });
  } catch (error) {
    logger.error('Failed to list personas', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to list personas' });
  }
});

/**
 * GET /api/personas/active
 * Get the currently active persona for the user
 */
router.get('/active', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const persona = await getActivePersona(req.userId);

    if (!persona) {
      res.status(404).json({ error: 'No active persona set' });
      return;
    }

    res.json({ persona });
  } catch (error) {
    logger.error('Failed to get active persona', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to get active persona' });
  }
});

/**
 * POST /api/personas/import
 * Import a persona pack from JSON, Markdown, or YAML
 */
router.post('/import', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { input, format } = req.body;

    if (!input) {
      res.status(400).json({ error: 'input is required (string or JSON object)' });
      return;
    }

    if (format && !['json', 'markdown', 'auto'].includes(format)) {
      res.status(400).json({ error: 'format must be "json", "markdown", or "auto"' });
      return;
    }

    const persona = await importPersonaPack({
      userId: req.userId,
      input,
      format: format || 'auto',
    });

    res.status(201).json({ persona });
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes('already exists')) {
      res.status(409).json({ error: errorMessage });
      return;
    }

    if (errorMessage.includes('Invalid JSON') || errorMessage.includes('must have')) {
      res.status(400).json({ error: errorMessage });
      return;
    }

    logger.error('Failed to import persona', error as Error, { userId: req.userId });
    res.status(500).json({ error: 'Failed to import persona' });
  }
});

/**
 * POST /api/personas/:id/activate
 * Activate a persona (set as default for user)
 */
router.post('/:id/activate', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    await activatePersona(req.userId, id);

    res.json({ message: 'Persona activated successfully' });
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes('not found')) {
      res.status(404).json({ error: 'Persona not found' });
      return;
    }

    logger.error('Failed to activate persona', error as Error, {
      userId: req.userId,
      personaId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to activate persona' });
  }
});

/**
 * GET /api/personas/:id/export
 * Export a persona pack in specified format
 * Query param: ?format=canonical|claude|openai|agent_md
 */
router.get('/:id/export', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const format = (req.query.format as string) || 'canonical';

    if (!['canonical', 'claude', 'openai', 'agent_md'].includes(format)) {
      res.status(400).json({
        error: 'format must be one of: canonical, claude, openai, agent_md',
      });
      return;
    }

    const exported = await exportPersonaPack({
      userId: req.userId,
      personaId: id,
      format: format as any,
    });

    // Set appropriate content type
    if (format === 'canonical' || format === 'openai') {
      res.setHeader('Content-Type', 'application/json');
    } else {
      res.setHeader('Content-Type', 'text/plain');
    }

    res.send(exported);
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes('not found')) {
      res.status(404).json({ error: 'Persona not found' });
      return;
    }

    logger.error('Failed to export persona', error as Error, {
      userId: req.userId,
      personaId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to export persona' });
  }
});

/**
 * GET /api/personas/:id
 * Get a specific persona pack
 */
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const persona = await getPersonaPack(req.userId, id);

    if (!persona) {
      res.status(404).json({ error: 'Persona not found' });
      return;
    }

    res.json({ persona });
  } catch (error) {
    logger.error('Failed to get persona', error as Error, {
      userId: req.userId,
      personaId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to get persona' });
  }
});

/**
 * DELETE /api/personas/:id
 * Delete a persona pack
 */
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    await deletePersonaPack(req.userId, id);

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete persona', error as Error, {
      userId: req.userId,
      personaId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to delete persona' });
  }
});

export default router;
