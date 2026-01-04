# Supabase RLS Lockout Recovery Runbook

## Scope

This runbook covers:
- Users locked out due to RLS (Row-Level Security) policy misconfiguration
- RLS policies preventing legitimate access
- RLS policies blocking application functionality
- Service account lockouts due to RLS
- RLS policy conflicts

This runbook does NOT cover:
- Database connection failures (see: Database Connection Failure Runbook)
- Authentication failures (see: Authentication Failure Runbook)
- Supabase service outages (see: Service Outage Runbook)
- RLS policy creation (see: RLS Policy Setup Runbook)

---

## When to Use This Runbook

Use this runbook when:
- Users report being unable to access their data
- Application logs show RLS policy violations
- Service accounts cannot access required data
- Monitoring alert: "rls_policy_violation_rate > 5%"
- Application functionality blocked by RLS

---

## When NOT to Use This Runbook

Do NOT use this runbook for:
- Database connection failures (use: Database Connection Failure Runbook)
- Authentication failures (use: Authentication Failure Runbook)
- Supabase service outages (use: Service Outage Runbook)
- Creating new RLS policies (use: RLS Policy Setup Runbook)

---

## Immediate Safety Checks (First 2 Minutes)

**DO THESE FIRST:**

1. **Verify database connectivity**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```
   - If fails: See Database Connection Failure Runbook
   - If succeeds: Continue

2. **Check Supabase dashboard status**
   - Navigate: Supabase Dashboard → Project Settings → Database
   - Verify: Database is accessible
   - If down: See Service Outage Runbook

3. **Identify affected users**
   - Check: User reports or error logs
   - Estimate: Number of affected users
   - If > 100: Consider emergency RLS policy update

4. **Check recent RLS policy changes**
   - Review: Recent migrations or policy updates
   - If changed in last 15 minutes: Consider rollback

**DO NOT:**
- Disable RLS entirely (security risk)
- Modify policies without understanding impact
- Skip verification steps

---

## Diagnosis Flow

### Step 1: Identify RLS Policy Violations

**Action**: Check application logs for RLS violations

```bash
# Filter logs for RLS violations
grep -i "row-level security" /var/log/app.log | tail -50
grep -i "permission denied" /var/log/app.log | tail -50
```

**Expected**: Specific RLS violation errors

**If Violations Found**:
- Note: Which policies are failing
- Note: Which users/tables are affected
- Continue to Step 2

**If No Violations**:
- Issue may be elsewhere
- See: Authentication Failure Runbook

---

### Step 2: Verify RLS Policy Configuration

**Action**: Check current RLS policies

```bash
# List RLS policies
psql $DATABASE_URL -c "
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
"
```

**Expected**: List of RLS policies

**If Policies Missing**:
- RLS may be disabled or policies not created
- Continue to Action Steps

**If Policies Exist**:
- Review policy definitions
- Continue to Step 3

---

### Step 3: Test RLS Policy with Affected User

**Action**: Test RLS policy with affected user context

```bash
# Test as affected user
psql $DATABASE_URL -c "
SET ROLE authenticated;
SET request.jwt.claim.sub = 'affected_user_id';
SELECT * FROM subscriptions WHERE id = 'test_id';
"
```

**Expected**: Query succeeds or returns permission denied

**If Permission Denied**:
- RLS policy is blocking access
- Continue to Action Steps

**If Query Succeeds**:
- Issue may be elsewhere
- Check application code

---

### Step 4: Check RLS Policy Logic

**Action**: Review RLS policy logic for issues

- **KEY**: `node-supabase-rls-guard`
- **Location**: `/node-keys/supabase-rls-guard/src/index.ts`
- **Review**: Policy definitions and logic

**Expected**: Clear understanding of policy logic

**If Logic Issue Found**:
- Policy may be too restrictive
- Continue to Action Steps

**If Logic Correct**:
- Issue may be with user context
- Continue to Action Steps

---

## Action Steps

### Action 1: Update RLS Policy (REVERSIBLE)

**Precondition**: Identified RLS policy issue in Step 2 or 4

**Automated (Preferred)**:
- **KEY**: `node-supabase-rls-guard`
- **Location**: `/node-keys/supabase-rls-guard/src/index.ts`

**Execution**:
```typescript
import { updateRLSPolicies } from '@/node-keys/supabase-rls-guard/src';

await updateRLSPolicies({
  table: 'subscriptions',
  policy: 'tenant_isolation',
  action: 'update',
  definition: `
    USING (
      tenant_id = current_setting('app.tenant_id')::uuid
      OR auth.uid() = user_id
    )
  `,
  dryRun: false,
});
```

**Manual Alternative**:
```sql
-- Update RLS policy
ALTER POLICY tenant_isolation ON subscriptions
USING (
  tenant_id = current_setting('app.tenant_id')::uuid
  OR auth.uid() = user_id
);
```

**Expected**: RLS policy updated, users can access data

**Verification**: Test with affected user (Step 3)

**Rollback**: Restore previous policy definition

---

### Action 2: Temporarily Relax RLS Policy (REVERSIBLE - USE WITH CAUTION)

**Precondition**: Emergency situation, many users affected

**Warning**: This reduces security. Use only as temporary measure.

**Action**:
```sql
-- Temporarily allow broader access
ALTER POLICY tenant_isolation ON subscriptions
USING (true); -- Allow all access temporarily

-- Fix root cause, then restore proper policy
```

**Expected**: Users can access data immediately

**Verification**: Test with affected users

**Rollback**: Restore proper policy immediately after fixing root cause

---

### Action 3: Fix User Context (REVERSIBLE)

**Precondition**: Identified user context issue

**Action**: Ensure user context is set correctly

```typescript
// In application code, ensure user context is set
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
    },
  }
);

// Ensure user is authenticated
const { data: { user } } = await supabase.auth.getUser();
```

**Expected**: User context set correctly, RLS works

**Verification**: Test with affected user

**Rollback**: Revert code changes if needed

---

### Action 4: Restore Previous RLS Policy (REVERSIBLE)

**Precondition**: Recent policy change caused issue

**Action**: Restore previous policy from backup or version control

```sql
-- Restore previous policy
ALTER POLICY tenant_isolation ON subscriptions
USING (
  -- Previous policy definition
  tenant_id = current_setting('app.tenant_id')::uuid
);
```

**Expected**: Previous policy restored, issue resolved

**Verification**: Test with affected users

**Rollback**: Can update policy again if needed

---

## Verification

### Immediate Verification (Within 5 Minutes)

1. **Test with Affected User**
   ```bash
   psql $DATABASE_URL -c "
   SET ROLE authenticated;
   SET request.jwt.claim.sub = 'affected_user_id';
   SELECT * FROM subscriptions LIMIT 1;
   "
   ```
   **Success**: Query succeeds

2. **Check Application Logs**
   ```bash
   tail -f /var/log/app.log | grep "row-level security"
   ```
   **Success**: No RLS violations

3. **Test Application Functionality**
   - Login as affected user
   - **Success**: Can access data

### Ongoing Verification (Next 24 Hours)

1. **Monitor RLS Violations**
   - Check: Application logs for violations
   - **Success**: No violations

2. **Monitor User Reports**
   - Check: No new lockout reports
   - **Success**: No reports

### Final Verification (After 1 Week)

1. **Full RLS Policy Audit**
   - Review: All RLS policies
   - **Success**: Policies correct and secure

2. **Security Review**
   - Verify: RLS policies maintain security
   - **Success**: Security maintained

---

## Rollback / Escalation

### When to Rollback

Rollback if:
- Policy update made things worse
- More users affected after update
- Security compromised

### Rollback Procedures

**If Action 1 (Update Policy) Made Things Worse**:
- Restore previous policy definition
- Investigate why update failed

**If Action 2 (Relax Policy) Was Applied**:
- Restore proper policy immediately
- Fix root cause
- Verify security maintained

### When to Escalate

Escalate if:
- > 100 users affected
- Cannot resolve after 1 hour
- Security incident suspected
- Data breach possible

---

## Evidence & Audit Notes

### Required Audit Trail Entries

1. **Lockout Start Time**: [Timestamp]
2. **Affected Users**: [Count and user IDs]
3. **Root Cause**: [What caused lockout]
4. **Actions Taken**: [List actions]
5. **Resolution Time**: [Timestamp]
6. **Verification Results**: [Results]

### Artifacts to Save

1. **RLS Policy Definitions**
   - Before changes
   - After changes

2. **Application Logs**
   - RLS violation logs
   - Resolution logs

3. **Database Backups**
   - Pre-change backup
   - Post-change state

### Compliance Relevance

**SOC 2**: RLS policies affect security controls.  
**GDPR**: RLS policies affect data access controls.

---

## Post-Incident Follow-Ups

### Within 24 Hours

1. **Review RLS Policies**
   - Identify why lockout occurred
   - Update policies if needed

2. **Update Monitoring**
   - Add alert for RLS violation rate > 5%
   - Add dashboard for RLS health

### Within 1 Week

1. **Implement Preventative Measures**
   - Review: `node-supabase-rls-guard` KEY
   - Set up RLS policy testing
   - Add RLS monitoring

2. **Review Related KEYS**
   - `node-supabase-rls-guard`: Enhance policy management

### Related Preventative KEYS

- **Node / Next KEYS**:
  - `node-supabase-rls-guard`: RLS policy management

- **Other Runbook KEYS**:
  - Database Connection Failure Runbook
  - Authentication Failure Runbook
