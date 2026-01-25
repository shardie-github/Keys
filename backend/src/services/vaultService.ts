import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { encryptForTenant, decryptForTenant, getVaultMasterKey } from '../utils/cryptoVault.js';
import type { EncryptedData } from '../utils/cryptoVault.js';
import { logger } from '../utils/logger.js';
import { redactSecrets } from '../utils/redaction.js';

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

export interface Secret {
  id: string;
  user_id: string;
  org_id?: string | null;
  name: string;
  kind: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SecretVersion {
  id: string;
  secret_id: string;
  version: number;
  status: 'active' | 'inactive';
  ciphertext: string;
  iv: string;
  tag: string;
  key_version: string;
  created_at: string;
}

export interface SecretMetadata {
  id: string;
  name: string;
  kind: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  active_version?: number;
  last_rotated_at?: string;
}

export interface CreateSecretParams {
  userId: string;
  name: string;
  kind: string;
  plaintext: string;
  description?: string;
}

export interface RotateSecretParams {
  userId: string;
  secretId?: string;
  name?: string;
  plaintext: string;
}

/**
 * Check if vault is configured (master key exists)
 */
export function isVaultConfigured(): boolean {
  try {
    getVaultMasterKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a new secret
 */
export async function createSecret(params: CreateSecretParams): Promise<Secret> {
  const { userId, name, kind, plaintext, description } = params;

  if (!isVaultConfigured()) {
    throw new Error('Vault not configured. Set KEYS_VAULT_MASTER_KEY environment variable.');
  }

  // Check if secret with this name already exists
  const { data: existing } = await getSupabaseClient()
    .from('secrets')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .single();

  if (existing) {
    throw new Error(`Secret with name "${name}" already exists`);
  }

  // Create secret metadata
  const { data: secret, error: secretError } = await getSupabaseClient()
    .from('secrets')
    .insert({
      user_id: userId,
      name,
      kind,
      description,
    })
    .select()
    .single();

  if (secretError || !secret) {
    logger.error('Failed to create secret metadata', secretError, { userId, name: redactSecrets(name) });
    throw new Error('Failed to create secret');
  }

  // Encrypt and store first version
  try {
    const encrypted = encryptForTenant(plaintext, userId);

    const { error: versionError } = await getSupabaseClient()
      .from('secret_versions')
      .insert({
        secret_id: secret.id,
        version: 1,
        status: 'active',
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        tag: encrypted.tag,
        key_version: encrypted.keyVersion,
      });

    if (versionError) {
      // Rollback secret creation
      await getSupabaseClient()
        .from('secrets')
        .delete()
        .eq('id', secret.id);

      logger.error('Failed to create secret version', versionError, { userId, secretId: secret.id });
      throw new Error('Failed to create secret version');
    }

    logger.info('Secret created successfully', { userId, secretId: secret.id, name: redactSecrets(name), kind });

    return secret;
  } catch (error) {
    // Rollback secret creation
    await getSupabaseClient()
      .from('secrets')
      .delete()
      .eq('id', secret.id);

    throw error;
  }
}

/**
 * Rotate a secret (create new version, deactivate old)
 */
export async function rotateSecret(params: RotateSecretParams): Promise<SecretVersion> {
  const { userId, secretId, name, plaintext } = params;

  if (!isVaultConfigured()) {
    throw new Error('Vault not configured');
  }

  // Find secret by ID or name
  let secret: Secret;

  if (secretId) {
    const { data, error } = await getSupabaseClient()
      .from('secrets')
      .select('*')
      .eq('id', secretId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('Secret not found');
    }

    secret = data;
  } else if (name) {
    const { data, error } = await getSupabaseClient()
      .from('secrets')
      .select('*')
      .eq('user_id', userId)
      .eq('name', name)
      .single();

    if (error || !data) {
      throw new Error('Secret not found');
    }

    secret = data;
  } else {
    throw new Error('Must provide either secretId or name');
  }

  // Get current max version
  const { data: versions, error: versionsError } = await getSupabaseClient()
    .from('secret_versions')
    .select('version')
    .eq('secret_id', secret.id)
    .order('version', { ascending: false })
    .limit(1);

  if (versionsError) {
    throw new Error('Failed to fetch secret versions');
  }

  const nextVersion = versions && versions.length > 0 ? versions[0].version + 1 : 1;

  // Encrypt new version
  const encrypted = encryptForTenant(plaintext, userId);

  // Deactivate current active version
  await getSupabaseClient()
    .from('secret_versions')
    .update({ status: 'inactive' })
    .eq('secret_id', secret.id)
    .eq('status', 'active');

  // Create new version
  const { data: newVersion, error: newVersionError } = await getSupabaseClient()
    .from('secret_versions')
    .insert({
      secret_id: secret.id,
      version: nextVersion,
      status: 'active',
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      tag: encrypted.tag,
      key_version: encrypted.keyVersion,
    })
    .select()
    .single();

  if (newVersionError || !newVersion) {
    logger.error('Failed to create new secret version', newVersionError, { userId, secretId: secret.id });
    throw new Error('Failed to rotate secret');
  }

  logger.info('Secret rotated successfully', { userId, secretId: secret.id, newVersion: nextVersion });

  return newVersion;
}

/**
 * List all secrets for a user (metadata only, no plaintext)
 */
export async function listSecrets(userId: string): Promise<SecretMetadata[]> {
  const { data: secrets, error } = await getSupabaseClient()
    .from('secrets')
    .select(`
      *,
      secret_versions!inner(version, created_at, status)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to list secrets', error, { userId });
    throw new Error('Failed to list secrets');
  }

  if (!secrets) {
    return [];
  }

  // Transform to metadata format
  const metadata: SecretMetadata[] = secrets.map((secret: any) => {
    const activeVersion = secret.secret_versions.find((v: any) => v.status === 'active');
    const allVersions = secret.secret_versions || [];
    const lastRotated = allVersions.length > 0
      ? allVersions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
      : secret.created_at;

    return {
      id: secret.id,
      name: secret.name,
      kind: secret.kind,
      description: secret.description,
      created_at: secret.created_at,
      updated_at: secret.updated_at,
      active_version: activeVersion?.version,
      last_rotated_at: lastRotated,
    };
  });

  return metadata;
}

/**
 * Get secret value by name (SERVER-ONLY, never return to client)
 */
export async function getSecretValueByName(userId: string, secretName: string): Promise<string | null> {
  if (!isVaultConfigured()) {
    logger.warn('Vault not configured, cannot retrieve secret', { userId, secretName: redactSecrets(secretName) });
    return null;
  }

  try {
    // Find secret by name
    const { data: secret, error: secretError } = await getSupabaseClient()
      .from('secrets')
      .select('id')
      .eq('user_id', userId)
      .eq('name', secretName)
      .single();

    if (secretError || !secret) {
      logger.debug('Secret not found', { userId, secretName: redactSecrets(secretName) });
      return null;
    }

    // Get active version
    const { data: version, error: versionError } = await getSupabaseClient()
      .from('secret_versions')
      .select('*')
      .eq('secret_id', secret.id)
      .eq('status', 'active')
      .single();

    if (versionError || !version) {
      logger.warn('No active version found for secret', { userId, secretId: secret.id });
      return null;
    }

    // Decrypt
    const encrypted: EncryptedData = {
      ciphertext: version.ciphertext,
      iv: version.iv,
      tag: version.tag,
      keyVersion: version.key_version,
    };

    const plaintext = decryptForTenant(encrypted, userId);

    return plaintext;
  } catch (error) {
    logger.error('Failed to retrieve secret', error as Error, { userId, secretName: redactSecrets(secretName) });
    return null;
  }
}

/**
 * Resolve secret reference (e.g., "secret://openai/default")
 * Returns plaintext if found, null otherwise
 */
export async function resolveSecretRef(userId: string, ref: string): Promise<string | null> {
  if (!ref.startsWith('secret://')) {
    return ref; // Not a secret reference
  }

  // Extract secret name from reference
  // Format: secret://name or secret://category/name
  const secretName = ref.replace('secret://', '');

  return getSecretValueByName(userId, secretName);
}

/**
 * Delete a secret (and all its versions)
 */
export async function deleteSecret(userId: string, secretId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('secrets')
    .delete()
    .eq('id', secretId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Failed to delete secret', error, { userId, secretId });
    throw new Error('Failed to delete secret');
  }

  logger.info('Secret deleted successfully', { userId, secretId });
}

/**
 * Get secret by ID (metadata only)
 */
export async function getSecret(userId: string, secretId: string): Promise<Secret | null> {
  const { data, error } = await getSupabaseClient()
    .from('secrets')
    .select('*')
    .eq('id', secretId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
