"""Example: Using the Keys Knowledge Indexer programmatically."""

import sys
from pathlib import Path

# Add tools directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "tools"))

from keys_indexer import (
    KeysIndexer,
    ArtifactType,
    ReproPackGenerator,
    ArtifactValidator,
    ReadyLayerAdapter,
)

def main():
    repo_root = Path(".")
    
    print("=" * 60)
    print("Keys Knowledge Indexer - Example Usage")
    print("=" * 60)
    
    # Step 1: Index knowledge artifacts
    print("\n1. Indexing knowledge artifacts...")
    indexer = KeysIndexer(repo_root=repo_root)
    
    # Index only notebooks and runbooks for demo
    artifacts = indexer.index(validate=False)
    print(f"   Indexed {len(artifacts)} artifacts")
    
    # Show breakdown by type
    by_type = {}
    for a in artifacts:
        t = a.type.value
        by_type[t] = by_type.get(t, 0) + 1
    print(f"   Breakdown: {by_type}")
    
    # Step 2: Query artifacts
    print("\n2. Querying for notebooks...")
    notebooks = indexer.query(artifact_type=ArtifactType.NOTEBOOK)
    print(f"   Found {len(notebooks)} notebooks:")
    for nb in notebooks:
        print(f"     - {nb.title} ({nb.language})")
    
    # Step 3: Validate
    print("\n3. Validating artifacts...")
    validator = ArtifactValidator(repo_root=repo_root, dry_run=True)
    results = validator.validate_all(artifacts[:5])  # First 5 for demo
    
    for artifact_id, result in results.items():
        print(f"   {artifact_id}: {result.status.value}")
    
    # Step 4: Generate repro packs for notebooks
    print("\n4. Generating reproduction packs...")
    generator = ReproPackGenerator(repo_root=repo_root)
    
    packs = {}
    for nb in notebooks:
        pack_path = generator.generate(nb, dry_run=False)
        if pack_path:
            packs[nb.id] = pack_path
            print(f"   Generated: {pack_path.name}")
    
    # Step 5: ReadyLayer readiness report
    print("\n5. Generating ReadyLayer readiness report...")
    adapter = ReadyLayerAdapter(repo_root=repo_root)
    readiness = adapter.convert(artifacts[:10], fail_on_broken=False)
    
    print(f"   Overall Status: {readiness['overall_status']}")
    for category, data in readiness['categories'].items():
        print(f"   {category}: {data['readiness_score']}% ready")
    
    # Save all outputs
    print("\n6. Saving outputs...")
    indexer.save_index()
    validator.save_report()
    adapter.save(readiness)
    
    print("\n" + "=" * 60)
    print("Complete! Check outputs/keys_index/ for results.")
    print("=" * 60)

if __name__ == "__main__":
    main()
