-- ============================================================================
-- Complete Supabase Backend Schema with RLS and Optimizations
-- ============================================================================
-- This file creates all tables, indexes, RLS policies, and functions needed
-- for the backend. Run this in Supabase SQL Editor.
--
-- AUTHENTICATION SETUP:
-- This schema supports both Supabase Auth and custom authentication:
-- - If using Supabase Auth: The auth_user_id() function will use auth.uid()
-- - If using custom auth: Ensure JWT includes 'user_id' claim
-- - Service role can bypass all RLS policies (for backend operations)
--
-- IMPORTANT: Never expose service_role key to frontend!
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Core Profile
  name TEXT,
  role TEXT,  -- 'founder', 'pm', 'staff_engineer', 'devops', 'cfo', 'investor'
  vertical TEXT,  -- 'software', 'agency', 'internal_tools', 'content', 'other'
  
  -- Stack Preferences (JSON)
  stack JSONB DEFAULT '{
    "code_repo": true,
    "issue_tracker": true,
    "doc_space": true,
    "ci_cd": true,
    "infra": true,
    "analytics": false
  }'::jsonb,
  
  -- Vibe Preferences
  tone TEXT DEFAULT 'balanced',  -- 'playful', 'serious', 'technical', 'casual', 'balanced'
  risk_tolerance TEXT DEFAULT 'moderate',  -- 'conservative', 'moderate', 'aggressive'
  kpi_focus TEXT DEFAULT 'velocity',  -- 'velocity', 'reliability', 'growth', 'revenue', 'quality'
  perspective TEXT DEFAULT 'founder',  -- 'founder', 'pm', 'staff_engineer', 'devops', 'cfo', 'investor'
  
  -- Behavior Embeddings (OpenAI vector for similarity search)
  behavior_embedding VECTOR(1536),
  
  -- Metadata
  brand_voice TEXT,
  company_context TEXT,
  preferred_models JSONB DEFAULT '["gpt-4-turbo", "claude-3-opus"]'::jsonb,
  timezone TEXT DEFAULT 'UTC',
  
  -- Premium Features
  premium_features JSONB DEFAULT '{
    "enabled": false,
    "voiceToText": false,
    "tokenLimit": 4000,
    "advancedFilters": false,
    "customPrompts": false
  }'::jsonb
);

-- Prompt Atoms Table
CREATE TABLE IF NOT EXISTS prompt_atoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  name TEXT NOT NULL,  -- e.g., "tone.playful", "stack.web_app", "perspective.founder", "phase.implementation"
  category TEXT NOT NULL,  -- 'tone', 'stack', 'perspective', 'phase', 'domain', 'constraint', 'example', 'goal', 'risk'
  version INT DEFAULT 1,
  
  -- Content
  system_prompt TEXT,  -- LLM system instruction snippet
  constraints JSONB,  -- {"max_tokens": 500, "style": "conversational"}
  examples JSONB,  -- Few-shot examples
  
  -- Weighting & Compatibility
  weight FLOAT DEFAULT 1.0,
  compatible_atoms TEXT[],
  target_roles TEXT[],
  target_verticals TEXT[],
  
  -- Telemetry
  usage_count INT DEFAULT 0,
  success_rate FLOAT DEFAULT 0.5,  -- How often outputs are accepted
  active BOOLEAN DEFAULT true,
  
  -- Unique constraint
  UNIQUE(name, version)
);

-- Vibe Configs Table
CREATE TABLE IF NOT EXISTS vibe_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Snapshot of current vibe state
  name TEXT,  -- e.g., "Q1 Feature Launch", "Tech Debt Sprint"
  
  -- Filter Sliders (0-100)
  playfulness INT DEFAULT 50 CHECK (playfulness >= 0 AND playfulness <= 100),
  revenue_focus INT DEFAULT 60 CHECK (revenue_focus >= 0 AND revenue_focus <= 100),
  investor_perspective INT DEFAULT 40 CHECK (investor_perspective >= 0 AND investor_perspective <= 100),
  
  -- Selected Atoms & Instructions
  selected_atoms UUID[],
  custom_instructions TEXT,
  
  -- System Preferences
  auto_suggest BOOLEAN DEFAULT true,
  approval_required BOOLEAN DEFAULT true,
  logging_level TEXT DEFAULT 'standard'
);

-- Agent Runs Table
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Run Metadata
  trigger TEXT NOT NULL,  -- 'manual', 'event', 'schedule', 'chat_input'
  trigger_data JSONB,
  
  -- Prompt Assembly
  assembled_prompt TEXT,
  selected_atoms UUID[],
  vibe_config_snapshot JSONB,
  
  -- Execution
  agent_type TEXT,  -- 'suggestion', 'generator', 'orchestrator'
  model_used TEXT,  -- 'gpt-4-turbo', 'claude-3-opus'
  
  -- Outputs & Feedback
  generated_content JSONB,
  user_feedback TEXT,  -- 'approved', 'rejected', 'revised'
  feedback_detail TEXT,
  
  -- Telemetry
  tokens_used INT,
  latency_ms INT,
  cost_usd FLOAT
);

-- Background Events Table
CREATE TABLE IF NOT EXISTS background_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Event Metadata
  event_type TEXT NOT NULL,  -- 'repo.pr.opened', 'repo.build.failed', 'issue.created', 'metric.regression', 'incident.opened'
  source TEXT NOT NULL,  -- 'code_repo', 'issue_tracker', 'ci_cd', 'infra', 'metrics', 'manual', 'schedule'
  event_data JSONB,
  event_timestamp TIMESTAMPTZ,
  
  -- Processing
  suggestion_generated BOOLEAN DEFAULT false,
  suggestion_id UUID,
  user_actioned BOOLEAN DEFAULT false
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'event', 'system', 'alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEMPLATE SYSTEM TABLES
-- ============================================================================

-- User Template Customizations
CREATE TABLE IF NOT EXISTS user_template_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  milestone TEXT NOT NULL,
  
  -- Customization data
  custom_variables JSONB DEFAULT '{}'::jsonb,
  custom_instructions TEXT,
  enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one customization per user per template
  UNIQUE(user_id, template_id)
);

-- Template Customization History
CREATE TABLE IF NOT EXISTS template_customization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customization_id UUID NOT NULL REFERENCES user_template_customizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  
  -- Snapshot of customization
  custom_variables JSONB,
  custom_instructions TEXT,
  enabled BOOLEAN,
  
  -- Metadata
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted')),
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Who made the change
  changed_by TEXT
);

-- Template Usage Analytics
CREATE TABLE IF NOT EXISTS template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  
  -- Usage metrics
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  
  -- Quality metrics
  average_rating FLOAT,
  total_ratings INT DEFAULT 0,
  
  -- Performance metrics
  average_tokens_used INT,
  average_latency_ms INT,
  
  -- Timestamps
  first_used_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, template_id)
);

-- Template Feedback
CREATE TABLE IF NOT EXISTS template_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  
  -- Feedback
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  suggestions TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, template_id)
);

-- Shared Template Customizations
CREATE TABLE IF NOT EXISTS shared_template_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  
  -- Sharing settings
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  shared_with_user_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  shared_with_team_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Template data
  custom_variables JSONB DEFAULT '{}'::jsonb,
  custom_instructions TEXT,
  
  -- Metadata
  usage_count INT DEFAULT 0,
  rating_average FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template Presets
CREATE TABLE IF NOT EXISTS template_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,  -- 'quick-start', 'scenario', 'industry', etc.
  
  -- Preset configuration
  template_ids TEXT[] NOT NULL,
  custom_variables JSONB DEFAULT '{}'::jsonb,
  custom_instructions TEXT,
  
  -- Metadata
  is_system_preset BOOLEAN DEFAULT false,
  created_by TEXT,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template Versions
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  version INT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(template_id, version)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- User Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_vertical ON user_profiles(vertical);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stack ON user_profiles USING GIN(stack);
CREATE INDEX IF NOT EXISTS idx_user_profiles_premium ON user_profiles ((premium_features->>'enabled'))
  WHERE (premium_features->>'enabled')::boolean = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_behavior_embedding ON user_profiles 
  USING ivfflat (behavior_embedding vector_cosine_ops) WITH (lists = 100);

-- Prompt Atoms Indexes
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_category ON prompt_atoms(category);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_active ON prompt_atoms(active);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_name ON prompt_atoms(name);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_target_roles ON prompt_atoms USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_target_verticals ON prompt_atoms USING GIN(target_verticals);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_compatible_atoms ON prompt_atoms USING GIN(compatible_atoms);

-- Vibe Configs Indexes
CREATE INDEX IF NOT EXISTS idx_vibe_configs_user_id ON vibe_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_vibe_configs_created_at ON vibe_configs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibe_configs_user_created ON vibe_configs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibe_configs_selected_atoms ON vibe_configs USING GIN(selected_atoms);

-- Agent Runs Indexes
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created ON agent_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_trigger ON agent_runs(trigger);
CREATE INDEX IF NOT EXISTS idx_agent_runs_feedback ON agent_runs(user_feedback);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_created ON agent_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_feedback ON agent_runs(user_id, user_feedback);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_recent ON agent_runs(user_id, created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '30 days';

-- Background Events Indexes
CREATE INDEX IF NOT EXISTS idx_background_events_user_id ON background_events(user_id);
CREATE INDEX IF NOT EXISTS idx_background_events_type ON background_events(event_type);
CREATE INDEX IF NOT EXISTS idx_background_events_source ON background_events(source);
CREATE INDEX IF NOT EXISTS idx_background_events_created ON background_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_background_events_actioned ON background_events(user_actioned);
CREATE INDEX IF NOT EXISTS idx_background_events_user_type ON background_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_background_events_suggestion ON background_events(suggestion_generated, user_actioned);
CREATE INDEX IF NOT EXISTS idx_background_events_timestamp ON background_events(event_timestamp DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_background_events_user_unprocessed ON background_events(user_id, suggestion_generated, created_at DESC) 
  WHERE suggestion_generated = false;

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC) 
  WHERE read = false;

-- Template Customizations Indexes
CREATE INDEX IF NOT EXISTS idx_user_template_customizations_user_id ON user_template_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_template_customizations_template_id ON user_template_customizations(template_id);
CREATE INDEX IF NOT EXISTS idx_user_template_customizations_user_template ON user_template_customizations(user_id, template_id);

-- Template History Indexes
CREATE INDEX IF NOT EXISTS idx_template_customization_history_customization_id ON template_customization_history(customization_id);
CREATE INDEX IF NOT EXISTS idx_template_customization_history_user_id ON template_customization_history(user_id);
CREATE INDEX IF NOT EXISTS idx_template_customization_history_template_id ON template_customization_history(template_id);
CREATE INDEX IF NOT EXISTS idx_template_customization_history_created_at ON template_customization_history(created_at DESC);

-- Template Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_user_id ON template_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_template_id ON template_usage_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_user_template ON template_usage_analytics(user_id, template_id);

-- Template Feedback Indexes
CREATE INDEX IF NOT EXISTS idx_template_feedback_template_id ON template_feedback(template_id);
CREATE INDEX IF NOT EXISTS idx_template_feedback_user_id ON template_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_template_feedback_rating ON template_feedback(rating);

-- Shared Templates Indexes
CREATE INDEX IF NOT EXISTS idx_shared_template_customizations_owner_id ON shared_template_customizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_template_customizations_template_id ON shared_template_customizations(template_id);
CREATE INDEX IF NOT EXISTS idx_shared_template_customizations_public ON shared_template_customizations(is_public) 
  WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_shared_template_customizations_shared_users ON shared_template_customizations USING GIN(shared_with_user_ids);

-- Template Presets Indexes
CREATE INDEX IF NOT EXISTS idx_template_presets_category ON template_presets(category);
CREATE INDEX IF NOT EXISTS idx_template_presets_system ON template_presets(is_system_preset) 
  WHERE is_system_preset = true;

-- Template Versions Indexes
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON template_versions(template_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track template usage
CREATE OR REPLACE FUNCTION track_template_usage(
  p_user_id TEXT,
  p_template_id TEXT,
  p_success BOOLEAN DEFAULT true,
  p_tokens_used INT DEFAULT NULL,
  p_latency_ms INT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO template_usage_analytics (
    user_id, template_id, usage_count, success_count, failure_count,
    last_used_at, first_used_at, average_tokens_used, average_latency_ms
  )
  VALUES (
    p_user_id, p_template_id, 1,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN p_success THEN 0 ELSE 1 END,
    NOW(), NOW(), p_tokens_used, p_latency_ms
  )
  ON CONFLICT (user_id, template_id) DO UPDATE SET
    usage_count = template_usage_analytics.usage_count + 1,
    success_count = template_usage_analytics.success_count + 
      CASE WHEN p_success THEN 1 ELSE 0 END,
    failure_count = template_usage_analytics.failure_count + 
      CASE WHEN p_success THEN 0 ELSE 1 END,
    last_used_at = NOW(),
    average_tokens_used = CASE 
      WHEN p_tokens_used IS NOT NULL THEN
        (template_usage_analytics.average_tokens_used * (template_usage_analytics.usage_count - 1) + p_tokens_used) / template_usage_analytics.usage_count
      ELSE template_usage_analytics.average_tokens_used
    END,
    average_latency_ms = CASE
      WHEN p_latency_ms IS NOT NULL THEN
        (template_usage_analytics.average_latency_ms * (template_usage_analytics.usage_count - 1) + p_latency_ms) / template_usage_analytics.usage_count
      ELSE template_usage_analytics.average_latency_ms
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create customization history entry
CREATE OR REPLACE FUNCTION create_customization_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO template_customization_history (
    customization_id, user_id, template_id,
    custom_variables, custom_instructions, enabled,
    change_type, changed_by
  )
  VALUES (
    NEW.id, NEW.user_id, NEW.template_id,
    NEW.custom_variables, NEW.custom_instructions, NEW.enabled,
    CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
    NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vibe_configs_updated_at
  BEFORE UPDATE ON vibe_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_template_customizations_updated_at
  BEFORE UPDATE ON user_template_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_presets_updated_at
  BEFORE UPDATE ON template_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_template_customizations_updated_at
  BEFORE UPDATE ON shared_template_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_feedback_updated_at
  BEFORE UPDATE ON template_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to track customization changes
CREATE TRIGGER track_customization_changes
  AFTER INSERT OR UPDATE ON user_template_customizations
  FOR EACH ROW
  EXECUTE FUNCTION create_customization_history();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_atoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_customization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_template_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user_id from JWT
-- Supports both Supabase auth (auth.uid()) and custom auth (JWT claims)
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS TEXT AS $$
DECLARE
  uid UUID;
  user_id_text TEXT;
BEGIN
  -- Try Supabase auth first (if using auth.users table)
  BEGIN
    uid := auth.uid();
    IF uid IS NOT NULL THEN
      RETURN uid::text;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- auth.uid() not available, continue to JWT claims
  END;
  
  -- Fall back to JWT claims (for custom auth)
  user_id_text := COALESCE(
    current_setting('request.jwt.claims', true)::json->>'user_id',
    current_setting('request.jwt.claims', true)::json->>'sub',
    NULL
  );
  
  RETURN user_id_text;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- User Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (user_id = auth_user_id())
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Service role can manage all profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Prompt Atoms RLS Policies (read-only for users, full access for service role)
CREATE POLICY "Users can view active prompt atoms"
  ON prompt_atoms FOR SELECT
  USING (active = true);

CREATE POLICY "Service role can manage prompt atoms"
  ON prompt_atoms FOR ALL
  USING (auth.role() = 'service_role');

-- Vibe Configs RLS Policies
CREATE POLICY "Users can view own vibe configs"
  ON vibe_configs FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "Users can insert own vibe configs"
  ON vibe_configs FOR INSERT
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Users can update own vibe configs"
  ON vibe_configs FOR UPDATE
  USING (user_id = auth_user_id())
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Users can delete own vibe configs"
  ON vibe_configs FOR DELETE
  USING (user_id = auth_user_id());

CREATE POLICY "Service role can manage all vibe configs"
  ON vibe_configs FOR ALL
  USING (auth.role() = 'service_role');

-- Agent Runs RLS Policies
CREATE POLICY "Users can view own agent runs"
  ON agent_runs FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "Users can insert own agent runs"
  ON agent_runs FOR INSERT
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Users can update own agent runs"
  ON agent_runs FOR UPDATE
  USING (user_id = auth_user_id())
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Service role can manage all agent runs"
  ON agent_runs FOR ALL
  USING (auth.role() = 'service_role');

-- Background Events RLS Policies
CREATE POLICY "Users can view own background events"
  ON background_events FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "Users can insert own background events"
  ON background_events FOR INSERT
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Users can update own background events"
  ON background_events FOR UPDATE
  USING (user_id = auth_user_id())
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Service role can manage all background events"
  ON background_events FOR ALL
  USING (auth.role() = 'service_role');

-- Notifications RLS Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth_user_id())
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth_user_id());

CREATE POLICY "Service role can manage all notifications"
  ON notifications FOR ALL
  USING (auth.role() = 'service_role');

-- User Template Customizations RLS Policies
CREATE POLICY "Users can view own template customizations"
  ON user_template_customizations FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "Users can insert own template customizations"
  ON user_template_customizations FOR INSERT
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Users can update own template customizations"
  ON user_template_customizations FOR UPDATE
  USING (user_id = auth_user_id())
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "Users can delete own template customizations"
  ON user_template_customizations FOR DELETE
  USING (user_id = auth_user_id());

CREATE POLICY "Service role can manage all template customizations"
  ON user_template_customizations FOR ALL
  USING (auth.role() = 'service_role');

-- Template Customization History RLS Policies
CREATE POLICY "Users can view own customization history"
  ON template_customization_history FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "Service role can manage all customization history"
  ON template_customization_history FOR ALL
  USING (auth.role() = 'service_role');

-- Template Usage Analytics RLS Policies
CREATE POLICY "Users can view own analytics"
  ON template_usage_analytics FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "Users can update own analytics"
  ON template_usage_analytics FOR ALL
  USING (user_id = auth_user_id());

CREATE POLICY "Service role can manage all analytics"
  ON template_usage_analytics FOR ALL
  USING (auth.role() = 'service_role');

-- Template Feedback RLS Policies
CREATE POLICY "Users can manage own feedback"
  ON template_feedback FOR ALL
  USING (user_id = auth_user_id());

CREATE POLICY "Users can view public feedback"
  ON template_feedback FOR SELECT
  USING (true);  -- Public feedback is viewable by all

CREATE POLICY "Service role can manage all feedback"
  ON template_feedback FOR ALL
  USING (auth.role() = 'service_role');

-- Shared Template Customizations RLS Policies
CREATE POLICY "Users can view public shared templates"
  ON shared_template_customizations FOR SELECT
  USING (
    is_public = true 
    OR owner_id = auth_user_id() 
    OR auth_user_id() = ANY(shared_with_user_ids)
  );

CREATE POLICY "Users can manage own shared templates"
  ON shared_template_customizations FOR ALL
  USING (owner_id = auth_user_id());

CREATE POLICY "Service role can manage all shared templates"
  ON shared_template_customizations FOR ALL
  USING (auth.role() = 'service_role');

-- Template Presets RLS Policies
CREATE POLICY "Users can view all presets"
  ON template_presets FOR SELECT
  USING (true);

CREATE POLICY "Users can create own presets"
  ON template_presets FOR INSERT
  WITH CHECK (created_by = auth_user_id() OR created_by IS NULL);

CREATE POLICY "Users can update own presets"
  ON template_presets FOR UPDATE
  USING (created_by = auth_user_id() OR is_system_preset = false);

CREATE POLICY "Users can delete own presets"
  ON template_presets FOR DELETE
  USING (created_by = auth_user_id() AND is_system_preset = false);

CREATE POLICY "Service role can manage all presets"
  ON template_presets FOR ALL
  USING (auth.role() = 'service_role');

-- Template Versions RLS Policies
CREATE POLICY "Users can view all template versions"
  ON template_versions FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage all template versions"
  ON template_versions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'User profile data including preferences, stack, and behavior embeddings';
COMMENT ON TABLE prompt_atoms IS 'Reusable prompt components for building system prompts';
COMMENT ON TABLE vibe_configs IS 'User-configured vibe settings for prompt generation';
COMMENT ON TABLE agent_runs IS 'Logs of agent execution runs with prompts and outputs';
COMMENT ON TABLE background_events IS 'Events from integrations that trigger agent suggestions';
COMMENT ON TABLE notifications IS 'User notifications for suggestions, events, and alerts';
COMMENT ON TABLE user_template_customizations IS 'User-specific template customizations';
COMMENT ON TABLE template_customization_history IS 'History of template customization changes';
COMMENT ON TABLE template_usage_analytics IS 'Analytics on template usage and performance';
COMMENT ON TABLE template_feedback IS 'User feedback and ratings on templates';
COMMENT ON TABLE shared_template_customizations IS 'Templates shared between users or teams';
COMMENT ON TABLE template_presets IS 'Pre-configured template presets';
COMMENT ON TABLE template_versions IS 'Version history for templates';

COMMENT ON COLUMN user_profiles.premium_features IS 'Premium feature flags and limits for the user';
COMMENT ON COLUMN user_profiles.behavior_embedding IS 'OpenAI embedding vector (1536 dimensions) for similarity search';
COMMENT ON COLUMN prompt_atoms.behavior_embedding IS 'Vector embedding for semantic search';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Schema creation complete! All tables, indexes, RLS policies, and functions have been created.';
  RAISE NOTICE 'Remember to:';
  RAISE NOTICE '1. Set up authentication in Supabase Dashboard';
  RAISE NOTICE '2. Configure JWT claims to include user_id';
  RAISE NOTICE '3. Test RLS policies with your authentication setup';
END $$;
