import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody } from '../middleware/validation.js';
import { assemblePrompt } from '../services/promptAssembly.js';
import type { InputFilter } from '../types/filters.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { AuthorizationError } from '../types/errors.js';

const router = Router();

const assemblePromptSchema = z.object({
  taskDescription: z.string().min(1),
  vibeConfig: z.object({
    playfulness: z.number().min(0).max(100).optional(),
    revenue_focus: z.number().min(0).max(100).optional(),
    investor_perspective: z.number().min(0).max(100).optional(),
  }).optional(),
  inputFilter: z.object({
    model: z.string().optional(),
    provider: z.enum(['openai', 'anthropic', 'google', 'meta', 'custom']).optional(),
    style: z
      .enum([
        'concise',
        'detailed',
        'technical',
        'conversational',
        'structured',
        'prompt_engineering',
        'chain_of_thought',
        'few_shot',
      ])
      .optional(),
    outputFormat: z
      .enum(['markdown', 'json', 'code', 'plain_text', 'structured_prompt', 'provider_native'])
      .optional(),
    tone: z.enum(['playful', 'serious', 'technical', 'casual', 'balanced']).optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().min(0).max(2).optional(),
    useProviderGuidelines: z.boolean().optional(),
    usePromptEngineering: z.boolean().optional(),
  }).optional(),
});

router.post(
  '/',
  authMiddleware,
  validateBody(assemblePromptSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!; // Always use authenticated user ID
    const { taskDescription, vibeConfig, inputFilter } = req.body;

    // Ignore userId from body if present - always use authenticated user
    const result = await assemblePrompt(
      userId,
      taskDescription,
      vibeConfig || {},
      inputFilter
    );

    res.json(result);
  })
);

export { router as assemblePromptRouter };
