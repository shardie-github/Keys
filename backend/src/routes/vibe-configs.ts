import type { Request, Response } from 'express';
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { createVibeConfigSchema, updateVibeConfigSchema } from '../validation/schemas.js';
import { NotFoundError, DatabaseError, AuthorizationError } from '../types/errors.js';
import { logger } from '../utils/logger.js';
import { getCache, setCache, deleteCache, cacheKeys } from '../cache/redis.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router() as Router;
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get user's vibe config
router.get(
  '/:userId',
  authMiddleware,
  validateParams(z.object({ userId: z.string().min(1) })),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.params;
    const authenticatedUserId = req.userId!;
    const requestId = req.headers['x-request-id'] as string;

    // Enforce ownership: users can only access their own vibe config unless admin
    if (userId !== authenticatedUserId && req.user?.role !== 'admin') {
      throw new AuthorizationError('You can only access your own vibe config');
    }

    // Try cache first
    const cacheKey = cacheKeys.vibeConfig(userId);
    const cached = await getCache(cacheKey);
    if (cached) {
      logger.debug('Vibe config cache hit', { userId, requestId });
      return res.json(cached);
    }

    const { data, error } = await supabase
      .from('vibe_configs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new DatabaseError('Failed to fetch vibe config', { error: error.message });
    }

    // Create default if not found
    if (!data) {
      const defaultConfig = {
        user_id: userId,
        playfulness: 50,
        revenue_focus: 60,
        investor_perspective: 40,
        auto_suggest: true,
        approval_required: true,
        logging_level: 'standard' as const,
      };

      const { data: newData, error: createError } = await supabase
        .from('vibe_configs')
        .insert(defaultConfig)
        .select()
        .single();

      if (createError) {
        throw new DatabaseError('Failed to create default vibe config', {
          error: createError.message,
        });
      }

      await setCache(cacheKey, newData, 300);
      logger.info('Default vibe config created', { userId, requestId });
      return res.json(newData);
    }

    await setCache(cacheKey, data, 300);
    logger.info('Vibe config fetched', { userId, requestId });
    res.json(data);
  })
);

// Create vibe config
router.post(
  '/',
  authMiddleware,
  validateBody(createVibeConfigSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const config = req.body;
    const userId = req.userId!; // Always use authenticated user ID
    const requestId = req.headers['x-request-id'] as string;

    // Ignore user_id from body if present - always use authenticated user
    const { user_id, ...configData } = config;

    const { data, error } = await supabase
      .from('vibe_configs')
      .insert({ ...configData, user_id: userId })
      .select()
      .single();

    if (error) {
      logger.error('Error creating vibe config', new Error(error.message), {
        userId,
        requestId,
      });
      throw new DatabaseError('Failed to create vibe config', { error: error.message });
    }

    await deleteCache(cacheKeys.vibeConfig(userId));
    logger.info('Vibe config created', { userId, requestId });
    res.status(201).json(data);
  })
);

// Update vibe config
router.patch(
  '/:userId',
  authMiddleware,
  validateParams(z.object({ userId: z.string().min(1) })),
  validateBody(updateVibeConfigSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { userId } = req.params;
    const authenticatedUserId = req.userId!;
    const updates = req.body;
    const requestId = req.headers['x-request-id'] as string;

    // Enforce ownership: users can only update their own vibe config unless admin
    if (userId !== authenticatedUserId && req.user?.role !== 'admin') {
      throw new AuthorizationError('You can only update your own vibe config');
    }

    // Remove user_id from updates if present - cannot change ownership
    const { user_id, ...updateData } = updates;

    const { data, error } = await supabase
      .from('vibe_configs')
      .update(updateData)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .select()
      .single();

    if (error) {
      logger.error('Error updating vibe config', new Error(error.message), {
        userId,
        requestId,
      });
      throw new DatabaseError('Failed to update vibe config', { error: error.message });
    }

    if (!data) {
      throw new NotFoundError('Vibe config');
    }

    await deleteCache(cacheKeys.vibeConfig(userId));
    logger.info('Vibe config updated', { userId, requestId });
    res.json(data);
  })
);

export { router as vibeConfigsRouter };
