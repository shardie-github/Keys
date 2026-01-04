# Background Job Failure & Replay Runbook

## Scope

This runbook covers:
- Background job failures (cron jobs, scheduled tasks)
- Failed job replay and recovery
- Job processing errors
- Job queue backlog
- Job timeout issues

This runbook does NOT cover:
- Job scheduler failures (see: Service Outage Runbook)
- Database connection failures affecting jobs (see: Database Connection Failure Runbook)
- Job configuration errors (see: Configuration Error Runbook)

---

## When to Use This Runbook

Use this runbook when:
- Background jobs are failing
- Monitoring alert: "job_failure_rate > 10%"
- Job queue has backlog
- Users report delayed processing
- Scheduled jobs not executing

---

## When NOT to Use This Runbook

Do NOT use this runbook for:
- Job scheduler failures (use: Service Outage Runbook)
- Database connection failures (use: Database Connection Failure Runbook)
- Job configuration errors (use: Configuration Error Runbook)

---

## Immediate Safety Checks (First 2 Minutes)

**DO THESE FIRST:**

1. **Check job scheduler status**
   ```bash
   # Check cron service
   systemctl status cron
   # OR check job runner
   pm2 list
   ```

2. **Check job queue status**
   - Review: Job queue dashboard or logs
   - Count: Failed jobs, pending jobs

3. **Assess impact**
   - Estimate: Number of failed jobs
   - Estimate: User impact

**DO NOT:**
- Replay jobs without understanding failures
- Delete failed jobs without backup
- Skip verification steps

---

## Diagnosis Flow

### Step 1: Identify Failed Jobs

**Action**: List failed jobs

```bash
# Check job logs
grep -i "failed\|error" /var/log/jobs.log | tail -50

# OR check job queue
# Use your job queue dashboard
```

**Expected**: List of failed jobs with error messages

**If Failed Jobs Found**:
- Note: Job types, error messages, timestamps
- Continue to Step 2

---

### Step 2: Analyze Failure Patterns

**Action**: Use Jupyter KEY to analyze patterns

- **KEY**: `jupyter-job-failure-analysis`
- **Input**: Job failure logs
- **Output**: Pattern analysis

**Expected**: Clear pattern of failures

**If Pattern Found**:
- Root cause identified
- Continue to Action Steps

---

### Step 3: Check Job Dependencies

**Action**: Verify job dependencies are available

```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check external API access
curl https://api.example.com/health
```

**Expected**: Dependencies available

**If Dependencies Unavailable**:
- Fix dependencies first
- Then replay jobs

---

## Action Steps

### Action 1: Replay Failed Jobs (REVERSIBLE)

**Precondition**: Identified failed jobs in Step 1

**Automated (Preferred)**:
- **KEY**: `node-safe-cron-execution`
- **Location**: `/node-keys/safe-cron-execution/src/index.ts`

**Execution**:
```typescript
import { replayFailedJobs } from '@/node-keys/safe-cron-execution/src';

await replayFailedJobs({
  jobType: 'reconciliation',
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  dryRun: false,
});
```

**Manual Alternative**:
```bash
# Replay specific job
# Use your job queue interface to retry failed jobs
```

**Expected**: Failed jobs replayed successfully

**Verification**: Check job logs for successful execution

**Rollback**: Jobs are idempotent, no rollback needed

---

### Action 2: Fix Job Processing Code (REVERSIBLE)

**Precondition**: Identified code bug in Step 2

**Action**:
1. Review error logs
2. Fix code issue
3. Test locally
4. Deploy fix
5. Replay failed jobs

**Expected**: Jobs process successfully

**Verification**: Monitor job execution

**Rollback**: Revert code change if needed

---

### Action 3: Increase Job Timeout (REVERSIBLE)

**Precondition**: Identified timeout issues

**Action**: Increase job timeout configuration

```typescript
// Update job configuration
const jobConfig = {
  timeout: 300000, // Increase from default
  retries: 3,
};
```

**Expected**: Jobs complete without timeout

**Verification**: Monitor job execution

**Rollback**: Restore previous timeout if needed

---

## Verification

### Immediate Verification (Within 5 Minutes)

1. **Check Job Execution**
   - Monitor: Job logs for successful execution
   - **Success**: Jobs complete successfully

2. **Check Job Queue**
   - Review: Queue status
   - **Success**: No failed jobs

### Ongoing Verification (Next 24 Hours)

1. **Monitor Job Execution**
   - Check: Job success rate
   - **Success**: Success rate > 95%

2. **Monitor User Impact**
   - Check: User reports
   - **Success**: No delayed processing reports

---

## Rollback / Escalation

### When to Rollback

Rollback if:
- Job replay made things worse
- More jobs failing after changes

### When to Escalate

Escalate if:
- > 1000 jobs failed
- Cannot resolve after 1 hour
- Critical jobs failing

---

## Evidence & Audit Notes

### Required Audit Trail Entries

1. **Job Failure Start Time**: [Timestamp]
2. **Failed Jobs**: [Count and types]
3. **Root Cause**: [What caused failures]
4. **Actions Taken**: [List actions]
5. **Resolution Time**: [Timestamp]

### Artifacts to Save

1. **Job Logs**
   - Failure logs
   - Replay logs

2. **Jupyter KEY Outputs**
   - Failure pattern analysis

---

## Post-Incident Follow-Ups

### Within 24 Hours

1. **Review Job Configuration**
   - Identify why jobs failed
   - Update configuration if needed

2. **Update Monitoring**
   - Add alert for job failure rate > 10%

### Within 1 Week

1. **Implement Preventative Measures**
   - Review: `node-safe-cron-execution` KEY
   - Set up job monitoring

### Related Preventative KEYS

- **Node / Next KEYS**:
  - `node-safe-cron-execution`: Safe job execution
  - `node-background-reconciliation`: Background reconciliation
