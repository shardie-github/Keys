import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

let supabaseClient: SupabaseClient<any> | null = null;

function getSupabaseClient(): SupabaseClient<any> {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase configuration missing');
  }

  supabaseClient = createClient<any>(url, key) as SupabaseClient<any>;
  return supabaseClient;
}

export interface PersonaCanonical {
  name: string;
  description?: string;
  system: string; // Core system prompt
  skills?: Array<{ name: string; description: string; usage?: string }>;
  invariants?: string[]; // Hard constraints
  examples?: Array<{ input: string; output: string }>;
  default_provider?: string;
  default_model?: string;
  metadata?: Record<string, any>;
}

export interface PersonaPack {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string | null;
  canonical_json: PersonaCanonical;
  render_claude?: string | null;
  render_openai?: any | null;
  render_agent_md?: string | null;
  default_provider?: string | null;
  default_model?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportPersonaParams {
  userId: string;
  input: string | PersonaCanonical;
  format?: 'json' | 'markdown' | 'auto';
}

export interface ExportPersonaParams {
  userId: string;
  personaId: string;
  format: 'canonical' | 'claude' | 'openai' | 'agent_md';
}

/**
 * Generate slug from name
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse input string to canonical JSON
 */
function parsePersonaInput(input: string, format: 'json' | 'markdown' | 'auto'): PersonaCanonical {
  if (format === 'json' || (format === 'auto' && input.trim().startsWith('{'))) {
    // Parse as JSON
    try {
      const parsed = JSON.parse(input);

      // Validate required fields
      if (!parsed.name) {
        throw new Error('Persona must have a name');
      }
      if (!parsed.system) {
        throw new Error('Persona must have a system prompt');
      }

      return parsed as PersonaCanonical;
    } catch (error) {
      throw new Error(`Invalid JSON: ${(error as Error).message}`);
    }
  } else {
    // Parse as Markdown
    // Simple extraction: treat everything as system prompt
    const lines = input.split('\n');
    let name = 'Imported Persona';
    let description = '';
    let system = input;

    // Try to extract # Title as name
    const titleMatch = input.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      name = titleMatch[1];
      // Remove title from system
      system = input.replace(/^#\s+.+$/m, '').trim();
    }

    // Try to extract description from first paragraph
    const paragraphs = system.split('\n\n');
    if (paragraphs.length > 1) {
      description = paragraphs[0].trim();
      system = paragraphs.slice(1).join('\n\n').trim();
    }

    return {
      name,
      description,
      system,
    };
  }
}

/**
 * Render persona as Claude system prompt
 */
function renderClaude(canonical: PersonaCanonical): string {
  let prompt = canonical.system;

  // Add skills
  if (canonical.skills && canonical.skills.length > 0) {
    prompt += '\n\n## Skills\n\n';
    for (const skill of canonical.skills) {
      prompt += `### ${skill.name}\n${skill.description}\n`;
      if (skill.usage) {
        prompt += `Usage: ${skill.usage}\n`;
      }
      prompt += '\n';
    }
  }

  // Add invariants
  if (canonical.invariants && canonical.invariants.length > 0) {
    prompt += '\n## Invariants\n\n';
    for (const invariant of canonical.invariants) {
      prompt += `- ${invariant}\n`;
    }
  }

  // Add examples
  if (canonical.examples && canonical.examples.length > 0) {
    prompt += '\n\n## Examples\n\n';
    for (let i = 0; i < canonical.examples.length; i++) {
      const example = canonical.examples[i];
      prompt += `### Example ${i + 1}\n\n`;
      prompt += `**Input:** ${example.input}\n\n`;
      prompt += `**Output:** ${example.output}\n\n`;
    }
  }

  return prompt;
}

/**
 * Render persona as OpenAI messages array
 */
function renderOpenAI(canonical: PersonaCanonical): any[] {
  const claudePrompt = renderClaude(canonical);

  return [
    { role: 'system', content: claudePrompt },
  ];
}

/**
 * Render persona as Cursor AGENT.md format
 */
function renderAgentMd(canonical: PersonaCanonical): string {
  let md = `# ${canonical.name}\n\n`;

  if (canonical.description) {
    md += `${canonical.description}\n\n`;
  }

  md += `## System Prompt\n\n${canonical.system}\n\n`;

  // Skills
  if (canonical.skills && canonical.skills.length > 0) {
    md += '## Skills\n\n';
    for (const skill of canonical.skills) {
      md += `### ${skill.name}\n\n${skill.description}\n\n`;
      if (skill.usage) {
        md += `**Usage:** ${skill.usage}\n\n`;
      }
    }
  }

  // Invariants
  if (canonical.invariants && canonical.invariants.length > 0) {
    md += '## Invariants\n\n';
    for (const invariant of canonical.invariants) {
      md += `- ${invariant}\n`;
    }
    md += '\n';
  }

  return md;
}

/**
 * Import a persona pack
 */
export async function importPersonaPack(params: ImportPersonaParams): Promise<PersonaPack> {
  const { userId, input, format = 'auto' } = params;

  // Parse input
  let canonical: PersonaCanonical;

  if (typeof input === 'string') {
    canonical = parsePersonaInput(input, format);
  } else {
    canonical = input;
  }

  // Generate slug
  const slug = slugify(canonical.name);

  // Check if slug already exists
  const { data: existing } = await getSupabaseClient()
    .from('persona_packs')
    .select('id')
    .eq('user_id', userId)
    .eq('slug', slug)
    .single();

  if (existing) {
    throw new Error(`Persona with slug "${slug}" already exists`);
  }

  // Render variants
  const renderClaude_ = renderClaude(canonical);
  const renderOpenAI_ = renderOpenAI(canonical);
  const renderAgentMd_ = renderAgentMd(canonical);

  // Create persona pack
  const { data: personaPack, error } = await getSupabaseClient()
    .from('persona_packs')
    .insert({
      user_id: userId,
      name: canonical.name,
      slug,
      description: canonical.description,
      canonical_json: canonical,
      render_claude: renderClaude_,
      render_openai: renderOpenAI_,
      render_agent_md: renderAgentMd_,
      default_provider: canonical.default_provider,
      default_model: canonical.default_model,
    })
    .select()
    .single();

  if (error || !personaPack) {
    logger.error('Failed to import persona pack', error, { userId, name: canonical.name });
    throw new Error('Failed to import persona pack');
  }

  logger.info('Persona pack imported successfully', { userId, personaId: personaPack.id, name: canonical.name });

  return personaPack;
}

/**
 * List persona packs for a user
 */
export async function listPersonaPacks(userId: string): Promise<PersonaPack[]> {
  const { data: personas, error } = await getSupabaseClient()
    .from('persona_packs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to list persona packs', error, { userId });
    throw new Error('Failed to list persona packs');
  }

  return personas || [];
}

/**
 * Get persona pack by ID
 */
export async function getPersonaPack(userId: string, personaId: string): Promise<PersonaPack | null> {
  const { data, error } = await getSupabaseClient()
    .from('persona_packs')
    .select('*')
    .eq('id', personaId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Export persona pack in specified format
 */
export async function exportPersonaPack(params: ExportPersonaParams): Promise<string | any> {
  const { userId, personaId, format } = params;

  const persona = await getPersonaPack(userId, personaId);

  if (!persona) {
    throw new Error('Persona pack not found');
  }

  switch (format) {
    case 'canonical':
      return JSON.stringify(persona.canonical_json, null, 2);

    case 'claude':
      return persona.render_claude || renderClaude(persona.canonical_json);

    case 'openai':
      return JSON.stringify(persona.render_openai || renderOpenAI(persona.canonical_json), null, 2);

    case 'agent_md':
      return persona.render_agent_md || renderAgentMd(persona.canonical_json);

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Activate a persona for a user (set as default)
 */
export async function activatePersona(userId: string, personaId: string): Promise<void> {
  // Verify persona exists and belongs to user
  const persona = await getPersonaPack(userId, personaId);

  if (!persona) {
    throw new Error('Persona pack not found');
  }

  // Update user profile
  const { error } = await getSupabaseClient()
    .from('user_profiles')
    .update({
      default_persona_id: personaId,
      default_provider: persona.default_provider,
      default_model: persona.default_model,
    })
    .eq('user_id', userId);

  if (error) {
    logger.error('Failed to activate persona', error, { userId, personaId });
    throw new Error('Failed to activate persona');
  }

  logger.info('Persona activated successfully', { userId, personaId });
}

/**
 * Delete a persona pack
 */
export async function deletePersonaPack(userId: string, personaId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('persona_packs')
    .delete()
    .eq('id', personaId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Failed to delete persona pack', error, { userId, personaId });
    throw new Error('Failed to delete persona pack');
  }

  logger.info('Persona pack deleted successfully', { userId, personaId });
}

/**
 * Get active persona for user (from profile)
 */
export async function getActivePersona(userId: string): Promise<PersonaPack | null> {
  // Get user profile
  const { data: profile, error: profileError } = await getSupabaseClient()
    .from('user_profiles')
    .select('default_persona_id')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile || !profile.default_persona_id) {
    return null;
  }

  // Get persona pack
  return getPersonaPack(userId, profile.default_persona_id);
}
