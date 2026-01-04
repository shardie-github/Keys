# Data Reconciliation Mismatch Runbook - Checklist

## Immediate Safety Checks

- [ ] Verify database connectivity
- [ ] Verify Stripe API access
- [ ] Check reconciliation job status
- [ ] Assess data impact (number of affected subscriptions)

## Diagnosis Flow

- [ ] Step 1: Identify discrepancies (use Jupyter KEY)
- [ ] Step 2: Analyze discrepancy patterns
- [ ] Step 3: Check webhook processing history

## Action Steps

- [ ] Action 1: Reconcile missing subscriptions
- [ ] Action 2: Remove orphaned subscriptions (if needed)
- [ ] Action 3: Update status mismatches
- [ ] Action 4: Update metadata mismatches

## Verification

- [ ] Immediate: Re-run reconciliation analysis
- [ ] Immediate: Verify affected subscriptions
- [ ] Ongoing: Monitor reconciliation job (24 hours)
- [ ] Ongoing: Monitor user reports (24 hours)
- [ ] Final: Full reconciliation audit (1 week)

## Evidence & Audit

- [ ] Record reconciliation start time
- [ ] Record discrepancies found
- [ ] Record root cause
- [ ] Record actions taken
- [ ] Save Jupyter KEY outputs
- [ ] Save database backups
- [ ] Save Stripe exports

## Post-Incident

- [ ] Review reconciliation process (24 hours)
- [ ] Update monitoring (24 hours)
- [ ] Implement preventative measures (1 week)
- [ ] Review related KEYS (1 week)
