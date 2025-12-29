import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { telemetryService } from '../services/telemetryService.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthorizationError, NotFoundError } from '../types/errors.js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.userId!;
    const { runId, feedback, detail } = req.body;

    if (!runId || !feedback) {
      return res.status(400).json({
        error: 'Missing required fields: runId, feedback',
      });
    }

    // First verify the run belongs to the user
    const { data: existingRun, error: fetchError } = await supabase
      .from('agent_runs')
      .select('user_id')
      .eq('id', runId)
      .single();

    if (fetchError || !existingRun) {
      throw new NotFoundError('Agent run not found');
    }

    // Enforce ownership: users can only provide feedback on their own runs unless admin
    if (existingRun.user_id !== userId && req.user?.role !== 'admin') {
      throw new AuthorizationError('You can only provide feedback on your own runs');
    }

    // Update agent run with feedback
    const { data, error } = await supabase
      .from('agent_runs')
      .update({
        user_feedback: feedback,
        feedback_detail: detail,
      })
      .eq('id', runId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update atom success rates based on feedback
    if (data.selected_atoms && feedback === 'approved') {
      // Increment usage count and update success rate for approved atoms
      for (const atomId of data.selected_atoms) {
        const { data: atom } = await supabase
          .from('prompt_atoms')
          .select('usage_count, success_rate')
          .eq('id', atomId)
          .single();

        if (atom) {
          const newUsageCount = (atom.usage_count || 0) + 1;
          // Simple moving average for success rate
          const newSuccessRate =
            ((atom.success_rate || 0.5) * (newUsageCount - 1) + 1) / newUsageCount;

          await supabase
            .from('prompt_atoms')
            .update({
              usage_count: newUsageCount,
              success_rate: newSuccessRate,
            })
            .eq('id', atomId);
        }
      }
    }

    // Track telemetry
    const source = data.trigger === 'event' ? 'background' : 'manual';
    await telemetryService.trackSuggestionFeedback(
      userId,
      runId,
      feedback,
      source
    );

    res.json({ success: true, data });
  })
);

export { router as feedbackRouter };
