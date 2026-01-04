# Jupyter Keys Markdown Workspace

**Purpose**: Consolidated Jupyter Keys documentation and references within KEYS repository

---

## What Is Here

This workspace contains consolidated Jupyter Keys documentation. **Note**: Actual `.ipynb` notebook files are maintained in a separate notebook repository.

**Content**:
- `JUPYTER_KEYS_LIBRARY.md` - Single canonical markdown consolidating all Jupyter Keys references, taxonomy, and usage instructions
- `references/` - Optional supporting images/diagrams

---

## What Is NOT Here

- **Actual Jupyter notebooks** - `.ipynb` files are in a separate notebook repository
- **Runbook keys** - See `/keys-assets/runbook-keys/`
- **Node/Next keys** - See `/keys-assets/node-next-keys/`
- **Keys app code** - Lives in `/backend/` and `/frontend/`

---

## Purpose

This workspace consolidates all Jupyter Keys content that was previously scattered across the KEYS repository:

- **Before**: Jupyter Keys references in multiple docs, runbooks, and metadata files
- **After**: Single canonical markdown (`JUPYTER_KEYS_LIBRARY.md`) with all references

This provides:
- **Single source of truth** for Jupyter Keys documentation within KEYS repo
- **Clear taxonomy** of Jupyter Keys referenced by runbooks
- **Usage instructions** for running Jupyter Keys
- **Integration guide** for marketplace consumption

---

## JUPYTER_KEYS_LIBRARY.md Contents

The consolidated library includes:

1. **What Are Jupyter Keys** - Definition and core principles
2. **Taxonomy** - By tool/outcome/maturity
3. **Jupyter Keys List** - All keys referenced in KEYS repository:
   - `jupyter-webhook-event-analysis`
   - `jupyter-webhook-delivery-report`
   - `jupyter-webhook-duplicate-detection`
   - `jupyter-stripe-subscription-reconciliation`
   - `jupyter-data-drift-analysis`
   - `jupyter-job-failure-analysis`
   - `jupyter-dependency-impact-analysis`
   - `jupyter-ai-output-analysis`
   - `jupyter-input-quality-analysis`
4. **How to Run** - Generic workflow for running Jupyter Keys
5. **Update/Versioning Policy** - How Jupyter Keys are versioned
6. **Marketplace Integration** - How Jupyter Keys integrate with Keys marketplace

---

## How This Integrates

### With Runbooks

Runbooks reference Jupyter Keys via `references_jupyter_keys` in `pack.json`:

```json
{
  "references_jupyter_keys": [
    "jupyter-webhook-event-analysis",
    "jupyter-webhook-delivery-report"
  ]
}
```

Runbooks explain **when** to run Jupyter Keys, not **how** they work. See:
- [`/docs/runbook-keys/JUPYTER_ALIGNMENT.md`](../../docs/runbook-keys/JUPYTER_ALIGNMENT.md)

### With Marketplace

Jupyter Keys are published via separate notebook repository:
- Notebook repository generates `library.json` index
- KEYS marketplace ingests `library.json`
- Users download notebooks via Stripe-gated downloads

See:
- [`/docs/marketplace-notebooks/CONTRACT.md`](../../docs/marketplace-notebooks/CONTRACT.md)

---

## Updating Jupyter Keys Documentation

### When to Update

Update `JUPYTER_KEYS_LIBRARY.md` when:
- New Jupyter Keys are referenced by runbooks
- Jupyter Keys taxonomy changes
- Usage instructions change
- Marketplace integration changes

### How to Update

1. Edit `JUPYTER_KEYS_LIBRARY.md`
2. Add new keys to the "Jupyter Keys Referenced in KEYS Repository" section
3. Update version history
4. Ensure all references point to correct notebook repository paths

---

## References

### Related Documentation

- **Foundation**: [`/docs/foundation/JUPYTER_KEYS.md`](../../docs/foundation/JUPYTER_KEYS.md) - Core Jupyter Keys philosophy
- **Runbook Alignment**: [`/docs/runbook-keys/JUPYTER_ALIGNMENT.md`](../../docs/runbook-keys/JUPYTER_ALIGNMENT.md) - How runbooks reference Jupyter Keys
- **Marketplace Contract**: [`/docs/marketplace-notebooks/CONTRACT.md`](../../docs/marketplace-notebooks/CONTRACT.md) - Technical integration contract
- **Cross-Key Audit**: [`/docs/runbook-keys/CROSS_KEY_AUDIT.md`](../../docs/runbook-keys/CROSS_KEY_AUDIT.md) - Consistency verification

### Notebook Repository

**Note**: Actual `.ipynb` notebook files are maintained in a separate notebook repository. This workspace only contains documentation and references for Jupyter Keys within the KEYS repository.

---

## Version History

- **1.0.0** (2025-01-XX): Initial consolidation of Jupyter Keys documentation
