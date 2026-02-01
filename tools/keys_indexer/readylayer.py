"""ReadyLayer integration for CI/CD readiness checks."""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from .models import ArtifactType, KnowledgeArtifact, RunnableStatus

logger = logging.getLogger(__name__)


class ReadyLayerAdapter:
    """Convert Keys index to ReadyLayer readiness format."""
    
    def __init__(self, repo_root: Path):
        self.repo_root = repo_root
    
    def convert(
        self,
        artifacts: list[KnowledgeArtifact],
        fail_on_broken: bool = True,
    ) -> dict[str, Any]:
        """Convert artifacts to ReadyLayer readiness report."""
        
        readiness = {
            "schema_version": "1.0.0",
            "generated_at": datetime.now().isoformat(),
            "repository": str(self.repo_root),
            "overall_status": "ready",
            "categories": {},
            "artifacts": [],
            "recommendations": [],
        }
        
        # Group by type
        by_type: dict[ArtifactType, list[KnowledgeArtifact]] = {}
        for artifact in artifacts:
            if artifact.type not in by_type:
                by_type[artifact.type] = []
            by_type[artifact.type].append(artifact)
        
        # Calculate readiness per category
        for artifact_type, type_artifacts in by_type.items():
            total = len(type_artifacts)
            runnable = sum(1 for a in type_artifacts if a.runnable_status == RunnableStatus.RUNNABLE)
            partial = sum(1 for a in type_artifacts if a.runnable_status == RunnableStatus.PARTIAL)
            broken = sum(1 for a in type_artifacts if a.runnable_status == RunnableStatus.BROKEN)
            
            # Calculate readiness score
            if total == 0:
                score = 100.0
            else:
                score = ((runnable + (partial * 0.5)) / total) * 100
            
            category_status = "ready"
            if broken > 0:
                category_status = "degraded"
            if broken > (total * 0.2):  # >20% broken
                category_status = "critical"
                readiness["overall_status"] = "not_ready"
            
            readiness["categories"][artifact_type.value] = {
                "total": total,
                "runnable": runnable,
                "partial": partial,
                "broken": broken,
                "readiness_score": round(score, 2),
                "status": category_status,
            }
        
        # Convert individual artifacts
        for artifact in artifacts:
            artifact_ready = self._convert_artifact(artifact)
            readiness["artifacts"].append(artifact_ready)
            
            # Generate recommendations for non-runnable artifacts
            if artifact.runnable_status == RunnableStatus.BROKEN:
                readiness["recommendations"].append({
                    "severity": "critical",
                    "artifact_id": artifact.id,
                    "message": f"Critical knowledge asset '{artifact.title}' is broken and needs immediate attention",
                    "action": "Review and fix the artifact",
                })
            elif artifact.runnable_status == RunnableStatus.PARTIAL:
                readiness["recommendations"].append({
                    "severity": "warning",
                    "artifact_id": artifact.id,
                    "message": f"Knowledge asset '{artifact.title}' has issues that may affect reproducibility",
                    "action": "Review validation warnings",
                })
        
        # Final status check
        if fail_on_broken and any(
            a["status"] == "critical" for a in readiness["categories"].values()
        ):
            readiness["overall_status"] = "not_ready"
        
        return readiness
    
    def _convert_artifact(self, artifact: KnowledgeArtifact) -> dict[str, Any]:
        """Convert single artifact to ReadyLayer format."""
        status_map = {
            RunnableStatus.RUNNABLE: "ready",
            RunnableStatus.PARTIAL: "degraded",
            RunnableStatus.BROKEN: "critical",
            RunnableStatus.UNKNOWN: "unknown",
        }
        
        return {
            "id": artifact.id,
            "path": str(artifact.path),
            "type": artifact.type.value,
            "title": artifact.title,
            "language": artifact.language,
            "status": status_map.get(artifact.runnable_status, "unknown"),
            "last_verified": artifact.last_verified.isoformat() if artifact.last_verified else None,
            "dependencies_declared": len(artifact.dependencies) > 0,
            "has_repro_pack": True,  # Would check if pack exists
            "tags": artifact.tags,
        }
    
    def save(self, readiness: dict[str, Any], output_path: Path | None = None) -> Path:
        """Save readiness report to file."""
        if output_path is None:
            output_path = self.repo_root / "outputs" / "keys_index" / "readiness.json"
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, "w") as f:
            json.dump(readiness, f, indent=2)
        
        logger.info(f"Readiness report saved to {output_path}")
        return output_path
    
    def check_critical(self, readiness: dict[str, Any]) -> tuple[bool, list[str]]:
        """Check if critical knowledge assets are reproducible."""
        is_ready = readiness["overall_status"] == "ready"
        failures = []
        
        for category, data in readiness["categories"].items():
            if data["status"] == "critical":
                failures.append(
                    f"Category '{category}' has {data['broken']} broken artifacts "
                    f"({data['broken'] / data['total'] * 100:.1f}%)"
                )
        
        for artifact in readiness["artifacts"]:
            if artifact["status"] == "critical":
                failures.append(
                    f"Critical artifact broken: {artifact['id']} ({artifact['title']})"
                )
        
        return is_ready, failures
