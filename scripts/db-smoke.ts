#!/usr/bin/env tsx
/**
 * Database Smoke Test Script
 * 
 * Runs a small set of real queries against Supabase using both anon and service role
 * to verify the app can connect and basic operations work.
 * 
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... tsx scripts/db-smoke.ts
 */

import { createClient } from '@supabase/supabase-js';

interface SmokeTestResult {
  test: string;
  status: 'pass' | 'fail';
  message: string;
  duration?: number;
}

async function runSmokeTests(): Promise<SmokeTestResult[]> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error('❌ Error: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
    process.exit(1);
  }

  console.log('🧪 Running database smoke tests...\n');

  const results: SmokeTestResult[] = [];

  // Create clients
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const anonClient = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Test 1: Service role can query tables
  results.push(await testServiceRoleQueries(serviceClient));

  // Test 2: Anon client can't query user data without auth (RLS working)
  results.push(await testRLSEnforcement(anonClient));

  // Test 3: Functions are callable
  results.push(await testFunctions(serviceClient));

  // Test 4: Basic CRUD operations work
  results.push(await testBasicCRUD(serviceClient));

  // Print summary
  console.log('\n📊 Smoke Test Summary:');
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${icon} ${result.test}: ${result.message}${duration}`);
  });

  console.log(`\n   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);

  return results;
}

async function testServiceRoleQueries(client: any): Promise<SmokeTestResult> {
  const start = Date.now();
  try {
    // Try to query a few key tables
    const tables = ['user_profiles', 'prompt_atoms', 'vibe_configs'];
    const errors: string[] = [];

    for (const table of tables) {
      const { error } = await client.from(table).select('*').limit(0);
      if (error) {
        errors.push(`${table}: ${error.message}`);
      }
    }

    const duration = Date.now() - start;

    if (errors.length > 0) {
      return {
        test: 'Service Role Queries',
        status: 'fail',
        message: `Failed to query tables: ${errors.join(', ')}`,
        duration,
      };
    }

    return {
      test: 'Service Role Queries',
      status: 'pass',
      message: 'Service role can query all expected tables',
      duration,
    };
  } catch (err: any) {
    return {
      test: 'Service Role Queries',
      status: 'fail',
      message: `Error: ${err.message}`,
      duration: Date.now() - start,
    };
  }
}

async function testRLSEnforcement(client: any): Promise<SmokeTestResult> {
  const start = Date.now();
  try {
    // Anon client should not be able to query user_profiles without auth
    const { data, error } = await client.from('user_profiles').select('*').limit(1);

    const duration = Date.now() - start;

    // If we get data back, RLS might not be working correctly
    if (data && data.length > 0) {
      return {
        test: 'RLS Enforcement',
        status: 'fail',
        message: 'Anon client was able to query user_profiles - RLS may not be enabled',
        duration,
      };
    }

    // If we get a permission error, that's expected (RLS is working)
    if (error && (error.code === 'PGRST301' || error.message?.includes('permission'))) {
      return {
        test: 'RLS Enforcement',
        status: 'pass',
        message: 'RLS is correctly blocking anon access to user data',
        duration,
      };
    }

    // Empty result is also acceptable (no rows, but RLS is working)
    return {
      test: 'RLS Enforcement',
      status: 'pass',
      message: 'RLS appears to be working (no data returned to anon)',
      duration,
    };
  } catch (err: any) {
    return {
      test: 'RLS Enforcement',
      status: 'fail',
      message: `Error: ${err.message}`,
      duration: Date.now() - start,
    };
  }
}

async function testFunctions(client: any): Promise<SmokeTestResult> {
  const start = Date.now();
  try {
    // Test gen_random_uuid (built-in but should work)
    const { data: uuidData, error: uuidError } = await client.rpc('gen_random_uuid');

    const duration = Date.now() - start;

    if (uuidError) {
      return {
        test: 'Functions',
        status: 'fail',
        message: `gen_random_uuid not available: ${uuidError.message}`,
        duration,
      };
    }

    // Test track_template_usage (our custom function)
    // Use a dummy UUID that won't conflict
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const { error: trackError } = await client.rpc('track_template_usage', {
      p_user_id: testUserId,
      p_template_id: 'smoke-test-template',
      p_success: true,
    });

    // If function doesn't exist, that's a failure
    if (trackError && (trackError.message?.includes('does not exist') || trackError.code === '42883')) {
      return {
        test: 'Functions',
        status: 'fail',
        message: `track_template_usage function not found: ${trackError.message}`,
        duration,
      };
    }

    return {
      test: 'Functions',
      status: 'pass',
      message: 'Key functions are callable',
      duration,
    };
  } catch (err: any) {
    return {
      test: 'Functions',
      status: 'fail',
      message: `Error: ${err.message}`,
      duration: Date.now() - start,
    };
  }
}

async function testBasicCRUD(client: any): Promise<SmokeTestResult> {
  const start = Date.now();
  try {
    // Test INSERT on prompt_atoms (should be allowed for service role)
    const testAtom = {
      name: 'smoke-test-atom',
      category: 'test',
      version: 999999, // High version to avoid conflicts
      active: false,
    };

    const { data: insertData, error: insertError } = await client
      .from('prompt_atoms')
      .insert(testAtom)
      .select()
      .single();

    if (insertError) {
      return {
        test: 'Basic CRUD',
        status: 'fail',
        message: `INSERT failed: ${insertError.message}`,
        duration: Date.now() - start,
      };
    }

    // Test SELECT
    const { data: selectData, error: selectError } = await client
      .from('prompt_atoms')
      .select('*')
      .eq('name', 'smoke-test-atom')
      .single();

    if (selectError || !selectData) {
      return {
        test: 'Basic CRUD',
        status: 'fail',
        message: `SELECT failed: ${selectError?.message || 'No data returned'}`,
        duration: Date.now() - start,
      };
    }

    // Test UPDATE
    const { error: updateError } = await client
      .from('prompt_atoms')
      .update({ active: true })
      .eq('id', insertData.id);

    if (updateError) {
      return {
        test: 'Basic CRUD',
        status: 'fail',
        message: `UPDATE failed: ${updateError.message}`,
        duration: Date.now() - start,
      };
    }

    // Test DELETE (cleanup)
    const { error: deleteError } = await client
      .from('prompt_atoms')
      .delete()
      .eq('id', insertData.id);

    const duration = Date.now() - start;

    if (deleteError) {
      return {
        test: 'Basic CRUD',
        status: 'fail',
        message: `DELETE failed: ${deleteError.message}`,
        duration,
      };
    }

    return {
      test: 'Basic CRUD',
      status: 'pass',
      message: 'INSERT, SELECT, UPDATE, DELETE operations work',
      duration,
    };
  } catch (err: any) {
    return {
      test: 'Basic CRUD',
      status: 'fail',
      message: `Error: ${err.message}`,
      duration: Date.now() - start,
    };
  }
}

// Main execution
if (require.main === module) {
  runSmokeTests()
    .then(results => {
      const failed = results.filter(r => r.status === 'fail');
      process.exit(failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runSmokeTests };
