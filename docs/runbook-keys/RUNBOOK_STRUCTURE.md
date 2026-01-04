# Canonical Operational Runbook Structure

**Version**: 1.0.0  
**Last Updated**: 2024-12-30  
**Status**: Canonical — Universal runbook structure (no deviations allowed)  
**Purpose**: Enforce consistent, predictable Runbook KEY organization

---

## Absolute Requirement

**Every Operational Runbook KEY MUST follow this exact structure. No deviations allowed.**

This structure ensures:
- Predictable navigation during incidents
- Reduced cognitive load
- Complete coverage of incident lifecycle
- Consistent audit trails
- Marketplace compatibility

---

## Mandatory Structure

Every Runbook KEY MUST contain these sections in this exact order:

### 1. TITLE + SCOPE

**Purpose**: Exact scenario covered, explicit exclusions

**Required Content**:
- Clear, specific title
- Exact scenario this runbook covers
- Explicit list of what this runbook does NOT cover
- Related runbooks (if applicable)

**Example**:
```markdown
# Stripe Webhook Failure Runbook

## Scope

This runbook covers:
- Stripe webhook endpoint returning 500 errors
- Stripe webhook signature verification failures
- Stripe webhook events not being processed

This runbook does NOT cover:
- Stripe API failures (see: Stripe API Failure Runbook)
- Stripe subscription creation failures (see: Subscription Creation Failure Runbook)
- Stripe payment processing failures (see: Payment Processing Failure Runbook)
```

---

### 2. WHEN TO USE THIS RUNBOOK

**Purpose**: Triggers, symptoms, alerts or signals

**Required Content**:
- Specific triggers (alerts, errors, user reports)
- Observable symptoms
- Alert names or error messages
- Monitoring signals

**Example**:
```markdown
## When to Use This Runbook

Use this runbook when:
- Stripe dashboard shows webhook delivery failures
- Application logs show "Stripe webhook signature verification failed"
- Alert: "stripe_webhook_failure_rate > 5%"
- Users report subscription updates not reflecting in app
- Monitoring shows webhook endpoint returning 500 errors
```

---

### 3. WHEN *NOT* TO USE THIS RUNBOOK

**Purpose**: Similar but different scenarios

**Required Content**:
- Scenarios that seem similar but are different
- When to use alternative runbooks
- Common misdiagnosis cases

**Example**:
```markdown
## When NOT to Use This Runbook

Do NOT use this runbook for:
- Stripe API calls failing (use: Stripe API Failure Runbook)
- Subscription creation failing (use: Subscription Creation Failure Runbook)
- Payment processing failing (use: Payment Processing Failure Runbook)
- Webhook endpoint unreachable (use: Service Outage Runbook)

If you're unsure, start with this runbook's diagnosis flow.
```

---

### 4. IMMEDIATE SAFETY CHECKS (FIRST 2 MINUTES)

**Purpose**: Actions that prevent making things worse

**Required Content**:
- Safety checks to perform immediately
- Actions to avoid (what NOT to do)
- Critical preconditions
- Emergency stop conditions

**Example**:
```markdown
## Immediate Safety Checks (First 2 Minutes)

**DO THESE FIRST:**

1. **Check if webhook endpoint is down**
   ```bash
   curl -X POST https://your-app.com/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
   - If returns 500: Continue with this runbook
   - If returns 404: Check deployment (use: Deployment Failure Runbook)
   - If returns 200: Issue may be resolved, verify

2. **Verify environment variables are set**
   ```bash
   echo $STRIPE_WEBHOOK_SECRET
   echo $STRIPE_SECRET_KEY
   ```
   - If empty: Set immediately (see: Environment Configuration Runbook)
   - If set: Continue

3. **Check recent deployments**
   - If deployed in last 15 minutes: Consider rollback
   - If no recent deployments: Continue with diagnosis

**DO NOT:**
- Restart services without checking logs first
- Change webhook secret without verifying current value
- Disable webhooks entirely (breaks subscription updates)
```

---

### 5. DIAGNOSIS FLOW

**Purpose**: Ordered checks, decision points, branching paths, references to Jupyter KEYS

**Required Content**:
- Ordered sequence of diagnostic checks
- Decision points with clear branches
- Expected outcomes for each check
- References to Jupyter KEYS for analysis
- When to escalate

**Example**:
```markdown
## Diagnosis Flow

### Step 1: Check Webhook Endpoint Health

**Action**: Verify endpoint is responding
```bash
curl -X POST https://your-app.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

**Expected**: 200 OK or 401 Unauthorized (signature required)

**If 500 Error**:
- Check application logs (see: Log Analysis Jupyter KEY)
- Check database connectivity (see: Database Health Check Runbook)
- Continue to Step 2

**If 200 OK**:
- Issue may be intermittent
- Check Stripe dashboard for recent failures
- If failures exist, continue to Step 2

### Step 2: Verify Webhook Secret

**Action**: Compare configured secret with Stripe dashboard
```bash
# Get configured secret (from environment)
echo $STRIPE_WEBHOOK_SECRET

# Compare with Stripe Dashboard:
# Stripe Dashboard → Developers → Webhooks → [Your Endpoint] → Signing secret
```

**Expected**: Secrets match exactly

**If Mismatch**:
- Update secret in environment
- Restart application
- Verify webhook delivery resumes
- **STOP HERE** - Issue resolved

**If Match**:
- Continue to Step 3

### Step 3: Analyze Recent Webhook Events

**Action**: Use Jupyter KEY to analyze webhook event patterns
- Run: `jupyter-webhook-event-analysis` KEY
- Input: Last 24 hours of webhook logs
- Review: Failure patterns, error types, timing

**Expected**: Clear pattern of failures

**If Pattern Found**:
- Follow pattern-specific resolution steps
- Document pattern for future prevention

**If No Pattern**:
- Continue to Step 4

### Step 4: Check Application Logs

**Action**: Review application logs for webhook processing errors
```bash
# Filter logs for webhook errors
grep -i "webhook" /var/log/app.log | tail -100

# Or use log aggregation tool
# Filter: endpoint="/api/webhooks/stripe" AND status=500
```

**Expected**: Specific error messages

**If Database Errors**:
- See: Database Connection Failure Runbook

**If Signature Errors**:
- See: Webhook Signature Verification Runbook

**If Processing Errors**:
- Continue to Step 5

### Step 5: Test Webhook Processing

**Action**: Send test webhook event
```bash
# Use Stripe CLI to send test event
stripe trigger payment_intent.succeeded \
  --override webhook-endpoint-url=https://your-app.com/api/webhooks/stripe
```

**Expected**: Event processed successfully

**If Fails**:
- Check error message
- Follow error-specific resolution steps

**If Succeeds**:
- Issue may be resolved
- Monitor for recurrence
- **STOP HERE** - Issue resolved
```

---

### 6. ACTION STEPS

**Purpose**: Explicit commands / actions, references to Node / Next KEYS, reversible steps clearly marked

**Required Content**:
- Explicit, copy-pasteable commands
- References to Node / Next KEYS for execution
- Clear marking of reversible vs. irreversible steps
- Preconditions for each action
- Expected outcomes

**Example**:
```markdown
## Action Steps

### Action 1: Update Webhook Secret (REVERSIBLE)

**Precondition**: Verified secret mismatch in Step 2

**Action**:
```bash
# 1. Get new secret from Stripe Dashboard
# Stripe Dashboard → Developers → Webhooks → [Your Endpoint] → Reveal signing secret

# 2. Update environment variable
export STRIPE_WEBHOOK_SECRET="whsec_new_secret_here"

# 3. Restart application
pm2 restart app
# OR
systemctl restart your-app
```

**Expected**: Webhook endpoint accepts new signatures

**Verification**:
```bash
# Send test webhook
stripe trigger payment_intent.succeeded \
  --override webhook-endpoint-url=https://your-app.com/api/webhooks/stripe

# Check logs for successful processing
tail -f /var/log/app.log | grep "webhook.*processed"
```

**Rollback**: Restore previous secret if issue persists

---

### Action 2: Replay Failed Webhook Events (REVERSIBLE)

**Precondition**: Identified failed events in Step 3

**Action**: Use Node KEY to replay events
```typescript
// Use: node-stripe-webhook-replay KEY
import { replayFailedWebhooks } from '@/node-keys/stripe-webhook-replay/src';

// Replay events from last 24 hours
await replayFailedWebhooks({
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endpoint: '/api/webhooks/stripe',
});
```

**Expected**: Failed events are replayed and processed

**Verification**: Check Stripe dashboard for successful deliveries

**Rollback**: Events are idempotent, no rollback needed

---

### Action 3: Restart Webhook Processing Service (REVERSIBLE)

**Precondition**: Identified service hang or memory leak

**Action**:
```bash
# Graceful restart
pm2 restart app
# OR
systemctl restart your-app

# Wait for service to be healthy
sleep 10
curl https://your-app.com/health
```

**Expected**: Service restarts and webhooks resume

**Verification**: Monitor webhook delivery in Stripe dashboard

**Rollback**: Service restart is reversible (can restart again if needed)

---

### Action 4: Disable Webhook Endpoint (IRREVERSIBLE - USE WITH CAUTION)

**Precondition**: All other actions failed, service is unstable

**Warning**: This will stop all subscription updates. Use only as last resort.

**Action**:
```bash
# Comment out webhook route temporarily
# File: app/api/webhooks/stripe/route.ts
# Comment: export const POST = stripeWebhookHandler;

# Redeploy
git commit -m "Temporarily disable webhook endpoint"
git push
```

**Expected**: Webhook endpoint returns 404

**Verification**: Stripe dashboard shows endpoint unreachable

**Rollback**: Uncomment route and redeploy immediately after fixing root cause
```

---

### 7. VERIFICATION

**Purpose**: How to confirm resolution, what "good" looks like

**Required Content**:
- Specific verification steps
- Success criteria
- Monitoring checks
- Time-based verification (ensure stability)

**Example**:
```markdown
## Verification

### Immediate Verification (Within 5 Minutes)

1. **Check Webhook Endpoint Health**
   ```bash
   curl -X POST https://your-app.com/api/webhooks/stripe \
     -H "Content-Type: application/json" \
     -d '{"type": "test"}'
   ```
   **Success**: Returns 200 OK or 401 Unauthorized (not 500)

2. **Send Test Webhook**
   ```bash
   stripe trigger payment_intent.succeeded \
     --override webhook-endpoint-url=https://your-app.com/api/webhooks/stripe
   ```
   **Success**: Event processed successfully, no errors in logs

3. **Check Stripe Dashboard**
   - Navigate: Stripe Dashboard → Developers → Webhooks → [Your Endpoint]
   - **Success**: Recent deliveries show "Succeeded" status

### Ongoing Verification (Next 1 Hour)

1. **Monitor Webhook Delivery Rate**
   - Check: Stripe Dashboard → Webhooks → Delivery rate
   - **Success**: Delivery rate > 95%

2. **Monitor Application Logs**
   ```bash
   tail -f /var/log/app.log | grep "webhook"
   ```
   **Success**: No 500 errors, all events processed

3. **Check Error Rate**
   - Monitoring dashboard: `stripe_webhook_error_rate`
   - **Success**: Error rate < 1%

### Final Verification (After 24 Hours)

1. **Review Webhook Delivery Report**
   - Use: `jupyter-webhook-delivery-report` KEY
   - **Success**: All events delivered successfully

2. **Verify Subscription Updates**
   - Check: User subscriptions match Stripe subscriptions
   - **Success**: No discrepancies

3. **Check Alert Status**
   - **Success**: No webhook-related alerts firing
```

---

### 8. ROLLBACK / ESCALATION

**Purpose**: When to stop, how to revert, when to escalate

**Required Content**:
- Clear rollback procedures
- Escalation triggers
- When to stop and escalate
- Contact information

**Example**:
```markdown
## Rollback / Escalation

### When to Rollback

Rollback if:
- Actions made the situation worse
- Error rate increased after actions
- Service became unavailable
- Data corruption detected

### Rollback Procedures

**If Action 1 (Secret Update) Made Things Worse**:
```bash
# Restore previous secret
export STRIPE_WEBHOOK_SECRET="whsec_previous_secret"
pm2 restart app
```

**If Action 2 (Replay) Caused Issues**:
- Replayed events are idempotent, but check for duplicates
- Review: `jupyter-webhook-duplicate-detection` KEY

**If Action 3 (Restart) Made Things Worse**:
- Check service logs for startup errors
- See: Service Startup Failure Runbook

**If Action 4 (Disable) Was Applied**:
```bash
# Re-enable webhook endpoint immediately
# Uncomment route and redeploy
git revert HEAD
git push
```

### When to Escalate

Escalate if:
- All actions failed
- Issue persists after 30 minutes
- Data corruption detected
- Security incident suspected
- Service is completely unavailable

### Escalation Contacts

**On-Call Engineer**: [Contact Info]  
**Engineering Lead**: [Contact Info]  
**Stripe Support**: https://support.stripe.com (for Stripe-specific issues)

### Escalation Information to Provide

When escalating, provide:
1. Runbook used: Stripe Webhook Failure Runbook
2. Actions taken: [List actions attempted]
3. Current state: [Service status, error messages]
4. Evidence: [Logs, monitoring screenshots, Jupyter KEY outputs]
5. Impact: [Number of affected users, severity]
```

---

### 9. EVIDENCE & AUDIT NOTES

**Purpose**: What to record, artifacts produced, compliance relevance

**Required Content**:
- Required audit trail entries
- Artifacts to save
- Compliance notes
- Post-incident documentation requirements

**Example**:
```markdown
## Evidence & Audit Notes

### Required Audit Trail Entries

Record the following in your incident log:

1. **Incident Start Time**: [Timestamp]
2. **Trigger**: [Alert name, error message, user report]
3. **Initial Symptoms**: [What was observed]
4. **Diagnosis Steps Taken**: [List steps from Diagnosis Flow]
5. **Root Cause**: [What caused the issue]
6. **Actions Taken**: [List actions from Action Steps]
7. **Resolution Time**: [Timestamp]
8. **Verification Results**: [Results from Verification section]

### Artifacts to Save

Save these artifacts for post-incident review:

1. **Application Logs**
   ```bash
   # Export logs from incident timeframe
   grep "webhook" /var/log/app.log \
     --after-context=10 \
     --before-context=10 \
     > incident_logs_$(date +%Y%m%d_%H%M%S).txt
   ```

2. **Stripe Dashboard Screenshots**
   - Webhook delivery failures
   - Event timeline
   - Error messages

3. **Jupyter KEY Outputs**
   - Webhook event analysis results
   - Failure pattern analysis
   - Delivery report

4. **Monitoring Dashboards**
   - Error rate graphs
   - Response time graphs
   - Service health metrics

### Compliance Relevance

**SOC 2**: This incident affects availability and security controls.  
**PCI DSS**: Webhook failures may affect payment processing audit trail.  
**GDPR**: Subscription updates affect user data accuracy.

**Required Actions**:
- Document incident in compliance log
- Review webhook processing for data accuracy
- Verify no PII was exposed in error logs
```

---

### 10. POST-INCIDENT FOLLOW-UPS

**Purpose**: What to review later, links to preventative KEYS

**Required Content**:
- Post-incident review items
- Preventative measures
- Links to related KEYS
- Documentation updates needed

**Example**:
```markdown
## Post-Incident Follow-Ups

### Within 24 Hours

1. **Post-Incident Review Meeting**
   - Review timeline of events
   - Identify root cause
   - Discuss prevention measures
   - Update runbook if needed

2. **Update Monitoring**
   - Add alert for webhook failure rate > 5%
   - Add alert for webhook secret mismatch
   - Add dashboard for webhook health

3. **Document Lessons Learned**
   - Update this runbook with any new findings
   - Document any new failure patterns
   - Share with team

### Within 1 Week

1. **Implement Preventative Measures**
   - Review: `node-webhook-health-check` KEY
   - Set up automated webhook secret rotation
   - Add webhook replay capability

2. **Update Documentation**
   - Update deployment docs with webhook secret management
   - Update onboarding docs with webhook troubleshooting
   - Update architecture docs with webhook failure modes

3. **Review Related KEYS**
   - `jupyter-webhook-event-analysis`: Improve analysis patterns
   - `node-stripe-webhook-replay`: Enhance replay capabilities
   - `node-webhook-monitoring`: Add monitoring coverage

### Related Preventative KEYS

- **Jupyter KEYS**:
  - `jupyter-webhook-event-analysis`: Analyze webhook patterns
  - `jupyter-webhook-delivery-report`: Generate delivery reports

- **Node / Next KEYS**:
  - `node-webhook-health-check`: Automated health checks
  - `node-stripe-webhook-replay`: Automated replay capability
  - `node-webhook-monitoring`: Enhanced monitoring

- **Other Runbook KEYS**:
  - Stripe API Failure Runbook
  - Database Connection Failure Runbook
  - Service Outage Runbook
```

---

## Structure Validation

Every Runbook KEY must pass structure validation:

```typescript
interface RunbookStructure {
  'README.md': {
    '1. TITLE + SCOPE': boolean;
    '2. WHEN TO USE THIS RUNBOOK': boolean;
    '3. WHEN *NOT* TO USE THIS RUNBOOK': boolean;
    '4. IMMEDIATE SAFETY CHECKS': boolean;
    '5. DIAGNOSIS FLOW': boolean;
    '6. ACTION STEPS': boolean;
    '7. VERIFICATION': boolean;
    '8. ROLLBACK / ESCALATION': boolean;
    '9. EVIDENCE & AUDIT NOTES': boolean;
    '10. POST-INCIDENT FOLLOW-UPS': boolean;
  };
  'checklist.md': boolean;
  'pack.json': boolean;
  'CHANGELOG.md': boolean;
  'LICENSE.txt': boolean;
}
```

Validation checks:
- All required sections exist
- Sections are in correct order
- No vague language ("check logs", "investigate")
- All commands are explicit and copy-pasteable
- All references to other KEYS are valid

---

## Deviations

**No deviations allowed.**

If a runbook needs a different structure, it must:
1. Propose the change to the canonical structure
2. Get approval before implementation
3. Update this document if approved

**Rationale**: Consistency enables calm execution during incidents, reduces cognitive load, and ensures complete coverage.

---

## Version History

- **1.0.0** (2024-12-30): Initial canonical structure definition
