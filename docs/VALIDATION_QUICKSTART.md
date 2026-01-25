# Validation Quickstart

## Run locally

```bash
pnpm keys:validate
```

By default this writes a deterministic validation report to:

```
frontend/public/validation_report.json
```

## Strict mode (CI)

```bash
pnpm keys:validate --strict
```

Strict mode exits non-zero if any errors are present.

## Options

- `--artifacts-dir` (default: `docs/library`)
- `--schema` (default: `contracts/artifact_metadata.schema.json`)
- `--format` (`json` or `text`)
- `--output` (write report to a file)

## Troubleshooting

- If schema validation fails, open `contracts/artifact_metadata.schema.json` to confirm required fields and limits.
- If `content_path` errors appear, verify the referenced content file exists inside the repo.
