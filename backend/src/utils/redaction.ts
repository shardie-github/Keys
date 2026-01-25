/**
 * Redaction Utilities
 * Enhanced secret redaction for logs, telemetry, and error messages
 */

/**
 * Patterns to identify secrets in strings and object keys
 */
const SECRET_PATTERNS = [
  // API Keys and tokens
  /kx_live_[A-Za-z0-9_-]{30,}/g,
  /kx_test_[A-Za-z0-9_-]{30,}/g,
  /sk-[A-Za-z0-9]{20,}/g, // OpenAI keys
  /sk-ant-[A-Za-z0-9-_]{20,}/g, // Anthropic keys
  /AIza[A-Za-z0-9_-]{35}/g, // Google AI keys

  // Generic patterns
  /[A-Za-z0-9]{32,}/g, // Long alphanumeric strings (likely keys)
  /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, // JWT tokens

  // Environment-specific
  /Bearer\s+[A-Za-z0-9_-]+/gi,
];

/**
 * Sensitive field names (case-insensitive)
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'secret',
  'token',
  'api_key',
  'apikey',
  'api-key',
  'auth',
  'authorization',
  'bearer',
  'credential',
  'private_key',
  'privatekey',
  'private-key',
  'access_key',
  'accesskey',
  'access-key',
  'session',
  'cookie',
  'ssn',
  'social_security',
  'credit_card',
  'creditcard',
  'card_number',
  'cvv',
  'cvc',
  'stripe_key',
  'supabase_key',
  'master_key',
  'hashed_key',
  'ciphertext',
  'plaintext',
  'openai_api_key',
  'anthropic_api_key',
  'google_ai_api_key',
]);

/**
 * Check if a field name is sensitive
 */
function isSensitiveField(fieldName: string): boolean {
  const normalized = fieldName.toLowerCase().replace(/[_-]/g, '');

  // Check exact matches
  if (SENSITIVE_FIELDS.has(fieldName.toLowerCase())) {
    return true;
  }

  // Check if any sensitive keyword is contained in the field name
  for (const sensitive of SENSITIVE_FIELDS) {
    const normalizedSensitive = sensitive.replace(/[_-]/g, '');
    if (normalized.includes(normalizedSensitive)) {
      return true;
    }
  }

  return false;
}

/**
 * Redact secrets from a string
 */
export function redactString(text: string): string {
  if (typeof text !== 'string') {
    return text;
  }

  let redacted = text;

  // Apply all secret patterns
  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED_SECRET]');
  }

  return redacted;
}

/**
 * Redact secrets from an object (recursive)
 */
export function redactObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitive types
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return redactString(obj);
    }
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item));
  }

  // Handle objects
  const redacted: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // If key is sensitive, redact the entire value
    if (isSensitiveField(key)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively redact nested objects
      redacted[key] = redactObject(value);
    } else if (typeof value === 'string') {
      // Redact string values
      redacted[key] = redactString(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Redact secrets from any value (auto-detect type)
 */
export function redactSecrets(value: any): any {
  if (typeof value === 'string') {
    return redactString(value);
  }

  if (typeof value === 'object' && value !== null) {
    return redactObject(value);
  }

  return value;
}

/**
 * Redact error messages and stack traces
 */
export function redactError(error: Error): Error {
  const redactedError = new Error(redactString(error.message));
  redactedError.name = error.name;

  if (error.stack) {
    redactedError.stack = redactString(error.stack);
  }

  // Copy other properties
  for (const key of Object.keys(error)) {
    if (key !== 'message' && key !== 'stack' && key !== 'name') {
      (redactedError as any)[key] = redactSecrets((error as any)[key]);
    }
  }

  return redactedError;
}

/**
 * Create a safe string representation for logging
 * Shows first and last N characters, redacts the middle
 */
export function partialRedact(value: string, showChars: number = 4): string {
  if (typeof value !== 'string' || value.length <= showChars * 2) {
    return '[REDACTED]';
  }

  const start = value.substring(0, showChars);
  const end = value.substring(value.length - showChars);
  const middleLength = value.length - (showChars * 2);

  return `${start}${'*'.repeat(Math.min(middleLength, 8))}${end}`;
}

/**
 * Redact secrets from URL (preserves structure, redacts sensitive query params)
 */
export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Redact sensitive query parameters
    const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth'];

    for (const param of sensitiveParams) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, '[REDACTED]');
      }
    }

    // Redact password in basic auth
    if (parsed.password) {
      parsed.password = '[REDACTED]';
    }

    return parsed.toString();
  } catch (error) {
    // If not a valid URL, apply string redaction
    return redactString(url);
  }
}
