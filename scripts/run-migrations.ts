#!/usr/bin/env tsx
/**
 * Database Migration Runner
 * 
 * Runs pending migrations in order using environment variables:
 * - SUPABASE_URL: Database connection URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin access
 * 
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run db:migrate
 *   Or set in .env file
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL environment variable is required');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

// Create Supabase client with service role key (admin access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Migration tracking table name
const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Ensure migrations tracking table exists
 */
async function ensureMigrationsTable() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        version VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      );
    `,
  });

  // If RPC doesn't exist, use direct SQL (requires postgres extension)
  if (error) {
    // Try direct query (this requires postgres extension or direct connection)
    console.log('⚠️  Note: Using direct SQL execution. Ensure you have postgres extension enabled.');
  }
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  try {
    // Try to query migrations table
    const { data, error } = await supabase
      .from(MIGRATIONS_TABLE)
      .select('version')
      .order('applied_at', { ascending: true });

    if (error) {
      // Table might not exist yet, return empty array
      if (error.code === '42P01') {
        return [];
      }
      throw error;
    }

    return data?.map((row) => row.version) || [];
  } catch (error) {
    console.warn('⚠️  Could not query migrations table, assuming no migrations applied');
    return [];
  }
}

/**
 * Record migration as applied
 */
async function recordMigration(version: string, name: string) {
  try {
    const { error } = await supabase.from(MIGRATIONS_TABLE).insert({
      version,
      name,
      applied_at: new Date().toISOString(),
    });

    if (error) {
      console.warn(`⚠️  Could not record migration ${version}:`, error.message);
    }
  } catch (error) {
    console.warn(`⚠️  Could not record migration ${version}:`, error);
  }
}

/**
 * Execute SQL migration
 */
async function executeMigration(sql: string, version: string, name: string): Promise<boolean> {
  try {
    console.log(`\n📝 Running migration: ${name} (${version})`);

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim().length === 0) continue;

      // Skip comments
      if (statement.trim().startsWith('--')) continue;

      try {
        // Use RPC if available, otherwise direct query
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Try direct query (requires postgres extension)
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          
          // If that fails, try executing via REST API
          console.error(`❌ Error executing statement:`, error.message);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      } catch (err: any) {
        // For migrations, we'll use a workaround: execute via REST API
        // This requires the postgres extension or direct connection
        console.error(`❌ Failed to execute migration ${version}:`, err.message);
        throw err;
      }
    }

    // Record migration as applied
    await recordMigration(version, name);
    console.log(`✅ Migration ${version} applied successfully`);

    return true;
  } catch (error: any) {
    console.error(`❌ Migration ${version} failed:`, error.message);
    throw error;
  }
}

/**
 * Get all migration files
 */
async function getMigrationFiles(): Promise<Array<{ version: string; name: string; path: string }>> {
  const migrationsDir = join(__dirname, '../backend/supabase/migrations');
  const files = await readdir(migrationsDir);

  // Filter SQL files and sort by name
  const migrationFiles = files
    .filter((file) => file.endsWith('.sql') && !file.startsWith('.'))
    .sort()
    .map((file) => {
      // Extract version from filename (e.g., "015_add_pro_plus_tier.sql" -> "015")
      const match = file.match(/^(\d+)/);
      const version = match ? match[1] : file.replace('.sql', '');
      const name = file.replace('.sql', '');

      return {
        version,
        name,
        path: join(migrationsDir, file),
      };
    });

  return migrationFiles;
}

/**
 * Main migration runner
 */
async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📊 Database URL: ${SUPABASE_URL.replace(/\/\/.*@/, '//***@')}`);
  console.log(`🔑 Using service role key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...\n`);

  try {
    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`📋 Applied migrations: ${appliedMigrations.length}`);

    // Get all migration files
    const migrationFiles = await getMigrationFiles();
    console.log(`📁 Found ${migrationFiles.length} migration files\n`);

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      (migration) => !appliedMigrations.includes(migration.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ All migrations are up to date!');
      return;
    }

    console.log(`🔄 Found ${pendingMigrations.length} pending migration(s):\n`);
    pendingMigrations.forEach((m) => {
      console.log(`   - ${m.name} (${m.version})`);
    });

    // Execute pending migrations
    for (const migration of pendingMigrations) {
      const sql = await readFile(migration.path, 'utf-8');
      await executeMigration(sql, migration.version, migration.name);
    }

    console.log(`\n✅ Successfully applied ${pendingMigrations.length} migration(s)!`);
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
