"""Knowledge Health Monitor - Living Knowledge System for Keys.

A self-validating, self-updating knowledge health monitoring system that:
- Tracks artifact health metrics (dependencies, environment, relevance, execution)
- Detects knowledge drift (broken notebooks, outdated runbooks, deprecated APIs)
- Provides intelligent curation recommendations (archive, merge, refactor, promote)
- Generates health reports in JSON and Markdown
- Demonstrates decay detection and revalidation workflows

Quick Start:
    python -m tools.knowledge_health.cli check      # Run health check
    python -m tools.knowledge_health.cli drift      # Detect drift
    python -m tools.knowledge_health.cli report     # Generate report
    python -m tools.knowledge_health.cli demo       # Run demo

Modules:
    models                  - Data models for health metrics, alerts, recommendations
    health_monitor          - Core health monitoring and scoring
    drift_detector          - Knowledge drift detection engine
    curation_engine         - Intelligent curation recommendations
    revalidation_scheduler  - Auto-revalidation scheduling and reporting
    cli                     - Command-line interface

Example:
    from tools.knowledge_health import HealthMonitor, SystemHealthConfig
    from pathlib import Path
    
    config = SystemHealthConfig()
    monitor = HealthMonitor(Path("."), config)
    
    # Check all artifacts
    health_metrics = monitor.check_all_health()
    
    # Get summary
    summary = monitor.get_health_summary(health_metrics)
    print(f"Average health score: {summary['average_score']:.1f}")
"""

from .models import (
    # Health Status
    HealthStatus,
    DependencyStatus,
    EnvironmentStatus,
    RelevanceStatus,
    
    # Drift & Curation
    DriftType,
    CurationAction,
    
    # Health Components
    DependencyHealth,
    EnvironmentHealth,
    RelevanceHealth,
    ExecutionHistory,
    HealthMetrics,
    
    # Alerts & Recommendations
    DriftAlert,
    CurationRecommendation,
    
    # Reports & Config
    KnowledgeHealthReport,
    RevalidationSchedule,
    SystemHealthConfig,
)

from .health_monitor import HealthMonitor
from .drift_detector import DriftDetector
from .curation_engine import CurationEngine
from .revalidation_scheduler import RevalidationScheduler

__version__ = "1.0.0"
__all__ = [
    # Core classes
    "HealthMonitor",
    "DriftDetector",
    "CurationEngine",
    "RevalidationScheduler",
    
    # Configuration
    "SystemHealthConfig",
    
    # Status enums
    "HealthStatus",
    "DependencyStatus",
    "EnvironmentStatus",
    "RelevanceStatus",
    "DriftType",
    "CurationAction",
    
    # Data models
    "DependencyHealth",
    "EnvironmentHealth",
    "RelevanceHealth",
    "ExecutionHistory",
    "HealthMetrics",
    "DriftAlert",
    "CurationRecommendation",
    "KnowledgeHealthReport",
    "RevalidationSchedule",
]
