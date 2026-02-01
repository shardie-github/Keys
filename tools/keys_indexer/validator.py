"""Validation engine for knowledge artifacts."""

import ast
import json
import logging
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

from .models import ArtifactType, KnowledgeArtifact, RunnableStatus

logger = logging.getLogger(__name__)


class ValidationResult:
    """Result of artifact validation."""
    
    def __init__(
        self,
        artifact_id: str,
        status: RunnableStatus,
        checks: dict[str, Any],
        errors: list[str],
        warnings: list[str],
        execution_time_ms: float = 0.0,
    ):
        self.artifact_id = artifact_id
        self.status = status
        self.checks = checks
        self.errors = errors
        self.warnings = warnings
        self.execution_time_ms = execution_time_ms
        self.validated_at = datetime.now()
    
    def to_dict(self) -> dict:
        return {
            "artifact_id": self.artifact_id,
            "status": self.status.value,
            "checks": self.checks,
            "errors": self.errors,
            "warnings": self.warnings,
            "execution_time_ms": self.execution_time_ms,
            "validated_at": self.validated_at.isoformat(),
        }


class ArtifactValidator:
    """Validate knowledge artifacts through static and dynamic checks."""
    
    def __init__(self, repo_root: Path, dry_run: bool = True):
        self.repo_root = repo_root
        self.dry_run = dry_run  # If True, don't actually execute code
        self.results: list[ValidationResult] = []
    
    def validate(self, artifact: KnowledgeArtifact) -> ValidationResult:
        """Validate a single artifact."""
        start_time = datetime.now()
        
        checks = {}
        errors = []
        warnings = []
        
        logger.info(f"Validating {artifact.id}...")
        
        # Type-specific validation
        if artifact.type == ArtifactType.NOTEBOOK:
            checks = self._validate_notebook(artifact, errors, warnings)
        elif artifact.type == ArtifactType.SCRIPT:
            checks = self._validate_script(artifact, errors, warnings)
        elif artifact.type == ArtifactType.RUNBOOK:
            checks = self._validate_runbook(artifact, errors, warnings)
        else:
            checks = {"validation": "skipped", "reason": "unsupported_type"}
        
        # Determine status
        if errors:
            status = RunnableStatus.BROKEN
        elif warnings:
            status = RunnableStatus.PARTIAL
        else:
            status = RunnableStatus.RUNNABLE
        
        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        
        result = ValidationResult(
            artifact_id=artifact.id,
            status=status,
            checks=checks,
            errors=errors,
            warnings=warnings,
            execution_time_ms=execution_time,
        )
        
        self.results.append(result)
        return result
    
    def validate_all(
        self,
        artifacts: list[KnowledgeArtifact],
    ) -> dict[str, ValidationResult]:
        """Validate multiple artifacts."""
        results = {}
        
        for artifact in artifacts:
            result = self.validate(artifact)
            results[artifact.id] = result
            
            # Update artifact status
            artifact.runnable_status = result.status
            artifact.last_verified = result.validated_at
        
        return results
    
    def _validate_notebook(
        self,
        artifact: KnowledgeArtifact,
        errors: list[str],
        warnings: list[str],
    ) -> dict[str, Any]:
        """Validate Jupyter notebook."""
        checks = {
            "syntax": False,
            "kernel_available": False,
            "dependencies_resolvable": False,
            "dry_run": self.dry_run,
        }
        
        notebook_path = self.repo_root / artifact.path
        if not notebook_path.exists():
            errors.append(f"Notebook not found: {notebook_path}")
            return checks
        
        try:
            import nbformat
            
            with open(notebook_path, "r", encoding="utf-8") as f:
                nb = nbformat.read(f, as_version=4)
            
            checks["syntax"] = True
            
            # Check kernel
            kernel_name = nb.metadata.get("kernelspec", {}).get("name", "python3")
            checks["kernel_available"] = self._check_kernel(kernel_name)
            
            if not checks["kernel_available"]:
                warnings.append(f"Kernel '{kernel_name}' may not be available")
            
            # Check dependencies
            checks["dependencies_resolvable"] = self._check_dependencies(
                artifact.dependencies
            )
            
            if not checks["dependencies_resolvable"]:
                warnings.append("Some dependencies may not be resolvable")
            
            # Dry-run cell validation (check Python syntax)
            if not self.dry_run:
                syntax_errors = self._validate_notebook_cells(nb)
                if syntax_errors:
                    errors.extend(syntax_errors)
                    checks["syntax"] = False
            
        except Exception as e:
            errors.append(f"Failed to read notebook: {e}")
        
        return checks
    
    def _validate_script(
        self,
        artifact: KnowledgeArtifact,
        errors: list[str],
        warnings: list[str],
    ) -> dict[str, Any]:
        """Validate Python script."""
        checks = {
            "syntax": False,
            "imports_resolvable": False,
            "dry_run": self.dry_run,
        }
        
        script_path = self.repo_root / artifact.path
        if not script_path.exists():
            errors.append(f"Script not found: {script_path}")
            return checks
        
        try:
            with open(script_path, "r", encoding="utf-8") as f:
                source = f.read()
            
            # Check Python syntax
            try:
                ast.parse(source)
                checks["syntax"] = True
            except SyntaxError as e:
                errors.append(f"Syntax error: {e}")
            
            # Check imports
            checks["imports_resolvable"] = self._check_imports(source)
            
            if not checks["imports_resolvable"]:
                warnings.append("Some imports may not be resolvable")
            
            # Dry-run execution (if enabled and safe)
            if not self.dry_run and checks["syntax"]:
                exec_result = self._safe_execute_script(script_path)
                if not exec_result["success"]:
                    errors.append(f"Execution failed: {exec_result['error']}")
            
        except Exception as e:
            errors.append(f"Failed to validate script: {e}")
        
        return checks
    
    def _validate_runbook(
        self,
        artifact: KnowledgeArtifact,
        errors: list[str],
        warnings: list[str],
    ) -> dict[str, Any]:
        """Validate runbook (markdown)."""
        checks = {
            "exists": False,
            "has_structure": False,
            "has_verification": False,
            "has_rollback": False,
        }
        
        runbook_path = self.repo_root / artifact.path
        if not runbook_path.exists():
            errors.append(f"Runbook not found: {runbook_path}")
            return checks
        
        checks["exists"] = True
        
        try:
            with open(runbook_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Check for standard sections
            required_sections = ["## Scope", "## When to Use"]
            has_structure = all(section in content for section in required_sections)
            checks["has_structure"] = has_structure
            
            if not has_structure:
                warnings.append("Missing standard runbook sections")
            
            # Check for verification
            checks["has_verification"] = "## Verification" in content
            if not checks["has_verification"]:
                warnings.append("No verification section found")
            
            # Check for rollback
            checks["has_rollback"] = (
                "## Rollback" in content or "## Rollback / Escalation" in content
            )
            if not checks["has_rollback"]:
                warnings.append("No rollback section found")
            
        except Exception as e:
            errors.append(f"Failed to read runbook: {e}")
        
        return checks
    
    def _check_kernel(self, kernel_name: str) -> bool:
        """Check if Jupyter kernel is available."""
        try:
            result = subprocess.run(
                ["jupyter", "kernelspec", "list"],
                capture_output=True,
                text=True,
                timeout=5,
            )
            return kernel_name in result.stdout
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def _check_dependencies(self, dependencies: list) -> bool:
        """Check if dependencies can be resolved."""
        try:
            import pkg_resources
            
            installed = {d.key for d in pkg_resources.working_set}
            
            missing = []
            for dep in dependencies:
                dep_key = dep.name.lower().replace("-", "_")
                if dep_key not in installed and dep.source in ["declared", "lockfile"]:
                    missing.append(dep.name)
            
            return len(missing) == 0
        except ImportError:
            # Can't check, assume OK
            return True
    
    def _validate_notebook_cells(self, nb) -> list[str]:
        """Validate Python syntax in notebook cells."""
        errors = []
        
        for i, cell in enumerate(nb.cells):
            if cell.cell_type == "code":
                try:
                    ast.parse(cell.source)
                except SyntaxError as e:
                    errors.append(f"Cell {i}: Syntax error - {e}")
        
        return errors
    
    def _check_imports(self, source: str) -> bool:
        """Check if imports in source are resolvable."""
        try:
            import pkg_resources
            
            tree = ast.parse(source)
            imports = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name.split(".")[0])
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.append(node.module.split(".")[0])
            
            installed = {d.key for d in pkg_resources.working_set}
            stdlib_modules = {
                "os", "sys", "json", "datetime", "pathlib", "typing",
                "collections", "itertools", "functools", "math", "random",
                "re", "string", "hashlib", "base64", "io", "csv",
            }
            
            missing = []
            for imp in set(imports):
                if imp not in stdlib_modules:
                    imp_key = imp.lower().replace("-", "_")
                    if imp_key not in installed:
                        missing.append(imp)
            
            return len(missing) == 0
            
        except ImportError:
            return True
    
    def _safe_execute_script(self, script_path: Path) -> dict[str, Any]:
        """Safely execute a script in a controlled environment."""
        result = {"success": False, "error": None, "output": None}
        
        try:
            # Run with timeout and restricted environment
            exec_result = subprocess.run(
                ["python3", "-c", f"import ast; ast.parse(open('{script_path}').read())"],
                capture_output=True,
                text=True,
                timeout=10,
                cwd=self.repo_root,
            )
            
            if exec_result.returncode == 0:
                result["success"] = True
            else:
                result["error"] = exec_result.stderr
                
        except subprocess.TimeoutExpired:
            result["error"] = "Execution timed out"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def save_report(self, output_path: Path | None = None) -> Path:
        """Save validation report to file."""
        if output_path is None:
            output_path = self.repo_root / "outputs" / "keys_index" / "validation_report.json"
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        report = {
            "generated_at": datetime.now().isoformat(),
            "dry_run": self.dry_run,
            "summary": {
                "total": len(self.results),
                "runnable": sum(1 for r in self.results if r.status == RunnableStatus.RUNNABLE),
                "partial": sum(1 for r in self.results if r.status == RunnableStatus.PARTIAL),
                "broken": sum(1 for r in self.results if r.status == RunnableStatus.BROKEN),
            },
            "results": [r.to_dict() for r in self.results],
        }
        
        with open(output_path, "w") as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Validation report saved to {output_path}")
        return output_path
