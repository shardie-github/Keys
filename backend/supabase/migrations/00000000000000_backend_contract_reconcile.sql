-- ============================================================================
-- BACKEND CONTRACT RECONCILIATION MIGRATION
-- ============================================================================
-- This migration ensures all expected tables, columns, indexes, constraints,
-- triggers, functions, RLS policies, and extensions are present and correct.
-- 
-- This migration is IDEMPOTENT and safe to run multiple times.
-- It uses IF NOT EXISTS patterns and DO blocks to handle conflicts gracefully.
--
-- Execution: Run this migration against your Supabase database to reconcile
-- the live state with the expected backend contract.
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- SECTION 2: CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- User Profiles Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
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
  }',
  
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
  preferred_models JSONB DEFAULT '["gpt-4-turbo", "claude-3-opus"]',
  timezone TEXT DEFAULT 'UTC',
  
  -- Premium Features
  premium_features JSONB DEFAULT '{
    "enabled": false,
    "voiceToText": false,
    "tokenLimit": 4000,
    "advancedFilters": false,
    "customPrompts": false
  }'::jsonb,
  
  -- Billing
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'inactive', 'canceled', 'past_due')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_current_period_end TIMESTAMPTZ,
  org_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add columns that might be missing (idempotent)
DO $$ 
BEGIN
  -- Premium features column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'premium_features'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN premium_features JSONB DEFAULT '{
      "enabled": false,
      "voiceToText": false,
      "tokenLimit": 4000,
      "advancedFilters": false,
      "customPrompts": false
    }'::jsonb;
  END IF;
  
  -- Billing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN stripe_customer_id TEXT,
    ADD COLUMN subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'inactive', 'canceled', 'past_due')),
    ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    ADD COLUMN subscription_current_period_end TIMESTAMPTZ,
    ADD COLUMN org_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Prompt Atoms Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prompt_atoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  
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
  active BOOLEAN DEFAULT true
);

-- Ensure NOT NULL constraints
DO $$
BEGIN
  ALTER TABLE prompt_atoms 
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN category SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL; -- Ignore if already set
END $$;

-- ----------------------------------------------------------------------------
-- Vibe Configs Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vibe_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Snapshot of current vibe state
  name TEXT,  -- e.g., "Q1 Feature Launch", "Tech Debt Sprint"
  
  -- Filter Sliders (0-100)
  playfulness INT DEFAULT 50 CHECK (playfulness >= 0 AND playfulness <= 100),  -- Writing tone: 0 = formal, 100 = playful
  revenue_focus INT DEFAULT 60 CHECK (revenue_focus >= 0 AND revenue_focus <= 100),  -- Business-outcome focus: 0 = exploratory, 100 = ROI-obsessed
  investor_perspective INT DEFAULT 40 CHECK (investor_perspective >= 0 AND investor_perspective <= 100),  -- Framing: 0 = pure operator/tech, 100 = investor/CFO framing
  
  -- Selected Atoms & Instructions
  selected_atoms UUID[],
  custom_instructions TEXT,
  
  -- System Preferences
  auto_suggest BOOLEAN DEFAULT true,
  approval_required BOOLEAN DEFAULT true,
  logging_level TEXT DEFAULT 'standard'
);

-- ----------------------------------------------------------------------------
-- Agent Runs Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
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

-- Ensure NOT NULL constraints
DO $$
BEGIN
  ALTER TABLE agent_runs 
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN trigger SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL; -- Ignore if already set
END $$;

-- ----------------------------------------------------------------------------
-- Background Events Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS background_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Event Metadata
  event_type TEXT NOT NULL,  -- 'repo.pr.opened', 'repo.build.failed', 'issue.created', 'metric.regression', 'incident.opened'
  source TEXT NOT NULL,  -- 'code_repo', 'issue_tracker', 'ci_cd', 'infra', 'metrics', 'manual', 'schedule'
  event_data JSONB,
  event_timestamp TIMESTAMP,
  
  -- Processing
  suggestion_generated BOOLEAN DEFAULT false,
  suggestion_id UUID,
  user_actioned BOOLEAN DEFAULT false
);

-- Ensure NOT NULL constraints
DO $$
BEGIN
  ALTER TABLE background_events 
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN event_type SET NOT NULL,
    ALTER COLUMN source SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL; -- Ignore if already set
END $$;

-- ============================================================================
-- SECTION 3: TEMPLATE SYSTEM TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- User Template Customizations Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_template_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- ----------------------------------------------------------------------------
-- Template Versions Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  version INT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(template_id, version)
);

-- ----------------------------------------------------------------------------
-- Template Customization History Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS template_customization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customization_id UUID NOT NULL REFERENCES user_template_customizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  
  -- Snapshot of customization
  custom_variables JSONB,
  custom_instructions TEXT,
  enabled BOOLEAN,
  
  -- Metadata
  change_type TEXT NOT NULL, -- 'created', 'updated', 'deleted'
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Who made the change
  changed_by UUID REFERENCES auth.users(id)
);

-- ----------------------------------------------------------------------------
-- Template Usage Analytics Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- ----------------------------------------------------------------------------
-- Template Feedback Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS template_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- ----------------------------------------------------------------------------
-- Shared Template Customizations Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shared_template_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  
  -- Sharing settings
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  shared_with_user_ids UUID[] DEFAULT ARRAY[]::UUID[],
  shared_with_team_ids UUID[] DEFAULT ARRAY[]::UUID[],
  
  -- Template data
  custom_variables JSONB DEFAULT '{}'::jsonb,
  custom_instructions TEXT,
  
  -- Metadata
  usage_count INT DEFAULT 0,
  rating_average FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Template Presets Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS template_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'quick-start', 'scenario', 'industry', etc.
  
  -- Preset configuration
  template_ids TEXT[] NOT NULL,
  custom_variables JSONB DEFAULT '{}'::jsonb,
  custom_instructions TEXT,
  
  -- Metadata
  is_system_preset BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 4: BILLING & ORGANIZATIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Organizations Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Organization Members Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- ----------------------------------------------------------------------------
-- Invitations Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email)
);

-- ----------------------------------------------------------------------------
-- Usage Metrics Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('runs', 'tokens', 'templates', 'exports')),
  metric_value INT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_type, period_start)
);

-- ============================================================================
-- SECTION 5: INDEXES
-- ============================================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_vertical ON user_profiles(vertical);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stack ON user_profiles USING GIN(stack);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id_unique ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_premium 
  ON user_profiles ((premium_features->>'enabled'))
  WHERE (premium_features->>'enabled')::boolean = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org_id ON user_profiles(org_id);

-- Prompt atoms indexes
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_category ON prompt_atoms(category);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_active ON prompt_atoms(active);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_name ON prompt_atoms(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_atoms_name_version ON prompt_atoms(name, version);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_target_roles ON prompt_atoms USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_target_verticals ON prompt_atoms USING GIN(target_verticals);
CREATE INDEX IF NOT EXISTS idx_prompt_atoms_compatible_atoms ON prompt_atoms USING GIN(compatible_atoms);

-- Vibe configs indexes
CREATE INDEX IF NOT EXISTS idx_vibe_configs_user_id ON vibe_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_vibe_configs_created_at ON vibe_configs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibe_configs_user_created ON vibe_configs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vibe_configs_selected_atoms ON vibe_configs USING GIN(selected_atoms);

-- Agent runs indexes
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created ON agent_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_trigger ON agent_runs(trigger);
CREATE INDEX IF NOT EXISTS idx_agent_runs_feedback ON agent_runs(user_feedback);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_created ON agent_runs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_trigger_created ON agent_runs(trigger, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_feedback ON agent_runs(user_id, user_feedback);
CREATE INDEX IF NOT EXISTS idx_agent_runs_user_recent ON agent_runs(user_id, created_at DESC) 
  WHERE created_at > NOW() - INTERVAL '30 days';

-- Background events indexes
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

-- Template customization indexes
CREATE INDEX IF NOT EXISTS idx_user_template_customizations_user_id 
  ON user_template_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_template_customizations_template_id 
  ON user_template_customizations(template_id);

-- Template system indexes
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_customization_history_customization_id 
  ON template_customization_history(customization_id);
CREATE INDEX IF NOT EXISTS idx_template_customization_history_user_id 
  ON template_customization_history(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_user_id 
  ON template_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_analytics_template_id 
  ON template_usage_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_template_feedback_template_id ON template_feedback(template_id);
CREATE INDEX IF NOT EXISTS idx_shared_template_customizations_owner_id 
  ON shared_template_customizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_template_customizations_template_id 
  ON shared_template_customizations(template_id);
CREATE INDEX IF NOT EXISTS idx_shared_template_customizations_public 
  ON shared_template_customizations(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_template_presets_category ON template_presets(category);

-- Billing & org indexes
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON invitations(org_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON usage_metrics(period_start, period_end);

-- ============================================================================
-- SECTION 6: CONSTRAINTS
-- ============================================================================

-- Add check constraints for vibe_configs (idempotent)
DO $$
BEGIN
  -- Playfulness range
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_playfulness_range'
  ) THEN
    ALTER TABLE vibe_configs 
      ADD CONSTRAINT check_playfulness_range CHECK (playfulness >= 0 AND playfulness <= 100);
  END IF;
  
  -- Revenue focus range
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_revenue_focus_range'
  ) THEN
    ALTER TABLE vibe_configs 
      ADD CONSTRAINT check_revenue_focus_range CHECK (revenue_focus >= 0 AND revenue_focus <= 100);
  END IF;
  
  -- Investor perspective range
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_investor_perspective_range'
  ) THEN
    ALTER TABLE vibe_configs 
      ADD CONSTRAINT check_investor_perspective_range CHECK (investor_perspective >= 0 AND investor_perspective <= 100);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL; -- Ignore if constraint already exists
END $$;

-- ============================================================================
-- SECTION 7: FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user_template_customizations updated_at
CREATE OR REPLACE FUNCTION update_user_template_customizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track template usage
CREATE OR REPLACE FUNCTION track_template_usage(
  p_user_id UUID,
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

-- ============================================================================
-- SECTION 8: TRIGGERS
-- ============================================================================

-- Trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for vibe_configs updated_at
DROP TRIGGER IF EXISTS update_vibe_configs_updated_at ON vibe_configs;
CREATE TRIGGER update_vibe_configs_updated_at
  BEFORE UPDATE ON vibe_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_template_customizations updated_at
DROP TRIGGER IF EXISTS update_user_template_customizations_updated_at ON user_template_customizations;
CREATE TRIGGER update_user_template_customizations_updated_at
  BEFORE UPDATE ON user_template_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_template_customizations_updated_at();

-- Trigger to track customization changes
DROP TRIGGER IF EXISTS track_customization_changes ON user_template_customizations;
CREATE TRIGGER track_customization_changes
  AFTER INSERT OR UPDATE ON user_template_customizations
  FOR EACH ROW
  EXECUTE FUNCTION create_customization_history();

-- Update updated_at triggers for template system tables
DROP TRIGGER IF EXISTS update_template_presets_updated_at ON template_presets;
CREATE TRIGGER update_template_presets_updated_at
  BEFORE UPDATE ON template_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_template_customizations_updated_at();

DROP TRIGGER IF EXISTS update_shared_template_customizations_updated_at ON shared_template_customizations;
CREATE TRIGGER update_shared_template_customizations_updated_at
  BEFORE UPDATE ON shared_template_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_template_customizations_updated_at();

DROP TRIGGER IF EXISTS update_template_feedback_updated_at ON template_feedback;
CREATE TRIGGER update_template_feedback_updated_at
  BEFORE UPDATE ON template_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_user_template_customizations_updated_at();

-- ============================================================================
-- SECTION 9: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all user-owned tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_customization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_template_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DO $$
BEGIN
  -- Drop existing policies if they exist (to allow recreation)
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
END $$;

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

-- RLS Policies for vibe_configs
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own vibe configs" ON vibe_configs;
  DROP POLICY IF EXISTS "Users can insert own vibe configs" ON vibe_configs;
  DROP POLICY IF EXISTS "Users can update own vibe configs" ON vibe_configs;
  DROP POLICY IF EXISTS "Users can delete own vibe configs" ON vibe_configs;
END $$;

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

-- RLS Policies for agent_runs
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own agent runs" ON agent_runs;
  DROP POLICY IF EXISTS "Users can insert own agent runs" ON agent_runs;
  DROP POLICY IF EXISTS "Users can update own agent runs" ON agent_runs;
  DROP POLICY IF EXISTS "Users can delete own agent runs" ON agent_runs;
END $$;

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

-- RLS Policies for background_events
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own background events" ON background_events;
  DROP POLICY IF EXISTS "Users can insert own background events" ON background_events;
  DROP POLICY IF EXISTS "Users can update own background events" ON background_events;
  DROP POLICY IF EXISTS "Users can delete own background events" ON background_events;
END $$;

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

-- RLS Policies for user_template_customizations
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own template customizations" ON user_template_customizations;
  DROP POLICY IF EXISTS "Users can insert own template customizations" ON user_template_customizations;
  DROP POLICY IF EXISTS "Users can update own template customizations" ON user_template_customizations;
  DROP POLICY IF EXISTS "Users can delete own template customizations" ON user_template_customizations;
END $$;

CREATE POLICY "Users can view own template customizations"
  ON user_template_customizations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own template customizations"
  ON user_template_customizations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own template customizations"
  ON user_template_customizations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own template customizations"
  ON user_template_customizations
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for template_customization_history
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own customization history" ON template_customization_history;
END $$;

CREATE POLICY "Users can view own customization history"
  ON template_customization_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for template_usage_analytics
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own analytics" ON template_usage_analytics;
  DROP POLICY IF EXISTS "Users can update own analytics" ON template_usage_analytics;
END $$;

CREATE POLICY "Users can view own analytics"
  ON template_usage_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON template_usage_analytics
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for template_feedback
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can manage own feedback" ON template_feedback;
  DROP POLICY IF EXISTS "Users can view public feedback" ON template_feedback;
END $$;

CREATE POLICY "Users can manage own feedback"
  ON template_feedback
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public feedback"
  ON template_feedback
  FOR SELECT
  USING (true); -- Public feedback is viewable by all

-- RLS Policies for shared_template_customizations
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view public shared templates" ON shared_template_customizations;
  DROP POLICY IF EXISTS "Users can manage own shared templates" ON shared_template_customizations;
END $$;

CREATE POLICY "Users can view public shared templates"
  ON shared_template_customizations
  FOR SELECT
  USING (is_public = true OR auth.uid() = owner_id OR auth.uid() = ANY(shared_with_user_ids));

CREATE POLICY "Users can manage own shared templates"
  ON shared_template_customizations
  FOR ALL
  USING (auth.uid() = owner_id);

-- RLS Policies for template_presets
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view all presets" ON template_presets;
  DROP POLICY IF EXISTS "Users can create own presets" ON template_presets;
  DROP POLICY IF EXISTS "Users can update own presets" ON template_presets;
END $$;

CREATE POLICY "Users can view all presets"
  ON template_presets
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create own presets"
  ON template_presets
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own presets"
  ON template_presets
  FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for organizations
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own organizations" ON organizations;
  DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
  DROP POLICY IF EXISTS "Owners can update organizations" ON organizations;
END $$;

CREATE POLICY "Users can view own organizations"
  ON organizations
  FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update organizations"
  ON organizations
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- RLS Policies for organization_members
DO $$
BEGIN
  DROP POLICY IF EXISTS "Members can view organization members" ON organization_members;
  DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
END $$;

CREATE POLICY "Members can view organization members"
  ON organization_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.org_id = organization_members.org_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON organization_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.org_id = organization_members.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for invitations
DO $$
BEGIN
  DROP POLICY IF EXISTS "Members can view invitations" ON invitations;
  DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
END $$;

CREATE POLICY "Members can view invitations"
  ON invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = invitations.org_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage invitations"
  ON invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.org_id = invitations.org_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for usage_metrics
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own usage metrics" ON usage_metrics;
  DROP POLICY IF EXISTS "System can insert usage metrics" ON usage_metrics;
END $$;

CREATE POLICY "Users can view own usage metrics"
  ON usage_metrics
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "System can insert usage metrics"
  ON usage_metrics
  FOR INSERT
  WITH CHECK (true); -- Service role will insert

-- ============================================================================
-- END OF RECONCILIATION MIGRATION
-- ============================================================================
