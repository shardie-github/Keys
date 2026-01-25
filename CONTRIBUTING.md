# Contributing to Keys

Thanks for helping improve the Keys library. This guide covers how to add artifacts and validate metadata.

## Add a new artifact
1. Add the artifact content to `docs/library/`.
2. Create a matching metadata file `<slug>.metadata.json` in the same directory.
3. Validate and generate the static index:

```bash
pnpm keys:index
```

## Metadata requirements
- Metadata must follow the schema in `tools/keys-indexer/schemas/artifact_metadata.schema.json`.
- The metadata file is the **single source of truth**. Do not add frontmatter to Markdown artifacts.
- `content_path` must point to the artifact content file.

For details, see [`docs/METADATA_SPEC.md`](docs/METADATA_SPEC.md).

## Validation workflow
- `pnpm keys:index` validates metadata and writes:
  - `frontend/public/keys-index.json`
  - `frontend/public/validation_report.json`
  - `frontend/public/artifacts_manifest.json`
- CI runs strict validation (fails on errors).

## Quickstart
If you are starting fresh, follow [`docs/INDEXER_QUICKSTART.md`](docs/INDEXER_QUICKSTART.md).
