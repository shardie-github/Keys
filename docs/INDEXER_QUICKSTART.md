# Keys Indexer Quickstart

## Requirements
- Go 1.22+
- Node 20+

## Generate the index
From the repo root:

```bash
pnpm keys:index
```

Outputs:
- `frontend/public/keys-index.json`
- `frontend/public/validation_report.json`
- `frontend/public/artifacts_manifest.json`

## Strict validation (CI)

```bash
KEYS_INDEX_STRICT=1 pnpm keys:index
```

## Troubleshooting
- If `keys-index.json` is missing, the library page shows a warning with the command to regenerate it.
- If validation fails in strict mode, open `frontend/public/validation_report.json` to review errors.
