# Knowledge Health Monitor

**Living Knowledge System for Keys**

A self-validating, self-updating knowledge health monitoring system that tracks artifact health, detects knowledge drift, and provides intelligent curation recommendations.

---

## Overview

The Knowledge Health Monitor transforms Keys from a static knowledge repository into a **Living Knowledge System** that:

- **Self-validates**: Continuously checks artifact health
- **Self-updates**: Tracks changes and detects drift
- **Self-curates**: Recommends archive, merge, refactor, and promotion actions
- **Flags decay**: Proactively identifies aging and broken artifacts

---

## Architecture

```
tools/knowledge_health/
├── __init__.py                 # Package exports
├── models.py                   # Data models (HealthMetrics, DriftAlert, etc.)
├── health_monitor.py           # Core health tracking and scoring
├── drift_detector.py           # Knowledge drift detection engine
├── curation_engine.py          # Intelligent curation recommendations
├── revalidation_scheduler.py   # Auto-revalidation and reporting
├── cli.py                      # Command-line interface
├── requirements.txt            # Dependencies
└── README.md                   # This file
```

---

## Quick Start

### Installation

```bash
# Install dependencies
pip install -r tools/knowledge_health/requirements.txt

# Or install with the indexer (recommended)
pip install -r tools/keys_indexer/requirements.txt
pip install nbformat
```

### Run Health Check

```bash
# Check health of all artifacts
python -m tools.knowledge_health.cli check

# Output:
# 📊 Health Check Results:
#    Total Artifacts: 708
#    Average Health Score: 78.5/100
#    
#    Status Distribution:
#       🟢 Healthy:   523 (73.9%)
#       🟡 Degraded:  145 (20.5%)
#       🔴 Critical:  35 (4.9%)
#       ⚫ Decayed:   5 (0.7%)
```

### Detect Knowledge Drift

```bash
# Detect all forms of drift
python -m tools.knowledge_health.cli drift

# Output:
# 📊 Drift Detection Results:
#    Total Alerts: 42
#       🔴 Critical: 8
#       🟡 Warnings: 24
#       🔵 Info: 10
```

### Generate Health Report

```bash
# Generate comprehensive report
python -m tools.knowledge_health.cli report

# Creates:
# outputs/knowledge_health/knowledge_health.json
# outputs/knowledge_health/knowledge_health.md
```

### Run Demonstration

```bash
# See decay detection and curation in action
python -m tools.knowledge_health.cli demo
```

---

## Features

### Phase 1: Knowledge Health Monitor

**Tracks:**
- Last successful execution
- Dependency rot (outdated/stale packages)
- Environment drift (Python version mismatches)
- Relevance decay (age, staleness, supersession)

**Assigns Health Score (0-100) based on:**
- Dependency health (30% weight)
- Environment compatibility (20% weight)
- Relevance status (25% weight)
- Execution history (25% weight)

**Health Status Levels:**
- 🟢 **Healthy** (80-100): Fully operational
- 🟡 **Degraded** (50-79): Functional but needs attention
- 🔴 **Critical** (20-49): Major issues, urgent action needed
- ⚫ **Decayed** (0-19): Severe issues, likely unusable

### Phase 2: Auto-Revalidation

**Scheduled Tasks:**
- Repro pack execution (validates artifacts run correctly)
- Dependency checks (identifies outdated packages)
- Output verification (confirms expected outputs)

**Frequency by Health:**
- Healthy: Weekly (default)
- Degraded: Every 3 days
- Critical: Daily

**Outputs:**
- `knowledge_health.json` - Machine-readable health data
- `knowledge_health.md` - Human-readable report

### Phase 3: Knowledge Drift Alerts

**Detects:**
- 🔴 **Broken notebooks** - Execution errors, syntax issues
- 🟡 **Outdated runbooks** - Missing sections, stale procedures
- 🟡 **Deprecated APIs** - Obsolete function calls, deprecated imports
- 🔵 **Superseded artifacts** - Duplicates, better alternatives available
- 🔴 **Missing dependencies** - Uninstalled or broken packages
- 🔴 **Environment drift** - Python version incompatibilities

### Phase 4: Curation Intelligence

**Recommends:**
- 📦 **Archive** - Move old/unused artifacts to archive
- 🔀 **Merge** - Combine similar or duplicate artifacts
- 🔄 **Refactor** - Major restructuring for broken artifacts
- ⭐ **Promote_Gold** - Elevate high-quality artifacts to gold standard
- 📝 **Update** - Minor refresh for stale content
- 👁️ **Review** - Manual review required

---

## Health Score Calculation

```
Health Score = (
    Dependency_Score × 0.30 +
    Environment_Score × 0.20 +
    Relevance_Score × 0.25 +
    Execution_Score × 0.25
)
```

### Dependency Score (0-100)

Penalties:
- Broken dependency: -30 points
- Stale dependency: -20 points
- Outdated dependency: -10 points
- Unknown dependency: -5 points

### Environment Score (0-100)

- Compatible: 100
- Drifted: 60
- Incompatible: 0
- Unknown: 75

### Relevance Score (0-100)

- Current: 100
- Aging: 80
- Stale: 50
- Superseded: 20
- Deprecated: 10

Penalties:
- >365 days since update: -10
- >180 days since verification: -5

### Execution Score (0-100)

Based on success rate with penalties for recent failures.

---

## CLI Reference

```bash
python -m tools.knowledge_health.cli [command] [options]

Commands:
  check       Run health check on all artifacts
  drift       Detect knowledge drift
  revalidate  Run revalidation for due artifacts
  curate      Generate curation recommendations
  report      Generate comprehensive health report
  demo        Run demonstration of decay detection

Options:
  --repo-root PATH       Repository root (default: .)
  --output-dir PATH      Output directory (default: outputs/knowledge_health)
  -v, --verbose          Enable verbose output

Revalidation Options:
  --artifact ID          Revalidate specific artifact
  --dry-run              Validate without executing (default)
  --no-dry-run           Actually execute code

Examples:
  # Check all artifacts
  python -m tools.knowledge_health.cli check

  # Detect drift with verbose output
  python -m tools.knowledge_health.cli drift -v

  # Revalidate specific artifact
  python -m tools.knowledge_health.cli revalidate --artifact <id>

  # Generate full report
  python -m tools.knowledge_health.cli report --output-dir ./reports
```

---

## Programmatic API

```python
from tools.knowledge_health import (
    HealthMonitor,
    DriftDetector,
    CurationEngine,
    RevalidationScheduler,
    SystemHealthConfig,
)
from pathlib import Path

# Initialize
config = SystemHealthConfig()
repo_root = Path(".")

# Check health
monitor = HealthMonitor(repo_root, config)
health_metrics = monitor.check_all_health()

# Get summary
summary = monitor.get_health_summary(health_metrics)
print(f"Average health: {summary['average_score']:.1f}")

# Detect drift
detector = DriftDetector(repo_root, config)
alerts = detector.detect_all_drift(health_metrics)
print(f"Found {len(alerts)} drift alerts")

# Get curation recommendations
curation = CurationEngine(repo_root, config)
recommendations = curation.generate_recommendations(health_metrics, alerts)

# Filter by action
archive_candidates = [r for r in recommendations if r.action.value == "archive"]

# Generate reports
scheduler = RevalidationScheduler(repo_root, config)
json_path, md_path = scheduler.generate_health_reports()
```

---

## Configuration

Create a custom configuration:

```python
from tools.knowledge_health import SystemHealthConfig

config = SystemHealthConfig(
    # Health score thresholds
    degraded_threshold=75.0,      # Below this is degraded
    critical_threshold=40.0,      # Below this is critical
    decayed_threshold=15.0,       # Below this is decayed
    
    # Aging thresholds (days)
    relevance_aging_days=60,      # When to flag as aging
    relevance_stale_days=120,     # When to flag as stale
    relevance_deprecated_days=300, # When to flag as deprecated
    
    # Revalidation frequency (days)
    default_revalidation_frequency=7,   # Weekly for healthy
    degraded_artifact_frequency=2,      # Every 2 days for degraded
    critical_artifact_frequency=1,      # Daily for critical
    
    # Scoring weights (must sum to 1.0)
    dependency_weight=0.35,
    environment_weight=0.15,
    relevance_weight=0.25,
    execution_weight=0.25,
)
```

---

## Output Files

### knowledge_health.json

```json
{
  "generated_at": "2026-01-31T20:00:00",
  "repo_root": "/path/to/Keys",
  "total_artifacts": 708,
  "healthy_count": 523,
  "degraded_count": 145,
  "critical_count": 35,
  "decayed_count": 5,
  "average_health_score": 78.5,
  "health_score_trend": "stable",
  "health_metrics": {
    "artifact_id": {
      "health_score": 85.0,
      "status": "healthy",
      "dependency_health": {...},
      "environment_health": {...},
      "relevance_health": {...},
      "execution_history": {...}
    }
  },
  "active_alerts": [...],
  "curation_recommendations": [...]
}
```

### knowledge_health.md

Human-readable report with:
- Executive summary
- Health distribution
- Active alerts table
- Curation recommendations
- Critical artifacts list

---

## Integration with CI/CD

Add to your GitHub Actions workflow:

```yaml
name: Knowledge Health Check

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  push:
    paths:
      - 'keys-assets/**'
      - 'node-keys/**'
      - 'runbook-keys/**'

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r tools/keys_indexer/requirements.txt
          pip install -r tools/knowledge_health/requirements.txt
      
      - name: Run health check
        run: python -m tools.knowledge_health.cli check
      
      - name: Detect drift
        run: python -m tools.knowledge_health.cli drift
      
      - name: Generate report
        run: python -m tools.knowledge_health.cli report
      
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: knowledge-health-report
          path: outputs/knowledge_health/
```

---

## Demo Output

```
======================================================================
🔬 KNOWLEDGE HEALTH SYSTEM - VERIFICATION DEMO
======================================================================

PHASE 1: DECAY DETECTION
----------------------------------------

📉 Simulated Decaying Artifact:
   ID: demo_decaying_artifact
   Health Score: 25/100 (CRITICAL)
   Dependencies: 3/5 stale
   Environment: drifted
   Relevance: stale (200 days old)
   Execution: 7/10 failures

   🔴 DECAY INDICATORS DETECTED:
      • Dependency: pandas 1.0.0 is outdated
      • Dependency: numpy 1.18.0 has security issues
      • Environment: Python version mismatch
      • Relevance: Content outdated

PHASE 2: REVALIDATION ATTEMPT
----------------------------------------
   ⚠️  Revalidation would fail due to:
      • Missing dependency 'deprecated_pkg'
      • Python version incompatibility
      • Outdated API calls
   📋 Recommended Action: REFACTOR (large effort)

PHASE 3: CURATION OUTPUT
----------------------------------------

   🎯 Curation Recommendations for Decaying Artifacts:

   1. ARCHIVE (High Priority)
      • demo_old_unused_artifact
        └─ Unused for 400+ days, consider archival

   2. REFACTOR (High Priority)
      • demo_decaying_artifact
        └─ Critical dependency failures, needs major rework

   3. UPDATE (Medium Priority)
      • demo_stale_notebook
        └─ Dependencies outdated, refresh recommended

   4. PROMOTE_GOLD (Low Priority)
      • demo_high_quality_pattern
        └─ Excellent health metrics, candidate for gold standard

======================================================================
✅ DEMO COMPLETE
======================================================================
```

---

## Troubleshooting

### No artifacts found

Run the indexer first:
```bash
python -m tools.keys_indexer.cli --index --validate
```

### Import errors (nbformat, jinja2)

Install optional dependencies:
```bash
pip install nbformat jinja2
```

### Large repository slow performance

Check health on subset:
```python
# Check only critical artifacts first
critical = [m for m in health_metrics.values() if m.health_score < 50]
```

---

## License

Private - All rights reserved
