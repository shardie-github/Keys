# Runbook Keys Workspace

**Purpose**: Operational runbook packs for incident response, recovery, and decision support

---

## What Is Here

This workspace contains operational runbook packs. Each runbook is a structured guide for handling specific incident scenarios, failure modes, or decision points.

**Runbooks**:
- `ai-output-regression` - AI output quality degradation and model regression
- `background-job-failure-replay` - Background job failures and replay procedures
- `data-reconciliation-mismatch` - Data reconciliation discrepancies
- `partial-outage-dependency-failure` - Partial outages from dependency failures
- `stripe-webhook-failure` - Stripe webhook delivery failures
- `supabase-rls-lockout-recovery` - Supabase RLS policy lockout recovery

---

## What Is NOT Here

- **Node/Next runtime keys** - See `/keys-assets/node-next-keys/`
- **Jupyter notebooks** - Actual notebooks are in separate repository
- **Keys app code** - Lives in `/backend/` and `/frontend/`
- **General documentation** - Lives in `/docs/`

---

## Runbook Structure

Each runbook follows this structure:

```
<runbook-slug>/
├── README.md          # The runbook itself (main content)
├── checklist.md      # Step-by-step checklist
├── pack.json         # Metadata (slug, title, version, references)
├── CHANGELOG.md      # Version history
└── LICENSE.txt       # License file
```

### Required Files

- **`README.md`** - The runbook content (diagnosis flow, actions, verification)
- **`checklist.md`** - Ordered checklist for execution
- **`pack.json`** - Metadata schema (validated against `/keys-assets/schemas/pack.schema.json`)
- **`CHANGELOG.md`** - Version history
- **`LICENSE.txt`** - License file

---

## How to Validate

### Validate All Runbooks

```bash
tsx ../tools/validate_assets.ts --type=runbooks
```

### Validate Specific Runbook

Check manually:
1. `pack.json` exists and is valid JSON
2. Slug in `pack.json` matches folder name
3. Required files exist (README.md, checklist.md, CHANGELOG.md, LICENSE.txt)
4. Documentation references in `pack.json` point to existing files

---

## How Runbooks Are Published/Consumed

### Publishing

1. **Source**: Runbooks live here in `/keys-assets/runbook-keys/`
2. **Validation**: Must pass schema validation
3. **Indexing**: Included in assets index (`/keys-assets/dist/assets-index.json`)

### Consumption

1. **Marketplace**: Runbooks listed in Keys marketplace
2. **Stripe Gating**: Downloads gated by Stripe entitlements
3. **Usage**: Operators download and use for incident response

### Integration

Runbooks reference:
- **Jupyter Keys** - For analysis and diagnostics (see `references_jupyter_keys` in `pack.json`)
- **Node/Next Keys** - For automation and fixes (see `references_node_keys` in `pack.json`)
- **Other Runbooks** - For related scenarios (see `related_runbooks` in `pack.json`)

---

## Runbook Metadata Schema

See `/keys-assets/schemas/pack.schema.json` for full schema.

**Key Fields**:
- `slug` - URL-safe identifier (must match folder name)
- `title` - Display name
- `description` - What the runbook covers
- `key_type` - Array of types: `["incident"]`, `["failure-mode"]`, `["decision"]`, `["recovery"]`
- `severity_level` - Optional: `"p0"`, `"p1"`, `"p2"`, `"p3"`, `"p4"`
- `references_jupyter_keys` - Array of Jupyter Key slugs
- `references_node_keys` - Array of Node/Next Key slugs
- `related_runbooks` - Array of related runbook slugs
- `outcome` - Outcome category (e.g., `"incident-response"`)
- `maturity` - `"starter"`, `"operator"`, `"scale"`, or `"enterprise"`

---

## Adding a New Runbook

1. **Create Folder**: `/keys-assets/runbook-keys/<slug>/`
2. **Create Files**: README.md, checklist.md, pack.json, CHANGELOG.md, LICENSE.txt
3. **Write Content**: Follow runbook structure guidelines
4. **Validate**: Run validation tool
5. **Update References**: Update any runbooks that should reference this one

---

## Related Documentation

- **Runbook Structure**: [`/docs/runbook-keys/RUNBOOK_STRUCTURE.md`](../../docs/runbook-keys/RUNBOOK_STRUCTURE.md)
- **Jupyter Alignment**: [`/docs/runbook-keys/JUPYTER_ALIGNMENT.md`](../../docs/runbook-keys/JUPYTER_ALIGNMENT.md)
- **Node Alignment**: [`/docs/runbook-keys/NODE_ALIGNMENT.md`](../../docs/runbook-keys/NODE_ALIGNMENT.md)
- **Metadata Schema**: [`/docs/runbook-keys/METADATA_SCHEMA.md`](../../docs/runbook-keys/METADATA_SCHEMA.md)

---

## Version History

- **1.0.0** (2025-01-XX): Initial runbook workspace structure
