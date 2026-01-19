import os
import shutil
from typing import Any


def detect() -> dict[str, Any]:
    git_path = shutil.which("git")
    return {
        "name": "github",
        "available": git_path is not None,
        "details": {
            "git": git_path,
            "github_actions": os.getenv("GITHUB_ACTIONS", "false"),
            "repository": os.getenv("GITHUB_REPOSITORY"),
        },
    }


def commands() -> list[dict[str, str]]:
    return [
        {"name": "git-version", "command": "git --version"},
    ]


def collect_artifacts(output_dir: str) -> list[str]:
    return [output_dir]
