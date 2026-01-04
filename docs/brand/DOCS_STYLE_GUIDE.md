# Documentation Style Guide

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX  
**Status**: Active — Governs all technical documentation  
**Purpose**: Standardized tone and language for README files, runbooks, Node/Next keys, Jupyter keys, and technical docs

---

## Core Principle

Technical documentation is **instructional, not promotional**. It should be calm, precise, and helpful—not marketing copy.

---

## Tone Requirements

### ✅ Required Tone

- **Instructional**: Step-by-step guidance
- **Calm**: No urgency or pressure
- **Precise**: Specific, actionable language
- **Helpful**: Answers questions users have
- **Respectful**: Assumes user competence

### ❌ Forbidden Tone

- **Promotional**: No marketing language
- **Hype**: No superlatives or excitement
- **Evangelical**: No "you should" or "you must"
- **Condescending**: No "obviously" or "simply"
- **Urgent**: No "now" or "immediately"

---

## Language Rules

### Product References

**In Technical Docs:**
- ✅ "KEYS" (when referring to the platform)
- ✅ "keys" (when referring to assets)
- ✅ "This key" (when referring to a specific asset)
- ❌ "KEYS framework" (say "KEYS marketplace" or just "KEYS")
- ❌ "Keyring" as product name (Keyring is the collection concept)

**Example:**
```
This key unlocks JWT authentication patterns in Cursor. Download the key 
from the KEYS marketplace and integrate it into your project.
```

---

### Action Language

**Use:**
- ✅ "Download the key"
- ✅ "Integrate the key"
- ✅ "Use this key"
- ✅ "Follow these steps"
- ✅ "Configure [X]"

**Avoid:**
- ❌ "Install KEYS" (KEYS is not installed)
- ❌ "Install this key" (keys are downloaded and integrated)
- ❌ "Deploy KEYS" (unless referring to self-hosted infrastructure)
- ❌ "Set up KEYS" (unless referring to account setup)

---

### Outcome Language

**Use:**
- ✅ "This key unlocks [specific outcome]"
- ✅ "This key provides [specific capability]"
- ✅ "This key generates [specific artifacts]"
- ✅ "This key enables [specific workflow]"

**Avoid:**
- ❌ "This key does everything"
- ❌ "This key solves [vague problem]"
- ❌ "This key is perfect for [everything]"

---

## README Structure

### Standard README Sections

1. **Title**: Key name and what it unlocks
2. **Description**: Specific outcome and tool
3. **Prerequisites**: Required tools and setup
4. **Installation**: Download and integration steps
5. **Usage**: How to use the key
6. **Configuration**: Options and settings
7. **Examples**: Practical examples
8. **Troubleshooting**: Common issues
9. **License**: License information

---

### README Language

**Title:**
```
# [Key Name] — Unlocks [Outcome] in [Tool]
```

**Description:**
```
This key unlocks [specific outcome] in [Tool]. It provides [specific artifacts] 
that [specific benefit]. 

Prerequisites: [Tool], [other requirements]
```

**Example:**
```
# Stripe Subscription Management — Unlocks Subscription Billing in Stripe

This key unlocks subscription billing workflows in Stripe. It provides payment 
flows, subscription lifecycle management, and webhook handling patterns that 
integrate into your Node.js application.

Prerequisites: Stripe account, Node.js project
```

---

## Runbook Language

### Structure

1. **Title**: What this runbook addresses
2. **Context**: When to use this runbook
3. **Prerequisites**: Required access and tools
4. **Steps**: Sequential actions
5. **Verification**: How to confirm success
6. **Rollback**: How to undo if needed

### Language

**Title:**
```
# [Problem] — [Tool] Runbook
```

**Context:**
```
Use this runbook when [specific situation]. This runbook unlocks [specific outcome] 
using [Tool].
```

**Steps:**
```
1. [Action] in [Tool]
2. [Action] in [Tool]
3. Verify [outcome]
```

**Example:**
```
# Stripe Webhook Failure — Stripe Runbook

Use this runbook when Stripe webhooks fail to process. This runbook unlocks 
webhook failure recovery using Stripe's API and your application logs.

Prerequisites: Stripe dashboard access, application logs access

Steps:
1. Check webhook delivery status in Stripe dashboard
2. Review application logs for error patterns
3. Retry failed webhooks using Stripe API
4. Verify webhook processing in application
```

---

## Node/Next Keys Documentation

### Language

**Structure:**
```
# [Key Name] — Node.js/Next.js Key

This key unlocks [outcome] in Node.js/Next.js applications. It provides 
[components/middleware/utilities] that [benefit].

## Installation

Download this key from the KEYS marketplace and extract it into your project.

## Usage

[Specific usage instructions]

## Configuration

[Configuration options]
```

**Avoid:**
- ❌ "This is the best way to [X]" (too promotional)
- ❌ "You must use this" (too prescriptive)
- ❌ "This solves everything" (too broad)

---

## Jupyter Keys Documentation

### Language

**Structure:**
```
# [Key Name] — Jupyter Notebook Key

This key unlocks [outcome] in Jupyter. It provides [notebook/analysis pattern] 
that [benefit].

## Usage

1. Download this key from the KEYS marketplace
2. Open the notebook in Jupyter
3. Configure [parameters]
4. Run cells to [outcome]
```

**Avoid:**
- ❌ "This notebook does everything" (too broad)
- ❌ "Perfect for all data science" (too general)
- ❌ "Magic analysis" (avoid "magic" language)

---

## Code Comments

### Language

**Use:**
- ✅ "Unlocks [specific capability]"
- ✅ "Provides [specific pattern]"
- ✅ "Enables [specific workflow]"
- ✅ "Generates [specific artifacts]"

**Avoid:**
- ❌ "Does magic"
- ❌ "Solves everything"
- ❌ "Perfect solution"

**Example:**
```javascript
// Unlocks JWT authentication middleware generation
// Provides secure token validation pattern
function validateJWT(token) {
  // Implementation
}
```

---

## Error Messages in Docs

### Language

**Use:**
- ✅ "If [condition], then [action]"
- ✅ "This error indicates [specific issue]"
- ✅ "To resolve, [specific steps]"

**Avoid:**
- ❌ "Something went wrong" (too vague)
- ❌ "Contact support" (unless necessary)
- ❌ "This shouldn't happen" (unhelpful)

**Example:**
```
If the key fails to download, check your internet connection and KEYS account 
access. Verify you have an entitlement to this key in your account dashboard.
```

---

## Troubleshooting Sections

### Language

**Structure:**
```
## Troubleshooting

### Issue: [Specific problem]

**Symptoms**: [What you see]

**Cause**: [Why this happens]

**Solution**: [Specific steps]
```

**Example:**
```
## Troubleshooting

### Issue: Key fails to integrate

**Symptoms**: Integration steps don't work, errors occur

**Cause**: Missing prerequisites or incorrect configuration

**Solution**: 
1. Verify prerequisites are installed
2. Check configuration matches key requirements
3. Review key documentation for specific setup steps
```

---

## Marketing Metaphors in Technical Docs

### ❌ Forbidden Metaphors

- "Revolutionary"
- "Game-changing"
- "Magic"
- "Perfect"
- "Best"

### ✅ Allowed Language

- "Proven"
- "Validated"
- "Structured"
- "Practical"
- "Effective"

---

## Version History

### Language

**Use:**
```
## Version History

- **1.0.0** (2025-01-XX): Initial release
  - Unlocks [outcome]
  - Provides [artifacts]
```

**Avoid:**
- ❌ "Amazing new features" (too promotional)
- ❌ "Fixed everything" (too broad)
- ❌ "Perfect release" (too superlative)

---

## Examples in Documentation

### Good Examples

**Specific:**
```
This key unlocks Stripe subscription management. Example: Create a subscription 
for a customer with a monthly plan.

```python
subscription = stripe.Subscription.create(
  customer=customer_id,
  items=[{'price': price_id}]
)
```
```

**Outcome-Focused:**
```
This key unlocks Jupyter data validation. Example: Validate a dataset for 
missing values and outliers, producing a validation report.
```

### Bad Examples

**Too Vague:**
```
This key does data science. Example: Analyze data.
```

**Too Promotional:**
```
This amazing key revolutionizes your workflow! Example: Use it for everything!
```

---

## Version History

- **1.0.0** (2025-01-XX): Initial documentation style guide
