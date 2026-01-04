# Assets Separation Inventory

**Version**: 1.0.0  
**Generated**: 2025-01-XX  
**Purpose**: Complete inventory of files to be moved and consolidated during KEYS assets reorganization

---

## Runbook Keys

### Current Location: `/runbook-keys/`
### Target Location: `/keys-assets/runbook-keys/`

**Runbooks to Move:**
1. `ai-output-regression/` → `keys-assets/runbook-keys/ai-output-regression/`
2. `background-job-failure-replay/` → `keys-assets/runbook-keys/background-job-failure-replay/`
3. `data-reconciliation-mismatch/` → `keys-assets/runbook-keys/data-reconciliation-mismatch/`
4. `partial-outage-dependency-failure/` → `keys-assets/runbook-keys/partial-outage-dependency-failure/`
5. `stripe-webhook-failure/` → `keys-assets/runbook-keys/stripe-webhook-failure/`
6. `supabase-rls-lockout-recovery/` → `keys-assets/runbook-keys/supabase-rls-lockout-recovery/`

**Files per Runbook:**
- `README.md` (the runbook itself)
- `checklist.md`
- `pack.json`
- `CHANGELOG.md`
- `LICENSE.txt`

**Total Runbook Files**: 30 files (6 runbooks × 5 files each)

---

## Node/Next Keys

### Current Location: `/node-keys/`
### Target Location: `/keys-assets/node-next-keys/`

**Keys to Move:**
1. `audit-log-capture/` → `keys-assets/node-next-keys/audit-log-capture/`
2. `background-reconciliation/` → `keys-assets/node-next-keys/background-reconciliation/`
3. `safe-cron-execution/` → `keys-assets/node-next-keys/safe-cron-execution/`
4. `stripe-webhook-entitlement/` → `keys-assets/node-next-keys/stripe-webhook-entitlement/`
5. `supabase-rls-guard/` → `keys-assets/node-next-keys/supabase-rls-guard/`

**Files per Key:**
- `README.md`
- `quickstart.md`
- `key.json`
- `CHANGELOG.md`
- `LICENSE.txt`
- `src/` (directory with source code)
- `tests/` (optional, some keys have this)

**Total Node/Next Key Files**: ~44 files (5 keys with varying structures)

---

## Jupyter Content (To Consolidate)

### Current Locations (scattered):
- `/docs/foundation/JUPYTER_KEYS.md` - Core definition
- `/docs/marketplace-notebooks/CONTRACT.md` - Marketplace contract
- `/docs/runbook-keys/JUPYTER_ALIGNMENT.md` - How runbooks reference Jupyter Keys
- `/docs/runbook-keys/CROSS_KEY_AUDIT.md` - Cross-key audit with Jupyter references
- `/docs/foundation/COHESION.md` - Cohesion with Jupyter Keys
- `/docs/node-keys/COHESION.md` - Node/Next cohesion with Jupyter Keys
- Various runbook READMEs referencing Jupyter Keys
- Various pack.json files with `references_jupyter_keys` arrays

### Target Location: `/keys-assets/jupyter-keys-md/JUPYTER_KEYS_LIBRARY.md`

**Content to Consolidate:**
1. What "Jupyter Keys" are (from JUPYTER_KEYS.md)
2. Taxonomy and types (from various docs)
3. List of referenced Jupyter Keys from runbooks:
   - `jupyter-webhook-event-analysis`
   - `jupyter-webhook-delivery-report`
   - `jupyter-stripe-subscription-reconciliation`
   - `jupyter-data-drift-analysis`
   - `jupyter-job-failure-analysis`
   - `jupyter-dependency-impact-analysis`
   - `jupyter-ai-output-analysis`
   - `jupyter-input-quality-analysis`
   - Plus others referenced in documentation
4. How to run packs (generic instructions)
5. Update/versioning policy
6. Integration with Keys marketplace

**Note**: Actual `.ipynb` notebook files remain in separate notebook repository. This consolidation is for documentation and references within KEYS repo only.

---

## Documentation References to Update

### Files referencing old paths:
- Any docs referencing `/runbook-keys/` → `/keys-assets/runbook-keys/`
- Any docs referencing `/node-keys/` → `/keys-assets/node-next-keys/`
- Any scattered Jupyter content → Point to `/keys-assets/jupyter-keys-md/JUPYTER_KEYS_LIBRARY.md`

---

## Licensing Files

### Current:
- Root `/LICENSE` - MIT License (needs review for commercial stance)
- Individual `LICENSE.txt` files in runbooks and node-keys (MIT)

### Actions:
1. Review root LICENSE for commercial/public repo stance
2. Create `/docs/licensing/COMMERCIAL_LICENSING.md`
3. Create `/NOTICE.md` for third-party licenses
4. Ensure per-folder LICENSE.txt files remain appropriate

---

## New Files to Create

### Structure:
- `/keys-assets/README.md` - Top-level explanation
- `/keys-assets/runbook-keys/README.md` - Runbook workspace README
- `/keys-assets/node-next-keys/README.md` - Node/Next workspace README
- `/keys-assets/jupyter-keys-md/README.md` - Jupyter content README
- `/keys-assets/jupyter-keys-md/JUPYTER_KEYS_LIBRARY.md` - Consolidated Jupyter content
- `/keys-assets/schemas/README.md` - Schema documentation
- `/keys-assets/schemas/key.schema.json` - Node/Next key schema
- `/keys-assets/schemas/pack.schema.json` - Runbook pack schema
- `/keys-assets/schemas/library.schema.json` - Library index schema
- `/keys-assets/tools/README.md` - Tools documentation
- `/keys-assets/tools/validate_assets.ts` - Validation tool
- `/keys-assets/tools/build_assets_index.ts` - Index builder tool
- `/docs/assets-separation/README.md` - System documentation

---

## Summary

- **Runbooks**: 6 runbooks, 30 files → Move to `/keys-assets/runbook-keys/`
- **Node/Next Keys**: 5 keys, ~44 files → Move to `/keys-assets/node-next-keys/`
- **Jupyter Content**: Multiple scattered docs → Consolidate into single markdown
- **New Structure**: ~15 new files to create
- **References**: Multiple docs need path updates
- **Licensing**: Review and update for commercial/public stance
