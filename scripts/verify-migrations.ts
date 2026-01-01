#!/usr/bin/env tsx
/**
 * Verify Migrations
 * 
 * Verifies that all migrations have been applied successfully
 */

import { Client } from 'pg';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

function parseSupabaseUrl(url: string) {
  const urlObj = new URL(url);
  return {
    host: urlObj.hostname,
    port: parseInt(urlObj.port) || 5432,
    database: urlObj.pathname.slice(1) || 'postgres',
    user: urlObj.username || 'postgres',
  };
}

const config = parseSupabaseUrl(SUPABASE_URL);
const client = new Client({
  ...config,
  password: SUPABASE_SERVICE_ROLE_KEY,
  ssl: { rejectUnauthorized: false },
});

async function verifyMigrations() {
  await client.connect();
  
  const { rows } = await client.query('SELECT version, name FROM schema_migrations ORDER BY applied_at');
  const applied = rows.map(r => r.version);
  
  const migrationsDir = join(__dirname, '../backend/supabase/migrations');
  const files = await readdir(migrationsDir);
  const allMigrations = files
    .filter(f => f.endsWith('.sql') && !f.startsWith('.'))
    .map(f => {
      const match = f.match(/^(\d+)/);
      return match ? match[1] : null;
    })
    .filter(Boolean)
    .sort((a, b) => parseInt(a!) - parseInt(b!));
  
  const missing = allMigrations.filter(m => !applied.includes(m));
  
  if (missing.length > 0) {
    console.error(`❌ Missing migrations: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ All migrations verified');
  await client.end();
}

verifyMigrations().catch(console.error);
