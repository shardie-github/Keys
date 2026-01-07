# Launch Verification & Rollback Runbook

## 1. Prerequisites
- [ ] Environment variables set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`).
- [ ] Supabase CLI installed and authenticated.
- [ ] GitHub Actions enabled.

## 2. Verification Steps

### A. CI/CD Checks
1.  **Push Changes**: Commit and push the hardening changes.
2.  **Verify Workflows**:
    - Check "Supabase Migrations" workflow in GitHub Actions. It should pass and print "✅ All public tables have RLS enabled."
    - Check "Quality Checks" workflow.

### B. Database Verification (Local or Remote)
Run the following SQL queries to verify the hardening:

```sql
-- 1. Check for insecure functions (Should return 0 rows)
SELECT proname, proconfig 
FROM pg_proc 
WHERE prosecdef = true 
AND (proconfig IS NULL OR NOT 'search_path=public' = ANY(proconfig));

-- 2. Check for RLS enforcement (Should return 0 rows)
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;
```

### C. Runtime Verification
1.  **Auth Redirect**: Open incognito window and visit `/dashboard`. You should be redirected to `/signin`.
2.  **Public Access**: Visit `/signin`. You should see the page.
3.  **Headers**: Inspect response headers on `/dashboard` (Network tab). Verify `X-Frame-Options: DENY` is present.

## 3. Rollback Plan

### Scenario 1: Migration Fails
**Symptom**: GitHub Action fails during `supabase db push`.
**Action**:
1.  Check the logs to identify the conflict.
2.  If it's a constraint violation, fix the data or adjust the migration.
3.  Since the migration is idempotent, you can retry after fixing.

### Scenario 2: Production Broken After Deploy
**Symptom**: 500 errors or functionality loss.
**Action**:
1.  **Revert Code**:
    ```bash
    git revert HEAD
    git push origin main
    ```
2.  **Rollback Database (If schema caused issues)**:
    - *Option A (Safe)*: If the migration was additive (adding policies/tables), you might not need to rollback DB if the code revert ignores them.
    - *Option B (Full Restore)*: Restore from the nightly backup or the backup taken immediately before launch.
    - *Option C (Manual Revert)*: Create a new migration file `backend/supabase/migrations/xxxx_rollback.sql` that drops the added policies or reverts the function definition.

    ```sql
    -- Example Rollback for function security
    CREATE OR REPLACE FUNCTION public.track_template_usage(...) 
    ... 
    SECURITY DEFINER; -- Remove SET search_path (if that was the cause, unlikely)
    ```

### 4. Emergency Contacts
- **Database**: Ops Team
- **Security**: Security Lead
