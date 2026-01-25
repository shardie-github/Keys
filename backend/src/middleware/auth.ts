import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyApiKeyToken } from '../services/apiKeyService.js';
import { logger } from '../utils/logger.js';

let supabaseClient: SupabaseClient<any> | null = null;

function getSupabaseAdminClient(): SupabaseClient<any> {
  const isTestRuntime = process.env.NODE_ENV === 'test' || typeof (import.meta as any)?.vitest !== 'undefined';
  if (!isTestRuntime && supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (isTestRuntime) {
    return createClient<any>(url || 'http://127.0.0.1:54321', key || 'test-service-role') as SupabaseClient<any>;
  }

  if (!url || !key) throw new Error('Supabase admin client is not configured');
  supabaseClient = createClient<any>(url, key) as SupabaseClient<any>;
  return supabaseClient;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  // Principal context (for API keys vs user sessions)
  principal?: {
    type: 'user_session' | 'api_key';
    userId: string;
    apiKeyId?: string;
    scopes?: string[];
  };
}

function isAllowlistedAdmin(userId: string | undefined): boolean {
  if (!userId) return false;
  const raw = process.env.ADMIN_USER_IDS || '';
  if (!raw.trim()) return false;
  const set = new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  return set.has(userId);
}

function getUserRole(user: { app_metadata?: any; user_metadata?: any; id?: string }): string | undefined {
  // Prefer app_metadata (not user-editable in Supabase).
  const appRole = user?.app_metadata?.role;
  if (typeof appRole === 'string' && appRole) return appRole;

  // Optional bootstrap: allowlist specific user IDs as admins via env.
  if (isAllowlistedAdmin(user?.id)) return 'admin';

  // Do NOT trust user_metadata.role for authorization.
  return undefined;
}

/**
 * Auth middleware to verify JWT token or API key and extract user info
 * Supports both Supabase JWT sessions and Keys-issued API keys
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Missing or invalid authorization header',
        },
        requestId: req.headers['x-request-id'],
      });
      return;
    }

    const token = authHeader.substring(7);

    // Check if it's a Keys API key (starts with kx_)
    if (token.startsWith('kx_')) {
      const verified = await verifyApiKeyToken(token);

      if (!verified) {
        res.status(401).json({
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid or revoked API key',
          },
          requestId: req.headers['x-request-id'],
        });
        return;
      }

      // Attach API key principal info
      req.userId = verified.userId;
      req.user = {
        id: verified.userId,
        role: 'user', // API keys don't have elevated roles by default
      };
      req.principal = {
        type: 'api_key',
        userId: verified.userId,
        apiKeyId: verified.apiKeyId,
        scopes: verified.scopes,
      };

      next();
      return;
    }

    // Otherwise, verify as Supabase JWT
    const {
      data: { user },
      error,
    } = await getSupabaseAdminClient().auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid or expired token',
        },
        requestId: req.headers['x-request-id'],
      });
      return;
    }

    // Attach user session info
    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
      role: getUserRole(user),
    };
    req.principal = {
      type: 'user_session',
      userId: user.id,
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error', error as Error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication error',
      },
      requestId: req.headers['x-request-id'],
    });
  }
}

/**
 * Optional auth - doesn't fail if no token, but attaches user if present
 * Supports both Supabase JWT sessions and Keys-issued API keys
 */
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Check if it's a Keys API key
      if (token.startsWith('kx_')) {
        const verified = await verifyApiKeyToken(token);

        if (verified) {
          req.userId = verified.userId;
          req.user = {
            id: verified.userId,
            role: 'user',
          };
          req.principal = {
            type: 'api_key',
            userId: verified.userId,
            apiKeyId: verified.apiKeyId,
            scopes: verified.scopes,
          };
        }
      } else {
        // Verify as Supabase JWT
        const {
          data: { user },
        } = await getSupabaseAdminClient().auth.getUser(token);

        if (user) {
          req.userId = user.id;
          req.user = {
            id: user.id,
            email: user.email,
            role: getUserRole(user),
          };
          req.principal = {
            type: 'user_session',
            userId: user.id,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Continue without auth on error
    next();
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRole = req.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
