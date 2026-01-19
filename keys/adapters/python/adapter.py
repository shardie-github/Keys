import shutil
import sys
from typing import Any


def detect() -> dict[str, Any]:
    python_path = shutil.which("python3") or shutil.which("python")
    return {
        "name": "python",
        "available": python_path is not None,
        "details": {
            "executable": python_path,
            "version": sys.version.split(" ")[0],
        },
    }


def commands() -> list[dict[str, str]]:
    return [
        {"name": "python-version", "command": "python --version"},
        {"name": "pip-version", "command": "python -m pip --version"},
    ]


def collect_artifacts(output_dir: str) -> list[str]:
    return [output_dir]
