# Operational Runbook KEY Types

**Version**: 1.0.0  
**Last Updated**: 2024-12-30  
**Status**: Canonical — Defines allowed Operational Runbook KEY types  
**Purpose**: Absolute definition of allowed Runbook KEY categories

---

## Core Principle

**Operational Runbook KEYS are decision and action instruments under pressure.**

They are NOT documentation.  
They are NOT guides.  
They are NOT training material.

They are **executable decision trees** that reduce cognitive load during incidents, failures, and critical decisions.

---

## Absolute Definition (Non-Negotiable)

An OPERATIONAL RUNBOOK KEY:

- is invoked when something is wrong or uncertain
- assumes limited time and partial information
- reduces cognitive load
- guides diagnosis → action → verification
- references executable KEYS where appropriate
- leaves an audit trail
- can be followed by a competent human without heroics

**If it cannot be used during a real incident, it is not a Key.**

---

## Allowed KEY Types

### 1. INCIDENT RUNBOOKS

**Purpose**: Something is broken, degraded, or failing

**What They Cover**:
- Service outages
- Data inconsistencies
- Failed automation
- Performance degradation
- Security incidents
- Integration failures

**Characteristics**:
- Triggered by alerts, errors, or user reports
- Time-sensitive (minutes to hours)
- Require immediate diagnosis and action
- Produce evidence for post-incident review

**Examples**:
- Stripe Webhook Failure Runbook
- Database Connection Failure Runbook
- API Rate Limit Exceeded Runbook
- Authentication Service Down Runbook

**Metadata**: `key_type = "incident"`, `severity_level = "p0" | "p1" | "p2" | "p3"`

---

### 2. FAILURE-MODE RUNBOOKS

**Purpose**: Known edge cases, partial outages, dependency failures

**What They Cover**:
- Partial service degradation
- Dependency failures (external services down)
- Edge cases in production
- Cascading failures
- Partial data corruption
- Graceful degradation scenarios

**Characteristics**:
- Cover known failure patterns
- May be proactive (prevent escalation)
- Often triggered by monitoring alerts
- Focus on containment and mitigation

**Examples**:
- Partial Outage / Dependency Failure Runbook
- Database Replication Lag Runbook
- External API Degradation Runbook
- Cache Invalidation Failure Runbook

**Metadata**: `key_type = "failure-mode"`, `severity_level = "p1" | "p2"`

---

### 3. DECISION RUNBOOKS

**Purpose**: "Should we do X or Y" — tradeoff resolution, risk-based choices

**What They Cover**:
- Deployment decisions (rollback vs. fix forward)
- Scaling decisions (scale up vs. optimize)
- Data recovery decisions (restore vs. rebuild)
- Feature flag decisions (enable vs. disable)
- Cost vs. performance tradeoffs

**Characteristics**:
- Guide decision-making under uncertainty
- Present clear tradeoffs
- Include risk assessment
- Document decision rationale

**Examples**:
- Rollback vs. Fix Forward Decision Runbook
- Scale Up vs. Optimize Decision Runbook
- Restore vs. Rebuild Decision Runbook
- Enable Feature Flag Decision Runbook

**Metadata**: `key_type = "decision"`, `severity_level = "p1" | "p2" | "p3"`

---

### 4. RECOVERY RUNBOOKS

**Purpose**: Rollback, replay, reconciliation, repair

**What They Cover**:
- Service rollback procedures
- Data replay and reconciliation
- Database repair and recovery
- Configuration restoration
- State reconciliation
- Audit trail repair

**Characteristics**:
- Execute after incident resolution
- Restore correct state
- Verify data integrity
- Leave audit trail

**Examples**:
- Supabase RLS Lockout Recovery Runbook
- Data Reconciliation Mismatch Runbook
- Background Job Failure & Replay Runbook
- Configuration Rollback Runbook

**Metadata**: `key_type = "recovery"`, `severity_level = "p1" | "p2"`

---

## KEY Type Selection Guide

### When to Use INCIDENT RUNBOOKS
- Service is down or degraded
- Users are affected
- Alerts are firing
- Errors are occurring
- Immediate action required

### When to Use FAILURE-MODE RUNBOOKS
- Known edge case occurring
- Partial degradation detected
- Dependency failure observed
- Monitoring alerts triggered
- Proactive mitigation needed

### When to Use DECISION RUNBOOKS
- Multiple valid options exist
- Tradeoffs need evaluation
- Risk assessment required
- Decision needs documentation
- Time pressure exists

### When to Use RECOVERY RUNBOOKS
- Incident is resolved
- State needs restoration
- Data needs reconciliation
- Rollback is required
- Audit trail needs repair

---

## KEY Type Combinations

A single Runbook KEY can combine multiple types if they are logically related:

**Example**: Database Connection Failure Runbook
- **Incident Runbook**: Diagnose and fix connection issues
- **Recovery Runbook**: Restore connections and verify state
- **Decision Runbook**: Choose between restart vs. failover

**Metadata**: `key_type = ["incident", "recovery", "decision"]`

---

## Forbidden KEY Types

### ❌ DOCUMENTATION KEYS
A Runbook KEY cannot be generic documentation. It must guide specific actions.

### ❌ TRAINING KEYS
A Runbook KEY cannot be training material. It must be usable during real incidents.

### ❌ GENERIC GUIDES
A Runbook KEY cannot be vague ("how to debug"). It must cover specific scenarios.

### ❌ TOOL-SPECIFIC ONLY
A Runbook KEY should work across tools where possible. Tool-specific details are fine, but the pattern should be transferable.

---

## Version History

- **1.0.0** (2024-12-30): Initial canonical definition of Runbook KEY types
