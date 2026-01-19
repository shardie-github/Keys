import argparse
import json
import os
import shutil
import subprocess
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


CATALOG_PATH = Path("keys/catalog.json")
CONFIG_PATH = Path("keys/keys.config.json")
SCHEMA_PATH = Path("keys/catalog.schema.json")
ADAPTERS_PATH = Path("keys/adapters")


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text())


def load_catalog(path: Path) -> dict[str, Any]:
    data = load_json(path)
    if "entries" not in data:
        raise ValueError("Catalog is missing entries")
    return data


def load_config(path: Path) -> dict[str, Any]:
    data = load_json(path)
    if "profiles" not in data:
        raise ValueError("Config is missing profiles")
    return data


def get_profile(config: dict[str, Any], profile_name: str) -> dict[str, Any]:
    profile = config.get("profiles", {}).get(profile_name)
    if not profile:
        raise ValueError(f"Unknown profile: {profile_name}")
    return profile


def resolve_output_root(profile: dict[str, Any]) -> Path:
    override = os.getenv("KEYS_OUTPUT_DIR")
    return Path(override or profile["output_dir"]).resolve()


def ensure_output_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def ensure_within_root(root: Path, target: Path) -> None:
    if root not in target.parents and root != target:
        raise ValueError("Output path must be within the configured output directory")


def parse_query(query: str) -> list[tuple[str, str]]:
    tokens = []
    for raw in query.split():
        if ":" in raw:
            key, value = raw.split(":", 1)
            tokens.append((key.lower(), value))
        else:
            tokens.append(("text", raw))
    return tokens


def match_entry(entry: dict[str, Any], tokens: list[tuple[str, str]]) -> bool:
    haystack = " ".join(
        [entry.get("id", ""), entry.get("title", ""), entry.get("description", "")]
    ).lower()
    for key, value in tokens:
        if key == "text":
            if value.lower() not in haystack:
                return False
        elif key == "tag":
            if value not in entry.get("tags", []):
                return False
        elif key == "type":
            if entry.get("type") != value:
                return False
        elif key == "category":
            if entry.get("category") != value:
                return False
        elif key == "requires_network":
            desired = value.lower() == "true"
            if entry.get("requires_network") is not desired:
                return False
        elif key == "adapter":
            if value not in entry.get("adapters", []):
                return False
        elif key == "stack":
            if value not in entry.get("supported_stacks", []):
                return False
        elif key == "id":
            if entry.get("id") != value:
                return False
        else:
            return False
    return True


def load_adapters(allowed: list[str]) -> list[dict[str, Any]]:
    adapters = []
    for adapter_dir in ADAPTERS_PATH.iterdir():
        if not adapter_dir.is_dir():
            continue
        manifest_path = adapter_dir / "manifest.json"
        if not manifest_path.exists():
            continue
        manifest = load_json(manifest_path)
        name = manifest.get("name")
        if name not in allowed:
            continue
        module_path = adapter_dir / "adapter.py"
        if not module_path.exists():
            continue
        spec = import_module_from_path(module_path)
        if not hasattr(spec, "detect"):
            continue
        adapters.append({"name": name, "module": spec, "manifest": manifest})
    return adapters


def import_module_from_path(path: Path) -> Any:
    import importlib.util

    spec = importlib.util.spec_from_file_location(path.stem, path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load module at {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def execute_notebook(path: Path, output_dir: Path, timeout: int) -> dict[str, Any]:
    started_at = datetime.now(timezone.utc)
    output_path = output_dir / path.name
    os.environ.setdefault("KEYS_NOTEBOOK_DRY_RUN", "1")
    result = {
        "path": str(path),
        "output_path": str(output_path),
        "status": "success",
        "duration_seconds": 0.0,
        "error": None,
        "started_at": started_at.isoformat(),
    }

    import nbformat
    from nbclient import NotebookClient
    from nbclient.exceptions import CellExecutionError

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
        ended_at = datetime.now(timezone.utc)
        result["duration_seconds"] = round(
            (ended_at - started_at).total_seconds(), 2
        )

    return result


def validate_runbook(path: Path, output_dir: Path) -> dict[str, Any]:
    required_files = ["README.md", "checklist.md", "CHANGELOG.md", "pack.json"]
    missing = [file for file in required_files if not (path / file).exists()]
    pack_data = None
    error = None
    if not missing:
        pack_data = load_json(path / "pack.json")
    else:
        error = f"Missing files: {', '.join(missing)}"

    result = {
        "path": str(path),
        "status": "success" if not missing else "failed",
        "error": error,
        "pack": pack_data,
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "runbook_validation.json").write_text(json.dumps(result, indent=2))
    return result


def validate_template(path: Path, output_dir: Path) -> dict[str, Any]:
    error = None
    try:
        data = load_json(path)
        if "version" not in data or "entries" not in data:
            error = "Template missing required keys: version, entries"
    except json.JSONDecodeError as exc:
        error = str(exc)

    result = {
        "path": str(path),
        "status": "failed" if error else "success",
        "error": error,
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "template_validation.json").write_text(json.dumps(result, indent=2))
    return result


def write_keys_report(report: dict[str, Any], output_root: Path) -> tuple[Path, Path]:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    report_dir = output_root / "reports" / timestamp
    report_dir.mkdir(parents=True, exist_ok=True)
    json_path = report_dir / "keys_report.json"
    md_path = report_dir / "keys_report.md"

    json_path.write_text(json.dumps(report, indent=2))

    md_lines = ["# Keys Report", "", f"Generated at: {report['generated_at']}", ""]
    md_lines.append("## Summary")
    md_lines.append("")
    for key, value in report["summary"].items():
        md_lines.append(f"- {key}: {value}")
    md_lines.append("")
    md_lines.append("## Details")
    md_lines.append("")
    md_lines.append("```json")
    md_lines.append(json.dumps(report["details"], indent=2))
    md_lines.append("```")

    md_path.write_text("\n".join(md_lines))
    return json_path, md_path


def run_entry(entry: dict[str, Any], profile: dict[str, Any]) -> dict[str, Any]:
    entry_type = entry["type"]
    output_root = resolve_output_root(profile)
    ensure_output_dir(output_root)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    entry_output_dir = output_root / entry["id"] / timestamp
    ensure_within_root(output_root, entry_output_dir)

    if entry_type == "notebook":
        timeout = int(os.getenv("NOTEBOOK_SMOKE_TIMEOUT", profile["runner"]["timeout_seconds"]))
        result = execute_notebook(Path(entry["path"]), entry_output_dir, timeout)
        return {"result": result, "output_dir": str(entry_output_dir)}
    if entry_type == "runbook":
        result = validate_runbook(Path(entry["path"]), entry_output_dir)
        return {"result": result, "output_dir": str(entry_output_dir)}
    if entry_type == "template":
        result = validate_template(Path(entry["path"]), entry_output_dir)
        return {"result": result, "output_dir": str(entry_output_dir)}

    raise ValueError(f"Unsupported entry type: {entry_type}")


def run_verification(entry: dict[str, Any], profile: dict[str, Any]) -> dict[str, Any]:
    if profile["network_policy"] == "deny" and entry["requires_network"]:
        raise RuntimeError("Network usage is blocked by the selected profile")
    command = entry["verification_command"]
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return {
        "command": command,
        "exit_code": result.returncode,
        "stdout": result.stdout.strip(),
        "stderr": result.stderr.strip(),
    }


def command_list(args: argparse.Namespace) -> int:
    catalog = load_catalog(Path(args.catalog))
    entries = catalog["entries"]
    if args.query:
        tokens = parse_query(args.query)
        entries = [entry for entry in entries if match_entry(entry, tokens)]
    for entry in entries:
        print(f"{entry['id']}\t{entry['type']}\t{entry['title']}")
    return 0


def command_info(args: argparse.Namespace) -> int:
    catalog = load_catalog(Path(args.catalog))
    entry = next((item for item in catalog["entries"] if item["id"] == args.entry_id), None)
    if entry is None:
        raise ValueError(f"Entry not found: {args.entry_id}")
    print(json.dumps(entry, indent=2))
    return 0


def command_search(args: argparse.Namespace) -> int:
    return command_list(args)


def command_run(args: argparse.Namespace) -> int:
    catalog = load_catalog(Path(args.catalog))
    config = load_config(Path(args.config))
    profile_name = args.profile or os.getenv("KEYS_PROFILE", "default")
    profile = get_profile(config, profile_name)
    entry = next((item for item in catalog["entries"] if item["id"] == args.entry_id), None)
    if entry is None:
        raise ValueError(f"Entry not found: {args.entry_id}")

    run_result = run_entry(entry, profile)
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {"command": "run", "entry": entry["id"], "status": run_result["result"]["status"]},
        "details": run_result,
    }
    json_path, md_path = write_keys_report(report, resolve_output_root(profile))
    print(json.dumps(run_result, indent=2))
    print(f"Keys report JSON: {json_path}")
    print(f"Keys report MD: {md_path}")
    return 0 if run_result["result"]["status"] == "success" else 1


def command_verify(args: argparse.Namespace) -> int:
    catalog = load_catalog(Path(args.catalog))
    config = load_config(Path(args.config))
    profile_name = args.profile or os.getenv("KEYS_PROFILE", "default")
    profile = get_profile(config, profile_name)
    entry = next((item for item in catalog["entries"] if item["id"] == args.entry_id), None)
    if entry is None:
        raise ValueError(f"Entry not found: {args.entry_id}")
    verification = run_verification(entry, profile)
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {"command": "verify", "entry": entry["id"], "exit_code": verification["exit_code"]},
        "details": verification,
    }
    json_path, md_path = write_keys_report(report, resolve_output_root(profile))
    print(json.dumps(verification, indent=2))
    print(f"Keys report JSON: {json_path}")
    print(f"Keys report MD: {md_path}")
    return 0 if verification["exit_code"] == 0 else 1


def command_smoke(args: argparse.Namespace) -> int:
    config = load_config(Path(args.config))
    profile_name = args.profile or os.getenv("KEYS_PROFILE", "default")
    profile = get_profile(config, profile_name)
    command = "python scripts/run_notebooks_smoke.py --timeout 300"
    result = subprocess.run(command, shell=True)
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {"command": "smoke", "exit_code": result.returncode},
        "details": {"command": command},
    }
    json_path, md_path = write_keys_report(report, resolve_output_root(profile))
    print(f"Keys report JSON: {json_path}")
    print(f"Keys report MD: {md_path}")
    return result.returncode


def command_doctor(args: argparse.Namespace) -> int:
    config = load_config(Path(args.config))
    profile_name = args.profile or os.getenv("KEYS_PROFILE", "default")
    profile = get_profile(config, profile_name)
    allowed = profile["allowed_adapters"]
    adapters = load_adapters(allowed)
    checks = []
    for adapter in adapters:
        detection = adapter["module"].detect()
        checks.append(detection)
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {"command": "doctor", "adapters_checked": len(checks)},
        "details": {"adapters": checks},
    }
    json_path, md_path = write_keys_report(report, resolve_output_root(profile))
    print(json.dumps(report["details"], indent=2))
    print(f"Keys report JSON: {json_path}")
    print(f"Keys report MD: {md_path}")
    return 0


def command_init(args: argparse.Namespace) -> int:
    target = Path(args.path)
    target.mkdir(parents=True, exist_ok=True)
    title = args.title
    description = args.description
    if args.type == "runbook":
        (target / "README.md").write_text(f"# {title}\n\n{description}\n")
        (target / "checklist.md").write_text("# Checklist\n\n- Validate prerequisites\n- Execute steps\n- Record outcomes\n")
        (target / "CHANGELOG.md").write_text("# Changelog\n\n- Initial creation\n")
        pack = {
            "slug": target.name,
            "title": title,
            "description": description,
            "version": "1.0.0",
            "tags": ["runbook"],
            "documentation": {
                "readme": "README.md",
                "checklist": "checklist.md",
                "changelog": "CHANGELOG.md",
            },
        }
        (target / "pack.json").write_text(json.dumps(pack, indent=2))
    else:
        schema = load_json(SCHEMA_PATH)
        template = {"schema": schema["$id"], "version": "1.0.0", "entries": []}
        (target / "catalog.json").write_text(json.dumps(template, indent=2))
    print(f"Initialized {args.type} at {target}")
    return 0


def command_export(args: argparse.Namespace) -> int:
    catalog = load_catalog(Path(args.catalog))
    entry = next((item for item in catalog["entries"] if item["id"] == args.entry_id), None)
    if entry is None:
        raise ValueError(f"Entry not found: {args.entry_id}")
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.write(CATALOG_PATH, arcname="catalog.json")
        archive.write(SCHEMA_PATH, arcname="catalog.schema.json")
        entry_path = Path(entry["path"])
        if entry_path.is_dir():
            for file in entry_path.rglob("*"):
                if file.is_file():
                    archive.write(file, arcname=str(Path(entry["id"]) / file.relative_to(entry_path)))
        else:
            archive.write(entry_path, arcname=str(Path(entry["id"]) / entry_path.name))
    print(f"Exported pack to {output_path}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Keys CLI")
    parser.add_argument("--catalog", default=str(CATALOG_PATH))
    parser.add_argument("--config", default=str(CONFIG_PATH))
    parser.add_argument("--profile", default=None)
    subparsers = parser.add_subparsers(dest="command", required=True)

    list_parser = subparsers.add_parser("list", help="List catalog entries")
    list_parser.add_argument("--query", default=None)
    list_parser.set_defaults(func=command_list)

    info_parser = subparsers.add_parser("info", help="Show entry details")
    info_parser.add_argument("entry_id")
    info_parser.set_defaults(func=command_info)

    search_parser = subparsers.add_parser("search", help="Search catalog entries")
    search_parser.add_argument("--query", required=True)
    search_parser.set_defaults(func=command_search)

    run_parser = subparsers.add_parser("run", help="Run a catalog entry")
    run_parser.add_argument("entry_id")
    run_parser.set_defaults(func=command_run)

    verify_parser = subparsers.add_parser("verify", help="Run verification command for entry")
    verify_parser.add_argument("entry_id")
    verify_parser.set_defaults(func=command_verify)

    smoke_parser = subparsers.add_parser("smoke", help="Run smoke suite")
    smoke_parser.set_defaults(func=command_smoke)

    doctor_parser = subparsers.add_parser("doctor", help="Run environment checks")
    doctor_parser.set_defaults(func=command_doctor)

    init_parser = subparsers.add_parser("init", help="Initialize a pack or template")
    init_parser.add_argument("--type", choices=["runbook", "template"], required=True)
    init_parser.add_argument("--path", required=True)
    init_parser.add_argument("--title", required=True)
    init_parser.add_argument("--description", required=True)
    init_parser.set_defaults(func=command_init)

    export_parser = subparsers.add_parser("export", help="Export a pack archive")
    export_parser.add_argument("entry_id")
    export_parser.add_argument("--output", required=True)
    export_parser.set_defaults(func=command_export)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
