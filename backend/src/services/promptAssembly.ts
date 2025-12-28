import { createClient } from '@supabase/supabase-js';
import type { UserProfile, PromptAtom, VibeConfig, PromptAssemblyResult } from '../types/index.js';
import { sliderToAtomName } from '../utils/sliderInterpolation.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function assemblePrompt(
  userId: string,
  taskDescription: string,
  vibeConfig: Partial<VibeConfig>
): Promise<PromptAssemblyResult> {
  // 1. Load user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found');
  }

  // 2. Filter atoms by compatibility with user's role + vertical
  const { data: allAtoms, error: atomsError } = await supabase
    .from('prompt_atoms')
    .select('*')
    .eq('active', true);

  if (atomsError) {
    throw new Error('Failed to fetch prompt atoms');
  }

  // Filter by role and vertical
  let roleAtoms = allAtoms || [];
  if (profile.role) {
    roleAtoms = roleAtoms.filter(
      (atom) =>
        !atom.target_roles || atom.target_roles.length === 0 || atom.target_roles.includes(profile.role!)
    );
  }

  if (profile.vertical) {
    roleAtoms = roleAtoms.filter(
      (atom) =>
        !atom.target_verticals ||
        atom.target_verticals.length === 0 ||
        atom.target_verticals.includes(profile.vertical!)
    );
  }

  // Filter by stack
  const stackAtoms = roleAtoms.filter((atom) => {
    if (atom.category !== 'stack') return true;
    const stackName = atom.name.split('.')[1];
    return profile.stack?.[stackName] === true;
  });

  // 3. Map slider values to atom selections
  const toneAtomName = sliderToAtomName('playfulness', vibeConfig.playfulness || 50);
  const revenueAtomName = sliderToAtomName('revenueFocus', vibeConfig.revenue_focus || 60);
  const perspectiveAtomName = sliderToAtomName(
    'investorPerspective',
    vibeConfig.investor_perspective || 40
  );

  // Find atoms by name
  const toneAtom = stackAtoms.find((a) => a.name === toneAtomName);
  const revenueAtom = stackAtoms.find((a) => a.name === revenueAtomName);
  const perspectiveAtom = stackAtoms.find((a) => a.name === perspectiveAtomName);

  // 4. Infer task-specific atoms from natural language
  const taskAtoms = await inferTaskAtoms(taskDescription, profile.vertical || '', stackAtoms);

  // 5. Combine and weight by success rate
  const candidateAtoms: PromptAtom[] = [];
  if (toneAtom) candidateAtoms.push(toneAtom);
  if (revenueAtom) candidateAtoms.push(revenueAtom);
  if (perspectiveAtom) candidateAtoms.push(perspectiveAtom);
  candidateAtoms.push(...taskAtoms);

  // Remove duplicates
  const uniqueAtoms = Array.from(
    new Map(candidateAtoms.map((atom) => [atom.id, atom])).values()
  );

  const weightedAtoms = uniqueAtoms.map((atom) => ({
    ...atom,
    finalWeight: atom.weight * (atom.success_rate || 0.5),
  }));

  // Sort by weight
  weightedAtoms.sort((a, b) => b.finalWeight - a.finalWeight);

  // 6. Compose final system prompt from atoms
  const systemPrompt = composeSystemPrompt(weightedAtoms);

  // 7. Compose user prompt from task + profile context
  const userPrompt = composeUserPrompt(taskDescription, profile, vibeConfig);

  // 8. Return assembled prompt + metadata
  return {
    systemPrompt,
    userPrompt,
    context: {
      userRole: profile.role,
      userVertical: profile.vertical,
      userStack: profile.stack as Record<string, boolean>,
      executionConstraints: extractConstraints(weightedAtoms),
    },
    selectedAtomIds: weightedAtoms.map((a) => a.id),
    blendRecipe: weightedAtoms.map((a, index) => ({
      id: a.id,
      name: a.name,
      weight: a.finalWeight,
      influence:
        index < 2 ? 'primary' : index < 4 ? 'secondary' : ('modifier' as const),
    })),
  };
}

async function inferTaskAtoms(
  taskDescription: string,
  vertical: string,
  availableAtoms: PromptAtom[]
): Promise<PromptAtom[]> {
  const lowerTask = taskDescription.toLowerCase();
  const inferred: PromptAtom[] = [];

  // Channel inference
  if (lowerTask.includes('tiktok')) {
    const atom = availableAtoms.find((a) => a.name === 'channel.tiktok_ads');
    if (atom) inferred.push(atom);
  }
  if (lowerTask.includes('email')) {
    const atom = availableAtoms.find((a) => a.name === 'channel.email');
    if (atom) inferred.push(atom);
  }
  if (lowerTask.includes('product') && lowerTask.includes('copy')) {
    const atom = availableAtoms.find((a) => a.name === 'channel.product_copy');
    if (atom) inferred.push(atom);
  }

  // Stack inference
  if (lowerTask.includes('shopify')) {
    const atom = availableAtoms.find((a) => a.name === 'stack.shopify_2_0');
    if (atom) inferred.push(atom);
  }
  if (lowerTask.includes('supabase') || lowerTask.includes('database')) {
    const atom = availableAtoms.find((a) => a.name === 'stack.supabase');
    if (atom) inferred.push(atom);
  }

  return inferred;
}

function composeSystemPrompt(atoms: Array<PromptAtom & { finalWeight: number }>): string {
  const primaryAtoms = atoms.slice(0, 3);
  const secondaryAtoms = atoms.slice(3, 6);

  let prompt = 'You are an AI assistant specialized in helping business operators and creators.\n\n';

  // Add primary atoms
  for (const atom of primaryAtoms) {
    if (atom.system_prompt) {
      prompt += `${atom.system_prompt}\n\n`;
    }
  }

  // Add secondary atoms as modifiers
  if (secondaryAtoms.length > 0) {
    prompt += 'Additional context:\n';
    for (const atom of secondaryAtoms) {
      if (atom.system_prompt) {
        prompt += `- ${atom.system_prompt}\n`;
      }
    }
  }

  return prompt.trim();
}

function composeUserPrompt(
  taskDescription: string,
  profile: UserProfile,
  vibeConfig: Partial<VibeConfig>
): string {
  let prompt = taskDescription;

  // Add profile context
  if (profile.company_context) {
    prompt += `\n\nCompany context: ${profile.company_context}`;
  }

  if (profile.brand_voice) {
    prompt += `\n\nBrand voice: ${profile.brand_voice}`;
  }

  // Add custom instructions from vibe config
  if (vibeConfig.custom_instructions) {
    prompt += `\n\nAdditional instructions: ${vibeConfig.custom_instructions}`;
  }

  return prompt;
}

function extractConstraints(
  atoms: Array<PromptAtom & { finalWeight: number }>
): Record<string, any> {
  const constraints: Record<string, any> = {};

  for (const atom of atoms) {
    if (atom.constraints) {
      Object.assign(constraints, atom.constraints);
    }
  }

  return constraints;
}
