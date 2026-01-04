# Partial Outage / Dependency Failure Runbook

## Scope

This runbook covers:
- Partial service degradation
- External dependency failures
- API rate limiting
- Third-party service outages
- Graceful degradation scenarios

This runbook does NOT cover:
- Complete service outages (see: Service Outage Runbook)
- Internal service failures (see: Internal Service Failure Runbook)
- Database failures (see: Database Connection Failure Runbook)

---

## When to Use This Runbook

Use this runbook when:
- External API is down or degraded
- Rate limits exceeded
- Partial functionality unavailable
- Monitoring alert: "dependency_failure_rate > 10%"
- Users report partial feature failures

---

## When NOT to Use This Runbook

Do NOT use this runbook for:
- Complete service outages (use: Service Outage Runbook)
- Internal service failures (use: Internal Service Failure Runbook)
- Database failures (use: Database Connection Failure Runbook)

---

## Immediate Safety Checks (First 2 Minutes)

**DO THESE FIRST:**

1. **Identify affected dependency**
   - Check: Which external service is failing
   - Check: Service status page
   - Estimate: Impact on application

2. **Check application health**
   ```bash
   curl https://your-app.com/health
   ```
   - If down: See Service Outage Runbook
   - If degraded: Continue

3. **Assess user impact**
   - Estimate: Number of affected users
   - Estimate: Feature impact

**DO NOT:**
- Disable features without understanding impact
- Make changes without documenting
- Skip verification steps

---

## Diagnosis Flow

### Step 1: Identify Dependency Failure

**Action**: Check dependency status

```bash
# Check external API
curl https://api.external-service.com/health

# Check rate limit status
# Review API dashboard for rate limit usage
```

**Expected**: Clear identification of failing dependency

**If Dependency Down**:
- Continue to Action Steps (graceful degradation)

**If Dependency Degraded**:
- Continue to Step 2

---

### Step 2: Analyze Failure Impact

**Action**: Use Jupyter KEY to analyze impact

- **KEY**: `jupyter-dependency-impact-analysis`
- **Input**: Application logs, dependency status
- **Output**: Impact analysis

**Expected**: Clear understanding of impact

**If Impact High**:
- Consider graceful degradation
- Continue to Action Steps

---

### Step 3: Check Fallback Mechanisms

**Action**: Verify fallback mechanisms

```typescript
// Check if fallback is configured
const hasFallback = checkFallbackConfiguration();
```

**Expected**: Fallback mechanisms available

**If Fallback Available**:
- Enable fallback
- Continue to Action Steps

**If No Fallback**:
- Implement graceful degradation
- Continue to Action Steps

---

## Action Steps

### Action 1: Enable Graceful Degradation (REVERSIBLE)

**Precondition**: Identified dependency failure

**Action**: Enable fallback or degraded mode

```typescript
// Enable graceful degradation
await enableGracefulDegradation({
  dependency: 'external-api',
  fallbackMode: 'cached',
});
```

**Expected**: Application continues with degraded functionality

**Verification**: Test application functionality

**Rollback**: Disable graceful degradation when dependency recovers

---

### Action 2: Implement Circuit Breaker (REVERSIBLE)

**Precondition**: Repeated dependency failures

**Action**: Implement circuit breaker pattern

- **KEY**: `node-circuit-breaker`
- **Location**: `/node-keys/circuit-breaker/src/index.ts`

**Execution**:
```typescript
import { enableCircuitBreaker } from '@/node-keys/circuit-breaker/src';

await enableCircuitBreaker({
  service: 'external-api',
  failureThreshold: 5,
  timeout: 60000,
});
```

**Expected**: Circuit breaker prevents cascading failures

**Verification**: Monitor circuit breaker status

**Rollback**: Disable circuit breaker when dependency recovers

---

### Action 3: Increase Rate Limits (REVERSIBLE)

**Precondition**: Rate limit exceeded

**Action**: Request rate limit increase or implement backoff

```typescript
// Implement exponential backoff
await implementBackoff({
  service: 'external-api',
  initialDelay: 1000,
  maxDelay: 60000,
});
```

**Expected**: Rate limit issues resolved

**Verification**: Monitor API usage

**Rollback**: Remove backoff when rate limits increase

---

## Verification

### Immediate Verification (Within 5 Minutes)

1. **Check Application Health**
   ```bash
   curl https://your-app.com/health
   ```
   **Success**: Application responds (may be degraded)

2. **Test Affected Features**
   - Test: Features using failed dependency
   - **Success**: Features work with fallback or graceful degradation

### Ongoing Verification (Next 24 Hours)

1. **Monitor Dependency Status**
   - Check: External service status
   - **Success**: Dependency recovers

2. **Monitor Application Health**
   - Check: Application metrics
   - **Success**: Application stable

---

## Rollback / Escalation

### When to Rollback

Rollback if:
- Graceful degradation made things worse
- More users affected

### When to Escalate

Escalate if:
- Critical dependency down > 1 hour
- Cannot implement graceful degradation
- User impact high

---

## Evidence & Audit Notes

### Required Audit Trail Entries

1. **Dependency Failure Start Time**: [Timestamp]
2. **Affected Dependency**: [Service name]
3. **Root Cause**: [What caused failure]
4. **Actions Taken**: [List actions]
5. **Resolution Time**: [Timestamp]

### Artifacts to Save

1. **Dependency Status Logs**
   - Failure logs
   - Recovery logs

2. **Application Logs**
   - Degradation logs
   - Fallback logs

---

## Post-Incident Follow-Ups

### Within 24 Hours

1. **Review Dependency Health**
   - Identify why dependency failed
   - Update monitoring if needed

2. **Update Monitoring**
   - Add alert for dependency failures
   - Add dashboard for dependency health

### Within 1 Week

1. **Implement Preventative Measures**
   - Review: `node-circuit-breaker` KEY
   - Set up dependency monitoring
   - Improve fallback mechanisms

### Related Preventative KEYS

- **Node / Next KEYS**:
  - `node-circuit-breaker`: Circuit breaker pattern
  - `node-graceful-degradation`: Graceful degradation
