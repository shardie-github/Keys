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
