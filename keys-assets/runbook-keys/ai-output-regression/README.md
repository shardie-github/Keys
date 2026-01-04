# AI Output Regression Incident Runbook

## Scope

This runbook covers:
- AI model output quality degradation
- Unexpected AI behavior changes
- AI output format regressions
- AI performance degradation
- AI model version issues

This runbook does NOT cover:
- AI service outages (see: Service Outage Runbook)
- AI API failures (see: API Failure Runbook)
- AI model training issues (see: Model Training Runbook)

---

## When to Use This Runbook

Use this runbook when:
- Users report degraded AI output quality
- Monitoring alert: "ai_output_quality_score < threshold"
- AI output format changed unexpectedly
- AI performance degraded
- AI model version changed

---

## When NOT to Use This Runbook

Do NOT use this runbook for:
- AI service outages (use: Service Outage Runbook)
- AI API failures (use: API Failure Runbook)
- Model training issues (use: Model Training Runbook)

---

## Immediate Safety Checks (First 2 Minutes)

**DO THESE FIRST:**

1. **Check AI service status**
   ```bash
   curl https://api.openai.com/v1/models
   # OR check your AI provider status page
   ```

2. **Check recent model version changes**
   - Review: Model version in use
   - Check: Recent deployments

3. **Assess user impact**
   - Estimate: Number of affected users
   - Estimate: Severity of degradation

**DO NOT:**
- Change model versions without testing
- Disable AI features without fallback
- Skip verification steps

---

## Diagnosis Flow

### Step 1: Identify Regression Pattern

**Action**: Use Jupyter KEY to analyze output patterns

- **KEY**: `jupyter-ai-output-analysis`
- **Input**: Recent AI outputs, quality scores
- **Output**: Regression pattern analysis

**Expected**: Clear pattern of regression

**If Pattern Found**:
- Root cause identified
- Continue to Action Steps

---

### Step 2: Check Model Version

**Action**: Verify model version in use

```typescript
// Check current model version
const modelVersion = getCurrentModelVersion();
console.log('Current model:', modelVersion);
```

**Expected**: Model version identified

**If Version Changed**:
- May be cause of regression
- Continue to Action Steps

---

### Step 3: Check Input Quality

**Action**: Verify input quality hasn't degraded

- **KEY**: `jupyter-input-quality-analysis`
- **Input**: Recent inputs to AI
- **Output**: Input quality analysis

**Expected**: Input quality is acceptable

**If Input Quality Degraded**:
- Fix input quality first
- Then check AI output

---

## Action Steps

### Action 1: Rollback Model Version (REVERSIBLE)

**Precondition**: Identified model version change caused regression

**Action**: Rollback to previous model version

```typescript
// Rollback model version
await updateModelVersion({
  version: 'previous-stable-version',
  dryRun: false,
});
```

**Expected**: AI output quality restored

**Verification**: Test AI outputs, monitor quality scores

**Rollback**: Can update to new version again if needed

---

### Action 2: Adjust AI Parameters (REVERSIBLE)

**Precondition**: Identified parameter issue

**Action**: Adjust AI parameters (temperature, top_p, etc.)

```typescript
// Adjust parameters
await updateAIParameters({
  temperature: 0.7, // Adjust based on analysis
  top_p: 0.9,
  max_tokens: 2000,
});
```

**Expected**: AI output quality improved

**Verification**: Test AI outputs, monitor quality scores

**Rollback**: Restore previous parameters if needed

---

### Action 3: Enable Output Validation (REVERSIBLE)

**Precondition**: Need to filter poor outputs

**Action**: Enable output validation

- **KEY**: `node-ai-output-validation`
- **Location**: `/node-keys/ai-output-validation/src/index.ts`

**Execution**:
```typescript
import { enableOutputValidation } from '@/node-keys/ai-output-validation/src';

await enableOutputValidation({
  qualityThreshold: 0.8,
  retryOnFailure: true,
});
```

**Expected**: Poor outputs filtered or retried

**Verification**: Monitor output quality scores

**Rollback**: Disable validation if needed

---

## Verification

### Immediate Verification (Within 5 Minutes)

1. **Test AI Outputs**
   - Test: Sample inputs
   - **Success**: Output quality acceptable

2. **Monitor Quality Scores**
   - Check: Quality score dashboard
   - **Success**: Scores above threshold

### Ongoing Verification (Next 24 Hours)

1. **Monitor User Reports**
   - Check: User feedback
   - **Success**: No quality complaints

2. **Monitor Quality Metrics**
   - Check: Quality score trends
   - **Success**: Scores stable or improving

---

## Rollback / Escalation

### When to Rollback

Rollback if:
- Model version change made things worse
- Parameters adjustment failed
- More users affected

### When to Escalate

Escalate if:
- Critical AI feature degraded
- Cannot resolve after 1 hour
- User impact high

---

## Evidence & Audit Notes

### Required Audit Trail Entries

1. **Regression Start Time**: [Timestamp]
2. **Regression Pattern**: [What changed]
3. **Root Cause**: [What caused regression]
4. **Actions Taken**: [List actions]
5. **Resolution Time**: [Timestamp]

### Artifacts to Save

1. **AI Output Samples**
   - Before regression
   - After regression
   - After fix

2. **Jupyter KEY Outputs**
   - Output analysis
   - Quality analysis

---

## Post-Incident Follow-Ups

### Within 24 Hours

1. **Review AI Configuration**
   - Identify why regression occurred
   - Update configuration if needed

2. **Update Monitoring**
   - Add alert for quality score < threshold
   - Add dashboard for AI quality

### Within 1 Week

1. **Implement Preventative Measures**
   - Review: `node-ai-output-validation` KEY
   - Set up quality monitoring
   - Improve output validation

### Related Preventative KEYS

- **Jupyter KEYS**:
  - `jupyter-ai-output-analysis`: Analyze output patterns
  - `jupyter-input-quality-analysis`: Analyze input quality

- **Node / Next KEYS**:
  - `node-ai-output-validation`: Output validation
