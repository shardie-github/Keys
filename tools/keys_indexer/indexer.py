"""Main indexer for knowledge artifacts."""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from .extractors import ArtifactExtractor
from .models import ArtifactType, Dependency, KnowledgeArtifact, RunnableStatus

logger = logging.getLogger(__name__)


class KeysIndexer:
    """Index knowledge artifacts in the repository."""
    
    DEFAULT_PATTERNS = {
        ArtifactType.NOTEBOOK: ["**/*.ipynb"],
        ArtifactType.RUNBOOK: ["**/README.md", "**/*runbook*.md"],
        ArtifactType.SCRIPT: ["**/*.py"],
        ArtifactType.TEMPLATE: ["**/*.ts", "**/*.js", "**/*.json", "**/*.yaml", "**/*.yml"],
    }
    
    def __init__(
        self,
        repo_root: Path | str,
        output_dir: Path | str | None = None,
        patterns: dict[ArtifactType, list[str]] | None = None,
    ):
        self.repo_root = Path(repo_root)
        self.output_dir = Path(output_dir) if output_dir else self.repo_root / "outputs" / "keys_index"
        self.patterns = patterns or self.DEFAULT_PATTERNS
        self.extractor = ArtifactExtractor(self.repo_root)
        self.artifacts: list[KnowledgeArtifact] = []
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def index(self, validate: bool = False) -> list[KnowledgeArtifact]:
        """Index all knowledge artifacts in the repository."""
        logger.info(f"Starting indexing of {self.repo_root}")
        
        self.artifacts = []
        
        for artifact_type, patterns in self.patterns.items():
            for pattern in patterns:
                paths = list(self.repo_root.glob(pattern))
                logger.info(f"Found {len(paths)} files matching {pattern}")
                
                for path in paths:
                    # Skip node_modules and other common exclude patterns
                    if any(part.startswith("node_modules") or part.startswith(".") 
                           for part in path.parts):
                        continue
                    
                    artifact = self.extractor.extract(path)
                    if artifact:
                        # Load declared dependencies if available
                        self._enrich_dependencies(artifact)
                        self.artifacts.append(artifact)
                        logger.debug(f"Indexed: {artifact.id} ({artifact.title})")
        
        logger.info(f"Indexed {len(self.artifacts)} artifacts")
        
        if validate:
            self.validate()
        
        return self.artifacts
    
    def _enrich_dependencies(self, artifact: KnowledgeArtifact) -> None:
        """Enrich artifact with declared dependencies from requirements files."""
        # Look for requirements.txt in same directory or scripts/
        search_paths = [
            self.repo_root / "scripts" / "requirements-notebooks.txt",
            artifact.path.parent / "requirements.txt",
            self.repo_root / "requirements.txt",
        ]
        
        declared_deps = {}
        for req_path in search_paths:
            deps = self.extractor.load_declared_dependencies(req_path)
            for dep in deps:
                declared_deps[dep.name.lower()] = dep
        
        # Merge declared dependencies with auto-detected
        merged = []
        for dep in artifact.dependencies:
            key = dep.name.lower()
            if key in declared_deps:
                declared = declared_deps[key]
                merged.append(Dependency(
                    name=dep.name,
                    version=declared.version,
                    source="lockfile" if declared.version else "declared",
                ))
                del declared_deps[key]
            else:
                merged.append(dep)
        
        # Add remaining declared dependencies
        for dep in declared_deps.values():
            merged.append(dep)
        
        artifact.dependencies = merged
    
    def validate(self) -> dict[str, Any]:
        """Validate indexed artifacts for reproducibility."""
        logger.info("Validating artifacts...")
        
        results = {
            "total": len(self.artifacts),
            "runnable": 0,
            "partial": 0,
            "broken": 0,
            "unknown": 0,
            "issues": [],
        }
        
        for artifact in self.artifacts:
            issues = []
            
            # Check for critical fields
            if not artifact.title or artifact.title == "Untitled Notebook":
                issues.append("Missing or generic title")
            
            if not artifact.purpose:
                issues.append("Missing purpose/description")
            
            # Check dependency declaration
            if artifact.type in [ArtifactType.NOTEBOOK, ArtifactType.SCRIPT]:
                if not artifact.dependencies:
                    issues.append("No dependencies declared")
                elif not any(d.source in ["declared", "lockfile"] for d in artifact.dependencies):
                    issues.append("Only auto-detected dependencies, no lockfile")
            
            # Check for inputs/outputs
            if artifact.type == ArtifactType.SCRIPT:
                if not artifact.inputs:
                    issues.append("Script has no declared inputs")
                if not artifact.outputs:
                    issues.append("Script has no declared outputs")
            
            # Determine runnable status
            if not issues:
                artifact.runnable_status = RunnableStatus.RUNNABLE
                results["runnable"] += 1
            elif any("broken" in i.lower() or "critical" in i.lower() for i in issues):
                artifact.runnable_status = RunnableStatus.BROKEN
                results["broken"] += 1
            elif len(issues) <= 2:
                artifact.runnable_status = RunnableStatus.PARTIAL
                results["partial"] += 1
            else:
                results["unknown"] += 1
            
            if issues:
                results["issues"].append({
                    "artifact_id": artifact.id,
                    "issues": issues,
                })
        
        logger.info(f"Validation complete: {results['runnable']} runnable, "
                   f"{results['partial']} partial, {results['broken']} broken")
        
        return results
    
    def save_index(self, filename: str = "kb_index.json") -> Path:
        """Save the index to JSON file."""
        output_path = self.output_dir / filename
        
        index_data = {
            "generated_at": datetime.now().isoformat(),
            "repo_root": str(self.repo_root),
            "total_artifacts": len(self.artifacts),
            "artifact_types": {},
            "artifacts": [a.to_dict() for a in self.artifacts],
        }
        
        # Count by type
        for artifact in self.artifacts:
            t = artifact.type.value
            if t not in index_data["artifact_types"]:
                index_data["artifact_types"][t] = 0
            index_data["artifact_types"][t] += 1
        
        with open(output_path, "w") as f:
            json.dump(index_data, f, indent=2)
        
        logger.info(f"Index saved to {output_path}")
        return output_path
    
    def load_index(self, filename: str = "kb_index.json") -> list[KnowledgeArtifact]:
        """Load index from JSON file."""
        input_path = self.output_dir / filename
        
        if not input_path.exists():
            logger.warning(f"Index file not found: {input_path}")
            return []
        
        with open(input_path, "r") as f:
            data = json.load(f)
        
        self.artifacts = [KnowledgeArtifact.from_dict(a) for a in data["artifacts"]]
        logger.info(f"Loaded {len(self.artifacts)} artifacts from {input_path}")
        return self.artifacts
    
    def get_artifact(self, artifact_id: str) -> KnowledgeArtifact | None:
        """Get a specific artifact by ID."""
        for artifact in self.artifacts:
            if artifact.id == artifact_id:
                return artifact
        return None
    
    def query(
        self,
        artifact_type: ArtifactType | None = None,
        language: str | None = None,
        tags: list[str] | None = None,
        runnable_only: bool = False,
    ) -> list[KnowledgeArtifact]:
        """Query artifacts by criteria."""
        results = self.artifacts
        
        if artifact_type:
            results = [a for a in results if a.type == artifact_type]
        
        if language:
            results = [a for a in results if a.language == language]
        
        if tags:
            results = [a for a in results if any(t in a.tags for t in tags)]
        
        if runnable_only:
            results = [a for a in results if a.runnable_status == RunnableStatus.RUNNABLE]
        
        return results
