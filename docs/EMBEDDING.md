# Embedding Keys

Keys can be embedded into another repository as a portable interoperability layer.

## Installation (vendored)

1. Copy the `keys/` directory and `scripts/keys_cli.py` into your repository.
2. Ensure Python 3.10+ is available (for notebook runs, `nbclient` + `nbformat`).
3. Commit the files and wire scripts in your CI.

## Minimal GitHub Actions example

```yaml
name: Keys Gates
on:
  pull_request:

jobs:
  keys:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Keys doctor
        run: python scripts/keys_cli.py doctor
      - name: Keys check
        run: npm run keys:check
      - name: Keys smoke
        run: python scripts/keys_cli.py smoke
      - name: Keys audit
        run: npm run keys:audit
```

## Runtime integration

- Use `python scripts/keys_cli.py list` to discover catalog entries.
- Use `python scripts/keys_cli.py run <id>` to run notebooks/runbooks/templates.
- Use `python scripts/keys_cli.py verify <id>` to execute an entry’s verification command.

## Profiles

Profiles are defined in `keys/keys.config.json` and can be selected with `KEYS_PROFILE`.

```
KEYS_PROFILE=offline
python scripts/keys_cli.py run notebook.eda-workflow
```
