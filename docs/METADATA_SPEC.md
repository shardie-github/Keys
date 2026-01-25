# Keys Artifact Metadata Specification

## Overview
Artifacts in the Keys library are described by a strict, versioned JSON metadata file stored alongside the artifact content. Metadata is the single source of truth for library listings and search. Do not duplicate this information in Markdown frontmatter.

## File naming
Place a metadata file next to the artifact content using the naming pattern:

```
<artifact-slug>.metadata.json
```

Example:

```
docs/library/incident-runbook-triage.metadata.json
```

## Schema
Metadata must conform to `tools/keys-indexer/schemas/artifact_metadata.schema.json`.

### Required fields
| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable ID in lowercase kebab-case or underscores. |
| `title` | string | Human-readable title. |
| `description` | string | Short summary. |
| `tags` | string[] | Lowercase tags. |
| `categories` | string[] | Lowercase categories. |
| `tools_supported` | string[] | Lowercase tool identifiers (e.g., `codex`, `claude-code`, `cursor`). |
| `schema_version` | string | Must be `1.0.0`. |
| `content_path` | string | Relative path to the artifact content (Markdown, notebook, etc.). |

### Optional fields
| Field | Type | Notes |
| --- | --- | --- |
| `created_at` | string (RFC3339) | Optional creation timestamp. |
| `updated_at` | string (RFC3339) | Optional update timestamp. |
| `license` | string | Optional per-artifact license. |
| `safety_notes` | string | Optional safety guidance shown in the UI. |

## Example

```json
{
  "id": "incident-runbook-triage",
  "title": "Incident Triage Runbook",
  "description": "A structured triage flow for production incidents.",
  "tags": ["incident", "operations", "reliability"],
  "categories": ["runbook", "incident-response"],
  "tools_supported": ["codex", "claude-code", "cursor"],
  "updated_at": "2024-05-12T00:00:00Z",
  "schema_version": "1.0.0",
  "content_path": "docs/library/incident-runbook-triage.md"
}
```

## Validation rules
- Schema validation uses `tools/keys-indexer/schemas/artifact_metadata.schema.json`.
- IDs must be unique across the library.
- `content_path` must resolve to a file inside the repo.
- `tags`, `categories`, and `tools_supported` are normalized to lowercase; duplicates are removed.

## One source of truth
Metadata must not be duplicated in Markdown frontmatter. If metadata changes, update only the `.metadata.json` file.
