# AGENT PR NOTES

## Iteration 1

### What changed
- Captured discovery findings, baseline checks, and an initial failure matrix for follow-up.

### Files changed
- .pr/AGENT_PR_NOTES.md

### Commands run + results
- `npm run lint` (success; warnings about unsupported TypeScript version and npm http-proxy env config).
- `npm run type-check` (success; npm http-proxy env config warning).
- `npm run test --workspaces --if-present` (failed; vitest ran in watch mode for frontend/backend, cancelled; frontend reported Playwright describe misuse).

### Why this is correct
- The notes file establishes required iteration tracking and records real verification output with actionable failures.

### Next steps
- Re-run tests in non-watch mode (e.g., `vitest run`) to gather deterministic pass/fail results.
- Investigate Playwright/vitest conflict in frontend e2e tests and align test runner usage.

---

## Repo Facts
- Tooling: Node.js workspace repo with `frontend` (Next.js) and `backend` (Express + TS). Top-level `package.json` defines workspace scripts and Node >= 18.0.0. Frontend uses Next.js 14, ESLint, Prettier, TypeScript, Vitest, Playwright. Backend uses ESLint, TypeScript, Vitest. No Python package manager or lockfiles found at repo root.
- Notebook tooling: Jupyter notebooks present under `keys-assets/jupyter-keys/*/notebooks`, no explicit tooling config (e.g., papermill/jupytext) found in root.
- Lint/format: ESLint (frontend/back) + Prettier (frontend script). No explicit formatting tool at root.
- Tests: Vitest in frontend/back; Playwright tests exist in frontend e2e directory.
- CI: GitHub Actions workflows present in `.github/workflows` for CI, quality, e2e, migrations, etc.
- Packaging: No `pyproject.toml`/`setup.cfg`/`requirements.txt` at root. Node workspaces managed by `package.json` and `package-lock.json`.

## Inventory

### Notebooks
- `keys-assets/jupyter-keys/jupyter-eda-workflows/notebooks/eda_workflow.ipynb` — EDA workflow notebook.
- `keys-assets/jupyter-keys/jupyter-model-validation-patterns/notebooks/model_validation.ipynb` — model validation patterns.
- `keys-assets/jupyter-keys/jupyter-production-ml-pipelines/notebooks/production_pipeline.ipynb` — production ML pipeline outline.

### Runbooks
- `runbook-keys/ai-output-regression`
- `runbook-keys/background-job-failure-replay`
- `runbook-keys/data-reconciliation-mismatch`
- `runbook-keys/partial-outage-dependency-failure`
- `runbook-keys/stripe-webhook-failure`
- `runbook-keys/supabase-rls-lockout-recovery`

### Templates
- `templates/` includes catalog, adapter/filter scripts, and documentation assets.

## Target Product Shapes
- Public repo with a curated free core (runbooks + templates) and paid notebook bundles under `keys-assets/jupyter-keys`.
- Premium pack ZIP releases (e.g., notebook bundles + runbooks + templates + catalog).
- Optional npm package for CLI helpers/scripts with documentation linking to notebooks.
- Notebook packs categorized by domain (EDA, model validation, ML pipelines) backed by catalog metadata.

## Baseline Failures

| Category | File(s) | Root cause | Severity | Fix plan |
| --- | --- | --- | --- | --- |
| Tests (frontend) | `frontend/e2e/billing.spec.ts` (and other e2e specs) | `vitest` default watch mode executed Playwright tests, causing Playwright `test.describe()` error. | High | Run frontend tests with proper runner (`vitest run` for unit, `playwright test` for e2e). Separate test commands. |
| Tests (backend) | `backend/__tests__/*` | `vitest` ran in watch mode; run cancelled before completion. | Medium | Run `vitest run` in backend or update root test command to non-watch mode. |
| Tooling warning | Repo-wide | TypeScript 5.9.3 unsupported by `@typescript-eslint/typescript-estree` (lint warning). | Low | Align TypeScript version to supported range or update ESLint tooling. |
| Tooling warning | Repo-wide | npm warns about unknown `http-proxy` env config. | Low | Remove env config or document as environment-specific. |

## Iteration 2

### Summary
- Fixed frontend unit test discovery by excluding Playwright specs from Vitest and enabling pass-with-no-tests.
- Added notebook smoke runner with deterministic DRY_RUN data handling and updated EDA notebook for offline execution.
- Implemented notebook requirements, smoke reports, and environment variable documentation.
- Added detect-secrets baseline + CI scan step; documented security scan outputs.
- Introduced a scoped format check gate for new artifacts.

### Evidence blocks (gate outputs)
- `npm run lint` (exit 0)
  - Last 30 lines:
    - `> hardonia-ai-companion-backend@1.0.0 lint`
    - `> eslint src --ext .ts`
    - `=============`
    - `WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.`
    - `SUPPORTED TYPESCRIPT VERSIONS: >=4.3.5 <5.4.0`
    - `YOUR TYPESCRIPT VERSION: 5.9.3`
    - `=============`
- `npm run format:check` (exit 0)
  - Last 30 lines:
    - `> keys@1.0.0 format:check`
    - `> npx prettier --check "ENV_VARS.md" "outputs/smoke_report.md" "outputs/smoke_report.json"`
    - `Checking formatting...`
    - `ENV_VARS.md`
    - `outputs/smoke_report.md`
    - `outputs/smoke_report.json`
    - `All matched files use Prettier code style!`
- `npm run type-check` (exit 0)
  - Last 30 lines:
    - `> keys@1.0.0 type-check:backend`
    - `> cd backend && npm run type-check`
    - `> hardonia-ai-companion-backend@1.0.0 type-check`
    - `> tsc --noEmit`
- `npm --workspace frontend run test` (exit 0)
  - Last 30 lines:
    - `RUN  v2.1.9 /workspace/Keys/frontend`
    - `include: **/*.{test,spec}.?(c|m)[jt]s?(x)`
    - `exclude:  e2e/**, node_modules/**, .next/**, dist/**, **/playwright.config.*, **/*.e2e.*`
    - `No test files found, exiting with code 0`
- `npm --workspace backend run test` (exit 0)
  - Last 30 lines:
    - `Test Files  9 passed (9)`
    - `Tests  45 passed (45)`
    - `Duration  4.61s (transform 741ms, setup 0ms, import 1.45s, tests 520ms, environment 2ms)`
- `npm run build` (exit 0)
  - Last 30 lines:
    - `✓ Collecting build traces`
    - `✓ Finalizing page optimization`
    - `Route (app) ...`
    - `> keys@1.0.0 build:backend`
    - `> hardonia-ai-companion-backend@1.0.0 build`
    - `> tsc`
- `python scripts/run_notebooks_smoke.py --timeout 300` (exit 0)
  - Last 30 lines:
    - `Smoke report JSON: outputs/smoke_report.json`
    - `Smoke report MD: outputs/smoke_report.md`
- `detect-secrets scan --baseline .secrets.baseline` (exit 0)
  - Last 30 lines: (no output)
- `npm --workspace backend audit --audit-level=high` (exit 0)
  - Last 30 lines:
    - `found 0 vulnerabilities`
- `npm --workspace frontend audit --audit-level=high` (exit 1)
  - Last 30 lines:
    - `glob  10.2.0 - 10.4.5` (Severity: high; dev dependency in @next/eslint-plugin-next)
    - `@supabase/auth-js  <2.69.1` (moderate; indirect)
    - `esbuild  <=0.24.2` (moderate; dev dependency)

### Risk/rollback notes
- **Risk accepted**: Frontend npm audit reports 3 high/7 moderate vulnerabilities from dev-only toolchain (glob/esbuild) and indirect supabase auth package. Fixes require breaking upgrades (`eslint-config-next@16` or `vitest@4`). Plan: schedule dependency upgrade window and align Next.js toolchain versions before release.
- Rollback: revert notebook smoke runner + notebook edits by `git revert` of this commit; no schema/runtime contracts were changed.

### Notebook smoke report status
- ✅ 3/3 notebooks executed successfully with `KEYS_NOTEBOOK_DRY_RUN=1` data. Report saved at `outputs/smoke_report.json` and `outputs/smoke_report.md`.
