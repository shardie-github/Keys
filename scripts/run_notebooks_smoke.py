import argparse
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import nbformat
from nbclient import NotebookClient
from nbclient.exceptions import CellExecutionError

NOTEBOOKS = [
    Path("keys-assets/jupyter-keys/jupyter-eda-workflows/notebooks/eda_workflow.ipynb"),
    Path(
        "keys-assets/jupyter-keys/jupyter-model-validation-patterns/notebooks/model_validation.ipynb"
    ),
    Path(
        "keys-assets/jupyter-keys/jupyter-production-ml-pipelines/notebooks/production_pipeline.ipynb"
    ),
]


def execute_notebook(path: Path, output_dir: Path, timeout: int) -> dict:
    started_at = time.time()
    output_path = output_dir / path.name
    os.environ.setdefault("KEYS_NOTEBOOK_DRY_RUN", "1")
    result = {
        "path": str(path),
        "output_path": str(output_path),
        "status": "success",
        "duration_seconds": 0.0,
        "error": None,
    }

    try:
        nb = nbformat.read(path, as_version=4)
        client = NotebookClient(
            nb,
            timeout=timeout,
            kernel_name="python3",
            allow_errors=False,
            resources={"metadata": {"path": str(path.parent)}},
        )
        client.execute()
        output_dir.mkdir(parents=True, exist_ok=True)
        nbformat.write(nb, output_path)
    except CellExecutionError as exc:
        result["status"] = "failed"
        result["error"] = str(exc)
    except Exception as exc:  # noqa: BLE001
        result["status"] = "failed"
        result["error"] = repr(exc)
    finally:
        result["duration_seconds"] = round(time.time() - started_at, 2)

    return result


def write_report(results: list[dict], report_dir: Path) -> tuple[Path, Path]:
    total = len(results)
    failed = [item for item in results if item["status"] != "success"]
    passed = total - len(failed)

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total": total,
        "passed": passed,
        "failed": len(failed),
        "results": results,
    }

    report_dir.mkdir(parents=True, exist_ok=True)
    json_path = report_dir / "smoke_report.json"
    md_path = report_dir / "smoke_report.md"

    json_path.write_text(json.dumps(report, indent=2))

    md_lines = [
        "# Notebook Smoke Report",
        "",
        f"Generated at: {report['generated_at']}",
        "",
        "| Notebook | Status | Duration (s) | Output |",
        "| --- | --- | --- | --- |",
    ]
    for item in results:
        md_lines.append(
            f"| {item['path']} | {item['status']} | {item['duration_seconds']} | {item['output_path']} |"
        )
    if failed:
        md_lines.extend(["", "## Failures", ""])
        for item in failed:
            md_lines.append(f"- {item['path']}: {item['error']}")

    md_path.write_text("\n".join(md_lines))

    return json_path, md_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Run notebook smoke suite")
    default_timeout = int(os.getenv("NOTEBOOK_SMOKE_TIMEOUT", "300"))
    parser.add_argument(
        "--timeout", type=int, default=default_timeout, help="Cell timeout in seconds"
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("outputs"),
        help="Root output directory",
    )
    args = parser.parse_args()

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    results = []

    for notebook in NOTEBOOKS:
        notebook_output_dir = args.output_root / notebook.stem / timestamp
        result = execute_notebook(notebook, notebook_output_dir, args.timeout)
        results.append(result)

    report_paths = write_report(results, args.output_root)
    print(f"Smoke report JSON: {report_paths[0]}")
    print(f"Smoke report MD: {report_paths[1]}")

    failures = [item for item in results if item["status"] != "success"]
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
