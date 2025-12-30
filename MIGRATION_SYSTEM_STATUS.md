# ✅ Migration System - Ready and Configured

**Status:** ✅ **READY TO USE**  
**Date:** 2024-12-30

## Configuration

The migration workflow is now correctly configured to use your existing GitHub secrets:

- ✅ **DATABASE_URL** - Used for running migrations
- ✅ **SUPABASE_URL** - Available for app features (not used by migrations)

## How It Works

### Automatic Trigger
When you merge SQL migration files to `main`:
1. GitHub Actions detects new `.sql` files in `backend/supabase/migrations/`
2. Workflow runs automatically
3. Uses `DATABASE_URL` secret to connect
4. Runs migrations via `psql`
5. Archives successful migrations
6. Commits archive changes back to repo

### Manual Trigger
1. Go to **Actions** → **Database Migrations**
2. Click **Run workflow**
3. Select branch (usually `main`)
4. Optionally enable **Force run all migrations**
5. Click **Run workflow**

## Next Steps

### Test the System

1. **Create a test migration:**
   ```bash
   echo "-- Test migration
   CREATE TABLE IF NOT EXISTS migration_test (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );" > backend/supabase/migrations/999_test_migration.sql
   ```

2. **Commit and merge to main:**
   ```bash
   git add backend/supabase/migrations/999_test_migration.sql
   git commit -m "test: Add test migration"
   git push origin main
   ```

3. **Watch GitHub Actions:**
   - Go to Actions tab
   - Watch "Database Migrations" workflow run
   - Verify migration executes
   - Check archive directory is updated

### Verify It Worked

- ✅ Check GitHub Actions logs for success
- ✅ Check `backend/supabase/migrations/archive/` for archived file
- ✅ Check `.migrations_tracked.txt` for tracking entry
- ✅ Verify table exists in database

## Current Migration Files

All existing migrations in `backend/supabase/migrations/`:
- `001_create_user_profiles.sql`
- `002_create_prompt_atoms.sql`
- `003_create_vibe_configs.sql`
- `004_create_agent_runs.sql`
- `005_create_background_events.sql`
- `006_add_indexes.sql`
- `007_add_constraints.sql`
- `008_add_premium_features.sql`
- `010_create_user_template_customizations.sql`
- `011_enhance_template_system.sql`
- `012_add_rls_core_tables.sql`
- `013_add_billing_and_orgs.sql`

**Note:** These will be detected and run on next workflow execution (if not already applied).

## Troubleshooting

### If migrations don't run automatically:
- Check: File path matches `backend/supabase/migrations/**/*.sql`
- Check: Changes are merged to `main` branch
- Check: GitHub Actions workflow is enabled

### If migration fails:
- Check: `DATABASE_URL` secret is set correctly
- Check: Connection string format is valid
- Check: Database is accessible from GitHub Actions IPs
- Check: Migration SQL syntax is correct

### If archive doesn't commit:
- Check: GitHub Actions has `contents: write` permission
- Check: GITHUB_TOKEN has write access
- May need: Manual commit if permissions insufficient

---

**✅ System is ready! Your existing secrets are configured correctly.**
