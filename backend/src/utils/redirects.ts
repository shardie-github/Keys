import { logger } from './logger.js';

const DEFAULT_FRONTEND_URL = 'http://localhost:3000';

export function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;
}

export function getAllowedRedirectOrigins(): string[] {
  const origins = new Set<string>();
  const candidates = [process.env.FRONTEND_URL].filter(
    (value): value is string => Boolean(value)
  );

  if (candidates.length === 0) {
    candidates.push(DEFAULT_FRONTEND_URL);
  }

  for (const candidate of candidates) {
    try {
      origins.add(new URL(candidate).origin);
    } catch (error) {
      logger.warn('Failed to parse allowed redirect origin', {
        candidate,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return Array.from(origins);
}

export function validateRedirectUrl(rawUrl: string, allowedOrigins: string[]): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch (error) {
    throw new Error('Redirect URL must be a valid absolute URL');
  }

  if (!allowedOrigins.includes(parsedUrl.origin)) {
    throw new Error('Redirect URL origin is not allowed');
  }

  return parsedUrl.toString();
}

export function resolveReturnUrl(
  rawUrl: string | undefined,
  allowedOrigins: string[],
  fallbackUrl: string
): string {
  if (!rawUrl) {
    return fallbackUrl;
  }

  try {
    return validateRedirectUrl(rawUrl, allowedOrigins);
  } catch (error) {
    logger.warn('Rejected return URL', {
      rawUrl,
      fallbackUrl,
      allowedOrigins,
      error: error instanceof Error ? error.message : String(error),
    });
    return fallbackUrl;
  }
}
