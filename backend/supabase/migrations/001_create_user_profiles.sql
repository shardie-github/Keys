-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Core Profile
  name TEXT,
  role TEXT,  -- 'operator', 'marketer', 'builder', 'educator', 'founder'
  vertical TEXT,  -- 'ecommerce', 'edtech', 'saas', 'agency'
  
  -- Stack Preferences (JSON)
  stack JSONB DEFAULT '{
    "shopify": true,
    "supabase": true,
    "mindstudio": true,
    "capcut": false,
    "stripe": false,
    "zapier": true
  }',
  
  -- Vibe Preferences
  tone TEXT DEFAULT 'balanced',  -- 'playful', 'serious', 'technical', 'casual'
  risk_tolerance TEXT DEFAULT 'moderate',  -- 'conservative', 'moderate', 'aggressive'
  kpi_focus TEXT DEFAULT 'revenue',  -- 'revenue', 'efficiency', 'growth', 'impact'
  perspective TEXT DEFAULT 'operator',  -- 'operator', 'investor', 'cfo', 'strategic'
  
  -- Behavior Embeddings (OpenAI vector for similarity search)
  behavior_embedding VECTOR(1536),
  
  -- Metadata
  brand_voice TEXT,
  company_context TEXT,
  preferred_models JSONB DEFAULT '["gpt-4-turbo", "claude-3-opus"]',
  timezone TEXT DEFAULT 'UTC'
);

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_vertical ON user_profiles(vertical);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
