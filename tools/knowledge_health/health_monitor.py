"""Knowledge Health Monitor - tracks health metrics for knowledge artifacts.

This module provides the core health monitoring functionality including:
- Health score calculation
- Dependency rot detection
- Environment drift detection
- Relevance decay tracking
"""

import json
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional

from .models import (
    DependencyHealth,
    DependencyStatus,
    EnvironmentHealth,
    EnvironmentStatus,
    ExecutionHistory,
    HealthMetrics,
    HealthStatus,
    RelevanceHealth,
    RelevanceStatus,
    SystemHealthConfig,
)


class HealthMonitor:
    """Monitors and calculates health metrics for knowledge artifacts."""
    
    def __init__(
        self,
        repo_root: Path,
        config: Optional[SystemHealthConfig] = None,
        index_path: Optional[Path] = None,
    ):
        self.repo_root = Path(repo_root)
        self.config = config or SystemHealthConfig()
        self.index_path = index_path or self.repo_root / "outputs" / "keys_index" / "kb_index.json"
        self._cached_artifacts: Optional[list[dict]] = None
        self._cached_index: Optional[dict] = None
    
    def _load_index(self) -> Optional[dict]:
        """Load the knowledge index."""
        if self._cached_index is not None:
            return self._cached_index
        
        if not self.index_path.exists():
            return None
        
        try:
            with open(self.index_path, "r", encoding="utf-8") as f:
                self._cached_index = json.load(f)
                self._cached_artifacts = self._cached_index.get("artifacts", [])
                return self._cached_index
        except Exception as e:
            print(f"Error loading index: {e}")
            return None
    
    def check_health(self, artifact: dict) -> HealthMetrics:
        """Check health for a single artifact."""
        artifact_id = artifact.get("id", "unknown")
        
        # Initialize metrics
        metrics = HealthMetrics(
            artifact_id=artifact_id,
            first_seen=datetime.now(),
            last_updated=datetime.now(),
            last_health_check=datetime.now(),
        )
        
        # Check component health
        metrics.dependency_health = self._check_dependencies(artifact)
        metrics.environment_health = self._check_environment(artifact)
        metrics.relevance_health = self._check_relevance(artifact)
        metrics.execution_history = self._check_execution_history(artifact)
        
        # Calculate overall health score
        metrics.health_score = self._calculate_health_score(metrics)
        metrics.status = self._health_score_to_status(metrics.health_score)
        
        return metrics
    
    def check_all_health(self) -> dict[str, HealthMetrics]:
        """Check health for all artifacts in the index."""
        index = self._load_index()
        if not index:
            return {}
        
        artifacts = index.get("artifacts", [])
        results = {}
        
        for artifact in artifacts:
            metrics = self.check_health(artifact)
            results[metrics.artifact_id] = metrics
        
        return results
    
    def _check_dependencies(self, artifact: dict) -> DependencyHealth:
        """Check dependency health for an artifact."""
        deps = artifact.get("dependencies", [])
        health = DependencyHealth(
            status=DependencyStatus.CURRENT,
            total_deps=len(deps),
            last_checked=datetime.now(),
        )
        
        if not deps:
            health.status = DependencyStatus.CURRENT
            return health
        
        issues = []
        
        for dep in deps:
            dep_name = dep.get("name", "")
            dep_version = dep.get("version")
            dep_source = dep.get("source", "auto-detected")
            
            # Check if dependency is from lockfile (more reliable)
            if dep_source == "lockfile" and dep_version:
                health.current_deps += 1
            elif dep_source == "declared":
                health.current_deps += 1
            elif dep_source == "auto-detected":
                # Auto-detected dependencies may be stdlib
                if dep_name in sys.stdlib_module_names:
                    health.current_deps += 1
                else:
                    health.unknown_deps += 1
                    issues.append(f"Unversioned dependency: {dep_name}")
            
            # Check for known problematic packages
            if dep_name in ["pandas", "numpy", "scikit-learn", "matplotlib"]:
                if not dep_version:
                    issues.append(f"Major dependency without version: {dep_name}")
        
        # Determine overall status
        if health.unknown_deps > health.total_deps * 0.5:
            health.status = DependencyStatus.UNKNOWN
        elif issues:
            health.status = DependencyStatus.OUTDATED
        
        health.issues = issues
        return health
    
    def _check_environment(self, artifact: dict) -> EnvironmentHealth:
        """Check environment compatibility for an artifact."""
        health = EnvironmentHealth(
            status=EnvironmentStatus.COMPATIBLE,
            last_checked=datetime.now(),
        )
        
        # Get declared Python version
        runtime = artifact.get("runtime", "")
        if runtime:
            health.python_version = runtime
        
        # Get current Python version
        health.detected_python = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        
        # Check for version mismatch
        if runtime:
            try:
                declared_major = int(runtime.split(".")[0])
                current_major = sys.version_info.major
                
                if declared_major != current_major:
                    health.runtime_mismatch = True
                    health.status = EnvironmentStatus.DRIFTED
                    health.issues.append(
                        f"Python version mismatch: declared {runtime}, current {health.detected_python}"
                    )
            except (ValueError, IndexError):
                pass
        
        # Check language compatibility
        language = artifact.get("language", "").lower()
        if language and language not in ["python", "", "shell", "bash"]:
            if language in ["javascript", "typescript", "node"]:
                # Check if node is available
                try:
                    result = subprocess.run(
                        ["node", "--version"],
                        capture_output=True,
                        text=True,
                        timeout=5,
                    )
                    if result.returncode != 0:
                        health.missing_binaries.append("node")
                        health.status = EnvironmentStatus.INCOMPATIBLE
                except (subprocess.TimeoutExpired, FileNotFoundError):
                    health.missing_binaries.append("node")
                    health.status = EnvironmentStatus.INCOMPATIBLE
        
        return health
    
    def _check_relevance(self, artifact: dict) -> RelevanceHealth:
        """Check relevance health for an artifact."""
        health = RelevanceHealth(
            status=RelevanceStatus.CURRENT,
            last_assessed=datetime.now(),
        )
        
        # Get file path for age calculation
        artifact_path = self.repo_root / artifact.get("path", "")
        if artifact_path.exists():
            stat = artifact_path.stat()
            creation_time = datetime.fromtimestamp(stat.st_ctime)
            modification_time = datetime.fromtimestamp(stat.st_mtime)
            
            health.days_since_creation = (datetime.now() - creation_time).days
            health.days_since_update = (datetime.now() - modification_time).days
        
        # Check last verification
        last_verified = artifact.get("last_verified")
        if last_verified:
            try:
                verified_date = datetime.fromisoformat(last_verified)
                health.days_since_verification = (datetime.now() - verified_date).days
            except ValueError:
                pass
        
        # Determine relevance status based on age
        if health.days_since_update > self.config.relevance_deprecated_days:
            health.status = RelevanceStatus.DEPRECATED
            health.issues.append(f"Artifact not updated in {health.days_since_update} days")
        elif health.days_since_update > self.config.relevance_stale_days:
            health.status = RelevanceStatus.STALE
            health.issues.append(f"Artifact stale ({health.days_since_update} days since update)")
        elif health.days_since_update > self.config.relevance_aging_days:
            health.status = RelevanceStatus.AGING
        
        # Check execution count
        health.usage_count = artifact.get("execution_count", 0)
        if health.usage_count == 0 and health.days_since_creation > 30:
            health.issues.append("Artifact never executed since creation")
        
        # Check runnable status
        runnable_status = artifact.get("runnable_status", "unknown")
        if runnable_status == "broken":
            health.issues.append("Artifact marked as broken")
        
        return health
    
    def _check_execution_history(self, artifact: dict) -> ExecutionHistory:
        """Check execution history for an artifact."""
        history = ExecutionHistory()
        
        # Load from stored execution history if available
        execution_log_path = (
            self.repo_root / "outputs" / "execution_logs" / f"{artifact.get('id', 'unknown')}.json"
        )
        
        if execution_log_path.exists():
            try:
                with open(execution_log_path, "r", encoding="utf-8") as f:
                    log_data = json.load(f)
                    history.total_attempts = log_data.get("total_attempts", 0)
                    history.successful_runs = log_data.get("successful_runs", 0)
                    history.failed_runs = log_data.get("failed_runs", 0)
                    history.last_success = (
                        datetime.fromisoformat(log_data["last_success"])
                        if log_data.get("last_success") else None
                    )
                    history.last_failure = (
                        datetime.fromisoformat(log_data["last_failure"])
                        if log_data.get("last_failure") else None
                    )
                    history.execution_history = log_data.get("execution_history", [])
            except Exception:
                pass
        
        return history
    
    def _calculate_health_score(self, metrics: HealthMetrics) -> float:
        """Calculate overall health score from component scores."""
        # Component scores (0-100)
        dep_score = self._dependency_score(metrics.dependency_health)
        env_score = self._environment_score(metrics.environment_health)
        rel_score = self._relevance_score(metrics.relevance_health)
        exec_score = self._execution_score(metrics.execution_history)
        
        # Weighted average
        score = (
            dep_score * self.config.dependency_weight +
            env_score * self.config.environment_weight +
            rel_score * self.config.relevance_weight +
            exec_score * self.config.execution_weight
        )
        
        return max(0.0, min(100.0, score))
    
    def _dependency_score(self, health: DependencyHealth) -> float:
        """Calculate dependency health score (0-100)."""
        if health.total_deps == 0:
            return 100.0  # No dependencies = no issues
        
        # Penalize broken and unknown dependencies
        broken_penalty = health.broken_deps * 30
        stale_penalty = health.stale_deps * 20
        outdated_penalty = health.outdated_deps * 10
        unknown_penalty = health.unknown_deps * 5
        
        score = 100 - broken_penalty - stale_penalty - outdated_penalty - unknown_penalty
        
        # Status-based minimums
        if health.status == DependencyStatus.BROKEN:
            score = min(score, 20)
        elif health.status == DependencyStatus.STALE:
            score = min(score, 50)
        elif health.status == DependencyStatus.UNKNOWN:
            score = min(score, 70)
        
        return max(0.0, score)
    
    def _environment_score(self, health: EnvironmentHealth) -> float:
        """Calculate environment health score (0-100)."""
        if health.status == EnvironmentStatus.INCOMPATIBLE:
            return 0.0
        elif health.status == EnvironmentStatus.DRIFTED:
            return 60.0
        elif health.status == EnvironmentStatus.COMPATIBLE:
            return 100.0
        else:
            return 75.0  # Unknown is moderately concerning
    
    def _relevance_score(self, health: RelevanceHealth) -> float:
        """Calculate relevance health score (0-100)."""
        score = 100.0
        
        # Penalize based on status
        if health.status == RelevanceStatus.DEPRECATED:
            score = 10.0
        elif health.status == RelevanceStatus.SUPERSEDED:
            score = 20.0
        elif health.status == RelevanceStatus.STALE:
            score = 50.0
        elif health.status == RelevanceStatus.AGING:
            score = 80.0
        
        # Additional age penalty
        if health.days_since_update > 365:
            score -= 10
        if health.days_since_verification > 180:
            score -= 5
        
        # Usage bonus
        if health.usage_count > 10:
            score += 5
        
        return max(0.0, min(100.0, score))
    
    def _execution_score(self, history: ExecutionHistory) -> float:
        """Calculate execution health score (0-100)."""
        if history.total_attempts == 0:
            return 75.0  # No attempts yet is neutral
        
        # Success rate
        success_rate = history.successful_runs / history.total_attempts
        score = success_rate * 100
        
        # Penalize recent failures
        if history.last_failure:
            days_since_failure = (datetime.now() - history.last_failure).days
            if days_since_failure < 7:
                score -= 20
            elif days_since_failure < 30:
                score -= 10
        
        # Consecutive failures penalty
        if history.failed_runs >= self.config.auto_flag_broken_after_failures:
            score = min(score, 30)
        
        return max(0.0, min(100.0, score))
    
    def _health_score_to_status(self, score: float) -> HealthStatus:
        """Convert health score to status enum."""
        if score >= self.config.degraded_threshold:
            return HealthStatus.HEALTHY
        elif score >= self.config.critical_threshold:
            return HealthStatus.DEGRADED
        elif score >= self.config.decayed_threshold:
            return HealthStatus.CRITICAL
        else:
            return HealthStatus.DECAYED
    
    def get_health_summary(self, metrics: dict[str, HealthMetrics]) -> dict[str, Any]:
        """Generate summary statistics from health metrics."""
        if not metrics:
            return {
                "total": 0,
                "healthy": 0,
                "degraded": 0,
                "critical": 0,
                "decayed": 0,
                "average_score": 0.0,
            }
        
        scores = [m.health_score for m in metrics.values()]
        
        return {
            "total": len(metrics),
            "healthy": sum(1 for m in metrics.values() if m.status == HealthStatus.HEALTHY),
            "degraded": sum(1 for m in metrics.values() if m.status == HealthStatus.DEGRADED),
            "critical": sum(1 for m in metrics.values() if m.status == HealthStatus.CRITICAL),
            "decayed": sum(1 for m in metrics.values() if m.status == HealthStatus.DECAYED),
            "average_score": sum(scores) / len(scores),
        }
