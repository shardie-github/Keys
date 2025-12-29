-- Enable RLS on core user-owned tables
-- These tables were missing RLS policies, which is a critical security issue

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Enable RLS on vibe_configs
ALTER TABLE vibe_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vibe_configs
CREATE POLICY "Users can view own vibe configs"
  ON vibe_configs
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own vibe configs"
  ON vibe_configs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own vibe configs"
  ON vibe_configs
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own vibe configs"
  ON vibe_configs
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Enable RLS on agent_runs
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_runs
CREATE POLICY "Users can view own agent runs"
  ON agent_runs
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own agent runs"
  ON agent_runs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own agent runs"
  ON agent_runs
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own agent runs"
  ON agent_runs
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Enable RLS on background_events
ALTER TABLE background_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for background_events
CREATE POLICY "Users can view own background events"
  ON background_events
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own background events"
  ON background_events
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own background events"
  ON background_events
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own background events"
  ON background_events
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Note: prompt_atoms table is admin-managed and should remain public-readable
-- (RLS can be added later if needed, but it's not user-owned data)
