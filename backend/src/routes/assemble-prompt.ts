import { Router } from 'express';
import { assemblePrompt } from '../services/promptAssembly.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { userId, taskDescription, vibeConfig } = req.body;

    if (!userId || !taskDescription) {
      return res.status(400).json({
        error: 'Missing required fields: userId, taskDescription',
      });
    }

    const result = await assemblePrompt(userId, taskDescription, vibeConfig || {});

    res.json(result);
  } catch (error) {
    console.error('Error assembling prompt:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export { router as assemblePromptRouter };
