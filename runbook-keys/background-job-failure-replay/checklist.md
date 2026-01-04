# Background Job Failure & Replay Runbook - Checklist

## Immediate Safety Checks

- [ ] Check job scheduler status
- [ ] Check job queue status
- [ ] Assess impact (number of failed jobs)

## Diagnosis Flow

- [ ] Step 1: Identify failed jobs
- [ ] Step 2: Analyze failure patterns (use Jupyter KEY)
- [ ] Step 3: Check job dependencies

## Action Steps

- [ ] Action 1: Replay failed jobs
- [ ] Action 2: Fix job processing code (if bug found)
- [ ] Action 3: Increase job timeout (if timeout issues)

## Verification

- [ ] Immediate: Check job execution (5 minutes)
- [ ] Immediate: Check job queue (5 minutes)
- [ ] Ongoing: Monitor job execution (24 hours)
- [ ] Ongoing: Monitor user impact (24 hours)

## Evidence & Audit

- [ ] Record job failure start time
- [ ] Record failed jobs
- [ ] Record root cause
- [ ] Record actions taken
- [ ] Save job logs
- [ ] Save Jupyter KEY outputs

## Post-Incident

- [ ] Review job configuration (24 hours)
- [ ] Update monitoring (24 hours)
- [ ] Implement preventative measures (1 week)
