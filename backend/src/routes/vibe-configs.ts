import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('vibe_configs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(404).json({ error: 'Vibe config not found' });
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
        logging_level: 'standard',
      };

      const { data: newData, error: createError } = await supabase
        .from('vibe_configs')
        .insert(defaultConfig)
        .select()
        .single();

      if (createError) {
        return res.status(400).json({ error: createError.message });
      }

      return res.json(newData);
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching vibe config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Get existing config
    const { data: existing } = await supabase
      .from('vibe_configs')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!existing) {
      // Create new config
      const newConfig = {
        user_id: userId,
        ...updates,
      };

      const { data, error } = await supabase
        .from('vibe_configs')
        .insert(newConfig)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json(data);
    }

    // Update existing
    const { data, error } = await supabase
      .from('vibe_configs')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating vibe config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as vibeConfigsRouter };
