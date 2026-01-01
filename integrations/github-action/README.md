# Keys GitHub Action

Automatically check PRs for security vulnerabilities, compliance issues, and quality problems using Keys.

## Features

- **Security Scanning**: Automatically scans PRs for SQL injection, XSS, secret exposure, and other vulnerabilities
- **Compliance Checking**: Checks for GDPR, SOC 2, and HIPAA compliance issues
- **Quality Gates**: Enforces code quality standards
- **PR Comments**: Posts results as PR comments
- **Merge Blocking**: Can block merges on critical issues

## Usage

Add to your `.github/workflows/keys-check.yml`:

```yaml
name: Keys Security Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  keys-check:
    runs-on: ubuntu-latest
    steps:
      - uses: keys-dev/github-action@v1
        with:
          api_key: ${{ secrets.KEYS_API_KEY }}
          check_security: 'true'
          check_compliance: 'true'
          check_quality: 'true'
          block_on_critical: 'true'
          comment_on_pr: 'true'
```

## Configuration

- `api_url`: Keys API URL (default: https://api.keys.dev)
- `api_key`: Keys API key (required, store in GitHub Secrets)
- `check_security`: Check for security vulnerabilities (default: true)
- `check_compliance`: Check for compliance issues (default: true)
- `check_quality`: Check for quality issues (default: true)
- `block_on_critical`: Block merge on critical issues (default: true)
- `comment_on_pr`: Comment on PR with results (default: true)

## Requirements

- Keys Pro+ or Enterprise subscription
- GitHub repository with Actions enabled
- API key stored in GitHub Secrets

## Outputs

- `security_issues`: Number of security issues found
- `compliance_issues`: Number of compliance issues found
- `quality_issues`: Number of quality issues found
- `blocked`: Whether merge was blocked
