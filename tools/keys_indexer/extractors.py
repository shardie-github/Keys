"""Extractors for different artifact types."""

import json
import re
from pathlib import Path
from typing import Any

import nbformat

from .models import ArtifactType, Dependency, KnowledgeArtifact, RunnableStatus


class ArtifactExtractor:
    """Extract metadata from knowledge artifacts."""
    
    def __init__(self, repo_root: Path):
        self.repo_root = repo_root
        self._dependency_cache: dict[str, list[Dependency]] = {}
    
    def extract(self, path: Path) -> KnowledgeArtifact | None:
        """Extract metadata from an artifact file."""
        if not path.exists():
            return None
        
        suffix = path.suffix.lower()
        
        if suffix == ".ipynb":
            return self._extract_notebook(path)
        elif suffix == ".md":
            return self._extract_runbook(path)
        elif suffix == ".py":
            return self._extract_script(path)
        elif suffix in [".ts", ".js", ".json", ".yaml", ".yml"]:
            return self._extract_template(path)
        
        return None
    
    def _extract_notebook(self, path: Path) -> KnowledgeArtifact:
        """Extract metadata from Jupyter notebook."""
        with open(path, "r", encoding="utf-8") as f:
            nb = nbformat.read(f, as_version=4)
        
        title = "Untitled Notebook"
        purpose = ""
        language = "python"
        runtime = ""
        inputs = []
        outputs = []
        dependencies = []
        execution_count = 0
        
        # Extract from first markdown cell (usually title)
        for cell in nb.cells:
            if cell.cell_type == "markdown":
                lines = cell.source.split("\n")
                if lines and lines[0].startswith("#"):
                    title = lines[0].lstrip("# ").strip()
                    purpose = "\n".join(lines[1:]).strip()
                    break
        
        # Extract from kernel metadata
        if nb.metadata.get("kernelspec"):
            runtime = nb.metadata["kernelspec"].get("display_name", "")
            language = nb.metadata["kernelspec"].get("language", "python")
        
        # Extract language info
        if nb.metadata.get("language_info"):
            lang_info = nb.metadata["language_info"]
            language = lang_info.get("name", language)
            runtime = lang_info.get("version", runtime)
        
        # Count code cells and extract dependencies from imports
        code_cells = [c for c in nb.cells if c.cell_type == "code"]
        execution_count = len(code_cells)
        
        all_imports = set()
        for cell in code_cells:
            imports = self._extract_imports(cell.source, language)
            all_imports.update(imports)
        
        dependencies = [Dependency(name=i, source="auto-detected") for i in sorted(all_imports)]
        
        # Check for outputs in the last cells
        for cell in reversed(code_cells):
            if cell.outputs:
                for output in cell.outputs:
                    if output.get("output_type") == "execute_result":
                        outputs.append("execution_result")
                        break
        
        artifact_id = self._generate_id(path)
        
        return KnowledgeArtifact(
            id=artifact_id,
            path=path.relative_to(self.repo_root),
            type=ArtifactType.NOTEBOOK,
            title=title,
            purpose=purpose[:500],  # Truncate long purposes
            language=language,
            runtime=runtime,
            inputs=inputs,
            outputs=outputs,
            dependencies=dependencies,
            metadata={
                "cell_count": len(nb.cells),
                "code_cell_count": execution_count,
                "markdown_cell_count": len(nb.cells) - execution_count,
            },
            tags=["notebook", language],
        )
    
    def _extract_runbook(self, path: Path) -> KnowledgeArtifact:
        """Extract metadata from runbook (markdown)."""
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        title = path.stem.replace("-", " ").title()
        purpose = ""
        inputs = []
        outputs = []
        
        # Extract title from first heading
        lines = content.split("\n")
        for line in lines:
            if line.startswith("# "):
                title = line[2:].strip()
                break
        
        # Extract purpose from scope or first paragraph
        scope_match = re.search(r"## Scope\s*\n(.*?)(?=\n## |$)", content, re.DOTALL)
        if scope_match:
            purpose = scope_match.group(1).strip()[:500]
        
        # Extract inputs from When to Use section
        when_use_match = re.search(r"## When to Use.*?\n(.*?)(?=\n## |$)", content, re.DOTALL)
        if when_use_match:
            bullet_points = re.findall(r"- (.+)", when_use_match.group(1))
            inputs = bullet_points[:5]
        
        # Extract code blocks as dependencies/commands
        code_blocks = re.findall(r"```(\w+)?\n(.*?)```", content, re.DOTALL)
        languages = set()
        for lang, _ in code_blocks:
            if lang:
                languages.add(lang)
        
        # Detect dependencies from code blocks
        dependencies = []
        for lang, code in code_blocks:
            if lang in ["bash", "sh", "shell"]:
                deps = self._extract_cli_tools(code)
                dependencies.extend([Dependency(name=d, source="auto-detected") for d in deps])
        
        artifact_id = self._generate_id(path)
        
        return KnowledgeArtifact(
            id=artifact_id,
            path=path.relative_to(self.repo_root),
            type=ArtifactType.RUNBOOK,
            title=title,
            purpose=purpose,
            language="markdown",
            runtime="procedural",
            inputs=inputs,
            outputs=outputs,
            dependencies=dependencies,
            metadata={
                "code_block_count": len(code_blocks),
                "languages_detected": list(languages),
                "has_verification": "## Verification" in content,
                "has_rollback": "## Rollback" in content or "## Rollback / Escalation" in content,
            },
            tags=["runbook", "operational"],
        )
    
    def _extract_script(self, path: Path) -> KnowledgeArtifact:
        """Extract metadata from Python script."""
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        title = path.stem.replace("_", " ").title()
        purpose = ""
        
        # Extract docstring
        docstring_match = re.search(r'^\s*"""(.*?)"""', content, re.DOTALL)
        if docstring_match:
            purpose = docstring_match.group(1).strip()[:500]
            lines = purpose.split("\n")
            if lines:
                title = lines[0].strip()
        
        # Extract imports
        imports = self._extract_imports(content, "python")
        dependencies = [Dependency(name=i, source="auto-detected") for i in sorted(imports)]
        
        # Check for CLI arguments (inputs)
        inputs = []
        if "argparse" in content or "sys.argv" in content:
            inputs.append("command_line_arguments")
        if "input(" in content:
            inputs.append("user_input")
        if "open(" in content and "'r'" in content:
            inputs.append("file_input")
        
        # Check for outputs
        outputs = []
        if "print(" in content or "logging" in content:
            outputs.append("stdout")
        if "open(" in content and "'w'" in content:
            outputs.append("file_output")
        if "json.dump" in content:
            outputs.append("json_output")
        
        artifact_id = self._generate_id(path)
        
        return KnowledgeArtifact(
            id=artifact_id,
            path=path.relative_to(self.repo_root),
            type=ArtifactType.SCRIPT,
            title=title,
            purpose=purpose,
            language="python",
            runtime="python3",
            inputs=inputs,
            outputs=outputs,
            dependencies=dependencies,
            tags=["script", "executable"],
        )
    
    def _extract_template(self, path: Path) -> KnowledgeArtifact:
        """Extract metadata from template files."""
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        title = path.stem.replace("-", " ").title()
        suffix = path.suffix.lower()
        language = suffix.lstrip(".")
        
        artifact_id = self._generate_id(path)
        
        return KnowledgeArtifact(
            id=artifact_id,
            path=path.relative_to(self.repo_root),
            type=ArtifactType.TEMPLATE,
            title=title,
            purpose=f"Template file for {language}",
            language=language,
            runtime="template",
            tags=["template", language],
        )
    
    def _extract_imports(self, code: str, language: str) -> set[str]:
        """Extract import statements from code."""
        imports = set()
        
        if language == "python":
            # Match 'import X' and 'from X import Y'
            import_patterns = [
                r"^import\s+([a-zA-Z_][a-zA-Z0-9_]*)",
                r"^from\s+([a-zA-Z_][a-zA-Z0-9_]*)",
            ]
            for pattern in import_patterns:
                for match in re.finditer(pattern, code, re.MULTILINE):
                    imports.add(match.group(1))
        
        return imports
    
    def _extract_cli_tools(self, code: str) -> set[str]:
        """Extract CLI tool references from shell code."""
        tools = set()
        common_tools = [
            "psql", "mysql", "curl", "wget", "jq", "grep", "awk", "sed",
            "docker", "kubectl", "aws", "gcloud", "az", "terraform",
            "npm", "node", "python", "pip", "git", "ssh", "scp",
            "supabase", "stripe", "vercel", "netlify", "flyctl",
        ]
        
        for tool in common_tools:
            if re.search(rf"\b{tool}\b", code):
                tools.add(tool)
        
        return tools
    
    def _generate_id(self, path: Path) -> str:
        """Generate unique ID from path."""
        parts = list(path.relative_to(self.repo_root).parts)
        parts[-1] = Path(parts[-1]).stem  # Remove extension
        return "_".join(parts).replace("-", "_").lower()
    
    def load_declared_dependencies(self, requirements_path: Path) -> list[Dependency]:
        """Load dependencies from requirements.txt or similar."""
        if not requirements_path.exists():
            return []
        
        cache_key = str(requirements_path)
        if cache_key in self._dependency_cache:
            return self._dependency_cache[cache_key]
        
        dependencies = []
        with open(requirements_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                
                # Parse package==version or package>=version
                match = re.match(r"^([a-zA-Z0-9_-]+)([<>=!~]+)?([\w.]+)?", line)
                if match:
                    name = match.group(1)
                    version = match.group(3) if match.group(3) else None
                    dependencies.append(Dependency(name=name, version=version, source="declared"))
        
        self._dependency_cache[cache_key] = dependencies
        return dependencies
