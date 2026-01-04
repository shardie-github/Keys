# Stripe Webhook Failure Runbook - Checklist

Print this checklist and follow it step-by-step during the incident.

## Immediate Safety Checks (First 2 Minutes)

- [ ] Check webhook endpoint is responding
  ```bash
  curl -X POST https://your-app.com/api/webhooks/stripe -H "Content-Type: application/json" -d '{"test": true}'
  ```
- [ ] Verify STRIPE_WEBHOOK_SECRET is set
  ```bash
  echo $STRIPE_WEBHOOK_SECRET
  ```
- [ ] Verify STRIPE_SECRET_KEY is set
  ```bash
  echo $STRIPE_SECRET_KEY
  ```
- [ ] Check recent deployments (last 15 minutes)
- [ ] Check Stripe dashboard for webhook status

## Diagnosis Flow

- [ ] Step 1: Check webhook endpoint health
- [ ] Step 2: Verify webhook secret matches Stripe dashboard
- [ ] Step 3: Analyze recent webhook events (use Jupyter KEY)
- [ ] Step 4: Check application logs for errors
- [ ] Step 5: Test webhook processing with Stripe CLI

## Action Steps

- [ ] Action 1: Update webhook secret (if mismatch found)
- [ ] Action 2: Replay failed webhook events
- [ ] Action 3: Restart webhook processing service (if needed)
- [ ] Action 4: Fix webhook processing code (if bug found)
- [ ] Action 5: Disable webhook endpoint (LAST RESORT ONLY)

## Verification

- [ ] Immediate: Check endpoint health (within 5 minutes)
- [ ] Immediate: Send test webhook (within 5 minutes)
- [ ] Immediate: Check Stripe dashboard (within 5 minutes)
- [ ] Ongoing: Monitor delivery rate (next 1 hour)
- [ ] Ongoing: Monitor application logs (next 1 hour)
- [ ] Ongoing: Check error rate (next 1 hour)
- [ ] Final: Review delivery report (after 24 hours)
- [ ] Final: Verify subscription updates (after 24 hours)
- [ ] Final: Check alert status (after 24 hours)

## Evidence & Audit

- [ ] Record incident start time
- [ ] Record trigger/symptoms
- [ ] Record diagnosis steps taken
- [ ] Record root cause
- [ ] Record actions taken
- [ ] Record resolution time
- [ ] Save application logs
- [ ] Save Stripe dashboard screenshots
- [ ] Save Jupyter KEY outputs
- [ ] Save monitoring dashboard screenshots

## Post-Incident

- [ ] Schedule post-incident review (within 24 hours)
- [ ] Update monitoring alerts (within 24 hours)
- [ ] Document lessons learned (within 24 hours)
- [ ] Implement preventative measures (within 1 week)
- [ ] Update documentation (within 1 week)
- [ ] Review related KEYS (within 1 week)

## Escalation

- [ ] Escalate if all actions failed
- [ ] Escalate if issue persists after 30 minutes
- [ ] Escalate if data corruption detected
- [ ] Escalate if security incident suspected
- [ ] Escalate if service completely unavailable

---

**Incident Commander**: _________________  
**Start Time**: _________________  
**Resolution Time**: _________________  
**Root Cause**: _________________
