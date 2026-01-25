-- Migration: Secret Vault + API Keys + Persona Packs
-- Creates tables for Doppler-style secrets management, Keys-issued API keys, and persona pack system

-- ============================================================================
-- 1. API Keys Table (Keys-issued API keys for using Keys API)
-- ============================================================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  org_id UUID NULL, -- Future: organization-scoped keys

  -- Key metadata
  name TEXT NOT NULL,
  prefix TEXT NOT NULL, -- e.g., 'kx_live', 'kx_test'
  hashed_key TEXT NOT NULL UNIQUE, -- Argon2id or bcrypt hash

  -- Scopes and permissions
  scopes TEXT[] NOT NULL DEFAULT '{}', -- e.g., ['read:secrets', 'write:runs']

  -- Status and lifecycle
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for api_keys
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_status ON api_keys(status) WHERE status = 'active';
CREATE INDEX idx_api_keys_hashed_key ON api_keys(hashed_key);

-- ============================================================================
-- 2. Secrets Table (Metadata only)
-- ============================================================================
CREATE TABLE secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  org_id UUID NULL, -- Future: organization-scoped secrets

  -- Secret metadata
  name TEXT NOT NULL, -- e.g., 'openai/default', 'anthropic/production'
  kind TEXT NOT NULL DEFAULT 'generic', -- e.g., 'openai_api_key', 'anthropic_api_key', 'webhook_secret', 'generic'
  description TEXT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure unique names per tenant
  UNIQUE(user_id, name)
);

-- Indexes for secrets
CREATE INDEX idx_secrets_user_id ON secrets(user_id);
CREATE INDEX idx_secrets_kind ON secrets(kind);

-- ============================================================================
-- 3. Secret Versions Table (Encrypted values)
-- ============================================================================
CREATE TABLE secret_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_id UUID NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,

  -- Version tracking
  version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  -- Encrypted payload (AES-256-GCM)
  ciphertext TEXT NOT NULL, -- Base64-encoded ciphertext
  iv TEXT NOT NULL, -- Base64-encoded initialization vector (12 bytes for GCM)
  tag TEXT NOT NULL, -- Base64-encoded authentication tag (16 bytes for GCM)
  key_version TEXT NOT NULL DEFAULT '1', -- Master key version for rotation support

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW(),

  -- Ensure one version number per secret
  UNIQUE(secret_id, version)
);

-- Indexes for secret_versions
CREATE INDEX idx_secret_versions_secret_id ON secret_versions(secret_id);
CREATE INDEX idx_secret_versions_status ON secret_versions(status) WHERE status = 'active';

-- ============================================================================
-- 4. Persona Packs Table
-- ============================================================================
CREATE TABLE persona_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- Persona metadata
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-safe identifier
  description TEXT NULL,

  -- Canonical representation (source of truth)
  canonical_json JSONB NOT NULL, -- Structured persona data: { system, skills, invariants, examples, etc. }

  -- Pre-rendered variants (for performance)
  render_claude TEXT NULL, -- Single system prompt block for Claude
  render_openai JSONB NULL, -- OpenAI messages array format
  render_agent_md TEXT NULL, -- Cursor Composer AGENT.md + skills layout

  -- Default model mapping
  default_provider TEXT NULL, -- e.g., 'anthropic', 'openai', 'google'
  default_model TEXT NULL, -- e.g., 'claude-3-opus', 'gpt-4-turbo'

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure unique slug per user
  UNIQUE(user_id, slug)
);

-- Indexes for persona_packs
CREATE INDEX idx_persona_packs_user_id ON persona_packs(user_id);
CREATE INDEX idx_persona_packs_slug ON persona_packs(user_id, slug);

-- ============================================================================
-- 5. Extend user_profiles Table
-- ============================================================================
-- Add persona and default model preferences
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS default_persona_id UUID NULL REFERENCES persona_packs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS default_provider TEXT NULL,
  ADD COLUMN IF NOT EXISTS default_model TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_default_persona ON user_profiles(default_persona_id);

-- ============================================================================
-- 6. Row-Level Security (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_packs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view own API keys"
  ON api_keys
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- RLS Policies for secrets
CREATE POLICY "Users can view own secrets"
  ON secrets
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own secrets"
  ON secrets
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own secrets"
  ON secrets
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own secrets"
  ON secrets
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- RLS Policies for secret_versions
-- Access to secret_versions requires access to parent secret
CREATE POLICY "Users can view own secret versions"
  ON secret_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM secrets
      WHERE secrets.id = secret_versions.secret_id
        AND secrets.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create own secret versions"
  ON secret_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM secrets
      WHERE secrets.id = secret_versions.secret_id
        AND secrets.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update own secret versions"
  ON secret_versions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM secrets
      WHERE secrets.id = secret_versions.secret_id
        AND secrets.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete own secret versions"
  ON secret_versions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM secrets
      WHERE secrets.id = secret_versions.secret_id
        AND secrets.user_id = auth.uid()::text
    )
  );

-- RLS Policies for persona_packs
CREATE POLICY "Users can view own persona packs"
  ON persona_packs
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own persona packs"
  ON persona_packs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own persona packs"
  ON persona_packs
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own persona packs"
  ON persona_packs
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- 7. Triggers for updated_at
-- ============================================================================

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_secrets_updated_at
  BEFORE UPDATE ON secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_packs_updated_at
  BEFORE UPDATE ON persona_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Helper Comments
-- ============================================================================

COMMENT ON TABLE api_keys IS 'Keys-issued API keys for programmatic access to Keys API';
COMMENT ON TABLE secrets IS 'User secrets metadata (Doppler-style vault)';
COMMENT ON TABLE secret_versions IS 'Encrypted secret values with versioning support';
COMMENT ON TABLE persona_packs IS 'Portable persona bundles (system prompts + skills)';

COMMENT ON COLUMN api_keys.hashed_key IS 'Argon2id hash of the API key token (never store plaintext)';
COMMENT ON COLUMN api_keys.prefix IS 'Key prefix for easy identification (e.g., kx_live_, kx_test_)';
COMMENT ON COLUMN secret_versions.ciphertext IS 'AES-256-GCM encrypted secret value (base64)';
COMMENT ON COLUMN secret_versions.iv IS 'Initialization vector for AES-GCM (base64, 12 bytes)';
COMMENT ON COLUMN secret_versions.tag IS 'Authentication tag for AES-GCM (base64, 16 bytes)';
COMMENT ON COLUMN persona_packs.canonical_json IS 'Source of truth for persona definition';
COMMENT ON COLUMN persona_packs.render_claude IS 'Pre-rendered system prompt for Claude models';
COMMENT ON COLUMN persona_packs.render_openai IS 'Pre-rendered messages array for OpenAI models';
