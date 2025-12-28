# Supabase Schema Setup Guide

This guide explains how to set up the complete backend schema in Supabase with RLS (Row Level Security) policies.

## Quick Start

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Click "New Query"

2. **Run the Complete Schema**
   - Copy the contents of `complete_schema_with_rls.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

3. **Verify Setup**
   - Check that all tables are created in the Table Editor
   - Verify RLS is enabled on all tables (should show a shield icon)
   - Test a query to ensure policies work

## Important Notes

### Authentication Setup

The schema uses a custom `auth_user_id()` function that extracts the user ID from JWT claims. You have two options:

#### Option 1: Use Supabase Auth (Recommended for new projects)

If you're using Supabase's built-in authentication (`auth.users` table), you'll need to:

1. Update the `auth_user_id()` function to use `auth.uid()`:
   ```sql
   CREATE OR REPLACE FUNCTION auth_user_id()
   RETURNS TEXT AS $$
   BEGIN
     RETURN COALESCE(
       auth.uid()::text,
       current_setting('request.jwt.claims', true)::json->>'user_id',
       NULL
     );
   END;
   $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
   ```

2. Ensure your JWT tokens include the user ID in the claims

#### Option 2: Custom Auth (Current Implementation)

If you're using a custom authentication system with TEXT user IDs:

1. Ensure your JWT tokens include `user_id` in the claims
2. The current `auth_user_id()` function will extract it automatically

### Service Role Access

The schema includes policies that allow the `service_role` to bypass RLS. This is necessary for:
- Backend services that need to access all data
- Admin operations
- Background jobs

**Important**: Never expose the service role key to the frontend. Only use it in secure backend environments.

## Schema Overview

### Core Tables

- **user_profiles**: User profile data, preferences, and behavior embeddings
- **prompt_atoms**: Reusable prompt components
- **vibe_configs**: User-configured vibe settings
- **agent_runs**: Execution logs with prompts and outputs
- **background_events**: Events from integrations
- **notifications**: User notifications

### Template System Tables

- **user_template_customizations**: User-specific template settings
- **template_customization_history**: Change history for rollback
- **template_usage_analytics**: Usage and performance metrics
- **template_feedback**: User ratings and feedback
- **shared_template_customizations**: Shared templates
- **template_presets**: Pre-configured presets
- **template_versions**: Version history

## Indexes

The schema includes optimized indexes for:
- User lookups (`user_id`)
- Time-based queries (`created_at DESC`)
- JSONB fields (GIN indexes)
- Array fields (GIN indexes)
- Vector similarity search (IVFFlat for embeddings)
- Partial indexes for common query patterns

## RLS Policies

All tables have RLS enabled with policies that:
- Allow users to view/manage only their own data
- Allow service role full access
- Provide public read access where appropriate (e.g., public shared templates)
- Restrict writes to authorized users only

## Functions

### `update_updated_at_column()`
Automatically updates the `updated_at` timestamp on row updates.

### `track_template_usage()`
Tracks template usage metrics including success rates, tokens, and latency.

### `create_customization_history()`
Automatically creates history entries when customizations change.

### `auth_user_id()`
Extracts the current user ID from JWT claims.

## Testing RLS Policies

After setup, test your RLS policies:

```sql
-- Test as authenticated user (replace with actual user_id)
SET request.jwt.claims = '{"user_id": "test-user-123"}';

-- Should return only your own profile
SELECT * FROM user_profiles;

-- Should fail (can't see other users' data)
SELECT * FROM user_profiles WHERE user_id = 'other-user';

-- Test service role access
SET ROLE service_role;
SELECT * FROM user_profiles; -- Should see all
RESET ROLE;
```

## Troubleshooting

### "Permission denied" errors

1. Check that RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. Verify your JWT includes the correct claims
3. Ensure you're using the service role key for backend operations

### Missing indexes

If queries are slow, check that indexes were created:
```sql
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
```

### Vector similarity search not working

Ensure the `vector` extension is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS "vector";
```

## Next Steps

1. **Set up authentication** in Supabase Dashboard
2. **Configure environment variables** in your backend:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Test API endpoints** to ensure RLS works correctly
4. **Monitor query performance** and add additional indexes if needed

## Support

If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify your JWT token structure
3. Test RLS policies individually
4. Check that all extensions are enabled
