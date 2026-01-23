#!/usr/bin/env tsx
/**
 * Environment Doctor Script
 *
 * Validates:
 * - Node/toolchain versions
 * - Required environment variables
 * - Database connectivity
 * - Common misconfigurations
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, message: string, severity: 'critical' | 'warning' | 'info' = 'critical'): void {
  results.push({ name, passed: condition, message, severity });
  const icon = condition ? '✓' : (severity === 'critical' ? '✗' : '⚠');
  const color = condition ? '\x1b[32m' : (severity === 'critical' ? '\x1b[31m' : '\x1b[33m');
  console.log(`${color}${icon}\x1b[0m ${name}: ${message}`);
}

async function runChecks() {
  console.log('\n🏥 Running environment health checks...\n');

  // 1. Node version check
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    check(
      'Node.js Version',
      majorVersion >= 20,
      majorVersion >= 20
        ? `${nodeVersion} (✓)`
        : `${nodeVersion} - requires >= 20.0.0`,
      majorVersion >= 20 ? 'info' : 'critical'
    );
  } catch (error) {
    check('Node.js Version', false, 'Could not determine Node version', 'critical');
  }

  // 2. npm version check
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    check('npm', true, `v${npmVersion}`, 'info');
  } catch (error) {
    check('npm', false, 'npm not found', 'critical');
  }

  // 3. Package installation check
  const nodeModulesExists = existsSync('./node_modules');
  check(
    'Dependencies Installed',
    nodeModulesExists,
    nodeModulesExists ? 'node_modules found' : 'Run: npm install',
    'critical'
  );

  // 4. Required environment variables
  const requiredEnvVars = [
    { key: 'SUPABASE_URL', description: 'Supabase project URL' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service role key' },
    { key: 'STRIPE_SECRET_KEY', description: 'Stripe secret key' },
    { key: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook secret' },
    { key: 'REQUEST_SIGNING_SECRET', description: 'Request signing secret' },
  ];

  for (const { key, description } of requiredEnvVars) {
    const value = process.env[key];
    check(
      `Env: ${key}`,
      !!value,
      value ? 'Set' : `Missing (${description})`,
      'critical'
    );
  }

  // 5. Optional but recommended env vars
  const optionalEnvVars = [
    { key: 'REDIS_URL', description: 'Redis for caching (degrades gracefully)' },
    { key: 'OPENAI_API_KEY', description: 'OpenAI LLM provider' },
    { key: 'SENTRY_DSN', description: 'Error tracking' },
  ];

  for (const { key, description } of optionalEnvVars) {
    const value = process.env[key];
    check(
      `Env: ${key}`,
      !!value,
      value ? 'Set' : `Not set (${description})`,
      'warning'
    );
  }

  // 6. Frontend env vars
  const frontendEnvVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Frontend Supabase URL' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Frontend Supabase anon key' },
    { key: 'NEXT_PUBLIC_API_URL', description: 'Backend API URL' },
  ];

  for (const { key, description } of frontendEnvVars) {
    const value = process.env[key];
    check(
      `Env: ${key}`,
      !!value,
      value ? 'Set' : `Missing (${description})`,
      'critical'
    );
  }

  // 7. CORS configuration check
  const corsOrigins = process.env.CORS_ORIGINS;
  check(
    'CORS Configuration',
    !!corsOrigins,
    corsOrigins
      ? `Allowed origins: ${corsOrigins}`
      : 'CORS_ORIGINS not set - API will reject browser requests',
    'critical'
  );

  // 8. Database connectivity check
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Test simple query
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        check(
          'Database Connectivity',
          false,
          `Cannot connect to Supabase: ${error.message}`,
          'critical'
        );
      } else {
        check('Database Connectivity', true, 'Connected to Supabase', 'info');
      }
    } catch (error) {
      check(
        'Database Connectivity',
        false,
        `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'critical'
      );
    }
  } else {
    check(
      'Database Connectivity',
      false,
      'Cannot test - Supabase credentials missing',
      'warning'
    );
  }

  // 9. Check for common misconfigurations
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (apiUrl && apiBaseUrl && apiUrl !== apiBaseUrl) {
    check(
      'API URL Consistency',
      false,
      `NEXT_PUBLIC_API_URL (${apiUrl}) != NEXT_PUBLIC_API_BASE_URL (${apiBaseUrl})`,
      'warning'
    );
  }

  // 10. Check log level
  const logLevel = process.env.LOG_LEVEL || 'info';
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  check(
    'Log Level',
    validLogLevels.includes(logLevel),
    validLogLevels.includes(logLevel)
      ? `Set to: ${logLevel}`
      : `Invalid: ${logLevel} (use: ${validLogLevels.join(', ')})`,
    validLogLevels.includes(logLevel) ? 'info' : 'warning'
  );

  // 11. Build artifacts check
  const backendBuildExists = existsSync('./backend/dist');
  const frontendBuildExists = existsSync('./frontend/.next');

  check(
    'Backend Build',
    backendBuildExists,
    backendBuildExists ? 'dist/ exists' : 'Not built (run: npm run build:backend)',
    'info'
  );

  check(
    'Frontend Build',
    frontendBuildExists,
    frontendBuildExists ? '.next/ exists' : 'Not built (run: npm run build:frontend)',
    'info'
  );

  // Summary
  console.log('\n' + '='.repeat(60));
  const critical = results.filter(r => !r.passed && r.severity === 'critical');
  const warnings = results.filter(r => !r.passed && r.severity === 'warning');
  const passed = results.filter(r => r.passed);

  console.log(`\n📊 Summary:`);
  console.log(`   ✓ Passed: ${passed.length}`);
  console.log(`   ⚠ Warnings: ${warnings.length}`);
  console.log(`   ✗ Critical: ${critical.length}`);

  if (critical.length > 0) {
    console.log('\n❌ Critical issues must be resolved before deployment:');
    critical.forEach(r => console.log(`   - ${r.name}: ${r.message}`));
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('\n⚠️  Warnings (recommended to fix):');
    warnings.forEach(r => console.log(`   - ${r.name}: ${r.message}`));
    process.exit(0);
  } else {
    console.log('\n✅ All checks passed! Environment is healthy.\n');
    process.exit(0);
  }
}

runChecks().catch((error) => {
  console.error('❌ Doctor script failed:', error);
  process.exit(1);
});
