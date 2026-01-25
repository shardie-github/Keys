use std::fs;
use std::path::PathBuf;

use keys_validate::{format_report_text, validate_artifacts, ValidationOptions};
use pretty_assertions::assert_eq;

#[test]
fn golden_reports_are_stable() {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let repo_root = manifest_dir
        .parent()
        .and_then(|path| path.parent())
        .expect("repo root");
    let fixtures_root = manifest_dir.join("tests/fixtures");

    let options = ValidationOptions {
        artifacts_dir: fixtures_root.join("docs/library"),
        schema_path: repo_root.join("contracts/artifact_metadata.schema.json"),
        repo_root: fixtures_root.clone(),
    };

    let report = validate_artifacts(&options).expect("report");
    let json = serde_json::to_string_pretty(&report).expect("json report");
    let expected_json =
        fs::read_to_string(fixtures_root.join("expected_report.json")).expect("expected json");
    assert_eq!(json.trim(), expected_json.trim());

    let text = format_report_text(&report);
    let expected_text =
        fs::read_to_string(fixtures_root.join("expected_report.txt")).expect("expected text");
    assert_eq!(text.trim_end(), expected_text.trim_end());
}
