# Operational Runbook KEY Metadata Schema

**Version**: 1.0.0  
**Last Updated**: 2024-12-30  
**Status**: Canonical — Defines pack.json schema for Runbook KEYS  
**Purpose**: Ensure consistent marketplace metadata and Runbook KEY configuration

---

## Core Principle

**Every Operational Runbook KEY must have a valid `pack.json` file that declares all capabilities, requirements, and side effects.**

No surprises. Everything explicit.

---

## Required Schema

```typescript
interface RunbookKeyMetadata {
  // Core identification
  slug: string;                    // Unique identifier (kebab-case)
  title: string;                   // Display name
  description: string;              // Brief description (1-2 sentences)
  
  // Tool and type classification
  tool: "operational";              // Always "operational" for runbooks
  key_type: RunbookKeyType[];       // Array of runbook KEY types
  severity_level: SeverityLevel;    // P0, P1, P2, or P3
  
  // Versioning
  version: string;                  // Semantic version (e.g., "1.0.0")
  
  // Runtime characteristics
  runtime_dependency: RuntimeDependency; // human | assisted | automated
  required_access_level: AccessLevel;   // read | write | admin
  
  // Evidence and compliance
  produces_evidence: boolean;       // Whether runbook produces audit evidence
  compliance_relevance: ComplianceStandard[]; // SOC2, PCI-DSS, GDPR, etc.
  
  // Related KEYS
  references_jupyter_keys?: string[];  // Jupyter KEYS referenced
  references_node_keys?: string[];     // Node / Next KEYS referenced
  related_runbooks?: string[];        // Related runbook slugs
  
  // Marketplace metadata
  outcome?: string;                 // Outcome category (incident-response, recovery, etc.)
  maturity?: "starter" | "operator" | "scale" | "enterprise";
  tags?: string[];                   // Search tags
  
  // License
  license_spdx: string;             // SPDX license identifier
  
  // Author information
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  
  // Documentation links
  documentation?: {
    readme?: string;
    checklist?: string;
    changelog?: string;
  };
}
```

---

## Type Definitions

### RunbookKeyType

```typescript
type RunbookKeyType = 
  | "incident"      // Something is broken
  | "failure-mode"  // Known edge cases, partial outages
  | "decision"      // "Should we do X or Y"
  | "recovery";     // Rollback, replay, reconciliation
```

---

### SeverityLevel

```typescript
type SeverityLevel = 
  | "p0"  // Critical - Site down, immediate response
  | "p1"  // High - Major feature broken, response within 1 hour
  | "p2"  // Medium - Minor feature broken, response within 4 hours
  | "p3"; // Low - Cosmetic issue, response next business day
```

---

### RuntimeDependency

```typescript
type RuntimeDependency =
  | "human"      // Requires human execution (manual steps)
  | "assisted"   // Human-guided with automation (Node KEYS assist)
  | "automated"; // Fully automated (can run without human)
```

---

### AccessLevel

```typescript
type AccessLevel =
  | "read"   // Read-only access (logs, monitoring)
  | "write"  // Write access (configuration, data updates)
  | "admin"; // Admin access (service restarts, infrastructure)
```

---

### ComplianceStandard

```typescript
type ComplianceStandard =
  | "SOC2"      // SOC 2 Type II
  | "PCI-DSS"   // PCI Data Security Standard
  | "GDPR"      // General Data Protection Regulation
  | "HIPAA"     // Health Insurance Portability and Accountability Act
  | "ISO27001"; // ISO/IEC 27001
```

---

## Example: Incident Runbook

```json
{
  "slug": "stripe-webhook-failure",
  "title": "Stripe Webhook Failure Runbook",
  "description": "Diagnose and resolve Stripe webhook delivery failures, signature verification errors, and processing failures",
  "tool": "operational",
  "key_type": ["incident"],
  "severity_level": "p1",
  "version": "1.0.0",
  "runtime_dependency": "assisted",
  "required_access_level": "write",
  "produces_evidence": true,
  "compliance_relevance": ["SOC2", "PCI-DSS"],
  "references_jupyter_keys": [
    "jupyter-webhook-event-analysis",
    "jupyter-webhook-delivery-report"
  ],
  "references_node_keys": [
    "node-stripe-webhook-entitlement",
    "node-stripe-webhook-replay"
  ],
  "related_runbooks": [
    "stripe-api-failure",
    "database-connection-failure",
    "service-outage"
  ],
  "outcome": "incident-response",
  "maturity": "operator",
  "tags": ["stripe", "webhook", "incident", "p1"],
  "license_spdx": "MIT",
  "author": {
    "name": "KEYS Team"
  },
  "documentation": {
    "readme": "README.md",
    "checklist": "checklist.md",
    "changelog": "CHANGELOG.md"
  }
}
```

---

## Example: Recovery Runbook

```json
{
  "slug": "data-reconciliation-mismatch",
  "title": "Data Reconciliation Mismatch Runbook",
  "description": "Identify and resolve data inconsistencies between Stripe subscriptions and local database",
  "tool": "operational",
  "key_type": ["recovery"],
  "severity_level": "p2",
  "version": "1.0.0",
  "runtime_dependency": "assisted",
  "required_access_level": "write",
  "produces_evidence": true,
  "compliance_relevance": ["SOC2", "GDPR"],
  "references_jupyter_keys": [
    "jupyter-stripe-subscription-reconciliation"
  ],
  "references_node_keys": [
    "node-background-reconciliation"
  ],
  "related_runbooks": [
    "stripe-webhook-failure",
    "database-connection-failure"
  ],
  "outcome": "recovery",
  "maturity": "scale",
  "tags": ["data", "reconciliation", "stripe", "recovery"],
  "license_spdx": "MIT",
  "author": {
    "name": "KEYS Team"
  },
  "documentation": {
    "readme": "README.md",
    "checklist": "checklist.md",
    "changelog": "CHANGELOG.md"
  }
}
```

---

## Example: Decision Runbook

```json
{
  "slug": "rollback-vs-fix-forward",
  "title": "Rollback vs. Fix Forward Decision Runbook",
  "description": "Guide decision-making between rolling back a deployment or fixing forward when issues are detected",
  "tool": "operational",
  "key_type": ["decision"],
  "severity_level": "p1",
  "version": "1.0.0",
  "runtime_dependency": "human",
  "required_access_level": "admin",
  "produces_evidence": true,
  "compliance_relevance": ["SOC2"],
  "references_jupyter_keys": [
    "jupyter-deployment-impact-analysis"
  ],
  "references_node_keys": [
    "node-rollback-handler",
    "node-deployment-management"
  ],
  "related_runbooks": [
    "deployment-failure",
    "service-outage"
  ],
  "outcome": "decision-support",
  "maturity": "operator",
  "tags": ["deployment", "decision", "rollback", "p1"],
  "license_spdx": "MIT",
  "author": {
    "name": "KEYS Team"
  },
  "documentation": {
    "readme": "README.md",
    "checklist": "checklist.md",
    "changelog": "CHANGELOG.md"
  }
}
```

---

## Validation Rules

### Required Fields

All fields except `references_jupyter_keys`, `references_node_keys`, `related_runbooks`, `outcome`, `maturity`, `tags`, and `author` are required.

### Field Validation

- `slug`: Must be kebab-case, unique within marketplace
- `version`: Must be valid semantic version
- `tool`: Must be "operational"
- `key_type`: Must be non-empty array of valid RunbookKeyType values
- `severity_level`: Must be valid SeverityLevel value
- `runtime_dependency`: Must be valid RuntimeDependency value
- `required_access_level`: Must be valid AccessLevel value
- `produces_evidence`: Must be boolean
- `compliance_relevance`: Must be array of valid ComplianceStandard values
- `license_spdx`: Must be valid SPDX license identifier

### Reference Validation

- `references_jupyter_keys`: All slugs must exist in marketplace
- `references_node_keys`: All slugs must exist in marketplace
- `related_runbooks`: All slugs must exist in marketplace

---

## Marketplace Integration

The `pack.json` file is used by:

1. **Marketplace UI**: Display Runbook KEY information, filtering, search
2. **Installation Scripts**: Validate requirements, check access levels
3. **Documentation Generation**: Auto-generate docs from metadata
4. **Analytics**: Track Runbook KEY usage, effectiveness, outcomes
5. **Bundling Logic**: Group related Runbooks together
6. **Compliance Reporting**: Generate compliance evidence from runbook usage

---

## Version History

- **1.0.0** (2024-12-30): Initial metadata schema definition
