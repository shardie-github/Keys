#!/usr/bin/env tsx
/**
 * Database Inventory Script
 * 
 * Queries live Supabase database to inventory:
 * - Tables, columns, types, defaults
 * - Indexes
 * - Constraints (PK, FK, UNIQUE, CHECK)
 * - Triggers
 * - Extensions
 * - RLS policies
 * - Functions (RPC)
 * - Storage buckets/policies
 * 
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... tsx scripts/db-inventory.ts
 */

import { createClient } from '@supabase/supabase-js';

interface TableInfo {
  schema: string;
  name: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
  triggers: TriggerInfo[];
  rlsEnabled: boolean;
  policies: PolicyInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isPrimaryKey: boolean;
}

interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
  definition: string;
}

interface ConstraintInfo {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK' | 'NOT NULL';
  definition: string;
}

interface TriggerInfo {
  name: string;
  event: string;
  timing: string;
  function: string;
}

interface PolicyInfo {
  name: string;
  command: string;
  definition: string;
}

interface FunctionInfo {
  schema: string;
  name: string;
  returnType: string;
  arguments: string;
  security: 'DEFINER' | 'INVOKER';
}

interface ExtensionInfo {
  name: string;
  version: string;
}

interface StorageBucketInfo {
  name: string;
  public: boolean;
  policies: PolicyInfo[];
}

async function inventoryDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('🔍 Inventorying Supabase database...\n');

  try {
    // Get extensions
    const extensions = await getExtensions(supabase);
    console.log('📦 Extensions:', extensions.length);
    extensions.forEach(ext => console.log(`   - ${ext.name} (${ext.version})`));

    // Get tables
    const tables = await getTables(supabase);
    console.log(`\n📊 Tables: ${tables.length}`);
    
    for (const table of tables) {
      console.log(`\n   Table: ${table.schema}.${table.name}`);
      console.log(`   RLS Enabled: ${table.rlsEnabled}`);
      console.log(`   Columns: ${table.columns.length}`);
      table.columns.forEach(col => {
        const pk = col.isPrimaryKey ? ' [PK]' : '';
        const nullable = col.nullable ? ' NULL' : ' NOT NULL';
        const def = col.default ? ` DEFAULT ${col.default}` : '';
        console.log(`     - ${col.name}: ${col.type}${nullable}${def}${pk}`);
      });
      
      console.log(`   Indexes: ${table.indexes.length}`);
      table.indexes.forEach(idx => {
        const unique = idx.unique ? ' [UNIQUE]' : '';
        console.log(`     - ${idx.name}${unique}: ${idx.definition}`);
      });
      
      console.log(`   Constraints: ${table.constraints.length}`);
      table.constraints.forEach(con => {
        console.log(`     - ${con.name} (${con.type}): ${con.definition}`);
      });
      
      console.log(`   Triggers: ${table.triggers.length}`);
      table.triggers.forEach(trg => {
        console.log(`     - ${trg.name}: ${trg.timing} ${trg.event} -> ${trg.function}`);
      });
      
      console.log(`   Policies: ${table.policies.length}`);
      table.policies.forEach(pol => {
        console.log(`     - ${pol.name} (${pol.command}): ${pol.definition}`);
      });
    }

    // Get functions
    const functions = await getFunctions(supabase);
    console.log(`\n🔧 Functions: ${functions.length}`);
    functions.forEach(fn => {
      console.log(`   - ${fn.schema}.${fn.name}(${fn.arguments}): ${fn.returnType} [${fn.security}]`);
    });

    // Get storage buckets
    const buckets = await getStorageBuckets(supabase);
    console.log(`\n🗄️  Storage Buckets: ${buckets.length}`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (public: ${bucket.public}, policies: ${bucket.policies.length})`);
    });

    // Output JSON for programmatic use
    const inventory = {
      extensions,
      tables,
      functions,
      buckets,
      timestamp: new Date().toISOString(),
    };

    console.log('\n✅ Inventory complete');
    return inventory;
  } catch (error) {
    console.error('❌ Error inventorying database:', error);
    throw error;
  }
}

async function getExtensions(supabase: any): Promise<ExtensionInfo[]> {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT extname as name, extversion as version
      FROM pg_extension
      WHERE extname NOT IN ('plpgsql')
      ORDER BY extname;
    `,
  });

  if (error) {
    // Fallback: direct query via service role
    const { data: directData, error: directError } = await supabase
      .from('pg_extension')
      .select('extname, extversion');
    
    if (directError) {
      console.warn('Could not query extensions:', directError);
      return [];
    }
    
    return (directData || []).map((row: any) => ({
      name: row.extname,
      version: row.extversion,
    }));
  }

  return data || [];
}

async function getTables(supabase: any): Promise<TableInfo[]> {
  // Query information_schema for tables
  const tablesQuery = `
    SELECT 
      table_schema,
      table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name;
  `;

  const { data: tablesData, error } = await supabase.rpc('exec_sql', {
    query: tablesQuery,
  });

  if (error) {
    console.warn('Could not query tables via RPC, trying direct approach...');
    // We'll need to use a different approach - query via Postgres directly
    // For now, return empty and handle in verification script
    return [];
  }

  const tables: TableInfo[] = [];

  for (const tableRow of tablesData || []) {
    const schema = tableRow.table_schema;
    const name = tableRow.table_name;
    
    const columns = await getColumns(supabase, schema, name);
    const indexes = await getIndexes(supabase, schema, name);
    const constraints = await getConstraints(supabase, schema, name);
    const triggers = await getTriggers(supabase, schema, name);
    const rlsEnabled = await getRLSStatus(supabase, schema, name);
    const policies = await getPolicies(supabase, schema, name);

    tables.push({
      schema,
      name,
      columns,
      indexes,
      constraints,
      triggers,
      rlsEnabled,
      policies,
    });
  }

  return tables;
}

async function getColumns(supabase: any, schema: string, table: string): Promise<ColumnInfo[]> {
  const query = `
    SELECT 
      c.column_name,
      c.data_type,
      c.udt_name,
      c.is_nullable,
      c.column_default,
      CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
    FROM information_schema.columns c
    LEFT JOIN (
      SELECT ku.table_schema, ku.table_name, ku.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage ku
        ON tc.constraint_name = ku.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
    ) pk ON c.table_schema = pk.table_schema 
      AND c.table_name = pk.table_name 
      AND c.column_name = pk.column_name
    WHERE c.table_schema = $1 AND c.table_name = $2
    ORDER BY c.ordinal_position;
  `;

  // Since we can't use parameterized queries easily via RPC, we'll construct the query
  const { data, error } = await supabase.rpc('exec_sql', {
    query: query.replace('$1', `'${schema}'`).replace('$2', `'${table}'`),
  });

  if (error) {
    console.warn(`Could not query columns for ${schema}.${table}:`, error);
    return [];
  }

  return (data || []).map((row: any) => ({
    name: row.column_name,
    type: row.udt_name || row.data_type,
    nullable: row.is_nullable === 'YES',
    default: row.column_default,
    isPrimaryKey: row.is_primary_key,
  }));
}

async function getIndexes(supabase: any, schema: string, table: string): Promise<IndexInfo[]> {
  const query = `
    SELECT
      i.indexname as name,
      i.indexdef as definition,
      i.indexdef LIKE '%UNIQUE%' as unique,
      array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) FILTER (WHERE a.attname IS NOT NULL) as columns
    FROM pg_indexes i
    JOIN pg_class c ON c.relname = i.indexname
    JOIN pg_index ix ON ix.indexrelid = c.oid
    LEFT JOIN pg_attribute a ON a.attrelid = ix.indrelid AND a.attnum = ANY(ix.indkey)
    WHERE i.schemaname = '${schema}' AND i.tablename = '${table}'
    GROUP BY i.indexname, i.indexdef
    ORDER BY i.indexname;
  `;

  const { data, error } = await supabase.rpc('exec_sql', {
    query,
  });

  if (error) {
    console.warn(`Could not query indexes for ${schema}.${table}:`, error);
    return [];
  }

  return (data || []).map((row: any) => ({
    name: row.name,
    definition: row.definition,
    unique: row.unique,
    columns: row.columns || [],
  }));
}

async function getConstraints(supabase: any, schema: string, table: string): Promise<ConstraintInfo[]> {
  const query = `
    SELECT
      tc.constraint_name as name,
      tc.constraint_type as type,
      pg_get_constraintdef(c.oid) as definition
    FROM information_schema.table_constraints tc
    JOIN pg_constraint c ON c.conname = tc.constraint_name
    WHERE tc.table_schema = '${schema}' AND tc.table_name = '${table}'
    ORDER BY tc.constraint_type, tc.constraint_name;
  `;

  const { data, error } = await supabase.rpc('exec_sql', {
    query,
  });

  if (error) {
    console.warn(`Could not query constraints for ${schema}.${table}:`, error);
    return [];
  }

  return (data || []).map((row: any) => ({
    name: row.name,
    type: row.type as ConstraintInfo['type'],
    definition: row.definition,
  }));
}

async function getTriggers(supabase: any, schema: string, table: string): Promise<TriggerInfo[]> {
  const query = `
    SELECT
      t.trigger_name as name,
      t.event_manipulation as event,
      t.action_timing as timing,
      t.action_statement as function
    FROM information_schema.triggers t
    WHERE t.trigger_schema = '${schema}' AND t.event_object_table = '${table}'
    ORDER BY t.trigger_name;
  `;

  const { data, error } = await supabase.rpc('exec_sql', {
    query,
  });

  if (error) {
    console.warn(`Could not query triggers for ${schema}.${table}:`, error);
    return [];
  }

  return (data || []).map((row: any) => ({
    name: row.name,
    event: row.event,
    timing: row.timing,
    function: row.function,
  }));
}

async function getRLSStatus(supabase: any, schema: string, table: string): Promise<boolean> {
  const query = `
    SELECT relrowsecurity as rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = '${schema}' AND c.relname = '${table}';
  `;

  const { data, error } = await supabase.rpc('exec_sql', {
    query,
  });

  if (error || !data || data.length === 0) {
    return false;
  }

  return data[0].rls_enabled === true;
}

async function getPolicies(supabase: any, schema: string, table: string): Promise<PolicyInfo[]> {
  const query = `
    SELECT
      pol.polname as name,
      pol.polcmd as command,
      pg_get_expr(pol.polqual, pol.polrelid) as definition
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = '${schema}' AND c.relname = '${table}'
    ORDER BY pol.polname;
  `;

  const { data, error } = await supabase.rpc('exec_sql', {
    query,
  });

  if (error) {
    console.warn(`Could not query policies for ${schema}.${table}:`, error);
    return [];
  }

  return (data || []).map((row: any) => ({
    name: row.name,
    command: row.command,
    definition: row.definition || '',
  }));
}

async function getFunctions(supabase: any): Promise<FunctionInfo[]> {
  const query = `
    SELECT
      n.nspname as schema,
      p.proname as name,
      pg_get_function_result(p.oid) as return_type,
      pg_get_function_arguments(p.oid) as arguments,
      CASE WHEN p.prosecdef THEN 'DEFINER' ELSE 'INVOKER' END as security
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND p.prokind = 'f'
    ORDER BY n.nspname, p.proname;
  `;

  const { data, error } = await supabase.rpc('exec_sql', {
    query,
  });

  if (error) {
    console.warn('Could not query functions:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    schema: row.schema,
    name: row.name,
    returnType: row.return_type,
    arguments: row.arguments || '',
    security: row.security,
  }));
}

async function getStorageBuckets(supabase: any): Promise<StorageBucketInfo[]> {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.warn('Could not query storage buckets:', error);
    return [];
  }

  const bucketsWithPolicies: StorageBucketInfo[] = [];

  for (const bucket of buckets || []) {
    // Note: Storage policies are managed via RLS on storage.objects
    // We can't easily query them via the JS client, so we'll note the bucket exists
    bucketsWithPolicies.push({
      name: bucket.name,
      public: bucket.public || false,
      policies: [], // Would need direct SQL query to get these
    });
  }

  return bucketsWithPolicies;
}

// Main execution
if (require.main === module) {
  inventoryDatabase()
    .then(inventory => {
      // Write to file for programmatic use
      const fs = require('fs');
      fs.writeFileSync(
        '/workspace/.db-inventory.json',
        JSON.stringify(inventory, null, 2)
      );
      console.log('\n📄 Inventory saved to .db-inventory.json');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { inventoryDatabase };
