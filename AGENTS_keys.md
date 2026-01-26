# AGENTS.md — Keys

This file defines **hard constraints** for any code agent operating in this repository. It is an execution contract.

## 0) Prime directive
- Build **working** features with **verification**.
- **No hard 500s** on user routes; degrade gracefully.
- **Fix root causes**, do not suppress lint/type/build errors.
- Protect user data and secrets at all times.

## 1) Product identity (OSS-first)
Keys is a developer tool that must feel like:
- Open source first: clear docs, easy local run, intuitive UX.
- Cloud/enterprise is optional: never gate docs or basic usage behind sign-in.

## 2) Stack assumptions
Unless this repo explicitly differs:
- **Next.js App Router**, **TypeScript**, **Tailwind**
- **shadcn/ui** component primitives
- **Supabase Postgres + RLS** (if present) for tenant isolation
- Optional **Stripe** billing (Node runtime for webhooks; raw-body verification)
- Vercel deploy target

## 3) Security invariants
Keys commonly handles credentials/keys/secrets. Treat security as existential:
- Never log secrets or return them to the client unintentionally.
- Encrypt sensitive values at rest (use repo’s existing approach; do not invent ad-hoc crypto).
- Principle of least privilege for DB and API access.
- Validate inputs at boundaries (prefer `zod` or repo’s validator).

## 4) API key management rules (if applicable)
If implementing key rotation/import/export:
- Provide **safe defaults** and explicit warnings.
- Support revoke/rotate flows without breaking existing integrations.
- Ensure auditing/logging excludes secret material (store fingerprints/hashes only).

## 5) UI/UX standards
- Mobile-first, Chrome mobile safe.
- Accessibility required: keyboard nav, focus rings, ARIA labels.
- Prefer shadcn/ui patterns; avoid duplicating primitives.
- Add robust empty/loading/error states on all data-driven screens.

## 6) Quality gates (required)
Discover scripts from `package.json`. Typical order:
1. Install: `pnpm install`
2. Lint: `pnpm lint`
3. Typecheck: `pnpm typecheck`
4. Tests: `pnpm test` (if present)
5. Build: `pnpm build`

Completion requires **lint + typecheck + build** to pass.

## 7) Work method
- Discovery-first: read repo rules, env templates, auth flow, data model.
- Implement smallest safe fix, verify, repeat.
- Avoid broad refactors unless they reduce risk and stay covered by tests.

## 8) Reporting requirements
At the end of any task, include:
- Summary of changes
- Files changed
- Commands run + results (lint/typecheck/build/tests)
- Remaining risks and next steps

---
If repo-specific docs conflict with this file, repo-specific docs win. Otherwise, follow this contract.
