# Backend Contract Verification

This document describes how to verify that the live Supabase database matches the expected backend contract defined in this repository.

## Overview

The backend contract includes:
- **Tables**: All user-facing and system tables with correct schemas
- **Columns**: Required columns with correct types, nullability, and defaults
- **Indexes**: Performance indexes for common queries
- **Constraints**: Primary keys, foreign keys, unique constraints, check constraints
- **RLS Policies**: Row-level security policies for tenant isolation
- **Functions**: RPC functions for template usage tracking and other operations
- **Triggers**: Automatic timestamp updates and history tracking
- **Extensions**: Required PostgreSQL extensions (uuid-ossp, vector)

## Quick Start

### Verify Database Contract

```bash
# Set environment variables
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"

# Run verification
npm run db:verify
```

### Run Smoke Tests

```bash
# Run runtime verification tests
npm run db:smoke
```

### Reconcile Database

If verification finds missing components, apply the reconciliation migration:

1. Open Supabase SQL Editor
2. Copy contents of `backend/supabase/migrations/00000000000000_backend_contract_reconcile.sql`
3. Run the migration (it's idempotent and safe to re-run)

Or use the npm script:

```bash
npm run db:reconcile
# Follow the instructions to run the migration in Supabase SQL editor
```

## Verification Scripts

### `db:verify`

Compares the live database state against the expected contract:

- ✅ Checks all required tables exist
- ✅ Verifies critical columns are present
- ✅ Validates extensions are installed
- ✅ Confirms functions are callable
- ✅ Checks RLS is enabled on user tables

**Output**: Pass/fail status for each component with details.

### `db:smoke`

Runs runtime verification tests:

- ✅ Service role can query tables
- ✅ RLS blocks anon access to user data
- ✅ Functions are callable
- ✅ Basic CRUD operations work

**Output**: Test results with timing information.

## Healthcheck Endpoint

The backend provides a comprehensive healthcheck endpoint:

```
GET /admin/health
```

**Authentication**: Requires admin role

**Response**: JSON with:
- Database connectivity and response time
- Required tables status
- Function availability
- RLS enforcement status
- Service status (Redis, Stripe)

**Example**:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://your-api.com/admin/health
```

## Expected Database Schema

### Core Tables

- `user_profiles` - User profile data with preferences and billing
- `prompt_atoms` - Reusable prompt components
- `vibe_configs` - User vibe/personality configurations
- `agent_runs` - Agent execution history
- `background_events` - Event-driven background processing

### Template System Tables

- `user_template_customizations` - User template customizations
- `template_versions` - Template versioning
- `template_customization_history` - Change history for rollback
- `template_usage_analytics` - Usage metrics
- `template_feedback` - User feedback/ratings
- `shared_template_customizations` - Team-shared templates
- `template_presets` - Template presets

### Billing & Organizations

- `organizations` - Multi-tenant organizations
- `organization_members` - Org membership
- `invitations` - Org invitations
- `usage_metrics` - Usage metering

## RLS Policies

All user-owned tables have RLS enabled with policies that:

- **SELECT**: Users can only view their own data
- **INSERT**: Users can only insert data with their own `user_id`
- **UPDATE**: Users can only update their own data
- **DELETE**: Users can only delete their own data

Organization tables have additional policies for:
- Org members can view org data
- Admins can manage members and invitations

## CI/CD Integration

### Automatic Verification

The CI pipeline runs database verification on:
- Every push to `main`
- When migration files change
- Daily via scheduled workflow

### Manual Verification

Run verification manually:

```bash
# In CI/CD or locally
npm run db:verify
npm run db:smoke
```

## Troubleshooting

### Missing Tables

If tables are missing, run the reconciliation migration:

```bash
# Copy migration SQL to Supabase SQL Editor
cat backend/supabase/migrations/00000000000000_backend_contract_reconcile.sql
```

### RLS Not Working

Check that:
1. RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Policies exist: Query `pg_policies` to see existing policies
3. Policies are correct: Verify `auth.uid()` checks match user_id format

### Functions Missing

Functions are defined in the reconciliation migration. Re-run it to recreate:

```sql
CREATE OR REPLACE FUNCTION function_name(...) ...
```

### Extensions Missing

Install required extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

## Migration Strategy

### Canonical Migration

The reconciliation migration (`00000000000000_backend_contract_reconcile.sql`) is the **single source of truth** for the database schema. It:

- Is fully idempotent (safe to run multiple times)
- Uses `IF NOT EXISTS` patterns
- Handles conflicts gracefully
- Includes all tables, indexes, constraints, RLS policies, functions, and triggers

### Old Migrations

Individual migration files in `backend/supabase/migrations/` are kept for:
- Historical reference
- Understanding incremental changes
- Rollback scenarios (if needed)

After reconciliation, old migrations can be archived but the canonical migration should always be runnable.

## Best Practices

1. **Always verify after migrations**: Run `db:verify` after applying any migration
2. **Test RLS**: Use `db:smoke` to verify RLS is working correctly
3. **Monitor health**: Set up monitoring for `/admin/health` endpoint
4. **Keep canonical migration updated**: When adding new features, update the reconciliation migration
5. **Document changes**: Update this document when schema changes

## Related Files

- `scripts/db-verify.ts` - Verification script
- `scripts/db-smoke.ts` - Smoke test script
- `scripts/db-inventory.ts` - Database inventory script
- `backend/supabase/migrations/00000000000000_backend_contract_reconcile.sql` - Canonical migration
- `backend/src/routes/admin.ts` - Healthcheck endpoint

## Support

For issues or questions:
1. Check verification output for specific errors
2. Review migration logs in Supabase dashboard
3. Check CI/CD logs for automated verification results
4. Review this documentation
