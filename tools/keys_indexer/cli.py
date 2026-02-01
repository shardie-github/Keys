"""Command line interface for Keys Indexer."""

import argparse
import logging
import sys
from pathlib import Path

from .indexer import KeysIndexer
from .models import ArtifactType


def setup_logging(verbose: bool = False):
    """Setup logging configuration."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Keys Knowledge Indexer - Index and validate knowledge artifacts",
        prog="keys-indexer",
    )
    
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path.cwd(),
        help="Root directory of the repository to index (default: current directory)",
    )
    
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Directory to write output files (default: <repo-root>/outputs/keys_index)",
    )
    
    parser.add_argument(
        "--index",
        action="store_true",
        help="Index all knowledge artifacts",
    )
    
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Validate artifacts after indexing",
    )
    
    parser.add_argument(
        "--query",
        type=str,
        help="Query artifacts by type (notebook, runbook, script, template)",
    )
    
    parser.add_argument(
        "--runnable-only",
        action="store_true",
        help="Only show runnable artifacts (used with --query)",
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )
    
    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 0.1.0",
    )
    
    args = parser.parse_args()
    setup_logging(args.verbose)
    
    indexer = KeysIndexer(
        repo_root=args.repo_root,
        output_dir=args.output_dir,
    )
    
    if args.index or (not args.query):
        # Default action: index everything
        artifacts = indexer.index(validate=args.validate)
        output_path = indexer.save_index()
        print(f"Indexed {len(artifacts)} artifacts")
        print(f"Index saved to: {output_path}")
        
        if args.validate:
            results = indexer.validate()
            print(f"\nValidation Results:")
            print(f"  Runnable: {results['runnable']}")
            print(f"  Partial: {results['partial']}")
            print(f"  Broken: {results['broken']}")
            if results["issues"]:
                print(f"\n  Issues found: {len(results['issues'])}")
    
    if args.query:
        # Load existing index and query
        indexer.load_index()
        artifact_type = ArtifactType(args.query) if args.query else None
        results = indexer.query(
            artifact_type=artifact_type,
            runnable_only=args.runnable_only,
        )
        print(f"\nQuery Results ({len(results)} artifacts):")
        for artifact in results:
            status = artifact.runnable_status.value
            print(f"  [{status}] {artifact.id}: {artifact.title}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
