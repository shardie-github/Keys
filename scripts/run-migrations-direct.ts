#!/usr/bin/env tsx
/**
 * Database Migration Runner (Direct PostgreSQL Connection)
 * 
 * Alternative implementation using direct PostgreSQL connection
 * for environments where Supabase client doesn't support DDL
 * 
 * Requires: pg package and direct database connection
 */

import { Client } from 'pg';
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

// Extract connection details from Supabase URL
// Format: postgresql://postgres:[password]@[host]:[port]/postgres
function parseSupabaseUrl(url: string): {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
} {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 5432,
      database: urlObj.pathname.slice(1) || 'postgres',
      user: urlObj.username || 'postgres',
      password: urlObj.password || SUPABASE_SERVICE_ROLE_KEY,
    };
  } catch (error) {
    // If URL parsing fails, try to extract from connection string
    const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        host: match[3],
        port: parseInt(match[4]),
        database: match[5],
        user: match[1],
        password: match[2],
      };
    }
    throw new Error('Invalid SUPABASE_URL format');
  }
}

const connectionConfig = parseSupabaseUrl(SUPABASE_URL);
const client = new Client({
  ...connectionConfig,
  password: SUPABASE_SERVICE_ROLE_KEY, // Use service role key as password
});

const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Ensure migrations tracking table exists
 */
async function ensureMigrationsTable() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      version VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `);
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await client.query(
      `SELECT version FROM ${MIGRATIONS_TABLE} ORDER BY applied_at ASC`
    );
    return result.rows.map((row) => row.version);
  } catch (error: any) {
    if (error.code === '42P01') {
      // Table doesn't exist yet
      return [];
    }
    throw error;
  }
}

/**
 * Record migration as applied
 */
async function recordMigration(version: string, name: string) {
  await client.query(
    `INSERT INTO ${MIGRATIONS_TABLE} (version, name, applied_at) VALUES ($1, $2, NOW()) ON CONFLICT (version) DO NOTHING`,
    [version, name]
  );
}

/**
 * Execute SQL migration
 */
async function executeMigration(sql: string, version: string, name: string): Promise<boolean> {
  console.log(`\n📝 Running migration: ${name} (${version})`);

  try {
    // Execute the entire migration as a transaction
    await client.query('BEGIN');
    
    // Execute the SQL
    await client.query(sql);
    
    // Record migration
    await recordMigration(version, name);
    
    await client.query('COMMIT');
    
    console.log(`✅ Migration ${version} applied successfully`);
    return true;
  } catch (error: any) {
    await client.query('ROLLBACK');
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

  const migrationFiles = files
    .filter((file) => file.endsWith('.sql') && !file.startsWith('.'))
    .sort()
    .map((file) => {
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
  console.log('🚀 Starting database migrations (direct connection)...\n');
  console.log(`📊 Database: ${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`);
  console.log(`👤 User: ${connectionConfig.user}\n`);

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database\n');

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
      await client.end();
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
    
    await client.end();
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
