# Data Reconciliation Mismatch Runbook

## Scope

This runbook covers:
- Data inconsistencies between Stripe subscriptions and local database
- Subscription status mismatches
- Missing subscription records in database
- Orphaned subscription records in database
- Subscription metadata discrepancies

This runbook does NOT cover:
- Stripe API failures (see: Stripe API Failure Runbook)
- Database connection failures (see: Database Connection Failure Runbook)
- Webhook processing failures (see: Stripe Webhook Failure Runbook)
- Data corruption requiring restore (see: Database Recovery Runbook)

---

## When to Use This Runbook

Use this runbook when:
- Users report subscription status incorrect in application
- Monitoring alert: "subscription_mismatch_count > 10"
- Reconciliation job reports discrepancies
- Manual audit reveals data inconsistencies
- Compliance audit requires data verification

---

## When NOT to Use This Runbook

Do NOT use this runbook for:
- Stripe API failures (use: Stripe API Failure Runbook)
- Database connection failures (use: Database Connection Failure Runbook)
- Webhook processing failures (use: Stripe Webhook Failure Runbook)
- Data corruption requiring restore (use: Database Recovery Runbook)

---

## Immediate Safety Checks (First 2 Minutes)

**DO THESE FIRST:**

1. **Verify database connectivity**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```
   - If fails: See Database Connection Failure Runbook
   - If succeeds: Continue

2. **Verify Stripe API access**
   ```bash
   stripe customers list --limit 1
   ```
   - If fails: See Stripe API Failure Runbook
   - If succeeds: Continue

3. **Check reconciliation job status**
   - Review: Last reconciliation job run time
   - If never run: Schedule reconciliation job
   - If failed: Check job logs

4. **Assess data impact**
   - Estimate: Number of affected subscriptions
   - If > 1000: Consider staged reconciliation
   - If < 100: Can reconcile immediately

**DO NOT:**
- Delete data without backup
- Modify Stripe data directly
- Run reconciliation without understanding scope
- Skip verification steps

---

## Diagnosis Flow

### Step 1: Identify Discrepancies

**Action**: Use Jupyter KEY to identify mismatches

- **KEY**: `jupyter-stripe-subscription-reconciliation`
- **Input**: Stripe subscription export (CSV) and database subscription export (CSV)
- **Output**: Report showing discrepancies and mismatches

**Steps**:
1. Export Stripe subscriptions:
   ```bash
   stripe subscriptions list --limit 1000 > stripe_subscriptions.csv
   ```

2. Export database subscriptions:
   ```bash
   psql $DATABASE_URL -c "COPY (SELECT * FROM subscriptions) TO STDOUT WITH CSV HEADER" > db_subscriptions.csv
   ```

3. Run Jupyter KEY:
   - Open: `/jupyter-keys/stripe-subscription-reconciliation/reconciliation.ipynb`
   - Input: `stripe_subscriptions.csv`, `db_subscriptions.csv`
   - Execute all cells

4. Review output:
   - Missing in database (in Stripe, not in DB)
   - Missing in Stripe (in DB, not in Stripe)
   - Status mismatches
   - Metadata mismatches

**Expected**: Clear list of discrepancies

**If No Discrepancies**:
- Issue may be resolved
- Verify with user reports
- **STOP HERE** - Issue resolved

**If Discrepancies Found**:
- Continue to Step 2

---

### Step 2: Analyze Discrepancy Patterns

**Action**: Use Jupyter KEY to analyze patterns

- **KEY**: `jupyter-data-drift-analysis`
- **Input**: Discrepancy report from Step 1
- **Output**: Pattern analysis (timing, types, frequency)

**Steps**:
1. Run Jupyter KEY with discrepancy report
2. Review patterns:
   - When did discrepancies start?
   - What types of discrepancies?
   - Which subscriptions are affected?

**Expected**: Clear pattern of discrepancies

**If Pattern Found**:
- Root cause identified
- Follow pattern-specific resolution
- Continue to Action Steps

**If No Pattern**:
- Continue to Step 3

---

### Step 3: Check Webhook Processing History

**Action**: Verify webhook processing for affected subscriptions

```bash
# Check webhook logs for affected subscription IDs
grep "sub_affected_id" /var/log/app.log | grep "webhook"
```

**Expected**: Webhook processing history

**If Webhook Failures Found**:
- See: Stripe Webhook Failure Runbook
- Fix webhook processing first
- Then rerun reconciliation

**If No Webhook Failures**:
- Continue to Action Steps

---

## Action Steps

### Action 1: Reconcile Missing Subscriptions (REVERSIBLE)

**Precondition**: Identified subscriptions in Stripe but not in database

**Automated (Preferred)**:
- **KEY**: `node-background-reconciliation`
- **Location**: `/node-keys/background-reconciliation/src/index.ts`

**Execution**:
```typescript
import { reconcileSubscriptions } from '@/node-keys/background-reconciliation/src';

await reconcileSubscriptions({
  tenantId: 'tenant-123',
  source: 'stripe',
  dryRun: false, // Set to true to preview
});
```

**Manual Alternative**:
```bash
# For each missing subscription:
# 1. Get subscription from Stripe
stripe subscriptions retrieve sub_1234567890

# 2. Insert into database
psql $DATABASE_URL -c "INSERT INTO subscriptions (id, customer_id, status, ...) VALUES (...);"
```

**Expected**: Missing subscriptions added to database

**Verification**: Re-run Jupyter KEY reconciliation, verify no missing subscriptions

**Rollback**: Can delete inserted records if needed

---

### Action 2: Remove Orphaned Subscriptions (IRREVERSIBLE - USE WITH CAUTION)

**Precondition**: Identified subscriptions in database but not in Stripe

**Warning**: Verify subscription is truly orphaned (not just hidden in Stripe)

**Action**:
```bash
# 1. Verify subscription doesn't exist in Stripe
stripe subscriptions retrieve sub_orphaned_id
# Should return 404

# 2. Archive subscription in database (don't delete)
psql $DATABASE_URL -c "UPDATE subscriptions SET status = 'archived', archived_at = NOW() WHERE id = 'sub_orphaned_id';"
```

**Expected**: Orphaned subscriptions archived

**Verification**: Re-run Jupyter KEY reconciliation, verify no orphaned subscriptions

**Rollback**: Can restore archived subscriptions if needed

---

### Action 3: Update Status Mismatches (REVERSIBLE)

**Precondition**: Identified status mismatches (Stripe vs. database)

**Action**: Use Node KEY to update statuses

- **KEY**: `node-background-reconciliation`
- **Execution**: Update statuses to match Stripe

```typescript
import { reconcileSubscriptionStatuses } from '@/node-keys/background-reconciliation/src';

await reconcileSubscriptionStatuses({
  subscriptionIds: ['sub_123', 'sub_456'],
  source: 'stripe',
  dryRun: false,
});
```

**Expected**: Statuses updated to match Stripe

**Verification**: Re-run Jupyter KEY reconciliation, verify no status mismatches

**Rollback**: Can restore previous statuses if needed

---

### Action 4: Update Metadata Mismatches (REVERSIBLE)

**Precondition**: Identified metadata mismatches

**Action**: Update metadata to match Stripe

```typescript
import { reconcileSubscriptionMetadata } from '@/node-keys/background-reconciliation/src';

await reconcileSubscriptionMetadata({
  subscriptionIds: ['sub_123', 'sub_456'],
  source: 'stripe',
  dryRun: false,
});
```

**Expected**: Metadata updated to match Stripe

**Verification**: Re-run Jupyter KEY reconciliation, verify no metadata mismatches

**Rollback**: Can restore previous metadata if needed

---

## Verification

### Immediate Verification (Within 5 Minutes)

1. **Re-run Reconciliation Analysis**
   - Use: `jupyter-stripe-subscription-reconciliation` KEY
   - **Success**: No discrepancies found

2. **Verify Affected Subscriptions**
   - Check: User-reported subscriptions now correct
   - **Success**: Status matches Stripe

### Ongoing Verification (Next 24 Hours)

1. **Monitor Reconciliation Job**
   - Check: Reconciliation job runs successfully
   - **Success**: No new discrepancies

2. **Monitor User Reports**
   - Check: No new subscription status reports
   - **Success**: No user reports

### Final Verification (After 1 Week)

1. **Full Reconciliation Audit**
   - Use: `jupyter-stripe-subscription-reconciliation` KEY
   - **Success**: No discrepancies found

2. **Compliance Verification**
   - Verify: Data accuracy for compliance audit
   - **Success**: Data matches Stripe

---

## Rollback / Escalation

### When to Rollback

Rollback if:
- Reconciliation made things worse
- Data corruption detected
- User impact increased

### Rollback Procedures

**If Action 1 (Add Missing) Made Things Worse**:
- Review inserted records
- Delete incorrect inserts
- Re-run reconciliation

**If Action 2 (Archive Orphaned) Made Things Worse**:
- Restore archived subscriptions
- Investigate why they were archived

**If Action 3 (Update Status) Made Things Worse**:
- Restore previous statuses
- Investigate root cause

### When to Escalate

Escalate if:
- > 1000 subscriptions affected
- Data corruption detected
- Cannot reconcile after 1 hour
- Compliance deadline approaching

---

## Evidence & Audit Notes

### Required Audit Trail Entries

1. **Reconciliation Start Time**: [Timestamp]
2. **Discrepancies Found**: [Count and types]
3. **Root Cause**: [What caused discrepancies]
4. **Actions Taken**: [List actions]
5. **Reconciliation End Time**: [Timestamp]
6. **Verification Results**: [Results]

### Artifacts to Save

1. **Jupyter KEY Outputs**
   - Reconciliation report
   - Discrepancy analysis
   - Pattern analysis

2. **Database Backups**
   - Pre-reconciliation backup
   - Post-reconciliation state

3. **Stripe Exports**
   - Subscription export used
   - Reconciliation timestamp

### Compliance Relevance

**SOC 2**: Data accuracy affects availability controls.  
**PCI-DSS**: Subscription data accuracy affects payment processing.  
**GDPR**: Subscription data accuracy affects user data accuracy.

---

## Post-Incident Follow-Ups

### Within 24 Hours

1. **Review Reconciliation Process**
   - Identify why discrepancies occurred
   - Update reconciliation job if needed

2. **Update Monitoring**
   - Add alert for discrepancy count > 10
   - Add dashboard for reconciliation health

### Within 1 Week

1. **Implement Preventative Measures**
   - Review: `node-background-reconciliation` KEY
   - Set up automated reconciliation
   - Add reconciliation monitoring

2. **Review Related KEYS**
   - `jupyter-stripe-subscription-reconciliation`: Improve analysis
   - `node-background-reconciliation`: Enhance reconciliation

### Related Preventative KEYS

- **Jupyter KEYS**:
  - `jupyter-stripe-subscription-reconciliation`: Analyze discrepancies
  - `jupyter-data-drift-analysis`: Analyze patterns

- **Node / Next KEYS**:
  - `node-background-reconciliation`: Automated reconciliation

- **Other Runbook KEYS**:
  - Stripe Webhook Failure Runbook
  - Database Connection Failure Runbook
