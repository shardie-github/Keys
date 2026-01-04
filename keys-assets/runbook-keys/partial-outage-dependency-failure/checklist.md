# Partial Outage / Dependency Failure Runbook - Checklist

## Immediate Safety Checks

- [ ] Identify affected dependency
- [ ] Check application health
- [ ] Assess user impact

## Diagnosis Flow

- [ ] Step 1: Identify dependency failure
- [ ] Step 2: Analyze failure impact (use Jupyter KEY)
- [ ] Step 3: Check fallback mechanisms

## Action Steps

- [ ] Action 1: Enable graceful degradation
- [ ] Action 2: Implement circuit breaker (if repeated failures)
- [ ] Action 3: Increase rate limits (if rate limit exceeded)

## Verification

- [ ] Immediate: Check application health (5 minutes)
- [ ] Immediate: Test affected features (5 minutes)
- [ ] Ongoing: Monitor dependency status (24 hours)
- [ ] Ongoing: Monitor application health (24 hours)

## Evidence & Audit

- [ ] Record dependency failure start time
- [ ] Record affected dependency
- [ ] Record root cause
- [ ] Record actions taken
- [ ] Save dependency status logs
- [ ] Save application logs

## Post-Incident

- [ ] Review dependency health (24 hours)
- [ ] Update monitoring (24 hours)
- [ ] Implement preventative measures (1 week)
