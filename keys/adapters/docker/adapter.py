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
    docker_path = shutil.which("docker")
    return {
        "name": "docker",
        "available": docker_path is not None,
        "details": {
            "docker": _version(["docker", "--version"]) if docker_path else None,
        },
    }


def commands() -> list[dict[str, str]]:
    return [
        {"name": "docker-version", "command": "docker --version"},
    ]


def collect_artifacts(output_dir: str) -> list[str]:
    return [output_dir]
