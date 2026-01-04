# Runbook KEYS Alignment with Jupyter KEYS

**Version**: 1.0.0  
**Last Updated**: 2024-12-30  
**Status**: Canonical — Defines how Runbook KEYS reference Jupyter KEYS  
**Purpose**: Ensure seamless integration between Runbook diagnosis and Jupyter analysis

---

## Core Principle

**Runbooks do NOT embed heavy analysis. They CALL analysis KEYS.**

Runbooks explain WHEN to run Jupyter KEYS, not HOW they work.

---

## Alignment Rules

### Rule 1: Diagnosis Calls Analysis

When a runbook needs analysis, it references a Jupyter KEY:

```markdown
### Step 3: Analyze Recent Webhook Events

**Action**: Use Jupyter KEY to analyze webhook event patterns
- Run: `jupyter-webhook-event-analysis` KEY
- Input: Last 24 hours of webhook logs
- Review: Failure patterns, error types, timing
```

**NOT**:
```markdown
### Step 3: Analyze Recent Webhook Events

**Action**: Write Python code to analyze webhook events
```python
import pandas as pd
# ... 50 lines of analysis code ...
```
```

---

### Rule 2: Explicit Inputs and Outputs

Every Jupyter KEY reference must specify:
- **Which KEY**: Exact slug/name
- **What Input**: What data to provide
- **What Output**: What to expect
- **What Questions**: What questions the notebook answers

**Example**:
```markdown
### Step 5: Analyze Database Query Patterns

**Action**: Use Jupyter KEY to identify slow queries
- **KEY**: `jupyter-database-query-analysis`
- **Input**: Database query logs from last 24 hours (CSV export)
- **Output**: Report identifying slow queries, frequency, and impact
- **Questions Answered**:
  - Which queries are slowest?
  - What is the query frequency?
  - What is the impact on overall performance?
- **Next Steps**: Use output to optimize identified queries
```

---

### Rule 3: When to Run Jupyter KEYS

Runbooks specify WHEN to run Jupyter KEYS:

- **During Diagnosis**: When analysis is needed to understand the issue
- **During Verification**: When analysis is needed to confirm resolution
- **Post-Incident**: When analysis is needed for follow-up

**Example**:
```markdown
## Diagnosis Flow

### Step 4: Analyze Error Patterns

**When**: After collecting error logs

**Action**: Run Jupyter KEY to identify patterns
- **KEY**: `jupyter-error-pattern-analysis`
- **Input**: Error logs from last 24 hours
- **When to Run**: After Step 3 (log collection) is complete
- **Expected Output**: Pattern report showing error frequency and types
```

---

### Rule 4: Evidence from Jupyter KEYS

Jupyter KEY outputs become evidence:

```markdown
## Evidence & Audit Notes

### Artifacts to Save

3. **Jupyter KEY Outputs**
   - Error pattern analysis results (`jupyter-error-pattern-analysis`)
   - Database query analysis report (`jupyter-database-query-analysis`)
   - Webhook delivery report (`jupyter-webhook-delivery-report`)
```

---

## Common Jupyter KEY Patterns in Runbooks

### Pattern 1: Log Analysis

**Runbook Need**: Analyze application logs to identify patterns

**Jupyter KEY**: `jupyter-log-analysis`

**Usage**:
```markdown
### Step 2: Analyze Application Logs

**Action**: Use Jupyter KEY to analyze logs
- **KEY**: `jupyter-log-analysis`
- **Input**: Application logs from incident timeframe (exported as CSV)
- **Output**: Pattern report showing error frequency, timing, and types
- **Questions Answered**:
  - What errors occurred?
  - When did errors start?
  - What is the error pattern?
```

---

### Pattern 2: Database Analysis

**Runbook Need**: Analyze database performance or data integrity

**Jupyter KEY**: `jupyter-database-analysis`

**Usage**:
```markdown
### Step 3: Analyze Database Performance

**Action**: Use Jupyter KEY to analyze database queries
- **KEY**: `jupyter-database-query-analysis`
- **Input**: Database query logs from last 24 hours
- **Output**: Report identifying slow queries and performance bottlenecks
- **Questions Answered**:
  - Which queries are slowest?
  - What is the query frequency?
  - What is the impact on performance?
```

---

### Pattern 3: Event Analysis

**Runbook Need**: Analyze events (webhooks, API calls, user actions)

**Jupyter KEY**: `jupyter-event-analysis`

**Usage**:
```markdown
### Step 4: Analyze Webhook Events

**Action**: Use Jupyter KEY to analyze webhook delivery patterns
- **KEY**: `jupyter-webhook-event-analysis`
- **Input**: Webhook delivery logs from Stripe dashboard (CSV export)
- **Output**: Report showing delivery success rate, failure patterns, timing
- **Questions Answered**:
  - What is the delivery success rate?
  - What events are failing?
  - When did failures start?
```

---

### Pattern 4: Data Reconciliation

**Runbook Need**: Verify data consistency between systems

**Jupyter KEY**: `jupyter-data-reconciliation`

**Usage**:
```markdown
### Step 5: Reconcile Subscription Data

**Action**: Use Jupyter KEY to compare Stripe and database subscriptions
- **KEY**: `jupyter-stripe-subscription-reconciliation`
- **Input**: Stripe subscription export (CSV) and database subscription export (CSV)
- **Output**: Report showing discrepancies and mismatches
- **Questions Answered**:
  - Which subscriptions don't match?
  - What are the discrepancies?
  - What is the data drift?
```

---

### Pattern 5: Performance Analysis

**Runbook Need**: Analyze system performance metrics

**Jupyter KEY**: `jupyter-performance-analysis`

**Usage**:
```markdown
### Step 6: Analyze Performance Metrics

**Action**: Use Jupyter KEY to analyze system performance
- **KEY**: `jupyter-api-performance-analysis`
- **Input**: API response time logs from last 24 hours (CSV)
- **Output**: Report showing response time patterns, p95/p99, degradation points
- **Questions Answered**:
  - When did performance degrade?
  - What endpoints are slowest?
  - What is the performance trend?
```

---

## Runbook → Jupyter KEY Mapping

### By Runbook Type

**Incident Runbooks**:
- Log analysis → `jupyter-log-analysis`
- Error pattern analysis → `jupyter-error-pattern-analysis`
- Performance analysis → `jupyter-performance-analysis`

**Failure-Mode Runbooks**:
- Event analysis → `jupyter-event-analysis`
- Dependency analysis → `jupyter-dependency-analysis`
- Degradation analysis → `jupyter-degradation-analysis`

**Recovery Runbooks**:
- Data reconciliation → `jupyter-data-reconciliation`
- State verification → `jupyter-state-verification`
- Audit trail analysis → `jupyter-audit-trail-analysis`

**Decision Runbooks**:
- Risk analysis → `jupyter-risk-analysis`
- Cost analysis → `jupyter-cost-analysis`
- Impact analysis → `jupyter-impact-analysis`

---

## Example: Complete Runbook Section

```markdown
## Diagnosis Flow

### Step 3: Analyze Webhook Delivery Patterns

**When**: After verifying webhook endpoint is healthy (Step 2)

**Action**: Use Jupyter KEY to analyze webhook delivery patterns

1. **Export Webhook Logs**
   ```bash
   # From Stripe Dashboard:
   # Developers → Webhooks → [Your Endpoint] → Export logs
   # Save as: webhook_logs_$(date +%Y%m%d).csv
   ```

2. **Run Jupyter KEY**
   - **KEY**: `jupyter-webhook-event-analysis`
   - **Input**: `webhook_logs_YYYYMMDD.csv`
   - **Location**: `/jupyter-keys/webhook-event-analysis/webhook-event-analysis.ipynb`

3. **Review Output**
   - **Expected Output**: Analysis report showing:
     - Delivery success rate (should be > 95%)
     - Failure patterns (which events fail most)
     - Timing patterns (when failures occur)
     - Error types (signature, timeout, processing)

4. **Interpret Results**
   - **If Success Rate < 95%**: Continue to Step 4 (check application logs)
   - **If Signature Errors**: See Action 1 (update webhook secret)
   - **If Timeout Errors**: See Action 2 (increase timeout)
   - **If Processing Errors**: See Action 3 (check application code)

**Evidence**: Save Jupyter KEY output report for audit trail
```

---

## Version History

- **1.0.0** (2024-12-30): Initial Jupyter KEY alignment definition
