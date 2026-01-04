# Node/Next Keys Workspace

**Purpose**: Node.js and Next.js runtime keys for application integration

---

## What Is Here

This workspace contains Node.js and Next.js runtime keys. Each key unlocks a specific capability (UI component, API route, background job, data handler, etc.) that can be integrated into user applications.

**Keys**:
- `audit-log-capture` - Audit log dashboard widget
- `background-reconciliation` - Background data reconciliation handlers
- `safe-cron-execution` - Safe cron job execution patterns
- `stripe-webhook-entitlement` - Stripe webhook entitlement handling
- `supabase-rls-guard` - Supabase RLS policy guard

---

## What Is NOT Here

- **Runbook keys** - See `/keys-assets/runbook-keys/`
- **Jupyter notebooks** - Actual notebooks are in separate repository
- **Keys app code** - Lives in `/backend/` and `/frontend/`
- **General documentation** - Lives in `/docs/`

---

## Key Structure

Each key follows this structure:

```
<key-slug>/
├── README.md          # Key documentation
├── quickstart.md      # Quick start guide
├── key.json           # Metadata (slug, title, version, dependencies)
├── src/               # Source code
│   ├── index.ts       # Main export
│   ├── components/    # React components (if UI key)
│   ├── handlers/      # Request handlers (if route/job key)
│   └── types.ts       # TypeScript types
├── tests/             # Tests (optional)
│   └── unit.test.ts
├── CHANGELOG.md       # Version history
└── LICENSE.txt        # License file
```

### Required Files

- **`README.md`** - Key documentation (what it unlocks, installation, usage, removal)
- **`quickstart.md`** - Quick start guide
- **`key.json`** - Metadata schema (validated against `/keys-assets/schemas/key.schema.json`)
- **`src/`** - Source code directory (must exist)
- **`CHANGELOG.md`** - Version history
- **`LICENSE.txt`** - License file

---

## How to Validate

### Validate All Node/Next Keys

```bash
tsx ../tools/validate_assets.ts --type=node-keys
```

### Validate Specific Key

Check manually:
1. `key.json` exists and is valid JSON
2. Slug in `key.json` matches folder name
3. Required files exist (README.md, quickstart.md, CHANGELOG.md, LICENSE.txt)
4. `src/` directory exists
5. Documentation references in `key.json` point to existing files

---

## How Keys Are Published/Consumed

### Publishing

1. **Source**: Keys live here in `/keys-assets/node-next-keys/`
2. **Validation**: Must pass schema validation
3. **Indexing**: Included in assets index (`/keys-assets/dist/assets-index.json`)

### Consumption

1. **Marketplace**: Keys listed in Keys marketplace
2. **Stripe Gating**: Downloads gated by Stripe entitlements
3. **Integration**: Users download and integrate into their projects
4. **Ownership**: Source code is user-owned after download

### Integration Pattern

Users integrate keys by:
1. Copying key directory to their project
2. Installing dependencies (from `key.json`)
3. Importing and using exported functions/components
4. Configuring environment variables (from `key.json`)

---

## Key Metadata Schema

See `/keys-assets/schemas/key.schema.json` for full schema.

**Key Fields**:
- `slug` - URL-safe identifier (must match folder name)
- `title` - Display name
- `description` - What the key unlocks
- `tool` - `"node"` or `"next"`
- `key_type` - Array of types: `["route"]`, `["job"]`, `["data"]`, `["ui"]`, `["integration"]`
- `runtime` - `"node"` or `"next"`
- `required_env` - Array of required environment variable names
- `optional_env` - Array of optional environment variable names
- `dependencies` - Array of NPM dependencies
- `compatibility` - Runtime version requirements
- `outcome` - Outcome category (e.g., `"compliance"`, `"automation"`)
- `maturity` - `"starter"`, `"operator"`, `"scale"`, or `"enterprise"`

---

## Adding a New Key

1. **Create Folder**: `/keys-assets/node-next-keys/<slug>/`
2. **Create Files**: README.md, quickstart.md, key.json, CHANGELOG.md, LICENSE.txt
3. **Create Source**: Add `src/` directory with code
4. **Write Documentation**: Document what it unlocks, installation, usage, removal
5. **Validate**: Run validation tool
6. **Test**: Add tests if applicable

---

## Key Types

### UI Keys (`key_type: ["ui"]`)

Unlock React components for Next.js applications.

**Example**: `audit-log-capture` - Provides `<AuditLogWidget />` component

### Route Keys (`key_type: ["route"]`)

Unlock API route handlers for Next.js applications.

**Example**: API endpoint handlers

### Job Keys (`key_type: ["job"]`)

Unlock background job handlers.

**Example**: `safe-cron-execution` - Provides cron job execution patterns

### Data Keys (`key_type: ["data"]`)

Unlock data handling utilities.

**Example**: Database query helpers

### Integration Keys (`key_type: ["integration"]`)

Unlock third-party service integrations.

**Example**: `stripe-webhook-entitlement` - Stripe webhook handling

---

## Related Documentation

- **Key Structure**: [`/docs/node-keys/KEY_STRUCTURE.md`](../../docs/node-keys/KEY_STRUCTURE.md)
- **Metadata Schema**: [`/docs/node-keys/METADATA_SCHEMA.md`](../../docs/node-keys/METADATA_SCHEMA.md)
- **Integration Contract**: [`/docs/node-keys/INTEGRATION_CONTRACT.md`](../../docs/node-keys/INTEGRATION_CONTRACT.md)
- **Cohesion**: [`/docs/node-keys/COHESION.md`](../../docs/node-keys/COHESION.md)

---

## Version History

- **1.0.0** (2025-01-XX): Initial node-next-keys workspace structure
