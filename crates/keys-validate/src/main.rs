use clap::{Parser, ValueEnum};
use std::fs;
use std::path::PathBuf;

use keys_validate::{format_report_text, validate_artifacts, ValidationOptions};

#[derive(Parser, Debug)]
#[command(
    name = "keys-validate",
    version,
    about = "Validate Keys artifact metadata"
)]
struct Cli {
    #[arg(long, default_value = "docs/library")]
    artifacts_dir: PathBuf,

    #[arg(long, default_value = "contracts/artifact_metadata.schema.json")]
    schema: PathBuf,

    #[arg(long)]
    output: Option<PathBuf>,

    #[arg(long, default_value = "json")]
    format: OutputFormat,

    #[arg(long)]
    strict: bool,
}

#[derive(ValueEnum, Debug, Clone, Copy)]
enum OutputFormat {
    Json,
    Text,
}

fn main() {
    let cli = Cli::parse();
    let repo_root = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

    let options = ValidationOptions {
        artifacts_dir: cli.artifacts_dir,
        schema_path: cli.schema,
        repo_root,
    };

    let report = match validate_artifacts(&options) {
        Ok(report) => report,
        Err(error) => {
            eprintln!("keys-validate failed: {error}");
            std::process::exit(2);
        }
    };

    let output_text = match cli.format {
        OutputFormat::Json => serde_json::to_string_pretty(&report).unwrap_or_else(|_| {
            "{\"schema_version\":\"1.0.0\",\"summary\":{\"artifacts\":0,\"errors\":1,\"warnings\":0},\"messages\":[]}".to_string()
        }),
        OutputFormat::Text => format_report_text(&report),
    };

    if let Some(output) = cli.output {
        if let Some(parent) = output.parent() {
            if let Err(error) = fs::create_dir_all(parent) {
                eprintln!("failed to create output directory {:?}: {}", parent, error);
                std::process::exit(2);
            }
        }
        if let Err(error) = fs::write(&output, output_text) {
            eprintln!("failed to write output {:?}: {}", output, error);
            std::process::exit(2);
        }
    } else {
        println!("{}", output_text);
    }

    if cli.strict && report.summary.errors > 0 {
        std::process::exit(1);
    }
}
