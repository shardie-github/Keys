-- Create background_events table
CREATE TABLE background_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Event Metadata
  event_type TEXT,  -- 'shopify.product.created', 'supabase.schema.changed'
  source TEXT,  -- 'shopify', 'supabase', 'calendar', 'manual'
  event_data JSONB,
  event_timestamp TIMESTAMP,
  
  -- Processing
  suggestion_generated BOOLEAN DEFAULT false,
  suggestion_id UUID,
  user_actioned BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX idx_background_events_user_id ON background_events(user_id);
CREATE INDEX idx_background_events_type ON background_events(event_type);
CREATE INDEX idx_background_events_source ON background_events(source);
CREATE INDEX idx_background_events_created ON background_events(created_at DESC);
CREATE INDEX idx_background_events_actioned ON background_events(user_actioned);
