use jsonschema::{Draft, JSONSchema};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Component, Path, PathBuf};
use thiserror::Error;
use walkdir::WalkDir;

const REPORT_SCHEMA_VERSION: &str = "1.0.0";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Error,
    Warning,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationMessage {
    pub severity: Severity,
    pub rule_id: String,
    pub message: String,
    pub file: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub artifact_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggested_fix: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationSummary {
    pub artifacts: usize,
    pub errors: usize,
    pub warnings: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationReport {
    pub schema_version: String,
    pub summary: ValidationSummary,
    pub messages: Vec<ValidationMessage>,
}

#[derive(Debug, Clone)]
pub struct ValidationOptions {
    pub artifacts_dir: PathBuf,
    pub schema_path: PathBuf,
    pub repo_root: PathBuf,
}

#[derive(Debug, Error)]
pub enum ValidationError {
    #[error("failed to read file {path:?}: {source}")]
    Io {
        path: PathBuf,
        #[source]
        source: std::io::Error,
    },
    #[error("failed to parse schema {path:?}: {source}")]
    SchemaParse {
        path: PathBuf,
        #[source]
        source: serde_json::Error,
    },
    #[error("failed to compile schema {path:?}: {message}")]
    SchemaCompile { path: PathBuf, message: String },
    #[error("failed to parse frontmatter in {path:?}: {message}")]
    FrontmatterParse { path: PathBuf, message: String },
}

#[derive(Debug, Clone, Deserialize)]
#[allow(dead_code)]
struct ArtifactMetadata {
    id: String,
    title: String,
    description: String,
    tags: Vec<String>,
    categories: Vec<String>,
    tools_supported: Vec<String>,
    schema_version: String,
    content_path: String,
    created_at: Option<String>,
    updated_at: Option<String>,
    license: Option<String>,
    safety_notes: Option<String>,
}

#[derive(Debug, Clone)]
struct MetadataEntry {
    file_path: PathBuf,
    metadata: Option<ArtifactMetadata>,
    messages: Vec<ValidationMessage>,
}

pub fn validate_artifacts(
    options: &ValidationOptions,
) -> Result<ValidationReport, ValidationError> {
    let schema = load_schema(&options.schema_path)?;
    let entries = collect_metadata_entries(&schema, options)?;

    let mut messages = Vec::new();
    let mut metadata_by_id: HashMap<String, Vec<PathBuf>> = HashMap::new();

    for entry in &entries {
        messages.extend(entry.messages.clone());
        if let Some(metadata) = &entry.metadata {
            metadata_by_id
                .entry(metadata.id.clone())
                .or_default()
                .push(entry.file_path.clone());
        }
    }

    for (artifact_id, files) in &metadata_by_id {
        if files.len() > 1 {
            for file in files {
                messages.push(ValidationMessage {
                    severity: Severity::Error,
                    rule_id: "metadata.duplicate_id".to_string(),
                    message: format!(
                        "artifact id \"{}\" appears in {} files",
                        artifact_id,
                        files.len()
                    ),
                    file: display_path(&options.repo_root, file),
                    artifact_id: Some(artifact_id.clone()),
                    suggested_fix: Some("Ensure each artifact id is unique.".to_string()),
                });
            }
        }
    }

    for entry in &entries {
        if let Some(metadata) = &entry.metadata {
            validate_metadata_content(metadata, entry, options, &mut messages);
        }
    }

    messages.sort_by(|a, b| {
        let ordering = a.file.cmp(&b.file);
        if ordering != std::cmp::Ordering::Equal {
            return ordering;
        }
        let ordering = a.rule_id.cmp(&b.rule_id);
        if ordering != std::cmp::Ordering::Equal {
            return ordering;
        }
        let ordering = a.message.cmp(&b.message);
        if ordering != std::cmp::Ordering::Equal {
            return ordering;
        }
        let ordering = a.artifact_id.cmp(&b.artifact_id);
        if ordering != std::cmp::Ordering::Equal {
            return ordering;
        }
        severity_rank(a.severity).cmp(&severity_rank(b.severity))
    });

    let errors = messages
        .iter()
        .filter(|message| message.severity == Severity::Error)
        .count();
    let warnings = messages
        .iter()
        .filter(|message| message.severity == Severity::Warning)
        .count();

    Ok(ValidationReport {
        schema_version: REPORT_SCHEMA_VERSION.to_string(),
        summary: ValidationSummary {
            artifacts: entries.len(),
            errors,
            warnings,
        },
        messages,
    })
}

fn severity_rank(severity: Severity) -> u8 {
    match severity {
        Severity::Error => 0,
        Severity::Warning => 1,
    }
}

fn validate_metadata_content(
    metadata: &ArtifactMetadata,
    entry: &MetadataEntry,
    options: &ValidationOptions,
    messages: &mut Vec<ValidationMessage>,
) {
    let file = display_path(&options.repo_root, &entry.file_path);
    let artifact_id = Some(metadata.id.clone());

    check_sorted_unique(&metadata.tags, "tags", &file, artifact_id.clone(), messages);
    check_sorted_unique(
        &metadata.categories,
        "categories",
        &file,
        artifact_id.clone(),
        messages,
    );
    check_sorted_unique(
        &metadata.tools_supported,
        "tools_supported",
        &file,
        artifact_id.clone(),
        messages,
    );

    let content_path = Path::new(&metadata.content_path);
    if content_path.is_absolute() {
        messages.push(ValidationMessage {
            severity: Severity::Error,
            rule_id: "metadata.content_path_absolute".to_string(),
            message: "content_path must be relative to the repository root".to_string(),
            file: file.clone(),
            artifact_id: artifact_id.clone(),
            suggested_fix: Some("Use a relative path like docs/library/example.md".to_string()),
        });
    }

    if content_path
        .components()
        .any(|component| matches!(component, Component::ParentDir))
    {
        messages.push(ValidationMessage {
            severity: Severity::Error,
            rule_id: "metadata.content_path_parent".to_string(),
            message: "content_path must not include parent directory segments (..)".to_string(),
            file: file.clone(),
            artifact_id: artifact_id.clone(),
            suggested_fix: Some("Use a relative path inside the repository.".to_string()),
        });
    }

    let full_path = options.repo_root.join(content_path);
    if !full_path.is_file() {
        messages.push(ValidationMessage {
            severity: Severity::Error,
            rule_id: "metadata.content_path_missing".to_string(),
            message: format!("content_path does not exist: {}", metadata.content_path),
            file,
            artifact_id,
            suggested_fix: Some("Ensure the content file exists at content_path.".to_string()),
        });
    }
}

fn check_sorted_unique(
    values: &[String],
    field: &str,
    file: &str,
    artifact_id: Option<String>,
    messages: &mut Vec<ValidationMessage>,
) {
    let mut sorted = values.to_vec();
    sorted.sort();
    if sorted != values {
        messages.push(ValidationMessage {
            severity: Severity::Error,
            rule_id: format!("metadata.{}.sorted", field),
            message: format!("{} must be sorted in ascending order", field),
            file: file.to_string(),
            artifact_id: artifact_id.clone(),
            suggested_fix: Some(format!("Sort {} alphabetically for stable output.", field)),
        });
    }

    let mut seen: HashSet<&str> = HashSet::new();
    let mut duplicates_found = false;
    for value in values {
        if !seen.insert(value.as_str()) {
            duplicates_found = true;
        }
    }
    if duplicates_found {
        messages.push(ValidationMessage {
            severity: Severity::Error,
            rule_id: format!("metadata.{}.unique", field),
            message: format!("{} must not contain duplicates", field),
            file: file.to_string(),
            artifact_id,
            suggested_fix: Some(format!("Remove duplicate entries in {}.", field)),
        });
    }
}

fn collect_metadata_entries(
    schema: &JSONSchema,
    options: &ValidationOptions,
) -> Result<Vec<MetadataEntry>, ValidationError> {
    let mut entries = Vec::new();
    let mut files = Vec::new();

    for entry in WalkDir::new(&options.artifacts_dir)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
    {
        files.push(entry.path().to_path_buf());
    }
    files.sort();

    for file_path in files {
        let extension = file_path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();

        if file_path
            .file_name()
            .and_then(|name| name.to_str())
            .map(|name| name.ends_with(".metadata.json"))
            .unwrap_or(false)
        {
            if let Some(entry) = parse_json_metadata(&file_path, schema, options)? {
                entries.push(entry);
            }
            continue;
        }

        if matches!(extension.as_str(), "md" | "mdx" | "markdown") {
            if let Some(entry) = parse_frontmatter_metadata(&file_path, schema, options)? {
                entries.push(entry);
            }
        }
    }

    Ok(entries)
}

fn parse_json_metadata(
    file_path: &Path,
    schema: &JSONSchema,
    options: &ValidationOptions,
) -> Result<Option<MetadataEntry>, ValidationError> {
    let content = fs::read_to_string(file_path).map_err(|source| ValidationError::Io {
        path: file_path.to_path_buf(),
        source,
    })?;
    let raw: Value =
        serde_json::from_str(&content).map_err(|source| ValidationError::SchemaParse {
            path: file_path.to_path_buf(),
            source,
        })?;
    Ok(Some(build_entry(file_path, raw, schema, options)))
}

fn parse_frontmatter_metadata(
    file_path: &Path,
    schema: &JSONSchema,
    options: &ValidationOptions,
) -> Result<Option<MetadataEntry>, ValidationError> {
    let content = fs::read_to_string(file_path).map_err(|source| ValidationError::Io {
        path: file_path.to_path_buf(),
        source,
    })?;

    let frontmatter = match extract_frontmatter(&content) {
        Some(frontmatter) => frontmatter,
        None => return Ok(None),
    };

    let frontmatter_value: serde_yaml::Value =
        serde_yaml::from_str(&frontmatter).map_err(|error| ValidationError::FrontmatterParse {
            path: file_path.to_path_buf(),
            message: error.to_string(),
        })?;

    let frontmatter_json =
        serde_json::to_value(frontmatter_value).map_err(|source| ValidationError::SchemaParse {
            path: file_path.to_path_buf(),
            source,
        })?;

    let metadata_value = match &frontmatter_json {
        Value::Object(map) => map
            .get("keys_metadata")
            .or_else(|| map.get("metadata"))
            .cloned(),
        _ => None,
    };

    let Some(raw) = metadata_value else {
        return Ok(None);
    };

    let mut entry = build_entry(file_path, raw, schema, options);

    if let Value::Object(map) = &frontmatter_json {
        let mut disallowed_keys = Vec::new();
        for key in [
            "layout",
            "permalink",
            "redirect",
            "template",
            "draft",
            "published",
            "private",
            "unsafe",
        ] {
            if map.contains_key(key) {
                disallowed_keys.push(key.to_string());
            }
        }

        if !disallowed_keys.is_empty() {
            entry.messages.push(ValidationMessage {
                severity: Severity::Error,
                rule_id: "frontmatter.disallowed_field".to_string(),
                message: format!(
                    "frontmatter includes disallowed fields: {}",
                    disallowed_keys.join(", ")
                ),
                file: display_path(&options.repo_root, file_path),
                artifact_id: entry.metadata.as_ref().map(|meta| meta.id.clone()),
                suggested_fix: Some("Remove disallowed frontmatter fields.".to_string()),
            });
        }
    }

    Ok(Some(entry))
}

fn build_entry(
    file_path: &Path,
    raw: Value,
    schema: &JSONSchema,
    options: &ValidationOptions,
) -> MetadataEntry {
    let mut entry = MetadataEntry {
        file_path: file_path.to_path_buf(),
        metadata: None,
        messages: Vec::new(),
    };

    let file = display_path(&options.repo_root, file_path);
    if let Err(errors) = schema.validate(&raw) {
        for error in errors {
            entry.messages.push(ValidationMessage {
                severity: Severity::Error,
                rule_id: "schema.invalid".to_string(),
                message: error.to_string(),
                file: file.clone(),
                artifact_id: None,
                suggested_fix: Some("Update metadata to match the schema.".to_string()),
            });
        }
    }

    match serde_json::from_value::<ArtifactMetadata>(raw) {
        Ok(metadata) => entry.metadata = Some(metadata),
        Err(_) => entry.messages.push(ValidationMessage {
            severity: Severity::Error,
            rule_id: "metadata.parse".to_string(),
            message: "failed to parse metadata into expected fields".to_string(),
            file,
            artifact_id: None,
            suggested_fix: Some("Ensure metadata matches the required fields.".to_string()),
        }),
    }

    entry
}

fn load_schema(path: &Path) -> Result<JSONSchema, ValidationError> {
    let content = fs::read_to_string(path).map_err(|source| ValidationError::Io {
        path: path.to_path_buf(),
        source,
    })?;
    let schema_json: Value =
        serde_json::from_str(&content).map_err(|source| ValidationError::SchemaParse {
            path: path.to_path_buf(),
            source,
        })?;

    JSONSchema::options()
        .with_draft(Draft::Draft202012)
        .compile(&schema_json)
        .map_err(|error| ValidationError::SchemaCompile {
            path: path.to_path_buf(),
            message: error.to_string(),
        })
}

fn extract_frontmatter(content: &str) -> Option<String> {
    let mut lines = content.lines();
    if lines.next()? != "---" {
        return None;
    }

    let mut frontmatter = Vec::new();
    for line in lines.by_ref() {
        if line == "---" {
            break;
        }
        frontmatter.push(line);
    }

    if frontmatter.is_empty() {
        return None;
    }

    Some(frontmatter.join("\n"))
}

fn display_path(repo_root: &Path, path: &Path) -> String {
    path.strip_prefix(repo_root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}

pub fn format_report_text(report: &ValidationReport) -> String {
    let mut output = String::new();
    output.push_str(&format!(
        "Artifacts scanned: {}\nErrors: {}\nWarnings: {}\n",
        report.summary.artifacts, report.summary.errors, report.summary.warnings
    ));

    if report.messages.is_empty() {
        return output;
    }

    output.push('\n');
    for message in &report.messages {
        output.push_str(&format!(
            "[{}] {} {}: {}\n",
            match message.severity {
                Severity::Error => "error",
                Severity::Warning => "warning",
            },
            message.rule_id,
            message.file,
            message.message
        ));
        if let Some(artifact_id) = &message.artifact_id {
            output.push_str(&format!("  Artifact: {}\n", artifact_id));
        }
        if let Some(suggested_fix) = &message.suggested_fix {
            output.push_str(&format!("  Suggested fix: {}\n", suggested_fix));
        }
    }

    output
}
