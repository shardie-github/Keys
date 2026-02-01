"""Data models for knowledge health monitoring.

This module defines the core data structures for tracking health metrics,
decay detection, and curation recommendations for knowledge artifacts.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Any, Optional


class HealthStatus(Enum):
    """Overall health status of a knowledge artifact."""
    HEALTHY = "healthy"  # 80-100 score
    DEGRADED = "degraded"  # 50-79 score
    CRITICAL = "critical"  # 20-49 score
    DECAYED = "decayed"  # 0-19 score


class DependencyStatus(Enum):
    """Status of artifact dependencies."""
    CURRENT = "current"  # All deps up to date
    OUTDATED = "outdated"  # Minor version behind
    STALE = "stale"  # Major version behind
    BROKEN = "broken"  # Critical dep issues
    UNKNOWN = "unknown"  # Cannot determine


class EnvironmentStatus(Enum):
    """Status of execution environment compatibility."""
    COMPATIBLE = "compatible"  # Environment matches requirements
    DRIFTED = "drifted"  # Minor environment differences
    INCOMPATIBLE = "incompatible"  # Major environment conflicts
    UNKNOWN = "unknown"  # Cannot determine


class RelevanceStatus(Enum):
    """Status of artifact relevance."""
    CURRENT = "current"  # Still relevant
    AGING = "aging"  # May need update soon
    STALE = "stale"  # Needs refresh
    SUPERSEDED = "superseded"  # Replaced by newer artifact
    DEPRECATED = "deprecated"  # No longer recommended


class DriftType(Enum):
    """Types of knowledge drift that can be detected."""
    BROKEN_NOTEBOOK = "broken_notebook"
    OUTDATED_RUNBOOK = "outdated_runbook"
    DEPRECATED_API = "deprecated_api"
    SUPERSEDED_ARTIFACT = "superseded_artifact"
    MISSING_DEPENDENCY = "missing_dependency"
    ENVIRONMENT_DRIFT = "environment_drift"
    CONTENT_STALENESS = "content_staleness"


class CurationAction(Enum):
    """Recommended curation actions."""
    ARCHIVE = "archive"  # Move to archive
    MERGE = "merge"  # Combine with similar artifacts
    REFACTOR = "refactor"  # Major restructuring needed
    PROMOTE_GOLD = "promote_gold"  # Promote to gold standard
    UPDATE = "update"  # Minor refresh needed
    REVIEW = "review"  # Manual review required
    DELETE = "delete"  # Remove from system
    NO_ACTION = "no_action"  # No action needed


@dataclass
class DependencyHealth:
    """Health metrics for artifact dependencies."""
    status: DependencyStatus
    total_deps: int = 0
    current_deps: int = 0
    outdated_deps: int = 0
    stale_deps: int = 0
    broken_deps: int = 0
    unknown_deps: int = 0
    issues: list[str] = field(default_factory=list)
    last_checked: datetime | None = None
    
    def to_dict(self) -> dict:
        return {
            "status": self.status.value,
            "total_deps": self.total_deps,
            "current_deps": self.current_deps,
            "outdated_deps": self.outdated_deps,
            "stale_deps": self.stale_deps,
            "broken_deps": self.broken_deps,
            "unknown_deps": self.unknown_deps,
            "issues": self.issues,
            "last_checked": self.last_checked.isoformat() if self.last_checked else None,
        }


@dataclass
class EnvironmentHealth:
    """Health metrics for execution environment."""
    status: EnvironmentStatus
    python_version: str = ""
    detected_python: str = ""
    runtime_mismatch: bool = False
    missing_binaries: list[str] = field(default_factory=list)
    version_conflicts: list[str] = field(default_factory=list)
    issues: list[str] = field(default_factory=list)
    last_checked: datetime | None = None
    
    def to_dict(self) -> dict:
        return {
            "status": self.status.value,
            "python_version": self.python_version,
            "detected_python": self.detected_python,
            "runtime_mismatch": self.runtime_mismatch,
            "missing_binaries": self.missing_binaries,
            "version_conflicts": self.version_conflicts,
            "issues": self.issues,
            "last_checked": self.last_checked.isoformat() if self.last_checked else None,
        }


@dataclass
class RelevanceHealth:
    """Health metrics for artifact relevance."""
    status: RelevanceStatus
    days_since_creation: int = 0
    days_since_update: int = 0
    days_since_verification: int = 0
    superseded_by: list[str] = field(default_factory=list)
    related_artifacts: list[str] = field(default_factory=list)
    usage_count: int = 0
    issues: list[str] = field(default_factory=list)
    last_assessed: datetime | None = None
    
    def to_dict(self) -> dict:
        return {
            "status": self.status.value,
            "days_since_creation": self.days_since_creation,
            "days_since_update": self.days_since_update,
            "days_since_verification": self.days_since_verification,
            "superseded_by": self.superseded_by,
            "related_artifacts": self.related_artifacts,
            "usage_count": self.usage_count,
            "issues": self.issues,
            "last_assessed": self.last_assessed.isoformat() if self.last_assessed else None,
        }


@dataclass
class ExecutionHistory:
    """Record of artifact execution history."""
    total_attempts: int = 0
    successful_runs: int = 0
    failed_runs: int = 0
    last_success: datetime | None = None
    last_failure: datetime | None = None
    last_error_message: str = ""
    average_duration_ms: float = 0.0
    execution_history: list[dict] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            "total_attempts": self.total_attempts,
            "successful_runs": self.successful_runs,
            "failed_runs": self.failed_runs,
            "last_success": self.last_success.isoformat() if self.last_success else None,
            "last_failure": self.last_failure.isoformat() if self.last_failure else None,
            "last_error_message": self.last_error_message,
            "average_duration_ms": self.average_duration_ms,
            "execution_history": self.execution_history[-10:],  # Last 10 runs
        }


@dataclass
class HealthMetrics:
    """Complete health metrics for a knowledge artifact."""
    artifact_id: str
    health_score: float = 100.0
    status: HealthStatus = HealthStatus.HEALTHY
    
    # Component health
    dependency_health: DependencyHealth = field(default_factory=lambda: DependencyHealth(DependencyStatus.UNKNOWN))
    environment_health: EnvironmentHealth = field(default_factory=lambda: EnvironmentHealth(EnvironmentStatus.UNKNOWN))
    relevance_health: RelevanceHealth = field(default_factory=lambda: RelevanceHealth(RelevanceStatus.CURRENT))
    execution_history: ExecutionHistory = field(default_factory=ExecutionHistory)
    
    # Timestamps
    first_seen: datetime | None = None
    last_updated: datetime | None = None
    last_health_check: datetime | None = None
    next_scheduled_check: datetime | None = None
    
    # Metadata
    health_version: str = "1.0.0"
    custom_flags: list[str] = field(default_factory=list)
    notes: str = ""
    
    def to_dict(self) -> dict:
        return {
            "artifact_id": self.artifact_id,
            "health_score": round(self.health_score, 2),
            "status": self.status.value,
            "dependency_health": self.dependency_health.to_dict(),
            "environment_health": self.environment_health.to_dict(),
            "relevance_health": self.relevance_health.to_dict(),
            "execution_history": self.execution_history.to_dict(),
            "first_seen": self.first_seen.isoformat() if self.first_seen else None,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
            "last_health_check": self.last_health_check.isoformat() if self.last_health_check else None,
            "next_scheduled_check": self.next_scheduled_check.isoformat() if self.next_scheduled_check else None,
            "health_version": self.health_version,
            "custom_flags": self.custom_flags,
            "notes": self.notes,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "HealthMetrics":
        dep_health = DependencyHealth(
            status=DependencyStatus(data["dependency_health"]["status"]),
            **{k: v for k, v in data["dependency_health"].items() if k != "status" and k != "last_checked"},
            last_checked=datetime.fromisoformat(data["dependency_health"]["last_checked"]) if data["dependency_health"].get("last_checked") else None,
        )
        env_health = EnvironmentHealth(
            status=EnvironmentStatus(data["environment_health"]["status"]),
            **{k: v for k, v in data["environment_health"].items() if k != "status" and k != "last_checked"},
            last_checked=datetime.fromisoformat(data["environment_health"]["last_checked"]) if data["environment_health"].get("last_checked") else None,
        )
        rel_health = RelevanceHealth(
            status=RelevanceStatus(data["relevance_health"]["status"]),
            **{k: v for k, v in data["relevance_health"].items() if k != "status" and k != "last_assessed"},
            last_assessed=datetime.fromisoformat(data["relevance_health"]["last_assessed"]) if data["relevance_health"].get("last_assessed") else None,
        )
        exec_hist = ExecutionHistory(**data["execution_history"])
        
        return cls(
            artifact_id=data["artifact_id"],
            health_score=data.get("health_score", 100.0),
            status=HealthStatus(data.get("status", "healthy")),
            dependency_health=dep_health,
            environment_health=env_health,
            relevance_health=rel_health,
            execution_history=exec_hist,
            first_seen=datetime.fromisoformat(data["first_seen"]) if data.get("first_seen") else None,
            last_updated=datetime.fromisoformat(data["last_updated"]) if data.get("last_updated") else None,
            last_health_check=datetime.fromisoformat(data["last_health_check"]) if data.get("last_health_check") else None,
            next_scheduled_check=datetime.fromisoformat(data["next_scheduled_check"]) if data.get("next_scheduled_check") else None,
            health_version=data.get("health_version", "1.0.0"),
            custom_flags=data.get("custom_flags", []),
            notes=data.get("notes", ""),
        )


@dataclass
class DriftAlert:
    """Alert for knowledge drift detection."""
    artifact_id: str
    drift_type: DriftType
    severity: str  # critical, warning, info
    message: str
    detected_at: datetime
    details: dict[str, Any] = field(default_factory=dict)
    recommended_action: CurationAction = CurationAction.REVIEW
    auto_resolvable: bool = False
    resolved_at: datetime | None = None
    resolved_by: str = ""
    
    def to_dict(self) -> dict:
        return {
            "artifact_id": self.artifact_id,
            "drift_type": self.drift_type.value,
            "severity": self.severity,
            "message": self.message,
            "detected_at": self.detected_at.isoformat(),
            "details": self.details,
            "recommended_action": self.recommended_action.value,
            "auto_resolvable": self.auto_resolvable,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolved_by": self.resolved_by,
        }


@dataclass
class CurationRecommendation:
    """Curation recommendation for an artifact."""
    artifact_id: str
    action: CurationAction
    priority: str  # high, medium, low
    reason: str
    confidence: float = 0.0  # 0.0 to 1.0
    related_artifacts: list[str] = field(default_factory=list)
    estimated_effort: str = ""  # small, medium, large
    suggested_assignee: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    expires_at: datetime | None = None
    
    def to_dict(self) -> dict:
        return {
            "artifact_id": self.artifact_id,
            "action": self.action.value,
            "priority": self.priority,
            "reason": self.reason,
            "confidence": round(self.confidence, 2),
            "related_artifacts": self.related_artifacts,
            "estimated_effort": self.estimated_effort,
            "suggested_assignee": self.suggested_assignee,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }


@dataclass
class KnowledgeHealthReport:
    """Complete health report for the knowledge base."""
    generated_at: datetime
    repo_root: Path
    total_artifacts: int = 0
    
    # Health distribution
    healthy_count: int = 0
    degraded_count: int = 0
    critical_count: int = 0
    decayed_count: int = 0
    
    # Component summaries
    artifacts_with_drift: int = 0
    artifacts_needing_curation: int = 0
    
    # Health metrics by artifact
    health_metrics: dict[str, HealthMetrics] = field(default_factory=dict)
    
    # Active alerts
    active_alerts: list[DriftAlert] = field(default_factory=list)
    
    # Curation recommendations
    curation_recommendations: list[CurationRecommendation] = field(default_factory=list)
    
    # Summary statistics
    average_health_score: float = 0.0
    health_score_trend: str = "stable"  # improving, stable, declining
    
    def to_dict(self) -> dict:
        return {
            "generated_at": self.generated_at.isoformat(),
            "repo_root": str(self.repo_root),
            "total_artifacts": self.total_artifacts,
            "healthy_count": self.healthy_count,
            "degraded_count": self.degraded_count,
            "critical_count": self.critical_count,
            "decayed_count": self.decayed_count,
            "artifacts_with_drift": self.artifacts_with_drift,
            "artifacts_needing_curation": self.artifacts_needing_curation,
            "health_metrics": {k: v.to_dict() for k, v in self.health_metrics.items()},
            "active_alerts": [a.to_dict() for a in self.active_alerts],
            "curation_recommendations": [r.to_dict() for r in self.curation_recommendations],
            "average_health_score": round(self.average_health_score, 2),
            "health_score_trend": self.health_score_trend,
        }
    
    def to_markdown(self) -> str:
        """Generate markdown summary of health report."""
        lines = [
            "# Knowledge Health Report",
            "",
            f"**Generated**: {self.generated_at.strftime('%Y-%m-%d %H:%M:%S')}",
            f"**Repository**: {self.repo_root}",
            "",
            "## Summary",
            "",
            f"- **Total Artifacts**: {self.total_artifacts}",
            f"- **Average Health Score**: {self.average_health_score:.1f}/100",
            f"- **Health Trend**: {self.health_score_trend.title()}",
            "",
            "### Health Distribution",
            "",
            f"| Status | Count | Percentage |",
            f"|--------|-------|------------|",
            f"| Healthy | {self.healthy_count} | {self.healthy_count / max(self.total_artifacts, 1) * 100:.1f}% |",
            f"| Degraded | {self.degraded_count} | {self.degraded_count / max(self.total_artifacts, 1) * 100:.1f}% |",
            f"| Critical | {self.critical_count} | {self.critical_count / max(self.total_artifacts, 1) * 100:.1f}% |",
            f"| Decayed | {self.decayed_count} | {self.decayed_count / max(self.total_artifacts, 1) * 100:.1f}% |",
            "",
            "## Active Alerts",
            "",
        ]
        
        if self.active_alerts:
            lines.extend([
                f"| Artifact | Type | Severity | Message |",
                f"|----------|------|----------|---------|",
            ])
            for alert in self.active_alerts[:20]:  # Show top 20
                lines.append(f"| {alert.artifact_id[:40]}... | {alert.drift_type.value} | {alert.severity} | {alert.message[:50]}... |")
        else:
            lines.append("No active drift alerts detected.")
        
        lines.extend([
            "",
            "## Curation Recommendations",
            "",
        ])
        
        if self.curation_recommendations:
            lines.extend([
                f"| Artifact | Action | Priority | Confidence | Reason |",
                f"|----------|--------|----------|------------|--------|",
            ])
            for rec in self.curation_recommendations[:20]:  # Show top 20
                lines.append(f"| {rec.artifact_id[:40]}... | {rec.action.value} | {rec.priority} | {rec.confidence:.0%} | {rec.reason[:50]}... |")
        else:
            lines.append("No curation recommendations at this time.")
        
        lines.extend([
            "",
            "## Critical Artifacts (Score < 50)",
            "",
        ])
        
        critical_artifacts = [
            (aid, metrics) for aid, metrics in self.health_metrics.items()
            if metrics.health_score < 50
        ]
        
        if critical_artifacts:
            lines.extend([
                f"| Artifact | Score | Status | Primary Issue |",
                f"|----------|-------|--------|---------------|",
            ])
            for aid, metrics in sorted(critical_artifacts, key=lambda x: x[1].health_score)[:15]:
                issue = "Unknown"
                if metrics.dependency_health.status in [DependencyStatus.BROKEN, DependencyStatus.STALE]:
                    issue = f"Deps: {metrics.dependency_health.status.value}"
                elif metrics.environment_health.status == EnvironmentStatus.INCOMPATIBLE:
                    issue = "Environment incompatible"
                elif metrics.relevance_health.status in [RelevanceStatus.SUPERSEDED, RelevanceStatus.DEPRECATED]:
                    issue = f"Relevance: {metrics.relevance_health.status.value}"
                elif metrics.execution_history.failed_runs > metrics.execution_history.successful_runs:
                    issue = "Execution failures"
                lines.append(f"| {aid[:40]}... | {metrics.health_score:.0f} | {metrics.status.value} | {issue} |")
        else:
            lines.append("No critical artifacts detected.")
        
        lines.append("")
        
        return "\n".join(lines)


@dataclass
class RevalidationSchedule:
    """Schedule for automatic revalidation."""
    artifact_id: str
    frequency_days: int = 7  # Default: weekly
    last_run: datetime | None = None
    next_run: datetime | None = None
    run_count: int = 0
    failure_count: int = 0
    is_active: bool = True
    
    def to_dict(self) -> dict:
        return {
            "artifact_id": self.artifact_id,
            "frequency_days": self.frequency_days,
            "last_run": self.last_run.isoformat() if self.last_run else None,
            "next_run": self.next_run.isoformat() if self.next_run else None,
            "run_count": self.run_count,
            "failure_count": self.failure_count,
            "is_active": self.is_active,
        }


@dataclass
class SystemHealthConfig:
    """Configuration for the knowledge health system."""
    # Health score thresholds
    degraded_threshold: float = 80.0
    critical_threshold: float = 50.0
    decayed_threshold: float = 20.0
    
    # Aging thresholds (days)
    relevance_aging_days: int = 90
    relevance_stale_days: int = 180
    relevance_deprecated_days: int = 365
    
    # Revalidation schedule
    default_revalidation_frequency: int = 7  # days
    critical_artifact_frequency: int = 1  # daily for critical
    degraded_artifact_frequency: int = 3  # every 3 days for degraded
    
    # Auto-actions
    auto_archive_threshold_days: int = 730  # 2 years
    auto_flag_broken_after_failures: int = 3
    
    # Scoring weights (must sum to 1.0)
    dependency_weight: float = 0.30
    environment_weight: float = 0.20
    relevance_weight: float = 0.25
    execution_weight: float = 0.25
    
    def to_dict(self) -> dict:
        return {
            "degraded_threshold": self.degraded_threshold,
            "critical_threshold": self.critical_threshold,
            "decayed_threshold": self.decayed_threshold,
            "relevance_aging_days": self.relevance_aging_days,
            "relevance_stale_days": self.relevance_stale_days,
            "relevance_deprecated_days": self.relevance_deprecated_days,
            "default_revalidation_frequency": self.default_revalidation_frequency,
            "critical_artifact_frequency": self.critical_artifact_frequency,
            "degraded_artifact_frequency": self.degraded_artifact_frequency,
            "auto_archive_threshold_days": self.auto_archive_threshold_days,
            "auto_flag_broken_after_failures": self.auto_flag_broken_after_failures,
            "dependency_weight": self.dependency_weight,
            "environment_weight": self.environment_weight,
            "relevance_weight": self.relevance_weight,
            "execution_weight": self.execution_weight,
        }
