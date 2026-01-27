import crypto from 'crypto';

/**
 * Crypto Vault Utilities
 * Provides AES-256-GCM encryption with HKDF key derivation for per-tenant encryption
 */

export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string; // Base64
  tag: string; // Base64
  keyVersion: string;
}

export interface VaultConfig {
  masterKey: Buffer;
  keyVersion?: string;
}

/**
 * Get vault master key from environment
 */
export function getVaultMasterKey(): Buffer {
  const masterKeyBase64 = process.env.KEYS_VAULT_MASTER_KEY;

  if (!masterKeyBase64) {
    throw new Error('KEYS_VAULT_MASTER_KEY environment variable is not set');
  }

  try {
    const masterKey = Buffer.from(masterKeyBase64, 'base64');

    if (masterKey.length !== 32) {
      throw new Error('KEYS_VAULT_MASTER_KEY must be exactly 32 bytes (256 bits)');
    }

    return masterKey;
  } catch (error) {
    throw new Error('Failed to decode KEYS_VAULT_MASTER_KEY: must be valid base64-encoded 32 bytes');
  }
}

/**
 * Get current key version from environment
 */
export function getKeyVersion(): string {
  return process.env.KEYS_VAULT_KEY_VERSION || '1';
}

/**
 * Derive per-tenant encryption key using HKDF
 * This ensures each tenant has a unique encryption key derived from the master key
 */
export function deriveTenantKey(masterKey: Buffer, tenantId: string): Buffer {
  const salt = crypto
    .createHash('sha256')
    .update(tenantId)
    .digest();

  const info = Buffer.from('keys-vault-v1', 'utf8');

// HKDF using HMAC-SHA256
  // Length: 32 bytes for AES-256
  const key = Buffer.from(crypto.hkdfSync('sha256', masterKey, salt, info, 32));

  return key;
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns ciphertext, IV, and authentication tag
 */
export function encrypt(
  plaintext: string,
  tenantKey: Buffer
): EncryptedData {
  // Generate random IV (12 bytes is standard for GCM)
  const iv = crypto.randomBytes(12);

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', tenantKey, iv);

  // Encrypt
  const plaintextBuffer = Buffer.from(plaintext, 'utf8');
  const ciphertext = Buffer.concat([
    cipher.update(plaintextBuffer),
    cipher.final(),
  ]);

  // Get authentication tag (16 bytes for GCM)
  const tag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    keyVersion: getKeyVersion(),
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * Verifies authentication tag to detect tampering
 */
export function decrypt(
  encrypted: EncryptedData,
  tenantKey: Buffer
): string {
  try {
    // Decode from base64
    const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
    const iv = Buffer.from(encrypted.iv, 'base64');
    const tag = Buffer.from(encrypted.tag, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', tenantKey, iv);

    // Set authentication tag
    decipher.setAuthTag(tag);

    // Decrypt
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return plaintext.toString('utf8');
  } catch (error) {
    throw new Error('Decryption failed: data may be corrupted or tampered with');
  }
}

/**
 * High-level encrypt for a tenant
 * Combines master key derivation + encryption
 */
export function encryptForTenant(
  plaintext: string,
  tenantId: string,
  masterKey?: Buffer
): EncryptedData {
  const key = masterKey || getVaultMasterKey();
  const tenantKey = deriveTenantKey(key, tenantId);
  return encrypt(plaintext, tenantKey);
}

/**
 * High-level decrypt for a tenant
 * Combines master key derivation + decryption
 */
export function decryptForTenant(
  encrypted: EncryptedData,
  tenantId: string,
  masterKey?: Buffer
): string {
  const key = masterKey || getVaultMasterKey();
  const tenantKey = deriveTenantKey(key, tenantId);
  return decrypt(encrypted, tenantKey);
}

/**
 * Generate a cryptographically secure random token
 * Used for API key generation
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Generate API key with prefix
 * Format: {prefix}_{random_token}
 */
export function generateApiKey(prefix: string = 'kx_live'): string {
  const token = generateSecureToken(32);
  return `${prefix}_${token}`;
}

/**
 * Hash API key using SHA-256
 * We use SHA-256 instead of Argon2id for API keys because:
 * 1. API keys are already high-entropy random tokens (not user passwords)
 * 2. SHA-256 is faster for verification (API key auth is on critical path)
 * 3. HMAC-SHA256 provides sufficient security for random tokens
 */
export function hashApiKey(apiKey: string): string {
  const hmac = crypto.createHmac('sha256', getVaultMasterKey());
  hmac.update(apiKey);
  return hmac.digest('hex');
}

/**
 * Verify API key against hash
 */
export function verifyApiKey(apiKey: string, hash: string): boolean {
  const computedHash = hashApiKey(apiKey);
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(hash)
  );
}
