# DATABASE MIGRATIONS SETUP - COMPLETE
**Status: Migration Runner Ready for GitHub Secrets**

**Date:** 2024-12-30

---

## ✅ MIGRATION RUNNER IMPLEMENTED

### Migration Script Created
**File:** `scripts/run-all-migrations.ts`

**Features:**
- ✅ Uses environment variables dynamically (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- ✅ Connects directly to PostgreSQL using `pg` package
- ✅ Tracks applied migrations in `schema_migrations` table
- ✅ Runs migrations in order (sorted by version number)
- ✅ Transactional execution (rollback on error)
- ✅ Idempotent (can run multiple times safely)
- ✅ Detailed logging and error reporting

### GitHub Actions Workflow Updated
**File:** `.github/workflows/migrations.yml`

**Features:**
- ✅ Automatically runs on push to main (when migration files change)
- ✅ Can be manually triggered via workflow_dispatch
- ✅ Uses GitHub Secrets for SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- ✅ Installs dependencies automatically
- ✅ Runs TypeScript migration runner
- ✅ Verifies migrations after running

---

## 🔧 SETUP INSTRUCTIONS

### 1. GitHub Secrets Configuration

Add these secrets to your GitHub repository:

1. Go to: **Settings → Secrets and variables → Actions**
2. Add the following secrets:

   **SUPABASE_URL**
   - Value: Your Supabase project URL
   - Format: `https://[project-ref].supabase.co`
   - Or: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

   **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key (admin access)
   - Found in: Supabase Dashboard → Settings → API → service_role key

### 2. Local Development

**Option 1: Using npm script**
```bash
cd backend
SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key npm run migrate
```

**Option 2: Using root script**
```bash
SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key npm run db:migrate
```

**Option 3: Using .env file**
```bash
# Create .env file in root or backend directory
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key

# Then run
cd backend && npm run migrate
```

### 3. CI/CD Usage

The GitHub Actions workflow will automatically:
1. Detect new migration files
2. Run migrations using secrets
3. Verify migrations completed
4. Report results

**Manual trigger:**
- Go to Actions → Run Database Migrations → Run workflow

---

## 📋 MIGRATION FILES

### Current Migrations (15 files)
1. `00000000000000_backend_contract_reconcile.sql` - Initial schema
2. `001_create_user_profiles.sql` - User profiles table
3. `002_create_prompt_atoms.sql` - Prompt atoms
4. `003_create_vibe_configs.sql` - Vibe configs
5. `004_create_agent_runs.sql` - Agent runs
6. `005_create_background_events.sql` - Background events
7. `006_add_indexes.sql` - Indexes
8. `007_add_constraints.sql` - Constraints
9. `008_add_premium_features.sql` - Premium features
10. `010_create_user_template_customizations.sql` - Template customizations
11. `011_enhance_template_system.sql` - Template enhancements
12. `012_add_rls_core_tables.sql` - RLS policies
13. `013_add_billing_and_orgs.sql` - Billing and organizations
14. `014_create_failure_memory_system.sql` - Failure memory system
15. `015_add_pro_plus_tier.sql` - **NEW: Pro+ tier support** ✅

### Migration Tracking

Migrations are tracked in the `schema_migrations` table:
```sql
CREATE TABLE schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

## 🚀 USAGE EXAMPLES

### Run All Pending Migrations
```bash
cd backend
npm run migrate
```

### Verify Migrations
```bash
tsx scripts/verify-migrations.ts
```

### Check Applied Migrations
```sql
SELECT version, name, applied_at 
FROM schema_migrations 
ORDER BY applied_at;
```

---

## 🔍 TROUBLESHOOTING

### Error: "SUPABASE_URL environment variable is required"
**Solution:** Set the environment variable:
```bash
export SUPABASE_URL=your_url
export SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Error: "Connection refused"
**Solution:** 
- Check SUPABASE_URL format
- Ensure service role key is correct
- Check firewall/network settings

### Error: "Migration already exists"
**Solution:** This is normal for idempotent migrations. The migration runner skips already-applied migrations.

### Error: "Table already exists"
**Solution:** Some migrations use `IF NOT EXISTS` clauses. This is expected behavior.

---

## 📊 MIGRATION STATUS

### Latest Migration: `015_add_pro_plus_tier.sql`

**Changes:**
- ✅ Adds 'pro+' to subscription_tier constraint
- ✅ Adds `prevented_failures_count` column
- ✅ Adds `guarantee_coverage` TEXT[] column
- ✅ Adds `integration_access` TEXT[] column
- ✅ Adds indexes for performance
- ✅ Adds column comments for documentation

**To Apply:**
```bash
cd backend
npm run migrate
```

---

## ✅ VERIFICATION

After running migrations, verify:

1. **Check schema_migrations table:**
```sql
SELECT * FROM schema_migrations ORDER BY applied_at;
```

2. **Check user_profiles columns:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('subscription_tier', 'prevented_failures_count', 'guarantee_coverage', 'integration_access');
```

3. **Check constraint:**
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'user_profiles_subscription_tier_check';
```

---

## 🎯 NEXT STEPS

1. **Add GitHub Secrets:**
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

2. **Test Locally:**
   ```bash
   cd backend
   npm run migrate
   ```

3. **Verify in GitHub Actions:**
   - Push a commit or manually trigger workflow
   - Check Actions tab for results

4. **Monitor:**
   - Check migration logs
   - Verify database schema
   - Test application functionality

---

## 📝 NOTES

- Migrations run in transactions (rollback on error)
- Migrations are idempotent (safe to run multiple times)
- Migration tracking prevents duplicate execution
- All migrations are logged with timestamps
- Failed migrations stop the process (can be configured to continue)

---

*Last updated: 2024-12-30*
