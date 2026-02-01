# Keys Knowledge Index & Reproduction Engine

A Python-based system for indexing, validating, and making knowledge artifacts reproducible.

## Overview

The Keys Knowledge Engine ensures that notebooks, runbooks, and scripts are:
- **Indexed**: Metadata extracted and searchable
- **Validated**: Syntax-checked and dependency-verified
- **Reproducible**: Packaged with all necessary dependencies
- **Executable**: Runnable with a single command

## Quick Start

### Installation

```bash
# Install dependencies
pip install -r tools/keys_indexer/requirements.txt
pip install nbformat  # Required for notebook processing
```

### Index Knowledge Artifacts

```bash
# Index all artifacts in the repository
python -m tools.keys_indexer.cli --index --validate

# Output:
# Indexed 708 artifacts
# Index saved to: outputs/keys_index/kb_index.json
#
# Validation Results:
#   Runnable: 644
#   Partial: 60
#   Broken: 0
```

### Generate Reproduction Packs

```bash
# Generate repro packs for all runnable artifacts
python -m tools.keys_indexer.cli --validate-only --generate-repro

# Output:
# Generated 644 reproduction packs
#   keys_assets_jupyter_keys_production_pipeline: outputs/repro_packs/...zip
```

### Query the Index

```bash
# Query only notebooks
python -m tools.keys_indexer.cli --query notebook --runnable-only

# Query runbooks
python -m tools.keys_indexer.cli --query runbook
```

## Architecture

```
tools/keys_indexer/
├── __init__.py          # Package exports
├── cli.py               # Command-line interface
├── indexer.py           # Main indexing engine
├── extractors.py        # Metadata extractors
├── models.py            # Data models
├── repro_generator.py   # Reproduction pack generator
├── validator.py         # Validation engine
├── readylayer.py        # CI/CD integration
└── requirements.txt     # Dependencies
```

## Data Model

### KnowledgeArtifact

Each indexed artifact includes:

- **id**: Unique identifier
- **path**: Relative path in repository
- **type**: notebook | runbook | script | template
- **title**: Human-readable title
- **purpose**: Description of what it does
- **language**: Programming language
- **runtime**: Runtime version
- **inputs**: Required inputs
- **outputs**: Produced outputs
- **dependencies**: Declared and auto-detected dependencies
- **runnable_status**: runnable | partial | broken | unknown
- **last_verified**: Timestamp of last validation

### kb_index.json

The generated index contains:

```json
{
  "generated_at": "2026-01-31T19:47:10",
  "repo_root": "/path/to/repo",
  "total_artifacts": 708,
  "artifact_types": {
    "notebook": 3,
    "runbook": 67,
    "script": 12,
    "template": 626
  },
  "artifacts": [...]
}
```

## Reproduction Pack Structure

Each repro pack is a zip file containing:

```
artifact_id_repro/
├── manifest.json        # Pack metadata and checksums
├── run.sh              # Execution script
├── src/                # Source artifact
│   └── notebook.ipynb
├── data/               # Data directory
│   └── README.md
└── deps/               # Dependencies
    ├── lock.json       # Dependency lock
    └── requirements.txt
```

## Validation

### Static Validation (Default - Safe)

```bash
python -m tools.keys_indexer.cli --validate-only --dry-run
```

Checks:
- Syntax correctness
- Import resolvability
- Structure completeness
- Dependency declarations

### Dynamic Validation (Execute Code - USE WITH CAUTION)

```bash
python -m tools.keys_indexer.cli --validate-only --no-dry-run
```

## CI/CD Integration

The included GitHub Actions workflow (`.github/workflows/knowledge-repro.yml`):

1. **Triggers**:
   - On push/PR affecting knowledge assets
   - Weekly scheduled runs
   - Manual dispatch

2. **Jobs**:
   - Index and validate all artifacts
   - Generate reproduction packs
   - Check ReadyLayer readiness
   - Comment on PRs with results

3. **Fail Conditions**:
   - >20% of artifacts in any category are broken
   - Critical knowledge assets fail validation

## Adding New Knowledge

### For Notebooks

1. Create notebook in appropriate `keys-assets/` directory
2. Include clear markdown cells with:
   - Title (first markdown cell with H1)
   - Purpose description
   - Input/output specifications
3. Declare dependencies in `requirements.txt`
4. Run indexer to auto-extract metadata

Example:
```python
# Cell 1: Title
"""
# My Analysis Notebook

This notebook performs customer churn analysis.
"""

# Cell 2: Imports (auto-detected as dependencies)
import pandas as pd
import numpy as np
```

### For Runbooks

1. Create markdown file following the runbook template
2. Include required sections:
   - `## Scope`
   - `## When to Use`
   - `## Action Steps`
   - `## Verification`
   - `## Rollback / Escalation`
3. Use code blocks for executable commands

### For Scripts

1. Create Python script with docstring
2. Use argparse for CLI inputs
3. Declare dependencies in requirements.txt

Example:
```python
"""Data Processing Script

Processes raw CSV files into normalized format.
"""

import argparse
import pandas as pd

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    # ...

if __name__ == "__main__":
    main()
```

## API Usage

### Programmatic Indexing

```python
from pathlib import Path
from tools.keys_indexer import KeysIndexer, ArtifactType

indexer = KeysIndexer(repo_root=Path("."))
artifacts = indexer.index(validate=True)

# Query notebooks
notebooks = indexer.query(
    artifact_type=ArtifactType.NOTEBOOK,
    runnable_only=True
)

# Save index
indexer.save_index()
```

### Generating Repro Packs

```python
from tools.keys_indexer import ReproPackGenerator

generator = ReproPackGenerator(repo_root=Path("."))
packs = generator.generate_all(artifacts, runnable_only=True)

for artifact_id, pack_path in packs.items():
    print(f"Generated: {pack_path}")
```

### Validation

```python
from tools.keys_indexer import ArtifactValidator

validator = ArtifactValidator(
    repo_root=Path("."),
    dry_run=True  # Safe mode
)

results = validator.validate_all(artifacts)
for artifact_id, result in results.items():
    print(f"{artifact_id}: {result.status.value}")
    if result.errors:
        print(f"  Errors: {result.errors}")
```

### ReadyLayer Integration

```python
from tools.keys_indexer import ReadyLayerAdapter

adapter = ReadyLayerAdapter(Path("."))
readiness = adapter.convert(artifacts, fail_on_broken=True)
adapter.save(readiness)

# Check if ready
is_ready, failures = adapter.check_critical(readiness)
if not is_ready:
    print("Critical failures:", failures)
```

## CLI Reference

```
python -m tools.keys_indexer.cli [options]

Options:
  --repo-root PATH        Repository root directory
  --output-dir PATH       Output directory for index
  --index                 Index all artifacts
  --validate              Validate after indexing
  --validate-only         Only validate existing index
  --dry-run               Dry-run validation (default: True)
  --no-dry-run            Actually execute code
  --generate-repro        Generate reproduction packs
  --repro-dir PATH        Directory for repro packs
  --query TYPE            Query by type (notebook, runbook, script, template)
  --runnable-only         Only show runnable artifacts
  --verbose               Enable verbose logging
  --version               Show version
```

## Example kb_index.json

See `outputs/keys_index/kb_index.json` for a full example. Key sections:

```json
{
  "generated_at": "2026-01-31T19:47:10",
  "total_artifacts": 708,
  "artifact_types": {
    "notebook": 3,
    "runbook": 67,
    "script": 12,
    "template": 626
  },
  "artifacts": [
    {
      "id": "keys_assets_jupyter_keys_production_pipeline",
      "path": "keys-assets/jupyter-keys/.../production_pipeline.ipynb",
      "type": "notebook",
      "title": "Production ML Pipeline",
      "purpose": "Demonstrates production ML pipeline patterns...",
      "language": "python",
      "runtime": "3.9.0",
      "dependencies": [
        {"name": "pandas", "version": "2.2.3", "source": "lockfile"},
        {"name": "numpy", "version": "2.1.3", "source": "lockfile"}
      ],
      "runnable_status": "runnable",
      "tags": ["notebook", "python"]
    }
  ]
}
```

## Example Repro Pack

See `outputs/repro_packs/*.zip` for generated packs. Contents:

```bash
$ unzip -l repro_pack.zip
Archive: repro_pack.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
     1037  2026-01-31 19:48   .../manifest.json
     1195  2026-01-31 19:48   .../run.sh
      277  2026-01-31 19:48   .../data/README.md
     1240  2026-01-31 19:48   .../deps/lock.json
      181  2026-01-31 19:48   .../deps/requirements.txt
     3079  2026-01-26 21:02   .../src/production_pipeline.ipynb
```

## Troubleshooting

### Import Errors

If you see `ModuleNotFoundError` for nbformat:
```bash
pip install nbformat
```

### Large Index Files

The index can be large for big repositories. Query with filters:
```bash
python -m tools.keys_indexer.cli --query notebook --runnable-only
```

### Validation Failures

Check the validation report:
```bash
cat outputs/keys_index/validation_report.json | jq '.results[] | select(.status == "broken")'
```

## License

Private - All rights reserved
