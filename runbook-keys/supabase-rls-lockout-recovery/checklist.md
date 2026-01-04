# Supabase RLS Lockout Recovery Runbook - Checklist

## Immediate Safety Checks

- [ ] Verify database connectivity
- [ ] Check Supabase dashboard status
- [ ] Identify affected users
- [ ] Check recent RLS policy changes

## Diagnosis Flow

- [ ] Step 1: Identify RLS policy violations
- [ ] Step 2: Verify RLS policy configuration
- [ ] Step 3: Test RLS policy with affected user
- [ ] Step 4: Check RLS policy logic

## Action Steps

- [ ] Action 1: Update RLS policy
- [ ] Action 2: Temporarily relax RLS policy (if emergency)
- [ ] Action 3: Fix user context
- [ ] Action 4: Restore previous RLS policy (if recent change)

## Verification

- [ ] Immediate: Test with affected user (5 minutes)
- [ ] Immediate: Check application logs (5 minutes)
- [ ] Immediate: Test application functionality (5 minutes)
- [ ] Ongoing: Monitor RLS violations (24 hours)
- [ ] Ongoing: Monitor user reports (24 hours)
- [ ] Final: Full RLS policy audit (1 week)

## Evidence & Audit

- [ ] Record lockout start time
- [ ] Record affected users
- [ ] Record root cause
- [ ] Record actions taken
- [ ] Save RLS policy definitions
- [ ] Save application logs
- [ ] Save database backups

## Post-Incident

- [ ] Review RLS policies (24 hours)
- [ ] Update monitoring (24 hours)
- [ ] Implement preventative measures (1 week)
- [ ] Review related KEYS (1 week)
