#!/usr/bin/env tsx
/**
 * Database Migration Runner
 * 
 * Runs all pending migrations using environment variables from GitHub Secrets:
 * - SUPABASE_URL: Database connection URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin access
 * 
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run migrate
 *   Or set in .env file or GitHub Secrets
 */

import { Client } from 'pg';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables (from GitHub Secrets or .env)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL environment variable is required');
  console.error('   Set it in GitHub Secrets or .env file');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('   Set it in GitHub Secrets or .env file');
  process.exit(1);
}

/**
 * Parse Supabase URL to extract connection details
 * Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 * Or: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
 */
function parseSupabaseUrl(url: string): {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
} {
  try {
    const urlObj = new URL(url);
    
    // Extract password from URL or use service role key
    const password = urlObj.password || SUPABASE_SERVICE_ROLE_KEY;
    
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 5432,
      database: urlObj.pathname.slice(1) || 'postgres',
      user: urlObj.username || 'postgres',
      password: password,
    };
  } catch (error) {
    // Try alternative parsing for Supabase connection strings
    const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        host: match[3],
        port: parseInt(match[4]),
        database: match[5],
        user: match[1],
        password: match[2] || SUPABASE_SERVICE_ROLE_KEY,
      };
    }
    throw new Error(`Invalid SUPABASE_URL format: ${url.substring(0, 50)}...`);
  }
}

const connectionConfig = parseSupabaseUrl(SUPABASE_URL);

// Create PostgreSQL client
const client = new Client({
  host: connectionConfig.host,
  port: connectionConfig.port,
  database: connectionConfig.database,
  user: connectionConfig.user,
  password: SUPABASE_SERVICE_ROLE_KEY, // Always use service role key for admin access
  ssl: {
    rejectUnauthorized: false, // Supabase uses SSL
  },
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
  console.log('✅ Migrations tracking table ready');
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
    `INSERT INTO ${MIGRATIONS_TABLE} (version, name, applied_at) 
     VALUES ($1, $2, NOW()) 
     ON CONFLICT (version) DO NOTHING`,
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
    
    // Execute the SQL (split by semicolon but handle multi-line statements)
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    for (const statement of statements) {
      if (statement.trim().length === 0) continue;
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      if (statement.trim().startsWith('/*')) continue;

      try {
        await client.query(statement);
      } catch (err: any) {
        // Some statements might fail if they're idempotent (IF NOT EXISTS)
        // Check if it's a "already exists" error
        if (err.code === '42P07' || err.code === '42710') {
          // Object already exists, skip
          console.log(`   ⚠️  Skipping (already exists): ${statement.substring(0, 50)}...`);
          continue;
        }
        throw err;
      }
    }
    
    // Record migration
    await recordMigration(version, name);
    
    await client.query('COMMIT');
    
    console.log(`✅ Migration ${version} applied successfully`);
    return true;
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(`❌ Migration ${version} failed:`, error.message);
    if (error.position) {
      console.error(`   Error at position: ${error.position}`);
    }
    throw error;
  }
}

/**
 * Get all migration files sorted by version
 */
async function getMigrationFiles(): Promise<Array<{ version: string; name: string; path: string }>> {
  const migrationsDir = join(__dirname, '../backend/supabase/migrations');
  
  try {
    const files = await readdir(migrationsDir);

    const migrationFiles = files
      .filter((file) => file.endsWith('.sql') && !file.startsWith('.') && file !== 'README.md')
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
      })
      .sort((a, b) => {
        // Sort by version number
        const aNum = parseInt(a.version) || 0;
        const bNum = parseInt(b.version) || 0;
        return aNum - bNum;
      });

    return migrationFiles;
  } catch (error) {
    console.error(`❌ Error reading migrations directory: ${migrationsDir}`, error);
    throw error;
  }
}

/**
 * Main migration runner
 */
async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📊 Database: ${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`);
  console.log(`👤 User: ${connectionConfig.user}`);
  console.log(`🔑 Using service role key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...\n`);

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database\n');

    // Ensure migrations table exists
    await ensureMigrationsTable();

    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`📋 Applied migrations: ${appliedMigrations.length}`);
    if (appliedMigrations.length > 0) {
      console.log(`   ${appliedMigrations.join(', ')}`);
    }

    // Get all migration files
    const migrationFiles = await getMigrationFiles();
    console.log(`\n📁 Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach((m) => {
      const status = appliedMigrations.includes(m.version) ? '✅' : '⏳';
      console.log(`   ${status} ${m.name} (${m.version})`);
    });

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      (migration) => !appliedMigrations.includes(migration.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('\n✅ All migrations are up to date!');
      await client.end();
      return;
    }

    console.log(`\n🔄 Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach((m) => {
      console.log(`   - ${m.name} (${m.version})`);
    });

    // Execute pending migrations
    let successCount = 0;
    let failCount = 0;

    for (const migration of pendingMigrations) {
      try {
        const sql = await readFile(migration.path, 'utf-8');
        await executeMigration(sql, migration.version, migration.name);
        successCount++;
      } catch (error: any) {
        console.error(`\n❌ Failed to apply migration ${migration.version}:`, error.message);
        failCount++;
        // Continue with next migration (comment out if you want to stop on first error)
        // break;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successfully applied: ${successCount}`);
    if (failCount > 0) {
      console.log(`   ❌ Failed: ${failCount}`);
    }

    if (failCount === 0) {
      console.log(`\n✅ All migrations completed successfully!`);
    } else {
      console.log(`\n⚠️  Some migrations failed. Please review errors above.`);
      process.exit(1);
    }

    await client.end();
  } catch (error: any) {
    console.error('\n❌ Migration process failed:', error.message);
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
