# Assets Separation System

**Purpose**: Documentation for the KEYS assets separation and consolidation system

---

## Overview

The KEYS repository has been reorganized to cleanly separate operational assets from application code. This separation ensures:

- **Clear boundaries** between assets and app code
- **Commercial licensing** protection while keeping repo public
- **Single source of truth** for Jupyter Keys content
- **Maintainable structure** for long-term growth

---

## Structure

### Assets Workspace

All assets live in `/keys-assets/`:

- **`/runbook-keys/`** - Operational runbook packs
- **`/node-next-keys/`** - Node.js/Next.js runtime keys
- **`/jupyter-keys-md/`** - Consolidated Jupyter Keys documentation
- **`/schemas/`** - JSON schemas for validation
- **`/tools/`** - Validation and indexing tools
- **`/dist/`** - Generated distribution files

### App Code

App code remains separate:

- **`/backend/`** - Backend application code
- **`/frontend/`** - Frontend application code
- **`/docs/`** - Documentation (references assets, doesn't contain them)

---

## What Was Moved

### Runbook Keys

**From**: `/runbook-keys/`  
**To**: `/keys-assets/runbook-keys/`

All 6 runbooks moved:
- `ai-output-regression`
- `background-job-failure-replay`
- `data-reconciliation-mismatch`
- `partial-outage-dependency-failure`
- `stripe-webhook-failure`
- `supabase-rls-lockout-recovery`

### Node/Next Keys

**From**: `/node-keys/`  
**To**: `/keys-assets/node-next-keys/`

All 5 keys moved:
- `audit-log-capture`
- `background-reconciliation`
- `safe-cron-execution`
- `stripe-webhook-entitlement`
- `supabase-rls-guard`

### Jupyter Content

**From**: Scattered across multiple docs  
**To**: `/keys-assets/jupyter-keys-md/JUPYTER_KEYS_LIBRARY.md`

Consolidated from:
- `/docs/foundation/JUPYTER_KEYS.md`
- `/docs/marketplace-notebooks/CONTRACT.md`
- `/docs/runbook-keys/JUPYTER_ALIGNMENT.md`
- `/docs/runbook-keys/CROSS_KEY_AUDIT.md`
- Various runbook READMEs and pack.json files

---

## Validation

### Schema Validation

All assets validated against JSON schemas:
- `pack.schema.json` - Runbook pack metadata
- `key.schema.json` - Node/Next key metadata
- `library.schema.json` - Library index (Jupyter Keys)

### File Validation

Validation tool checks:
- Required files exist
- Slug matches folder name
- Documentation references are valid
- No dangling references

### Running Validation

```bash
tsx keys-assets/tools/validate_assets.ts
```

---

## Licensing

### Commercial Licensing Model

The repository uses a **source-available / commercial** licensing approach:

- **Public Repository**: Code is visible to all
- **Commercial License**: Required for commercial use/resale
- **Read-Only Rights**: Viewers can read but not use commercially without license

See:
- [`/docs/licensing/COMMERCIAL_LICENSING.md`](../licensing/COMMERCIAL_LICENSING.md)
- [`/NOTICE.md`](../../NOTICE.md)

### Asset Licenses

Individual assets maintain their own licenses:
- Runbooks: MIT (per `LICENSE.txt`)
- Node/Next Keys: MIT (per `LICENSE.txt`)
- Jupyter Keys: Defined in notebook repository

---

## References Updated

### Documentation References

All documentation references updated to point to new locations:
- `/runbook-keys/` → `/keys-assets/runbook-keys/`
- `/node-keys/` → `/keys-assets/node-next-keys/`
- Jupyter content → `/keys-assets/jupyter-keys-md/JUPYTER_KEYS_LIBRARY.md`

### Code References

App code does NOT depend on asset source folders directly. Assets are:
- Indexed and served via marketplace API
- Downloaded by users as separate packages
- Not imported into app code

---

## Next Steps

### Publishing Assets

1. **Validate**: Run validation tool
2. **Build Index**: Generate assets index
3. **Publish**: Assets served via marketplace API

### Adding New Assets

1. **Create**: Add to appropriate workspace (`/runbook-keys/` or `/node-next-keys/`)
2. **Validate**: Run validation tool
3. **Document**: Update relevant documentation
4. **Index**: Rebuild assets index

---

## Related Documentation

- **Inventory**: [`INVENTORY.md`](./INVENTORY.md) - Complete file inventory
- **Assets Workspace**: [`/keys-assets/README.md`](../../keys-assets/README.md)
- **Commercial Licensing**: [`/docs/licensing/COMMERCIAL_LICENSING.md`](../licensing/COMMERCIAL_LICENSING.md)

---

## Version History

- **1.0.0** (2025-01-XX): Initial assets separation system documentation
