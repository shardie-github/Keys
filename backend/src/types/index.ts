// User Profile Types
export interface UserProfile {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  name?: string;
  role?: 'operator' | 'marketer' | 'builder' | 'educator' | 'founder';
  vertical?: 'ecommerce' | 'edtech' | 'saas' | 'agency' | 'finance' | 'other';
  stack: {
    shopify?: boolean;
    supabase?: boolean;
    mindstudio?: boolean;
    capcut?: boolean;
    stripe?: boolean;
    zapier?: boolean;
    [key: string]: boolean | undefined;
  };
  tone?: 'playful' | 'serious' | 'technical' | 'casual' | 'balanced';
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
  kpi_focus?: 'revenue' | 'efficiency' | 'growth' | 'impact';
  perspective?: 'operator' | 'investor' | 'cfo' | 'strategic';
  behavior_embedding?: number[];
  brand_voice?: string;
  company_context?: string;
  preferred_models?: string[];
  timezone?: string;
}

// Prompt Atom Types
export interface PromptAtom {
  id: string;
  created_at: string;
  name: string;
  category: 'tone' | 'stack' | 'channel' | 'constraint' | 'example' | 'perspective' | 'goal' | 'risk';
  version: number;
  system_prompt?: string;
  constraints?: Record<string, any>;
  examples?: any[];
  weight: number;
  compatible_atoms?: string[];
  target_roles?: string[];
  target_verticals?: string[];
  usage_count: number;
  success_rate: number;
  active: boolean;
}

// Vibe Config Types
export interface VibeConfig {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  name?: string;
  playfulness: number;
  revenue_focus: number;
  investor_perspective: number;
  selected_atoms?: string[];
  custom_instructions?: string;
  auto_suggest: boolean;
  approval_required: boolean;
  logging_level: 'standard' | 'verbose' | 'minimal';
}

// Agent Run Types
export interface AgentRun {
  id: string;
  user_id: string;
  created_at: string;
  trigger: 'manual' | 'event' | 'schedule' | 'chat_input';
  trigger_data?: Record<string, any>;
  assembled_prompt?: string;
  selected_atoms?: string[];
  vibe_config_snapshot?: Partial<VibeConfig>;
  agent_type: 'suggestion' | 'generator' | 'orchestrator';
  model_used?: string;
  generated_content?: Record<string, any>;
  user_feedback?: 'approved' | 'rejected' | 'revised';
  feedback_detail?: string;
  tokens_used?: number;
  latency_ms?: number;
  cost_usd?: number;
}

// Background Event Types
export interface BackgroundEvent {
  id: string;
  user_id: string;
  created_at: string;
  event_type: string;
  source: 'shopify' | 'supabase' | 'calendar' | 'manual';
  event_data?: Record<string, any>;
  event_timestamp?: string;
  suggestion_generated: boolean;
  suggestion_id?: string;
  user_actioned: boolean;
}

// Agent Output Types
export type OutputType =
  | 'prompt_refinement'
  | 'content_generation'
  | 'agent_scaffold'
  | 'workflow_recommendation'
  | 'data_insight'
  | 'code_snippet';

export interface AgentOutput {
  outputType: OutputType;
  content: string | Record<string, any>;
  requiresApproval: boolean;
  editableFields: string[];
  generatedAt: string;
  modelUsed: string;
  tokensUsed: number;
  costUsd: number;
}

// Task Intent Types
export interface TaskIntent {
  task: string;
  channel?: string;
  asset?: string;
  context?: string;
  tools?: string[];
}
