/**
 * Environment variable validation
 * Validates required environment variables at build time and runtime
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_API_BASE_URL',
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.\n` +
      `See .env.example for a template.`
    );
  }
}

// Run validation at module load time (build/runtime)
// During build time, only warn. During runtime, the app will fail gracefully.
if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    console.error('\n❌ Environment validation failed:');
    console.error((error as Error).message);
    console.error('\nThe application may not function correctly.\n');
  }
}
