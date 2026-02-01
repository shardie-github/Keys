#!/usr/bin/env python3
"""Test repro pack generation."""

import sys
sys.path.insert(0, "tools")

from pathlib import Path
from keys_indexer.indexer import KeysIndexer
from keys_indexer.repro_generator import ReproPackGenerator

# Index only notebooks for testing
indexer = KeysIndexer(
    repo_root=Path("."),
    patterns={
        "notebook": ["keys-assets/**/*.ipynb"],
        "runbook": [],
        "script": [],
        "template": [],
    }
)

artifacts = indexer.index(validate=True)
print(f"Indexed {len(artifacts)} artifacts")

# Generate repro packs
generator = ReproPackGenerator(repo_root=Path("."))
packs = generator.generate_all(artifacts, runnable_only=False)

print(f"\nGenerated {len(packs)} reproduction packs:")
for artifact_id, pack_path in packs.items():
    print(f"  {artifact_id}")
    print(f"    -> {pack_path}")
    
    # Show manifest
    import json
    manifest_path = pack_path.parent / f"{artifact_id}_repro" / "manifest.json"
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)
        print(f"    Title: {manifest['title']}")
        print(f"    Type: {manifest['type']}")
        print()
