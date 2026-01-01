-- Add Pro+ tier support to subscription_tier
-- This migration updates the subscription_tier constraint to include 'pro+'

-- Drop the existing check constraint
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;

-- Add new check constraint with 'pro+' tier
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'pro', 'pro+', 'enterprise'));

-- Add columns for guarantee tracking and usage-based pricing
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS prevented_failures_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS guarantee_coverage TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS integration_access TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add index for prevented_failures_count (for usage-based pricing queries)
CREATE INDEX IF NOT EXISTS idx_user_profiles_prevented_failures ON user_profiles(prevented_failures_count);

-- Add comment explaining the tiers
COMMENT ON COLUMN user_profiles.subscription_tier IS 'Subscription tier: free (50 runs/month), pro ($29/month with guarantees), pro+ ($79/month with IDE/CI/CD), enterprise (custom pricing with SLA)';
COMMENT ON COLUMN user_profiles.prevented_failures_count IS 'Count of failures prevented by Keys (for usage-based pricing in Enterprise tier)';
COMMENT ON COLUMN user_profiles.guarantee_coverage IS 'Array of guarantee types: security, compliance, quality, sla';
COMMENT ON COLUMN user_profiles.integration_access IS 'Array of integration types: ide, cicd';
