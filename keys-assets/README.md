# Keys Assets Workspace

**Purpose**: Centralized workspace for all KEYS assets (runbooks, node/next keys, and Jupyter content)

---

## What Is Here

This workspace contains:

- **`/runbook-keys/`** - Operational runbook packs for incident response and recovery
- **`/node-next-keys/`** - Node.js and Next.js runtime keys for application integration
- **`/jupyter-keys-md/`** - Consolidated Jupyter Keys documentation and references
- **`/schemas/`** - JSON schemas for validating asset metadata
- **`/tools/`** - Validation and indexing tools
- **`/dist/`** - Generated distribution files (indexes, compiled packs)

---

## What Is NOT Here

- **Keys app source code** - Lives in `/backend/` and `/frontend/`
- **Actual Jupyter notebooks** - `.ipynb` files are maintained in a separate notebook repository
- **Marketplace backend** - Lives in `/backend/src/marketplace/`
- **Documentation** - Main docs live in `/docs/`

---

## Workspace Structure

```
keys-assets/
├── runbook-keys/          # Operational runbooks
│   └── <runbook-slug>/
│       ├── README.md      # The runbook itself
│       ├── checklist.md
│       ├── pack.json
│       ├── CHANGELOG.md
│       └── LICENSE.txt
│
├── node-next-keys/        # Node/Next runtime keys
│   └── <key-slug>/
│       ├── README.md
│       ├── quickstart.md
│       ├── key.json
│       ├── src/           # Source code
│       ├── tests/         # Tests (optional)
│       ├── CHANGELOG.md
│       └── LICENSE.txt
│
├── jupyter-keys-md/       # Jupyter content (markdown only)
│   ├── README.md
│   ├── JUPYTER_KEYS_LIBRARY.md
│   └── references/        # Supporting images/diagrams
│
├── schemas/               # JSON schemas
│   ├── pack.schema.json
│   ├── key.schema.json
│   └── library.schema.json
│
├── tools/                 # Validation and indexing
│   ├── validate_assets.ts
│   └── build_assets_index.ts
│
└── dist/                  # Generated files (gitignored)
    ├── assets-index.json
    └── packs/
```

---

## How to Validate

### Validate All Assets

```bash
# Using npm script (if configured)
npm run validate:assets

# Or directly
tsx keys-assets/tools/validate_assets.ts
```

### Validate Specific Asset Type

```bash
tsx keys-assets/tools/validate_assets.ts --type=runbooks
tsx keys-assets/tools/validate_assets.ts --type=node-keys
tsx keys-assets/tools/validate_assets.ts --type=library
```

### What Gets Validated

- JSON schema compliance
- Slug matches folder name
- Required files exist
- Documentation references are valid
- No dangling references

---

## How Assets Are Published/Consumed

### Runbook Keys

1. **Source**: `/keys-assets/runbook-keys/<slug>/`
2. **Validation**: Must pass schema validation
3. **Consumption**: 
   - Referenced by Keys app marketplace
   - Served via Stripe-gated downloads
   - Used by operators for incident response

### Node/Next Keys

1. **Source**: `/keys-assets/node-next-keys/<slug>/`
2. **Validation**: Must pass schema validation
3. **Consumption**:
   - Referenced by Keys app marketplace
   - Users download and integrate into their Next.js/Node.js projects
   - Source code is user-owned after download

### Jupyter Keys

1. **Source**: Separate notebook repository (not in KEYS repo)
2. **Documentation**: Consolidated in `/keys-assets/jupyter-keys-md/JUPYTER_KEYS_LIBRARY.md`
3. **Consumption**:
   - Referenced by runbooks and documentation
   - Actual notebooks served via marketplace
   - Users download `.ipynb` files

---

## Building Indexes

Generate distribution indexes:

```bash
tsx keys-assets/tools/build_assets_index.ts
```

This creates:
- `/keys-assets/dist/assets-index.json` - Complete index
- `/keys-assets/dist/packs/` - Prepared pack files

---

## Boundaries

### Do NOT

- ❌ Make Keys app code depend on asset source folders directly
- ❌ Store actual Jupyter notebooks here (they're in separate repo)
- ❌ Modify assets without updating schemas if structure changes
- ❌ Break slug/folder name consistency

### DO

- ✅ Keep assets in their designated workspaces
- ✅ Validate before committing changes
- ✅ Update schemas when adding new fields
- ✅ Maintain clear separation from app code

---

## Related Documentation

- **Asset Separation**: [`/docs/assets-separation/README.md`](../docs/assets-separation/README.md)
- **Runbook Documentation**: [`/docs/runbook-keys/`](../docs/runbook-keys/)
- **Node Keys Documentation**: [`/docs/node-keys/`](../docs/node-keys/)
- **Jupyter Keys Library**: [`/keys-assets/jupyter-keys-md/JUPYTER_KEYS_LIBRARY.md`](./jupyter-keys-md/JUPYTER_KEYS_LIBRARY.md)

---

## Version History

- **1.0.0** (2025-01-XX): Initial workspace structure created
