import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { generateApiKey, hashApiKey, verifyApiKey } from '../utils/cryptoVault.js';
import { logger } from '../utils/logger.js';
import { redactSecrets, partialRedact } from '../utils/redaction.js';

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

export interface ApiKey {
  id: string;
  user_id: string;
  org_id?: string | null;
  name: string;
  prefix: string;
  hashed_key: string;
  scopes: string[];
  status: 'active' | 'revoked';
  last_used_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyMetadata {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: 'active' | 'revoked';
  last_used_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  partial_key: string; // e.g., "kx_live_abcd...wxyz"
}

export interface CreateApiKeyParams {
  userId: string;
  name: string;
  prefix?: 'kx_live' | 'kx_test';
  scopes?: string[];
  expiresAt?: Date;
}

export interface CreateApiKeyResult {
  token: string; // Full API key - SHOW ONLY ONCE
  metadata: ApiKeyMetadata;
}

export interface VerifiedApiKey {
  userId: string;
  apiKeyId: string;
  scopes: string[];
}

/**
 * Create a new API key
 * Returns the full token ONCE - it will never be shown again
 */
export async function createApiKey(params: CreateApiKeyParams): Promise<CreateApiKeyResult> {
  const {
    userId,
    name,
    prefix = 'kx_live',
    scopes = [],
    expiresAt,
  } = params;

  // Generate token
  const token = generateApiKey(prefix);
  const hashedKey = hashApiKey(token);

  // Store in database
  const { data: apiKey, error } = await getSupabaseClient()
    .from('api_keys')
    .insert({
      user_id: userId,
      name,
      prefix,
      hashed_key: hashedKey,
      scopes,
      status: 'active',
      expires_at: expiresAt?.toISOString(),
    })
    .select()
    .single();

  if (error || !apiKey) {
    logger.error('Failed to create API key', error, { userId, name });
    throw new Error('Failed to create API key');
  }

  logger.info('API key created successfully', {
    userId,
    apiKeyId: apiKey.id,
    name,
    prefix,
  });

  // Extract visible portion for display
  const parts = token.split('_');
  const tokenPart = parts[parts.length - 1];
  const visiblePortion = `${prefix}_${tokenPart.substring(0, 4)}...${tokenPart.substring(tokenPart.length - 4)}`;

  return {
    token, // Return full token ONCE
    metadata: {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      scopes: apiKey.scopes,
      status: apiKey.status,
      last_used_at: apiKey.last_used_at,
      expires_at: apiKey.expires_at,
      created_at: apiKey.created_at,
      partial_key: visiblePortion,
    },
  };
}

/**
 * Verify an API key token and return user context
 * Returns null if invalid or revoked
 */
export async function verifyApiKeyToken(token: string): Promise<VerifiedApiKey | null> {
  try {
    const hashedKey = hashApiKey(token);

    // Find API key by hash
    const { data: apiKey, error } = await getSupabaseClient()
      .from('api_keys')
      .select('*')
      .eq('hashed_key', hashedKey)
      .eq('status', 'active')
      .single();

    if (error || !apiKey) {
      logger.debug('API key not found or revoked', { hashedKey: partialRedact(hashedKey) });
      return null;
    }

    // Check expiration
    if (apiKey.expires_at) {
      const expiresAt = new Date(apiKey.expires_at);
      if (expiresAt < new Date()) {
        logger.warn('API key expired', { apiKeyId: apiKey.id, userId: apiKey.user_id });
        return null;
      }
    }

    // Update last_used_at (fire and forget)
    getSupabaseClient()
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKey.id)
      .then(() => {
        // Silent update
      })
      .catch((err) => {
        logger.error('Failed to update last_used_at', err, { apiKeyId: apiKey.id });
      });

    return {
      userId: apiKey.user_id,
      apiKeyId: apiKey.id,
      scopes: apiKey.scopes,
    };
  } catch (error) {
    logger.error('API key verification error', error as Error, {
      token: redactSecrets(token),
    });
    return null;
  }
}

/**
 * List all API keys for a user (metadata only, no tokens)
 */
export async function listApiKeys(userId: string): Promise<ApiKeyMetadata[]> {
  const { data: apiKeys, error } = await getSupabaseClient()
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to list API keys', error, { userId });
    throw new Error('Failed to list API keys');
  }

  if (!apiKeys) {
    return [];
  }

  return apiKeys.map((key: ApiKey) => ({
    id: key.id,
    name: key.name,
    prefix: key.prefix,
    scopes: key.scopes,
    status: key.status,
    last_used_at: key.last_used_at,
    expires_at: key.expires_at,
    created_at: key.created_at,
    partial_key: `${key.prefix}_****`,
  }));
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('api_keys')
    .update({ status: 'revoked' })
    .eq('id', apiKeyId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Failed to revoke API key', error, { userId, apiKeyId });
    throw new Error('Failed to revoke API key');
  }

  logger.info('API key revoked successfully', { userId, apiKeyId });
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(userId: string, apiKeyId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('api_keys')
    .delete()
    .eq('id', apiKeyId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Failed to delete API key', error, { userId, apiKeyId });
    throw new Error('Failed to delete API key');
  }

  logger.info('API key deleted successfully', { userId, apiKeyId });
}

/**
 * Get API key by ID (metadata only)
 */
export async function getApiKey(userId: string, apiKeyId: string): Promise<ApiKeyMetadata | null> {
  const { data: apiKey, error } = await getSupabaseClient()
    .from('api_keys')
    .select('*')
    .eq('id', apiKeyId)
    .eq('user_id', userId)
    .single();

  if (error || !apiKey) {
    return null;
  }

  return {
    id: apiKey.id,
    name: apiKey.name,
    prefix: apiKey.prefix,
    scopes: apiKey.scopes,
    status: apiKey.status,
    last_used_at: apiKey.last_used_at,
    expires_at: apiKey.expires_at,
    created_at: apiKey.created_at,
    partial_key: `${apiKey.prefix}_****`,
  };
}
