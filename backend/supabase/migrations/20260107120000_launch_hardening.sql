-- ============================================================================
-- LAUNCH PRESSURE AUDIT: HARDENING MIGRATION
-- Date: 2026-01-07
-- Purpose: Fix critical security vulnerabilities (search_path), enforce RLS, and ensure launch readiness.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FIX INSECURE FUNCTIONS (CRITICAL)
-- ----------------------------------------------------------------------------
-- Security vulnerability: SECURITY DEFINER functions must have a fixed search_path
-- to prevent privilege escalation attacks.

CREATE OR REPLACE FUNCTION public.track_template_usage(
  p_user_id UUID,
  p_template_id TEXT,
  p_success BOOLEAN DEFAULT true,
  p_tokens_used INT DEFAULT NULL,
  p_latency_ms INT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.template_usage_analytics (
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- 2. ENSURE RLS IS ENABLED (MANDATORY)
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prompt_atoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vibe_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.background_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_template_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.template_customization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.template_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.template_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shared_template_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.template_presets ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. FIX MISSING/INCORRECT POLICIES
-- ----------------------------------------------------------------------------

-- PROMPT ATOMS (Admin managed, public read)
DO $$ BEGIN
  -- Drop potentially incorrect policies to reset state
  DROP POLICY IF EXISTS "Public can view prompt atoms" ON public.prompt_atoms;
  DROP POLICY IF EXISTS "Service role can manage prompt atoms" ON public.prompt_atoms;
  
  CREATE POLICY "Public can view prompt atoms" 
    ON public.prompt_atoms FOR SELECT USING (true);
    
  CREATE POLICY "Service role can manage prompt atoms" 
    ON public.prompt_atoms FOR ALL USING (auth.jwt()->>'role' = 'service_role');
END $$;

-- ----------------------------------------------------------------------------
-- 4. CLEANUP & VERIFICATION
-- ----------------------------------------------------------------------------
-- Ensure all foreign keys are valid
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT conname, conrelid::regclass FROM pg_constraint WHERE confdeltype = 'a' LOOP
        RAISE NOTICE 'Constraint % on table % is set to NO ACTION on delete, which might leave orphans.', r.conname, r.conrelid;
    END LOOP;
END $$;
