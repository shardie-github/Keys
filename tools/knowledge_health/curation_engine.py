"""Curation Intelligence Engine.

Provides intelligent recommendations for knowledge curation:
- Archive candidates (old, unused artifacts)
- Merge candidates (duplicates, similar artifacts)
- Refactor targets (poor quality, broken artifacts)
- Gold standard promotions (high quality, well-used artifacts)
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from .models import (
    CurationAction,
    CurationRecommendation,
    DependencyStatus,
    DriftAlert,
    DriftType,
    EnvironmentStatus,
    HealthMetrics,
    HealthStatus,
    RelevanceStatus,
    SystemHealthConfig,
)


class CurationEngine:
    """Intelligent curation recommendation engine."""
    
    def __init__(
        self,
        repo_root: Path,
        config: Optional[SystemHealthConfig] = None,
    ):
        self.repo_root = Path(repo_root)
        self.config = config or SystemHealthConfig()
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
    
    def generate_recommendations(
        self,
        health_metrics: dict[str, HealthMetrics],
        active_alerts: list[DriftAlert],
    ) -> list[CurationRecommendation]:
        """Generate all curation recommendations."""
        recommendations = []
        
        # Group alerts by artifact
        alerts_by_artifact: dict[str, list[DriftAlert]] = {}
        for alert in active_alerts:
            if alert.artifact_id not in alerts_by_artifact:
                alerts_by_artifact[alert.artifact_id] = []
            alerts_by_artifact[alert.artifact_id].append(alert)
        
        # Analyze each artifact
        for artifact_id, metrics in health_metrics.items():
            artifact_alerts = alerts_by_artifact.get(artifact_id, [])
            rec = self._analyze_artifact(artifact_id, metrics, artifact_alerts)
            if rec:
                recommendations.append(rec)
        
        # Sort by priority and confidence
        priority_order = {"high": 0, "medium": 1, "low": 2}
        recommendations.sort(
            key=lambda r: (priority_order.get(r.priority, 1), -r.confidence)
        )
        
        return recommendations
    
    def _analyze_artifact(
        self,
        artifact_id: str,
        metrics: HealthMetrics,
        alerts: list[DriftAlert],
    ) -> Optional[CurationRecommendation]:
        """Analyze a single artifact and generate recommendation."""
        
        # Load artifact metadata
        index = self._load_index()
        artifact = None
        if index:
            for art in index.get("artifacts", []):
                if art.get("id") == artifact_id:
                    artifact = art
                    break
        
        # Decision tree for recommendations
        
        # 1. Decayed artifacts - Archive
        if metrics.status == HealthStatus.DECAYED:
            return CurationRecommendation(
                artifact_id=artifact_id,
                action=CurationAction.ARCHIVE,
                priority="high",
                reason="Artifact has decayed (health score < 20). Multiple critical issues.",
                confidence=0.9,
                estimated_effort="small",
            )
        
        # 2. Critical artifacts - Review/Refactor
        if metrics.status == HealthStatus.CRITICAL:
            # Check specific issues
            if metrics.dependency_health.status == DependencyStatus.BROKEN:
                return CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.REFACTOR,
                    priority="high",
                    reason=f"Critical dependency failures: {', '.join(metrics.dependency_health.issues[:2])}",
                    confidence=0.85,
                    estimated_effort="large",
                )
            
            if metrics.environment_health.status == EnvironmentStatus.INCOMPATIBLE:
                return CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.REFACTOR,
                    priority="high",
                    reason="Environment incompatibility. Requires significant updates.",
                    confidence=0.85,
                    estimated_effort="large",
                )
            
            if metrics.execution_history.failed_runs >= self.config.auto_flag_broken_after_failures:
                return CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.REFACTOR,
                    priority="high",
                    reason=f"Multiple execution failures ({metrics.execution_history.failed_runs}). Needs debugging.",
                    confidence=0.8,
                    estimated_effort="medium",
                )
            
            # Generic critical recommendation
            return CurationRecommendation(
                artifact_id=artifact_id,
                action=CurationAction.REVIEW,
                priority="high",
                reason="Artifact in critical health state. Manual review required.",
                confidence=0.7,
                estimated_effort="medium",
            )
        
        # 3. Check for merge candidates (from superseded alerts)
        superseded_alert = next(
            (a for a in alerts if a.drift_type == DriftType.SUPERSEDED_ARTIFACT),
            None
        )
        if superseded_alert:
            similar_to = superseded_alert.details.get("similar_to", "")
            return CurationRecommendation(
                artifact_id=artifact_id,
                action=CurationAction.MERGE,
                priority="medium",
                reason=f"Highly similar to {similar_to}. Consider merging.",
                confidence=superseded_alert.details.get("similarity_score", 0.7),
                related_artifacts=[similar_to] if similar_to else [],
                estimated_effort="medium",
            )
        
        # 4. Deprecated content - Archive
        if metrics.relevance_health.status == RelevanceStatus.DEPRECATED:
            return CurationRecommendation(
                artifact_id=artifact_id,
                action=CurationAction.ARCHIVE,
                priority="medium",
                reason=f"Content deprecated. Last updated {metrics.relevance_health.days_since_update} days ago.",
                confidence=0.85,
                estimated_effort="small",
            )
        
        # 5. Stale content - Update
        if metrics.relevance_health.status == RelevanceStatus.STALE:
            outdated_api_alert = next(
                (a for a in alerts if a.drift_type == DriftType.DEPRECATED_API),
                None
            )
            if outdated_api_alert:
                return CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.UPDATE,
                    priority="medium",
                    reason=f"Stale content with deprecated APIs. {outdated_api_alert.message}",
                    confidence=0.75,
                    estimated_effort="medium",
                )
            
            return CurationRecommendation(
                artifact_id=artifact_id,
                action=CurationAction.UPDATE,
                priority="low",
                reason=f"Content stale ({metrics.relevance_health.days_since_update} days). Refresh recommended.",
                confidence=0.6,
                estimated_effort="small",
            )
        
        # 6. Healthy, well-used artifacts - Consider for gold standard
        if self._is_gold_standard_candidate(metrics, artifact):
            return CurationRecommendation(
                artifact_id=artifact_id,
                action=CurationAction.PROMOTE_GOLD,
                priority="low",
                reason="High-quality artifact with good usage. Candidate for gold standard.",
                confidence=0.7,
                estimated_effort="small",
            )
        
        # 7. Degraded artifacts - Update
        if metrics.status == HealthStatus.DEGRADED:
            # Check for specific degradations
            if metrics.dependency_health.status == DependencyStatus.STALE:
                return CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.UPDATE,
                    priority="medium",
                    reason="Dependencies outdated. Update recommended.",
                    confidence=0.65,
                    estimated_effort="small",
                )
            
            if metrics.relevance_health.status == RelevanceStatus.AGING:
                return CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.UPDATE,
                    priority="low",
                    reason="Content aging. Minor refresh suggested.",
                    confidence=0.5,
                    estimated_effort="small",
                )
            
            return CurationRecommendation(
                artifact_id=artifact_id,
                action=CurationAction.REVIEW,
                priority="low",
                reason="Artifact health degraded. Review recommended.",
                confidence=0.5,
                estimated_effort="small",
            )
        
        # No action needed
        return None
    
    def _is_gold_standard_candidate(
        self,
        metrics: HealthMetrics,
        artifact: Optional[dict],
    ) -> bool:
        """Determine if an artifact is a candidate for gold standard promotion."""
        # Must be healthy
        if metrics.status != HealthStatus.HEALTHY:
            return False
        
        # Must have good health score
        if metrics.health_score < 90:
            return False
        
        # Should have been used
        if metrics.execution_history.successful_runs < 3:
            return False
        
        # Should have current dependencies
        if metrics.dependency_health.status != DependencyStatus.CURRENT:
            return False
        
        # Should be relatively recent
        if metrics.relevance_health.days_since_update > 180:
            return False
        
        # Should have good execution ratio
        if metrics.execution_history.total_attempts > 0:
            success_rate = (
                metrics.execution_history.successful_runs /
                metrics.execution_history.total_attempts
            )
            if success_rate < 0.9:
                return False
        
        return True
    
    def get_archive_candidates(
        self,
        health_metrics: dict[str, HealthMetrics],
        min_age_days: int = 365,
    ) -> list[CurationRecommendation]:
        """Get list of artifacts that are candidates for archiving."""
        candidates = []
        
        for artifact_id, metrics in health_metrics.items():
            # Criteria for archiving
            should_archive = False
            reason = ""
            confidence = 0.0
            
            # Very old and unused
            if (metrics.relevance_health.days_since_update > min_age_days and
                metrics.relevance_health.usage_count == 0):
                should_archive = True
                reason = f"Unused artifact older than {min_age_days} days"
                confidence = 0.9
            
            # Explicitly deprecated
            elif metrics.relevance_health.status == RelevanceStatus.DEPRECATED:
                should_archive = True
                reason = "Content marked as deprecated"
                confidence = 0.95
            
            # Decayed with no recovery
            elif (metrics.status == HealthStatus.DECAYED and
                  metrics.execution_history.failed_runs > 5):
                should_archive = True
                reason = "Decayed artifact with repeated failures"
                confidence = 0.85
            
            if should_archive:
                candidates.append(CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.ARCHIVE,
                    priority="medium",
                    reason=reason,
                    confidence=confidence,
                    estimated_effort="small",
                ))
        
        return candidates
    
    def get_merge_candidates(
        self,
        health_metrics: dict[str, HealthMetrics],
    ) -> list[tuple[str, str, float]]:
        """Get list of artifact pairs that could be merged.
        
        Returns list of (artifact1_id, artifact2_id, similarity_score).
        """
        # This is already handled by drift detection
        # But we can provide a cleaned list
        index = self._load_index()
        if not index:
            return []
        
        candidates = []
        seen_pairs = set()
        
        # Group by type
        by_type: dict[str, list[dict]] = {}
        for art in index.get("artifacts", []):
            art_type = art.get("type", "unknown")
            if art_type not in by_type:
                by_type[art_type] = []
            by_type[art_type].append(art)
        
        # Find similar pairs
        import re
        
        for art_type, artifacts in by_type.items():
            for i, art1 in enumerate(artifacts):
                for j, art2 in enumerate(artifacts):
                    if i >= j:
                        continue
                    
                    id1 = art1.get("id", "")
                    id2 = art2.get("id", "")
                    
                    pair_key = tuple(sorted([id1, id2]))
                    if pair_key in seen_pairs:
                        continue
                    seen_pairs.add(pair_key)
                    
                    # Compare titles
                    title1 = art1.get("title", "").lower()
                    title2 = art2.get("title", "").lower()
                    
                    # Extract words
                    words1 = set(re.findall(r'\b\w+\b', title1))
                    words2 = set(re.findall(r'\b\w+\b', title2))
                    
                    if len(words1) > 0 and len(words2) > 0:
                        overlap = len(words1 & words2)
                        similarity = overlap / max(len(words1), len(words2))
                        
                        if similarity > 0.6:
                            candidates.append((id1, id2, similarity))
        
        # Sort by similarity
        candidates.sort(key=lambda x: x[2], reverse=True)
        
        return candidates[:20]  # Top 20
    
    def get_refactor_targets(
        self,
        health_metrics: dict[str, HealthMetrics],
    ) -> list[CurationRecommendation]:
        """Get list of artifacts that need significant refactoring."""
        targets = []
        
        for artifact_id, metrics in health_metrics.items():
            if metrics.status not in [HealthStatus.CRITICAL, HealthStatus.DECAYED]:
                continue
            
            # High-priority refactors
            if metrics.environment_health.status == EnvironmentStatus.INCOMPATIBLE:
                targets.append(CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.REFACTOR,
                    priority="high",
                    reason="Environment incompatibility requires major refactoring",
                    confidence=0.85,
                    estimated_effort="large",
                ))
            
            elif metrics.dependency_health.status == DependencyStatus.BROKEN:
                targets.append(CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.REFACTOR,
                    priority="high",
                    reason="Broken dependencies require refactoring",
                    confidence=0.8,
                    estimated_effort="large",
                ))
            
            elif metrics.execution_history.failed_runs >= 5:
                targets.append(CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.REFACTOR,
                    priority="medium",
                    reason=f"Persistent execution failures ({metrics.execution_history.failed_runs})",
                    confidence=0.75,
                    estimated_effort="medium",
                ))
        
        return targets
    
    def get_gold_standard_candidates(
        self,
        health_metrics: dict[str, HealthMetrics],
    ) -> list[CurationRecommendation]:
        """Get list of artifacts that could be promoted to gold standard."""
        candidates = []
        
        for artifact_id, metrics in health_metrics.items():
            if self._is_gold_standard_candidate(metrics, None):
                candidates.append(CurationRecommendation(
                    artifact_id=artifact_id,
                    action=CurationAction.PROMOTE_GOLD,
                    priority="low",
                    reason="High-quality, well-used artifact with excellent health metrics",
                    confidence=0.75,
                    estimated_effort="small",
                ))
        
        # Sort by health score
        candidates.sort(
            key=lambda c: health_metrics.get(
                c.artifact_id, HealthMetrics(artifact_id=c.artifact_id)
            ).health_score,
            reverse=True
        )
        
        return candidates[:10]  # Top 10
