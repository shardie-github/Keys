# Asset Tools

**Purpose**: Validation and indexing tools for assets

---

## Tools

### `validate_assets.ts`

Validates all assets against JSON schemas and checks for required files.

**Usage**:
```bash
# Validate all assets
tsx tools/validate_assets.ts

# Validate specific type
tsx tools/validate_assets.ts --type=runbooks
tsx tools/validate_assets.ts --type=node-keys
tsx tools/validate_assets.ts --type=library
```

**What it validates**:
- JSON schema compliance (pack.json, key.json, library.json)
- Slug matches folder name
- Required files exist (README.md, checklist.md, CHANGELOG.md, LICENSE.txt, etc.)
- Documentation file references are valid
- Source directories exist (for node keys)

**Exit codes**:
- `0`: All assets valid
- `1`: One or more assets invalid

---

### `build_assets_index.ts`

Scans assets and generates index files for distribution.

**Usage**:
```bash
tsx tools/build_assets_index.ts
```

**Outputs**:
- `/keys-assets/dist/assets-index.json` - Complete index of all assets
- `/keys-assets/dist/packs/` - Prepared pack files (placeholder for now)

**Index structure**:
```json
{
  "version": "1.0.0",
  "generated_at": "2025-01-XXT00:00:00Z",
  "runbooks": [...],
  "node_keys": [...]
}
```

---

## Dependencies

These tools require:
- `tsx` - TypeScript execution
- `ajv` - JSON schema validation
- `ajv-formats` - Additional format validators

Install:
```bash
npm install --save-dev tsx ajv ajv-formats
```

---

## Integration

### NPM Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "validate:assets": "tsx keys-assets/tools/validate_assets.ts",
    "build:assets-index": "tsx keys-assets/tools/build_assets_index.ts"
  }
}
```

### CI/CD

Run validation in CI:
```yaml
- name: Validate assets
  run: npm run validate:assets
```

Build index before deployment:
```yaml
- name: Build assets index
  run: npm run build:assets-index
```

---

## Development

### Adding New Validation Rules

Edit `validate_assets.ts` to add custom validation logic:

```typescript
// Example: Check for required environment variables
if (keyData.required_env && keyData.required_env.length === 0) {
  result.warnings.push('No required environment variables specified');
}
```

### Extending Index Builder

Edit `build_assets_index.ts` to add additional metadata or generate different index formats.

---

## Notes

- Tools use TypeScript for type safety
- Schemas are loaded from `/keys-assets/schemas/`
- Validation errors are printed to stdout
- Index generation is idempotent (safe to run multiple times)
