"""Data models for knowledge artifacts."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any


class ArtifactType(Enum):
    NOTEBOOK = "notebook"
    RUNBOOK = "runbook"
    SCRIPT = "script"
    TEMPLATE = "template"
    UNKNOWN = "unknown"


class RunnableStatus(Enum):
    RUNNABLE = "runnable"
    PARTIAL = "partially_runnable"
    BROKEN = "broken"
    UNKNOWN = "unknown"


@dataclass
class Dependency:
    name: str
    version: str | None = None
    source: str = "auto-detected"  # auto-detected, declared, lockfile


@dataclass
class KnowledgeArtifact:
    id: str
    path: Path
    type: ArtifactType
    title: str
    purpose: str = ""
    language: str = ""
    runtime: str = ""
    inputs: list[str] = field(default_factory=list)
    outputs: list[str] = field(default_factory=list)
    dependencies: list[Dependency] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    last_verified: datetime | None = None
    runnable_status: RunnableStatus = RunnableStatus.UNKNOWN
    execution_count: int = 0
    tags: list[str] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "path": str(self.path),
            "type": self.type.value,
            "title": self.title,
            "purpose": self.purpose,
            "language": self.language,
            "runtime": self.runtime,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "dependencies": [
                {"name": d.name, "version": d.version, "source": d.source}
                for d in self.dependencies
            ],
            "metadata": self.metadata,
            "last_verified": self.last_verified.isoformat() if self.last_verified else None,
            "runnable_status": self.runnable_status.value,
            "execution_count": self.execution_count,
            "tags": self.tags,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "KnowledgeArtifact":
        return cls(
            id=data["id"],
            path=Path(data["path"]),
            type=ArtifactType(data["type"]),
            title=data["title"],
            purpose=data.get("purpose", ""),
            language=data.get("language", ""),
            runtime=data.get("runtime", ""),
            inputs=data.get("inputs", []),
            outputs=data.get("outputs", []),
            dependencies=[
                Dependency(d["name"], d.get("version"), d.get("source", "auto-detected"))
                for d in data.get("dependencies", [])
            ],
            metadata=data.get("metadata", {}),
            last_verified=datetime.fromisoformat(data["last_verified"]) if data.get("last_verified") else None,
            runnable_status=RunnableStatus(data.get("runnable_status", "unknown")),
            execution_count=data.get("execution_count", 0),
            tags=data.get("tags", []),
        )
