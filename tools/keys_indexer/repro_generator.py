"""Reproduction pack generator for knowledge artifacts."""

import hashlib
import json
import logging
import shutil
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any

from ..keys_indexer.models import ArtifactType, Dependency, KnowledgeArtifact, RunnableStatus

logger = logging.getLogger(__name__)


class ReproPackGenerator:
    """Generate reproducible execution bundles for knowledge artifacts."""
    
    def __init__(self, repo_root: Path, output_dir: Path | None = None):
        self.repo_root = repo_root
        self.output_dir = output_dir or repo_root / "outputs" / "repro_packs"
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate(
        self,
        artifact: KnowledgeArtifact,
        include_data_stubs: bool = True,
        dry_run: bool = False,
    ) -> Path | None:
        """Generate a reproduction pack for an artifact."""
        if artifact.type not in [ArtifactType.NOTEBOOK, ArtifactType.SCRIPT, ArtifactType.RUNBOOK]:
            logger.debug(f"Skipping {artifact.id}: not a runnable artifact")
            return None
        
        pack_dir = self._create_pack_directory(artifact)
        
        if dry_run:
            logger.info(f"[DRY-RUN] Would create pack at: {pack_dir}")
            return pack_dir
        
        # Copy source
        self._copy_source(artifact, pack_dir)
        
        # Generate dependency lock
        self._generate_lockfile(artifact, pack_dir)
        
        # Generate runner script
        self._generate_runner(artifact, pack_dir)
        
        # Create data stubs
        if include_data_stubs:
            self._create_data_stubs(artifact, pack_dir)
        
        # Generate manifest
        self._generate_manifest(artifact, pack_dir)
        
        # Create zip archive
        zip_path = self._create_zip(pack_dir)
        
        logger.info(f"Created repro pack: {zip_path}")
        return zip_path
    
    def generate_all(
        self,
        artifacts: list[KnowledgeArtifact],
        runnable_only: bool = True,
    ) -> dict[str, Path]:
        """Generate packs for all artifacts."""
        results = {}
        
        for artifact in artifacts:
            if runnable_only and artifact.runnable_status != RunnableStatus.RUNNABLE:
                logger.debug(f"Skipping {artifact.id}: not runnable")
                continue
            
            pack_path = self.generate(artifact)
            if pack_path:
                results[artifact.id] = pack_path
        
        logger.info(f"Generated {len(results)} reproduction packs")
        return results
    
    def _create_pack_directory(self, artifact: KnowledgeArtifact) -> Path:
        """Create the pack directory structure."""
        pack_name = f"{artifact.id}_repro"
        pack_dir = self.output_dir / pack_name
        
        if pack_dir.exists():
            shutil.rmtree(pack_dir)
        
        pack_dir.mkdir(parents=True)
        (pack_dir / "src").mkdir()
        (pack_dir / "data").mkdir()
        (pack_dir / "deps").mkdir()
        
        return pack_dir
    
    def _copy_source(self, artifact: KnowledgeArtifact, pack_dir: Path) -> None:
        """Copy the source artifact to the pack."""
        src_path = self.repo_root / artifact.path
        if not src_path.exists():
            logger.warning(f"Source not found: {src_path}")
            return
        
        dest_path = pack_dir / "src" / src_path.name
        
        if src_path.is_file():
            shutil.copy2(src_path, dest_path)
        elif src_path.is_dir():
            shutil.copytree(src_path, dest_path)
    
    def _generate_lockfile(self, artifact: KnowledgeArtifact, pack_dir: Path) -> None:
        """Generate dependency lock file."""
        lock_data = {
            "artifact_id": artifact.id,
            "generated_at": datetime.now().isoformat(),
            "language": artifact.language,
            "runtime": artifact.runtime,
            "dependencies": {},
            "sources": {},
        }
        
        for dep in artifact.dependencies:
            lock_data["dependencies"][dep.name] = {
                "version": dep.version,
                "source": dep.source,
            }
        
        # Try to resolve exact versions
        if artifact.language == "python":
            self._resolve_python_versions(lock_data, artifact)
        
        lock_path = pack_dir / "deps" / "lock.json"
        with open(lock_path, "w") as f:
            json.dump(lock_data, f, indent=2)
        
        # Also generate requirements.txt for Python
        if artifact.language == "python":
            req_path = pack_dir / "deps" / "requirements.txt"
            with open(req_path, "w") as f:
                for dep in artifact.dependencies:
                    if dep.version:
                        f.write(f"{dep.name}=={dep.version}\n")
                    else:
                        f.write(f"{dep.name}\n")
    
    def _resolve_python_versions(
        self,
        lock_data: dict,
        artifact: KnowledgeArtifact,
    ) -> None:
        """Attempt to resolve exact Python package versions."""
        try:
            import pkg_resources
            
            installed = {d.key: d.version for d in pkg_resources.working_set}
            
            for dep_name in lock_data["dependencies"]:
                key = dep_name.lower().replace("-", "_")
                if key in installed:
                    lock_data["dependencies"][dep_name]["resolved_version"] = installed[key]
                    lock_data["dependencies"][dep_name]["source"] = "resolved_from_env"
        except ImportError:
            logger.debug("pkg_resources not available, skipping version resolution")
    
    def _generate_runner(self, artifact: KnowledgeArtifact, pack_dir: Path) -> None:
        """Generate runner script for the artifact."""
        if artifact.type == ArtifactType.NOTEBOOK:
            runner = self._generate_notebook_runner(artifact)
        elif artifact.type == ArtifactType.SCRIPT:
            runner = self._generate_script_runner(artifact)
        elif artifact.type == ArtifactType.RUNBOOK:
            runner = self._generate_runbook_runner(artifact)
        else:
            return
        
        runner_path = pack_dir / "run.sh"
        with open(runner_path, "w") as f:
            f.write(runner)
        
        # Make executable on Unix
        import stat
        runner_path.chmod(runner_path.stat().st_mode | stat.S_IEXEC)
    
    def _generate_notebook_runner(self, artifact: KnowledgeArtifact) -> str:
        """Generate runner script for notebook."""
        src_file = Path(artifact.path).name
        
        return f"""#!/bin/bash
set -e

echo "=== Keys Reproduction Pack ==="
echo "Artifact: {artifact.id}"
echo "Title: {artifact.title}"
echo ""

# Check dependencies
echo "Checking dependencies..."
python3 --version

# Check if papermill is available for execution
if ! command -v papermill &> /dev/null; then
    echo "Warning: papermill not found. Install with: pip install papermill"
    echo "Notebook can be opened in Jupyter but not executed headlessly."
fi

# Install dependencies
echo "Installing dependencies..."
pip install -q -r deps/requirements.txt 2>/dev/null || echo "Some dependencies may need manual installation"

# Run notebook
echo ""
echo "Running notebook..."
if command -v papermill &> /dev/null; then
    papermill "src/{src_file}" "outputs/notebook_output.ipynb" --log-output
else
    echo "Open src/{src_file} in Jupyter Notebook/Lab to run interactively"
    echo "jupyter notebook src/{src_file}"
fi

echo ""
echo "=== Execution Complete ==="
echo "Outputs: outputs/"
echo "Check outputs/notebook_output.ipynb for results"
"""
    
    def _generate_script_runner(self, artifact: KnowledgeArtifact) -> str:
        """Generate runner script for Python script."""
        src_file = Path(artifact.path).name
        
        return f"""#!/bin/bash
set -e

echo "=== Keys Reproduction Pack ==="
echo "Artifact: {artifact.id}"
echo "Title: {artifact.title}"
echo ""

# Check dependencies
echo "Checking dependencies..."
python3 --version

# Install dependencies
echo "Installing dependencies..."
pip install -q -r deps/requirements.txt 2>/dev/null || echo "Some dependencies may need manual installation"

# Run script
echo ""
echo "Running script..."
python3 "src/{src_file}" "$@"

echo ""
echo "=== Execution Complete ==="
"""
    
    def _generate_runbook_runner(self, artifact: KnowledgeArtifact) -> str:
        """Generate runner script for runbook."""
        src_file = Path(artifact.path).name
        
        return f"""#!/bin/bash

echo "=== Keys Reproduction Pack ==="
echo "Artifact: {artifact.id}"
echo "Title: {artifact.title}"
echo "Type: Runbook (Manual Procedure)"
echo ""

echo "This is a runbook - a manual procedure document."
echo "Open and follow the instructions in:"
echo "  src/{src_file}"
echo ""
echo "The runbook contains:"
echo "  - Safety checks"
echo "  - Diagnosis steps"
echo "  - Action procedures"
echo "  - Verification steps"
echo ""
echo "Some steps may require manual execution of commands."
echo "Use deps/lock.json for dependency reference."
echo ""
echo "=== Open src/{src_file} to begin ==="
"""
    
    def _create_data_stubs(self, artifact: KnowledgeArtifact, pack_dir: Path) -> None:
        """Create data stub files based on artifact inputs."""
        data_dir = pack_dir / "data"
        
        for input_desc in artifact.inputs:
            if "file" in input_desc.lower():
                stub_file = data_dir / "input_data.stub"
                stub_file.write_text(
                    f"# Data Stub for: {input_desc}\n"
                    f"# Place your input data here\n"
                    f"# Expected by: {artifact.id}\n"
                )
        
        # Create README for data
        readme = data_dir / "README.md"
        readme.write_text(
            f"""# Data Directory

This directory should contain input data for: {artifact.id}

Expected Inputs:
{chr(10).join(f"- {inp}" for inp in artifact.inputs) if artifact.inputs else "- None specified"}

Expected Outputs:
{chr(10).join(f"- {out}" for out in artifact.outputs) if artifact.outputs else "- None specified"}

Place your data files here before running.
"""
        )
    
    def _generate_manifest(self, artifact: KnowledgeArtifact, pack_dir: Path) -> None:
        """Generate pack manifest."""
        manifest = {
            "artifact_id": artifact.id,
            "title": artifact.title,
            "type": artifact.type.value,
            "language": artifact.language,
            "generated_at": datetime.now().isoformat(),
            "structure": {
                "src": "Source artifact",
                "data": "Input/output data directory",
                "deps": "Dependency lock and requirements",
                "run.sh": "Execution script",
            },
            "execution": {
                "command": "./run.sh",
                "prerequisites": ["bash", artifact.runtime] if artifact.runtime else ["bash"],
            },
            "checksums": self._calculate_checksums(pack_dir),
        }
        
        manifest_path = pack_dir / "manifest.json"
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
    
    def _calculate_checksums(self, pack_dir: Path) -> dict[str, str]:
        """Calculate checksums for pack contents."""
        checksums = {}
        
        for path in pack_dir.rglob("*"):
            if path.is_file():
                rel_path = str(path.relative_to(pack_dir))
                checksums[rel_path] = self._hash_file(path)
        
        return checksums
    
    def _hash_file(self, path: Path) -> str:
        """Calculate SHA256 hash of file."""
        h = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    
    def _create_zip(self, pack_dir: Path) -> Path:
        """Create zip archive of pack."""
        zip_path = pack_dir.parent / f"{pack_dir.name}.zip"
        
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for path in pack_dir.rglob("*"):
                if path.is_file():
                    zf.write(path, path.relative_to(pack_dir.parent))
        
        return zip_path
