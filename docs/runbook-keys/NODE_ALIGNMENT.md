# Runbook KEYS Alignment with Node / Next KEYS

**Version**: 1.0.0  
**Last Updated**: 2024-12-30  
**Status**: Canonical — Defines how Runbook KEYS reference Node / Next KEYS  
**Purpose**: Ensure seamless integration between Runbook actions and Node / Next execution

---

## Core Principle

**Runbooks never hide execution. All automation is explicit.**

Runbooks explain WHEN to run Node / Next KEYS, WHAT they do, and WHAT the side effects are.

---

## Alignment Rules

### Rule 1: Actions Call Execution KEYS

When a runbook needs to execute a fix, it references a Node / Next KEY:

```markdown
### Action 2: Replay Failed Webhook Events

**Action**: Use Node KEY to replay events
```typescript
import { replayFailedWebhooks } from '@/node-keys/stripe-webhook-replay/src';

await replayFailedWebhooks({
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endpoint: '/api/webhooks/stripe',
});
```
```

**NOT**:
```markdown
### Action 2: Replay Failed Webhook Events

**Action**: Write code to replay events
```typescript
// ... 100 lines of replay logic ...
```
```

---

### Rule 2: Explicit Preconditions

Every Node / Next KEY reference must specify:
- **Which KEY**: Exact slug/name
- **Preconditions**: What must be true before running
- **Side Effects**: What the KEY does
- **Safety**: Whether the action is reversible

**Example**:
```markdown
### Action 1: Update Webhook Secret (REVERSIBLE)

**Preconditions**:
- Verified secret mismatch in diagnosis Step 2
- Have new secret from Stripe Dashboard
- Application can be restarted

**Action**: Use Node KEY to update secret
- **KEY**: `node-webhook-secret-update`
- **Location**: `/node-keys/webhook-secret-update/src/index.ts`
- **Side Effects**:
  - Updates `STRIPE_WEBHOOK_SECRET` environment variable
  - Restarts application service
  - Verifies webhook endpoint accepts new signatures

**Execution**:
```typescript
import { updateWebhookSecret } from '@/node-keys/webhook-secret-update/src';

await updateWebhookSecret({
  newSecret: process.env.NEW_STRIPE_WEBHOOK_SECRET,
  restartService: true,
  verifyEndpoint: true,
});
```

**Safety**: REVERSIBLE - Can restore previous secret if needed
```

---

### Rule 3: Manual Alternatives

If automation fails, runbooks provide manual alternatives:

```markdown
### Action 2: Replay Failed Webhook Events

**Automated (Preferred)**:
```typescript
import { replayFailedWebhooks } from '@/node-keys/stripe-webhook-replay/src';
await replayFailedWebhooks({ ... });
```

**Manual Alternative (If Automation Fails)**:
```bash
# 1. Get failed events from Stripe Dashboard
# Stripe Dashboard → Developers → Webhooks → [Your Endpoint] → Failed events

# 2. Replay each event manually
stripe events resend evt_1234567890
stripe events resend evt_0987654321
# ... repeat for each failed event ...
```
```

---

### Rule 4: Side Effects Are Explicit

All side effects must be documented:

```markdown
### Action 3: Restart Webhook Processing Service

**Side Effects**:
- Service will be unavailable for 10-30 seconds during restart
- In-flight webhook requests will fail
- Pending webhook events will be retried automatically by Stripe
- No data loss (events are idempotent)

**Preconditions**:
- Identified service hang or memory leak
- Have verified issue is service-related (not infrastructure)
- Can tolerate brief service interruption
```

---

## Common Node / Next KEY Patterns in Runbooks

### Pattern 1: Webhook Processing

**Runbook Need**: Process webhooks, replay events, verify signatures

**Node KEYS**:
- `node-stripe-webhook-entitlement`: Webhook handler
- `node-stripe-webhook-replay`: Replay failed events
- `node-webhook-signature-verification`: Verify signatures

**Usage**:
```markdown
### Action 1: Replay Failed Webhook Events

**Action**: Use Node KEY to replay events
- **KEY**: `node-stripe-webhook-replay`
- **Preconditions**: Identified failed events in diagnosis
- **Side Effects**: Replays events, updates database, sends notifications
- **Safety**: REVERSIBLE - Events are idempotent

**Execution**:
```typescript
import { replayFailedWebhooks } from '@/node-keys/stripe-webhook-replay/src';

await replayFailedWebhooks({
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endpoint: '/api/webhooks/stripe',
  dryRun: false,
});
```
```

---

### Pattern 2: Data Reconciliation

**Runbook Need**: Reconcile data between systems

**Node KEYS**:
- `node-background-reconciliation`: Automated reconciliation
- `node-data-reconciliation`: Manual reconciliation

**Usage**:
```markdown
### Action 2: Reconcile Subscription Data

**Action**: Use Node KEY to reconcile Stripe and database subscriptions
- **KEY**: `node-background-reconciliation`
- **Preconditions**: Identified data discrepancies in diagnosis
- **Side Effects**: Updates database, sends reconciliation report
- **Safety**: REVERSIBLE - Can restore from backup if needed

**Execution**:
```typescript
import { reconcileSubscriptions } from '@/node-keys/background-reconciliation/src';

await reconcileSubscriptions({
  tenantId: 'tenant-123',
  source: 'stripe',
  dryRun: false,
});
```
```

---

### Pattern 3: Background Jobs

**Runbook Need**: Run background jobs, retry failed jobs, replay jobs

**Node KEYS**:
- `node-safe-cron-execution`: Safe cron execution
- `node-background-job-replay`: Replay failed jobs

**Usage**:
```markdown
### Action 3: Replay Failed Background Jobs

**Action**: Use Node KEY to replay failed jobs
- **KEY**: `node-background-job-replay`
- **Preconditions**: Identified failed jobs in diagnosis
- **Side Effects**: Replays jobs, updates job status, sends notifications
- **Safety**: REVERSIBLE - Jobs are idempotent

**Execution**:
```typescript
import { replayFailedJobs } from '@/node-keys/background-job-replay/src';

await replayFailedJobs({
  jobType: 'reconciliation',
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  dryRun: false,
});
```
```

---

### Pattern 4: Database Operations

**Runbook Need**: Fix database issues, update RLS policies, repair data

**Node KEYS**:
- `node-supabase-rls-guard`: RLS policy management
- `node-database-repair`: Database repair operations

**Usage**:
```markdown
### Action 4: Fix RLS Policy Lockout

**Action**: Use Node KEY to update RLS policies
- **KEY**: `node-supabase-rls-guard`
- **Preconditions**: Identified RLS policy issue in diagnosis
- **Side Effects**: Updates RLS policies, may require service restart
- **Safety**: REVERSIBLE - Can restore previous policies

**Execution**:
```typescript
import { updateRLSPolicies } from '@/node-keys/supabase-rls-guard/src';

await updateRLSPolicies({
  table: 'subscriptions',
  policy: 'tenant_isolation',
  action: 'update',
  dryRun: false,
});
```
```

---

### Pattern 5: Monitoring and Health Checks

**Runbook Need**: Check service health, monitor endpoints, verify configurations

**Node KEYS**:
- `node-health-check`: Service health checks
- `node-webhook-monitoring`: Webhook monitoring

**Usage**:
```markdown
### Verification Step 1: Check Webhook Health

**Action**: Use Node KEY to verify webhook endpoint health
- **KEY**: `node-webhook-monitoring`
- **Preconditions**: Actions completed, service restarted
- **Side Effects**: None (read-only)
- **Safety**: SAFE - Read-only operation

**Execution**:
```typescript
import { checkWebhookHealth } from '@/node-keys/webhook-monitoring/src';

const health = await checkWebhookHealth({
  endpoint: '/api/webhooks/stripe',
  timeout: 5000,
});

console.log('Health:', health);
// Expected: { status: 'healthy', responseTime: 150, errors: 0 }
```
```

---

## Runbook → Node KEY Mapping

### By Runbook Type

**Incident Runbooks**:
- Webhook failures → `node-stripe-webhook-entitlement`, `node-stripe-webhook-replay`
- Service restarts → `node-health-check`, `node-service-management`
- Database failures → `node-database-repair`, `node-supabase-rls-guard`

**Failure-Mode Runbooks**:
- Partial outages → `node-graceful-degradation`, `node-circuit-breaker`
- Dependency failures → `node-dependency-health-check`, `node-fallback-handler`

**Recovery Runbooks**:
- Data reconciliation → `node-background-reconciliation`, `node-data-reconciliation`
- Job replay → `node-background-job-replay`, `node-safe-cron-execution`
- State restoration → `node-state-restoration`, `node-rollback-handler`

**Decision Runbooks**:
- Feature flags → `node-feature-flag-management`
- Scaling decisions → `node-auto-scaling`, `node-resource-management`

---

## Example: Complete Runbook Action Section

```markdown
## Action Steps

### Action 1: Replay Failed Webhook Events (REVERSIBLE)

**Precondition**: Identified failed events in Step 3 of Diagnosis Flow

**Automated (Preferred)**:
- **KEY**: `node-stripe-webhook-replay`
- **Location**: `/node-keys/stripe-webhook-replay/src/index.ts`
- **Side Effects**:
  - Replays webhook events from Stripe
  - Updates database with event data
  - Sends email notification on completion
  - Logs replay results

**Execution**:
```typescript
import { replayFailedWebhooks } from '@/node-keys/stripe-webhook-replay/src';

const result = await replayFailedWebhooks({
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endpoint: '/api/webhooks/stripe',
  dryRun: false, // Set to true to preview without executing
});

console.log('Replay result:', result);
// Expected: { replayed: 15, succeeded: 15, failed: 0 }
```

**Manual Alternative (If Automation Fails)**:
```bash
# 1. Get failed events from Stripe Dashboard
# Stripe Dashboard → Developers → Webhooks → [Your Endpoint] → Failed events

# 2. Replay each event manually
stripe events resend evt_1234567890
stripe events resend evt_0987654321
# ... repeat for each failed event ...

# 3. Verify events were processed
# Check application logs for successful processing
tail -f /var/log/app.log | grep "webhook.*processed"
```

**Verification**:
- Check Stripe dashboard for successful deliveries
- Check application logs for processed events
- Verify database updates

**Rollback**: Events are idempotent, no rollback needed. If issues occur, check application logs for processing errors.
```

---

## Safety Classifications

Every Node / Next KEY action must be classified:

### SAFE
- Read-only operations
- No side effects
- Can be run multiple times safely

**Example**: Health checks, monitoring, status queries

### REVERSIBLE
- Has side effects
- Can be undone
- Rollback procedure exists

**Example**: Configuration updates, service restarts, data updates

### IRREVERSIBLE
- Permanent changes
- Cannot be undone
- Use with extreme caution

**Example**: Data deletion, permanent configuration changes

---

## Version History

- **1.0.0** (2024-12-30): Initial Node / Next KEY alignment definition
