-- Create agent_runs table
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Run Metadata
  trigger TEXT,  -- 'manual', 'event', 'schedule', 'chat_input'
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

-- Create indexes
CREATE INDEX idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX idx_agent_runs_created ON agent_runs(created_at DESC);
CREATE INDEX idx_agent_runs_trigger ON agent_runs(trigger);
CREATE INDEX idx_agent_runs_feedback ON agent_runs(user_feedback);
