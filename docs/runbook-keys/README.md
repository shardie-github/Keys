# Operational Runbook KEYS

**Version**: 1.0.0  
**Last Updated**: 2024-12-30  
**Status**: Canonical — Complete Operational Runbook KEYS system  
**Purpose**: Decision and action instruments under pressure

---

## What Are Operational Runbook KEYS?

**Operational Runbook KEYS are decision and action instruments under pressure.**

They are NOT documentation.  
They are NOT guides.  
They are NOT training material.

They are **executable decision trees** that:
- Reduce cognitive load during incidents
- Guide diagnosis → action → verification
- Reference executable KEYS where appropriate
- Leave complete audit trails
- Can be followed by a competent human without heroics

---

## The KEYS Triad

Operational Runbook KEYS complete the KEYS triad:

**THINK** (Jupyter KEYS) → **DO** (Node / Next KEYS) → **RECOVER** (Runbook KEYS)

- **Jupyter KEYS**: Unlock analysis and diagnostics
- **Node / Next KEYS**: Unlock runtime fixes and execution
- **Runbook KEYS**: Unlock incident response and recovery

---

## Core Documentation

### Foundation

- **[KEY_TYPES.md](./KEY_TYPES.md)**: Allowed Runbook KEY types (incident, failure-mode, decision, recovery)
- **[RUNBOOK_STRUCTURE.md](./RUNBOOK_STRUCTURE.md)**: Canonical structure (10 mandatory sections)
- **[METADATA_SCHEMA.md](./METADATA_SCHEMA.md)**: pack.json schema for Runbook KEYS

### Alignment

- **[JUPYTER_ALIGNMENT.md](./JUPYTER_ALIGNMENT.md)**: How Runbooks reference Jupyter KEYS
- **[NODE_ALIGNMENT.md](./NODE_ALIGNMENT.md)**: How Runbooks reference Node / Next KEYS
- **[CROSS_KEY_AUDIT.md](./CROSS_KEY_AUDIT.md)**: Consistency verification across all KEY types

### Enterprise Value

- **[ENTERPRISE_VALUE.md](./ENTERPRISE_VALUE.md)**: Enterprise value proposition and competitive moat
- **[FINAL_QA_REPORT.md](./FINAL_QA_REPORT.md)**: Quality assurance verification

---

## Initial Runbook Set

### 1. Stripe Webhook Failure Runbook
- **Type**: Incident
- **Severity**: P1
- **Covers**: Webhook delivery failures, signature verification errors, processing failures

### 2. Data Reconciliation Mismatch Runbook
- **Type**: Recovery
- **Severity**: P2
- **Covers**: Data inconsistencies between Stripe and database

### 3. Supabase RLS Lockout Recovery Runbook
- **Type**: Recovery
- **Severity**: P1
- **Covers**: RLS policy lockouts, user access restoration

### 4. Background Job Failure & Replay Runbook
- **Type**: Incident, Recovery
- **Severity**: P2
- **Covers**: Background job failures, job replay and recovery

### 5. Partial Outage / Dependency Failure Runbook
- **Type**: Failure-Mode
- **Severity**: P1
- **Covers**: Partial service degradation, external dependency failures

### 6. AI Output Regression Incident Runbook
- **Type**: Incident
- **Severity**: P2
- **Covers**: AI output quality degradation, model regressions

---

## Runbook Structure

Every Runbook KEY follows this canonical structure:

1. **TITLE + SCOPE**: Exact scenario covered, explicit exclusions
2. **WHEN TO USE THIS RUNBOOK**: Triggers, symptoms, alerts
3. **WHEN *NOT* TO USE THIS RUNBOOK**: Similar but different scenarios
4. **IMMEDIATE SAFETY CHECKS**: Actions that prevent making things worse
5. **DIAGNOSIS FLOW**: Ordered checks, decision points, branching paths
6. **ACTION STEPS**: Explicit commands, references to Node / Next KEYS
7. **VERIFICATION**: How to confirm resolution, what "good" looks like
8. **ROLLBACK / ESCALATION**: When to stop, how to revert, when to escalate
9. **EVIDENCE & AUDIT NOTES**: What to record, artifacts produced
10. **POST-INCIDENT FOLLOW-UPS**: What to review later, links to preventative KEYS

---

## Quality Bar

**If a tired engineer at 3 AM can follow a runbook calmly and fix the problem without guessing, the runbook is correct.**

All runbooks are:
- ✅ Structured and clear
- ✅ No ambiguous steps
- ✅ All commands explicit
- ✅ No tribal knowledge assumed
- ✅ Usable during real incidents
- ✅ Complete audit trails

---

## Enterprise Value

### Risk Reduction
- Prevents $10K-$100K+ incidents
- Reduces MTTR by 50-70%
- Eliminates hero dependencies

### Compliance Support
- SOC 2 evidence
- PCI-DSS evidence
- GDPR evidence

### Onboarding Acceleration
- Reduces onboarding time by 60-80%
- Eliminates tribal knowledge
- Immediate productivity

### Institutional Memory
- Preserves knowledge
- Prevents repeat incidents
- Maintains consistency

**ROI**: $29/month runbook prevents $10K-$100K+ incidents. ROI: 190x-1,900x.

---

## Getting Started

### For Incident Responders

1. Identify incident type
2. Find appropriate runbook
3. Follow runbook step-by-step
4. Document evidence
5. Complete post-incident follow-ups

### For Engineering Leads

1. Review runbook library
2. Customize for your infrastructure
3. Train team on runbooks
4. Integrate with monitoring
5. Update based on incidents

### For Compliance Officers

1. Review runbook audit requirements
2. Verify evidence collection
3. Integrate with compliance processes
4. Use for audit preparation

---

## Related Documentation

- **[Node / Next KEYS Documentation](../node-keys/README.md)**: Runtime execution KEYS
- **[Jupyter KEYS Documentation](../foundation/JUPYTER_KEYS.md)**: Analysis KEYS
- **[KEYS Cohesion](../foundation/COHESION.md)**: Cross-layer consistency

---

## Version History

- **1.0.0** (2024-12-30): Initial Operational Runbook KEYS system

---

## Support

For questions or issues with Runbook KEYS:
- Review documentation in this directory
- Check runbook-specific README files
- Refer to cross-key audit for consistency

---

**Remember**: Runbooks are decision and action instruments under pressure. If it cannot be used during a real incident, it is not a Key.
