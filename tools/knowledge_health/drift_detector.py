"""Knowledge Drift Detection Engine.

Detects various forms of knowledge drift:
- Broken notebooks (execution errors, syntax issues)
- Outdated runbooks (stale procedures, missing steps)
- Deprecated APIs (outdated dependencies, removed features)
- Superseded artifacts (duplicates, better alternatives)
"""

import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional

from .models import (
    CurationAction,
    DependencyStatus,
    DriftAlert,
    DriftType,
    EnvironmentStatus,
    HealthMetrics,
    RelevanceStatus,
    SystemHealthConfig,
)


class DriftDetector:
    """Detects knowledge drift in artifacts."""
    
    # Patterns that indicate deprecated APIs or features
    DEPRECATED_PATTERNS = [
        (r"pandas\.DataFrame\.append", "DataFrame.append is deprecated, use concat"),
        (r"sklearn\.\w+\.\w+\(.*deprecated", "scikit-learn deprecated API usage"),
        (r"@app\.route", "Flask route decorators may indicate outdated patterns"),
        (r"from deprecated import", "Explicit deprecated import detected"),
        (r"warnings\.warn.*deprecated", "Deprecation warning in code"),
    ]
    
    # Patterns that indicate broken code
    ERROR_PATTERNS = [
        (r"Error:|ERROR:|Traceback", "Error pattern detected in output"),
        (r"ModuleNotFoundError", "Missing module dependency"),
        (r"ImportError", "Import failure detected"),
        (r"SyntaxError", "Syntax error in code"),
        (r"NameError", "Undefined variable/reference"),
        (r"TypeError.*NoneType", "None value error (possible missing data)"),
        (r"FileNotFoundError", "Missing required file"),
        (r"ConnectionError|ConnectTimeout", "Network connectivity issue"),
    ]
    
    def __init__(
        self,
        repo_root: Path,
        config: Optional[SystemHealthConfig] = None,
    ):
        self.repo_root = Path(repo_root)
        self.config = config or SystemHealthConfig()
        self._alerts: list[DriftAlert] = []
        self._index_cache: Optional[dict] = None
    
    def _load_index(self) -> Optional[dict]:
        """Load the knowledge index."""
        if self._index_cache is not None:
            return self._index_cache
        
        index_path = self.repo_root / "outputs" / "keys_index" / "kb_index.json"
        if not index_path.exists():
            return None
        
        try:
            with open(index_path, "r", encoding="utf-8") as f:
                self._index_cache = json.load(f)
                return self._index_cache
        except Exception:
            return None
    
    def detect_all_drift(
        self,
        health_metrics: dict[str, HealthMetrics],
    ) -> list[DriftAlert]:
        """Detect all forms of drift for all artifacts."""
        alerts = []
        
        for artifact_id, metrics in health_metrics.items():
            artifact_alerts = self.detect_drift(artifact_id, metrics)
            alerts.extend(artifact_alerts)
        
        # Detect superseded artifacts (requires cross-artifact analysis)
        superseded_alerts = self._detect_superseded_artifacts(health_metrics)
        alerts.extend(superseded_alerts)
        
        return alerts
    
    def detect_drift(
        self,
        artifact_id: str,
        metrics: HealthMetrics,
    ) -> list[DriftAlert]:
        """Detect drift for a single artifact."""
        alerts = []
        
        # Load artifact data
        index = self._load_index()
        artifact = None
        if index:
            for art in index.get("artifacts", []):
                if art.get("id") == artifact_id:
                    artifact = art
                    break
        
        if not artifact:
            return alerts
        
        # Check for broken status
        if artifact.get("runnable_status") == "broken":
            alerts.append(DriftAlert(
                artifact_id=artifact_id,
                drift_type=DriftType.BROKEN_NOTEBOOK,
                severity="critical",
                message="Artifact marked as broken in index",
                detected_at=datetime.now(),
                recommended_action=CurationAction.REFACTOR,
            ))
        
        # Check dependency issues
        if metrics.dependency_health.status in [DependencyStatus.BROKEN, DependencyStatus.STALE]:
            severity = "critical" if metrics.dependency_health.status == DependencyStatus.BROKEN else "warning"
            alerts.append(DriftAlert(
                artifact_id=artifact_id,
                drift_type=DriftType.MISSING_DEPENDENCY,
                severity=severity,
                message=f"Dependency issues: {', '.join(metrics.dependency_health.issues[:3])}",
                detected_at=datetime.now(),
                details={
                    "total_deps": metrics.dependency_health.total_deps,
                    "broken_deps": metrics.dependency_health.broken_deps,
                    "stale_deps": metrics.dependency_health.stale_deps,
                },
                recommended_action=CurationAction.UPDATE,
            ))
        
        # Check environment drift
        if metrics.environment_health.status == EnvironmentStatus.INCOMPATIBLE:
            alerts.append(DriftAlert(
                artifact_id=artifact_id,
                drift_type=DriftType.ENVIRONMENT_DRIFT,
                severity="critical",
                message=f"Environment incompatible: {', '.join(metrics.environment_health.issues[:2])}",
                detected_at=datetime.now(),
                details={
                    "python_version": metrics.environment_health.python_version,
                    "detected_python": metrics.environment_health.detected_python,
                },
                recommended_action=CurationAction.REFACTOR,
            ))
        
        # Check relevance decay
        if metrics.relevance_health.status in [RelevanceStatus.DEPRECATED, RelevanceStatus.SUPERSEDED]:
            alerts.append(DriftAlert(
                artifact_id=artifact_id,
                drift_type=DriftType.CONTENT_STALENESS,
                severity="warning",
                message=f"Artifact is {metrics.relevance_health.status.value}",
                detected_at=datetime.now(),
                details={
                    "days_since_update": metrics.relevance_health.days_since_update,
                    "superseded_by": metrics.relevance_health.superseded_by,
                },
                recommended_action=CurationAction.ARCHIVE if metrics.relevance_health.status == RelevanceStatus.DEPRECATED else CurationAction.REVIEW,
            ))
        
        # Check execution failures
        if metrics.execution_history.failed_runs >= self.config.auto_flag_broken_after_failures:
            alerts.append(DriftAlert(
                artifact_id=artifact_id,
                drift_type=DriftType.BROKEN_NOTEBOOK,
                severity="critical",
                message=f"Multiple execution failures ({metrics.execution_history.failed_runs} failures)",
                detected_at=datetime.now(),
                details={
                    "failed_runs": metrics.execution_history.failed_runs,
                    "successful_runs": metrics.execution_history.successful_runs,
                    "last_error": metrics.execution_history.last_error_message,
                },
                recommended_action=CurationAction.REFACTOR,
            ))
        
        # Check for deprecated APIs in code
        artifact_path = self.repo_root / artifact.get("path", "")
        if artifact_path.exists():
            api_alerts = self._scan_for_deprecated_apis(artifact_id, artifact_path)
            alerts.extend(api_alerts)
        
        # Check runbook staleness
        if artifact.get("type") == "runbook":
            runbook_alert = self._check_runbook_staleness(artifact_id, artifact)
            if runbook_alert:
                alerts.append(runbook_alert)
        
        return alerts
    
    def _scan_for_deprecated_apis(
        self,
        artifact_id: str,
        artifact_path: Path,
    ) -> list[DriftAlert]:
        """Scan artifact content for deprecated API usage."""
        alerts = []
        
        try:
            with open(artifact_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            return alerts
        
        for pattern, message in self.DEPRECATED_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                alerts.append(DriftAlert(
                    artifact_id=artifact_id,
                    drift_type=DriftType.DEPRECATED_API,
                    severity="warning",
                    message=message,
                    detected_at=datetime.now(),
                    details={"pattern": pattern},
                    recommended_action=CurationAction.UPDATE,
                ))
        
        return alerts
    
    def _check_runbook_staleness(
        self,
        artifact_id: str,
        artifact: dict,
    ) -> Optional[DriftAlert]:
        """Check if a runbook is outdated."""
        artifact_path = self.repo_root / artifact.get("path", "")
        
        if not artifact_path.exists():
            return None
        
        try:
            with open(artifact_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception:
            return None
        
        # Check for required sections
        missing_sections = []
        required_sections = ["## Scope", "## When to Use", "## Verification"]
        
        for section in required_sections:
            if section not in content:
                missing_sections.append(section.replace("## ", ""))
        
        if len(missing_sections) >= 2:
            return DriftAlert(
                artifact_id=artifact_id,
                drift_type=DriftType.OUTDATED_RUNBOOK,
                severity="warning",
                message=f"Runbook missing critical sections: {', '.join(missing_sections)}",
                detected_at=datetime.now(),
                details={"missing_sections": missing_sections},
                recommended_action=CurationAction.UPDATE,
            )
        
        # Check for outdated references
        outdated_refs = []
        if "last updated" in content.lower():
            # Try to extract date
            date_patterns = [
                r"last updated[:\s]+(\d{4}-\d{2}-\d{2})",
                r"last updated[:\s]+(\w+ \d{1,2},? \d{4})",
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, content, re.IGNORECASE)
                if match:
                    # If we found an old date, flag it
                    outdated_refs.append("runbook has explicit last updated date")
                    break
        
        if outdated_refs and artifact.get("last_verified") is None:
            return DriftAlert(
                artifact_id=artifact_id,
                drift_type=DriftType.OUTDATED_RUNBOOK,
                severity="info",
                message="Runbook may contain outdated information",
                detected_at=datetime.now(),
                recommended_action=CurationAction.REVIEW,
            )
        
        return None
    
    def _detect_superseded_artifacts(
        self,
        health_metrics: dict[str, HealthMetrics],
    ) -> list[DriftAlert]:
        """Detect artifacts that may be superseded by newer/better versions."""
        alerts = []
        
        # Group artifacts by type and similar titles
        index = self._load_index()
        if not index:
            return alerts
        
        artifacts_by_type: dict[str, list[dict]] = {}
        for art in index.get("artifacts", []):
            art_type = art.get("type", "unknown")
            if art_type not in artifacts_by_type:
                artifacts_by_type[art_type] = []
            artifacts_by_type[art_type].append(art)
        
        # Check for potential duplicates or superseded artifacts
        for art_type, artifacts in artifacts_by_type.items():
            if len(artifacts) < 2:
                continue
            
            # Simple similarity check based on title keywords
            titles = [(art.get("id", ""), art.get("title", "").lower().split()) for art in artifacts]
            
            for i, (id1, words1) in enumerate(titles):
                for j, (id2, words2) in enumerate(titles):
                    if i >= j:
                        continue
                    
                    # Check for significant word overlap
                    if len(words1) > 0 and len(words2) > 0:
                        overlap = len(set(words1) & set(words2))
                        similarity = overlap / max(len(words1), len(words2))
                        
                        if similarity > 0.7:  # 70% word overlap
                            # Determine which one is newer/better
                            art1 = artifacts[i]
                            art2 = artifacts[j]
                            
                            # Prefer artifacts with more recent verification
                            ver1 = art1.get("last_verified")
                            ver2 = art2.get("last_verified")
                            
                            if ver1 and not ver2:
                                newer = id1
                                older = id2
                            elif ver2 and not ver1:
                                newer = id2
                                older = id1
                            else:
                                # Check health scores
                                score1 = health_metrics.get(id1, HealthMetrics(artifact_id=id1)).health_score
                                score2 = health_metrics.get(id2, HealthMetrics(artifact_id=id2)).health_score
                                
                                if score1 >= score2:
                                    newer = id1
                                    older = id2
                                else:
                                    newer = id2
                                    older = id1
                            
                            alerts.append(DriftAlert(
                                artifact_id=older,
                                drift_type=DriftType.SUPERSEDED_ARTIFACT,
                                severity="info",
                                message=f"Similar to {newer} ({similarity:.0%} title overlap)",
                                detected_at=datetime.now(),
                                details={
                                    "similar_to": newer,
                                    "similarity_score": round(similarity, 2),
                                },
                                recommended_action=CurationAction.MERGE,
                            ))
        
        return alerts
    
    def analyze_error_logs(self, artifact_id: str, log_content: str) -> list[DriftAlert]:
        """Analyze error logs for drift patterns."""
        alerts = []
        
        for pattern, message in self.ERROR_PATTERNS:
            if re.search(pattern, log_content, re.IGNORECASE | re.MULTILINE):
                alerts.append(DriftAlert(
                    artifact_id=artifact_id,
                    drift_type=DriftType.BROKEN_NOTEBOOK,
                    severity="critical",
                    message=message,
                    detected_at=datetime.now(),
                    details={"pattern": pattern},
                    recommended_action=CurationAction.REFACTOR,
                ))
        
        return alerts
