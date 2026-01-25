import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';
import {
  encryptForTenant,
  decryptForTenant,
  deriveTenantKey,
  generateApiKey,
  hashApiKey,
  verifyApiKey,
} from '../../../src/utils/cryptoVault.js';

describe('cryptoVault', () => {
  let testMasterKey: Buffer;

  beforeAll(() => {
    // Generate a test master key (32 bytes)
    testMasterKey = crypto.randomBytes(32);
    // Set it in environment for tests
    process.env.KEYS_VAULT_MASTER_KEY = testMasterKey.toString('base64');
  });

  describe('encryption and decryption', () => {
    it('should encrypt and decrypt plaintext successfully', () => {
      const tenantId = 'user123';
      const plaintext = 'my-secret-api-key';

      const encrypted = encryptForTenant(plaintext, tenantId, testMasterKey);

      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      expect(encrypted).toHaveProperty('keyVersion');

      const decrypted = decryptForTenant(encrypted, tenantId, testMasterKey);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext (random IV)', () => {
      const tenantId = 'user123';
      const plaintext = 'my-secret-api-key';

      const encrypted1 = encryptForTenant(plaintext, tenantId, testMasterKey);
      const encrypted2 = encryptForTenant(plaintext, tenantId, testMasterKey);

      // IVs should be different (random)
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      // But both should decrypt to the same plaintext
      expect(decryptForTenant(encrypted1, tenantId, testMasterKey)).toBe(plaintext);
      expect(decryptForTenant(encrypted2, tenantId, testMasterKey)).toBe(plaintext);
    });

    it('should fail decryption with wrong tenant ID', () => {
      const tenantId1 = 'user123';
      const tenantId2 = 'user456';
      const plaintext = 'my-secret-api-key';

      const encrypted = encryptForTenant(plaintext, tenantId1, testMasterKey);

      expect(() => {
        decryptForTenant(encrypted, tenantId2, testMasterKey);
      }).toThrow('Decryption failed');
    });

    it('should fail decryption with tampered ciphertext', () => {
      const tenantId = 'user123';
      const plaintext = 'my-secret-api-key';

      const encrypted = encryptForTenant(plaintext, tenantId, testMasterKey);

      // Tamper with ciphertext
      const tampered = { ...encrypted };
      const ciphertextBuffer = Buffer.from(encrypted.ciphertext, 'base64');
      ciphertextBuffer[0] = ciphertextBuffer[0] ^ 0xFF; // Flip bits
      tampered.ciphertext = ciphertextBuffer.toString('base64');

      expect(() => {
        decryptForTenant(tampered, tenantId, testMasterKey);
      }).toThrow('Decryption failed');
    });
  });

  describe('tenant key derivation', () => {
    it('should derive deterministic keys for same tenant', () => {
      const tenantId = 'user123';

      const key1 = deriveTenantKey(testMasterKey, tenantId);
      const key2 = deriveTenantKey(testMasterKey, tenantId);

      expect(key1.equals(key2)).toBe(true);
    });

    it('should derive different keys for different tenants', () => {
      const key1 = deriveTenantKey(testMasterKey, 'user123');
      const key2 = deriveTenantKey(testMasterKey, 'user456');

      expect(key1.equals(key2)).toBe(false);
    });
  });

  describe('API key generation and hashing', () => {
    it('should generate API key with correct prefix', () => {
      const apiKey = generateApiKey('kx_test');

      expect(apiKey).toMatch(/^kx_test_[A-Za-z0-9_-]+$/);
    });

    it('should hash and verify API key successfully', () => {
      const apiKey = generateApiKey('kx_live');
      const hash = hashApiKey(apiKey);

      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex chars

      const isValid = verifyApiKey(apiKey, hash);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong API key', () => {
      const apiKey1 = generateApiKey('kx_live');
      const apiKey2 = generateApiKey('kx_live');
      const hash = hashApiKey(apiKey1);

      const isValid = verifyApiKey(apiKey2, hash);
      expect(isValid).toBe(false);
    });

    it('should produce consistent hashes for same key', () => {
      const apiKey = generateApiKey('kx_live');
      const hash1 = hashApiKey(apiKey);
      const hash2 = hashApiKey(apiKey);

      expect(hash1).toBe(hash2);
    });
  });
});
