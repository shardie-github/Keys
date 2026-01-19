import shutil
import subprocess
from typing import Any


def _version(command: list[str]) -> str | None:
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        return result.stdout.strip() or result.stderr.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def detect() -> dict[str, Any]:
    node_path = shutil.which("node")
    npm_path = shutil.which("npm")
    tsc_path = shutil.which("tsc")
    return {
        "name": "node-typescript",
        "available": node_path is not None and npm_path is not None,
        "details": {
            "node": _version(["node", "--version"]) if node_path else None,
            "npm": _version(["npm", "--version"]) if npm_path else None,
            "tsc": _version(["tsc", "--version"]) if tsc_path else None,
        },
    }


def commands() -> list[dict[str, str]]:
    return [
        {"name": "node-version", "command": "node --version"},
        {"name": "npm-version", "command": "npm --version"},
        {"name": "tsc-version", "command": "tsc --version"},
    ]


def collect_artifacts(output_dir: str) -> list[str]:
    return [output_dir]
