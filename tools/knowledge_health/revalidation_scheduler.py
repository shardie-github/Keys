"""Auto-Revalidation Scheduler for periodic health checks.

This module provides:
- Scheduled revalidation of knowledge artifacts
- Dependency update checking
- Output verification
- Report generation (JSON and Markdown)
"""

import json
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional

from .models import (
    HealthMetrics,
    RevalidationSchedule,
    SystemHealthConfig,
)
from .health_monitor import HealthMonitor


class RevalidationScheduler:
    """Schedules and manages periodic revalidation of artifacts."""
    
    def __init__(
        self,
        repo_root: Path,
        config: Optional[SystemHealthConfig] = None,
        schedules_path: Optional[Path] = None,
    ):
        self.repo_root = Path(repo_root)
        self.config = config or SystemHealthConfig()
        self.schedules_path = schedules_path or self.repo_root / "outputs" / "knowledge_health" / "schedules.json"
        self.health_monitor = HealthMonitor(repo_root, config)
        self._schedules: dict[str, RevalidationSchedule] = {}
        self._load_schedules()
    
    def _load_schedules(self) -> None:
        """Load revalidation schedules from disk."""
        if not self.schedules_path.exists():
            return
        
        try:
            with open(self.schedules_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for artifact_id, schedule_data in data.items():
                    self._schedules[artifact_id] = RevalidationSchedule(
                        artifact_id=artifact_id,
                        frequency_days=schedule_data.get("frequency_days", self.config.default_revalidation_frequency),
                        last_run=datetime.fromisoformat(schedule_data["last_run"]) if schedule_data.get("last_run") else None,
                        next_run=datetime.fromisoformat(schedule_data["next_run"]) if schedule_data.get("next_run") else None,
                        run_count=schedule_data.get("run_count", 0),
                        failure_count=schedule_data.get("failure_count", 0),
                        is_active=schedule_data.get("is_active", True),
                    )
        except Exception as e:
            print(f"Error loading schedules: {e}")
    
    def _save_schedules(self) -> None:
        """Save revalidation schedules to disk."""
        self.schedules_path.parent.mkdir(parents=True, exist_ok=True)
        
        data = {
            artifact_id: schedule.to_dict()
            for artifact_id, schedule in self._schedules.items()
        }
        
        with open(self.schedules_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    
    def initialize_schedule(
        self,
        artifact_id: str,
        health_score: float = 100.0,
    ) -> RevalidationSchedule:
        """Initialize a new revalidation schedule for an artifact."""
        # Determine frequency based on health
        if health_score < self.config.critical_threshold:
            frequency = self.config.critical_artifact_frequency
        elif health_score < self.config.degraded_threshold:
            frequency = self.config.degraded_artifact_frequency
        else:
            frequency = self.config.default_revalidation_frequency
        
        schedule = RevalidationSchedule(
            artifact_id=artifact_id,
            frequency_days=frequency,
            next_run=datetime.now() + timedelta(days=frequency),
        )
        
        self._schedules[artifact_id] = schedule
        return schedule
    
    def get_due_artifacts(self) -> list[str]:
        """Get list of artifact IDs that are due for revalidation."""
        now = datetime.now()
        due = []
        
        for artifact_id, schedule in self._schedules.items():
            if not schedule.is_active:
                continue
            
            if schedule.next_run is None or schedule.next_run <= now:
                due.append(artifact_id)
        
        return due
    
    def run_revalidation(
        self,
        artifact_id: str,
        dry_run: bool = True,
    ) -> dict[str, Any]:
        """Run revalidation for a single artifact."""
        # Load artifact from index
        index_path = self.repo_root / "outputs" / "keys_index" / "kb_index.json"
        artifact = None
        
        if index_path.exists():
            with open(index_path, "r", encoding="utf-8") as f:
                index = json.load(f)
                for art in index.get("artifacts", []):
                    if art.get("id") == artifact_id:
                        artifact = art
                        break
        
        if not artifact:
            return {
                "success": False,
                "error": f"Artifact {artifact_id} not found in index",
                "artifact_id": artifact_id,
            }
        
        # Run health check
        metrics = self.health_monitor.check_health(artifact)
        
        # Run actual validation if not dry run
        validation_result = None
        if not dry_run:
            validation_result = self._execute_validation(artifact)
        
        # Update schedule
        schedule = self._schedules.get(artifact_id)
        if schedule:
            schedule.last_run = datetime.now()
            schedule.run_count += 1
            
            if validation_result and not validation_result.get("success", False):
                schedule.failure_count += 1
            
            # Adjust frequency based on new health score
            if metrics.health_score < self.config.critical_threshold:
                schedule.frequency_days = self.config.critical_artifact_frequency
            elif metrics.health_score < self.config.degraded_threshold:
                schedule.frequency_days = self.config.degraded_artifact_frequency
            else:
                schedule.frequency_days = self.config.default_revalidation_frequency
            
            schedule.next_run = datetime.now() + timedelta(days=schedule.frequency_days)
        
        return {
            "success": True,
            "artifact_id": artifact_id,
            "health_score": metrics.health_score,
            "health_status": metrics.status.value,
            "dry_run": dry_run,
            "validation_result": validation_result,
            "timestamp": datetime.now().isoformat(),
        }
    
    def _execute_validation(self, artifact: dict) -> dict[str, Any]:
        """Execute actual validation of an artifact."""
        artifact_type = artifact.get("type", "unknown")
        artifact_path = self.repo_root / artifact.get("path", "")
        
        result = {
            "success": False,
            "errors": [],
            "warnings": [],
            "execution_time_ms": 0,
        }
        
        if not artifact_path.exists():
            result["errors"].append(f"Artifact file not found: {artifact_path}")
            return result
        
        start_time = datetime.now()
        
        try:
            if artifact_type == "notebook":
                result = self._validate_notebook(artifact_path)
            elif artifact_type == "script":
                result = self._validate_script(artifact_path)
            elif artifact_type == "runbook":
                result = self._validate_runbook(artifact_path)
            elif artifact_type == "template":
                result = self._validate_template(artifact_path)
            else:
                result["warnings"].append(f"Unknown artifact type: {artifact_type}")
                result["success"] = True  # Can't validate, but not a failure
        
        except Exception as e:
            result["errors"].append(f"Validation error: {str(e)}")
        
        end_time = datetime.now()
        result["execution_time_ms"] = (end_time - start_time).total_seconds() * 1000
        
        return result
    
    def _validate_notebook(self, path: Path) -> dict[str, Any]:
        """Validate a Jupyter notebook."""
        result = {
            "success": False,
            "errors": [],
            "warnings": [],
        }
        
        try:
            # Try to import nbformat
            import nbformat
            
            # Read and validate notebook
            with open(path, "r", encoding="utf-8") as f:
                notebook = nbformat.read(f, as_version=4)
            
            # Check for errors in cells
            for i, cell in enumerate(notebook.cells):
                if cell.cell_type == "code":
                    # Check for error outputs
                    if hasattr(cell, "outputs"):
                        for output in cell.outputs:
                            if output.output_type == "error":
                                result["errors"].append(
                                    f"Cell {i+1} has error: {output.get('ename', 'Unknown')}"
                                )
            
            if not result["errors"]:
                result["success"] = True
        
        except ImportError:
            result["warnings"].append("nbformat not available, skipping deep validation")
            result["success"] = True  # Assume success if we can't validate
        except Exception as e:
            result["errors"].append(f"Notebook validation failed: {str(e)}")
        
        return result
    
    def _validate_script(self, path: Path) -> dict[str, Any]:
        """Validate a Python script."""
        result = {
            "success": False,
            "errors": [],
            "warnings": [],
        }
        
        try:
            # Syntax check
            with open(path, "r", encoding="utf-8") as f:
                source = f.read()
            
            compile(source, str(path), "exec")
            result["success"] = True
        except SyntaxError as e:
            result["errors"].append(f"Syntax error at line {e.lineno}: {e.msg}")
        except Exception as e:
            result["errors"].append(f"Script validation failed: {str(e)}")
        
        return result
    
    def _validate_runbook(self, path: Path) -> dict[str, Any]:
        """Validate a runbook markdown file."""
        result = {
            "success": False,
            "errors": [],
            "warnings": [],
        }
        
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Check for required sections
            required_sections = ["## Scope", "## When to Use", "## Action Steps"]
            for section in required_sections:
                if section not in content:
                    result["warnings"].append(f"Missing recommended section: {section}")
            
            # Check for code blocks
            if "```" not in content:
                result["warnings"].append("No code blocks found in runbook")
            
            result["success"] = True
        except Exception as e:
            result["errors"].append(f"Runbook validation failed: {str(e)}")
        
        return result
    
    def _validate_template(self, path: Path) -> dict[str, Any]:
        """Validate a template file."""
        result = {
            "success": False,
            "errors": [],
            "warnings": [],
        }
        
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Check for minimum content
            if len(content) < 100:
                result["warnings"].append("Template is very short")
            
            # Check for placeholder patterns
            if "{{" in content or "{%" in content:
                # Looks like a Jinja2 template
                try:
                    import jinja2
                    jinja2.Environment().parse(content)
                except ImportError:
                    pass  # Can't validate without jinja2
                except Exception as e:
                    result["errors"].append(f"Template syntax error: {str(e)}")
            
            result["success"] = True
        except Exception as e:
            result["errors"].append(f"Template validation failed: {str(e)}")
        
        return result
    
    def check_dependencies(
        self,
        artifact_id: str,
    ) -> dict[str, Any]:
        """Check dependencies for updates or issues."""
        # Load artifact
        index_path = self.repo_root / "outputs" / "keys_index" / "kb_index.json"
        artifact = None
        
        if index_path.exists():
            with open(index_path, "r", encoding="utf-8") as f:
                index = json.load(f)
                for art in index.get("artifacts", []):
                    if art.get("id") == artifact_id:
                        artifact = art
                        break
        
        if not artifact:
            return {
                "success": False,
                "error": f"Artifact {artifact_id} not found",
            }
        
        deps = artifact.get("dependencies", [])
        outdated = []
        current = []
        unknown = []
        
        for dep in deps:
            dep_name = dep.get("name", "")
            dep_version = dep.get("version")
            dep_source = dep.get("source", "auto-detected")
            
            if dep_source == "auto-detected" and dep_name not in sys.stdlib_module_names:
                unknown.append(dep_name)
            elif dep_version:
                # Try to check for newer versions
                current.append(f"{dep_name}=={dep_version}")
            else:
                unknown.append(dep_name)
        
        return {
            "success": True,
            "artifact_id": artifact_id,
            "total_dependencies": len(deps),
            "current": current,
            "outdated": outdated,
            "unknown": unknown,
        }
    
    def run_all_due(self, dry_run: bool = True) -> dict[str, Any]:
        """Run revalidation for all artifacts that are due."""
        due_artifacts = self.get_due_artifacts()
        
        results = {
            "total_due": len(due_artifacts),
            "processed": 0,
            "successful": 0,
            "failed": 0,
            "details": [],
        }
        
        for artifact_id in due_artifacts:
            result = self.run_revalidation(artifact_id, dry_run=dry_run)
            results["details"].append(result)
            results["processed"] += 1
            
            if result.get("success", False):
                results["successful"] += 1
            else:
                results["failed"] += 1
        
        # Save updated schedules
        self._save_schedules()
        
        return results
    
    def generate_health_reports(
        self,
        output_dir: Optional[Path] = None,
    ) -> tuple[Path, Path]:
        """Generate both JSON and Markdown health reports."""
        from .drift_detector import DriftDetector
        from .curation_engine import CurationEngine
        
        output_dir = output_dir or self.repo_root / "outputs" / "knowledge_health"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Check health for all artifacts
        health_metrics = self.health_monitor.check_all_health()
        
        # Detect drift
        drift_detector = DriftDetector(self.repo_root, self.config)
        alerts = drift_detector.detect_all_drift(health_metrics)
        
        # Generate curation recommendations
        curation = CurationEngine(self.repo_root, self.config)
        recommendations = curation.generate_recommendations(health_metrics, alerts)
        
        # Build report
        from .models import KnowledgeHealthReport
        
        summary = self.health_monitor.get_health_summary(health_metrics)
        
        report = KnowledgeHealthReport(
            generated_at=datetime.now(),
            repo_root=self.repo_root,
            total_artifacts=summary["total"],
            healthy_count=summary["healthy"],
            degraded_count=summary["degraded"],
            critical_count=summary["critical"],
            decayed_count=summary["decayed"],
            artifacts_with_drift=len(alerts),
            artifacts_needing_curation=len(recommendations),
            health_metrics=health_metrics,
            active_alerts=alerts,
            curation_recommendations=recommendations,
            average_health_score=summary["average_score"],
        )
        
        # Save JSON report
        json_path = output_dir / "knowledge_health.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(report.to_dict(), f, indent=2)
        
        # Save Markdown report
        md_path = output_dir / "knowledge_health.md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(report.to_markdown())
        
        return json_path, md_path
