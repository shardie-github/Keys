# Environment Variables

This document maps environment variables to the components that consume them. Values in `.env.example` are safe defaults or empty slots for secrets.

## Notebook smoke suite

| Variable                 | Used by                                        | Description                                             | Required                             |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------ |
| `KEYS_NOTEBOOK_DRY_RUN`  | `scripts/run_notebooks_smoke.py`, EDA notebook | Enables sample data generation for notebook smoke runs. | No (defaults to `1` in smoke runner) |
| `NOTEBOOK_SMOKE_TIMEOUT` | `scripts/run_notebooks_smoke.py`               | Per-cell timeout (seconds) for notebook execution.      | No                                   |

## Keys CLI

| Variable          | Used by              | Description                                   | Required |
| ----------------- | -------------------- | --------------------------------------------- | -------- |
| `KEYS_PROFILE`    | `scripts/keys_cli.py` | Selects the Keys configuration profile.       | No       |
| `KEYS_OUTPUT_DIR` | `scripts/keys_cli.py` | Overrides the default output directory root.  | No       |

## Frontend (Next.js)

| Variable                         | Used by                       | Description                                         | Required          |
| -------------------------------- | ----------------------------- | --------------------------------------------------- | ----------------- |
| `NEXT_PUBLIC_SITE_URL`           | metadata + sitemap generation | Public base URL for sitemap/metadata.               | No                |
| `NEXT_PUBLIC_API_URL`            | client API calls              | Backend base URL for user-facing pages.             | No                |
| `NEXT_PUBLIC_API_BASE_URL`       | admin dashboards + API routes | Backend base URL for admin and internal API routes. | No                |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase client/middleware    | Supabase project URL.                               | Yes for auth/data |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase client/middleware    | Supabase anonymous key.                             | Yes for auth/data |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | analytics hook                | Optional analytics endpoint.                        | No                |
| `NEXT_PUBLIC_ANALYTICS_ENABLED`  | UX events                     | Feature flag for analytics.                         | No                |
| `NEXT_OUTPUT`                    | static export checks          | Next.js static export guard.                        | No                |
| `VERCEL_ENV`                     | middleware                    | Vercel environment hint.                            | No                |
| `ENABLE_INTERNAL_REVIEW_ROUTE`   | middleware                    | Enables internal review routes.                     | No                |
| `ADMIN_USER_IDS`                 | middleware + API routes       | Comma-separated admin user IDs for access controls. | No                |
| `REQUEST_SIGNING_SECRET`         | internal API route            | Shared secret for request signing.                  | No                |

## Backend (API services)

| Variable                    | Used by                    | Description                           | Required                  |
| --------------------------- | -------------------------- | ------------------------------------- | ------------------------- |
| `SUPABASE_URL`              | Supabase adapters/services | Supabase project URL.                 | Yes                       |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase adapters/services | Service role key for server access.   | Yes                       |
| `STRIPE_SECRET_KEY`         | billing routes             | Stripe secret key for billing.        | No (required for billing) |
| `STRIPE_WEBHOOK_SECRET`     | billing routes             | Stripe webhook signing secret.        | No                        |
| `FRONTEND_URL`              | billing routes             | Return URL for billing flows.         | No                        |
| `PORT`                      | server bootstrap           | API port override (defaults to 3001). | No                        |
| `NODE_ENV`                  | server + security          | Runtime environment.                  | No                        |
| `REDIS_URL`                 | cache                      | Redis connection string.              | No                        |
| `LOG_LEVEL`                 | logger                     | Logging verbosity.                    | No                        |
| `CORS_ORIGINS`              | security middleware        | Comma-separated allowlist origins.    | No                        |
| `RATE_LIMIT_WINDOW_MS`      | rate limiter               | Rate limit window in ms.              | No                        |
| `RATE_LIMIT_MAX_REQUESTS`   | rate limiter               | Rate limit maximum requests.          | No                        |
| `REQUEST_SIGNING_SECRET`    | security hardening         | Optional request signing secret.      | No                        |
| `SENTRY_DSN`                | error tracking             | Sentry DSN for backend monitoring.    | No                        |
| `SLACK_WEBHOOK_URL`         | notifications              | Slack webhook for notifications.      | No                        |

## LLM + AI providers

| Variable             | Used by      | Description                                  | Required |
| -------------------- | ------------ | -------------------------------------------- | -------- |
| `OPENAI_API_KEY`     | LLM services | OpenAI API key.                              | No       |
| `OPENAI_BASE_URL`    | LLM services | Optional base URL for OpenAI-compatible API. | No       |
| `ANTHROPIC_API_KEY`  | LLM services | Anthropic API key.                           | No       |
| `GOOGLE_AI_API_KEY`  | LLM services | Google Generative AI API key.                | No       |
| `TOGETHER_API_KEY`   | LLM services | Together AI API key.                         | No       |
| `GROQ_API_KEY`       | LLM services | Groq API key.                                | No       |
| `MISTRAL_API_KEY`    | LLM services | Mistral API key.                             | No       |
| `COHERE_API_KEY`     | LLM services | Cohere API key.                              | No       |
| `PERPLEXITY_API_KEY` | LLM services | Perplexity API key.                          | No       |
| `VLLM_BASE_URL`      | LLM services | Base URL for vLLM host.                      | No       |
| `LOCAL_LLM_BASE_URL` | LLM services | Base URL for local LLM host.                 | No       |

## Integrations

| Variable                   | Used by               | Description                                        | Required |
| -------------------------- | --------------------- | -------------------------------------------------- | -------- |
| `CODE_REPO_API_KEY`        | code repo adapter     | API token for repo provider.                       | No       |
| `CODE_REPO_WEBHOOK_SECRET` | code repo adapter     | Webhook signing secret.                            | No       |
| `CODE_REPO_URL`            | code repo adapter     | Repo URL.                                          | No       |
| `CODE_REPO_PROVIDER`       | code repo adapter     | Provider (`github`, `gitlab`, `bitbucket`).        | No       |
| `GITHUB_TOKEN`             | CI/CD + issue tracker | GitHub token.                                      | No       |
| `GITHUB_REPO_URL`          | CI/CD + issue tracker | GitHub repo URL.                                   | No       |
| `GITHUB_WEBHOOK_SECRET`    | code repo adapter     | GitHub webhook secret.                             | No       |
| `CIRCLECI_TOKEN`           | CI/CD adapter         | CircleCI API token.                                | No       |
| `CIRCLECI_ORG`             | CI/CD adapter         | CircleCI org slug.                                 | No       |
| `GITLAB_TOKEN`             | CI/CD adapter         | GitLab API token.                                  | No       |
| `CI_CD_PROVIDER`           | CI/CD adapter         | Provider (`github_actions`, `circleci`, `gitlab`). | No       |
| `CI_CD_BASE_URL`           | CI/CD adapter         | Provider base URL.                                 | No       |
| `ISSUE_TRACKER_PROVIDER`   | issue tracker adapter | Provider (`github`, `jira`, `linear`).             | No       |
| `ISSUE_TRACKER_API_KEY`    | issue tracker adapter | API token.                                         | No       |
| `ISSUE_TRACKER_BASE_URL`   | issue tracker adapter | Base URL for provider.                             | No       |
| `JIRA_EMAIL`               | Jira adapter          | Email for Jira auth.                               | No       |
| `JIRA_PROJECT`             | Jira adapter          | Jira project key.                                  | No       |
| `LINEAR_WORKSPACE`         | Linear adapter        | Linear workspace slug.                             | No       |
| `NOTION_API_KEY`           | doc space adapter     | Notion API key.                                    | No       |
| `NOTION_WORKSPACE_ID`      | doc space adapter     | Notion workspace ID.                               | No       |
| `CONFLUENCE_API_TOKEN`     | doc space adapter     | Confluence API token.                              | No       |
| `CONFLUENCE_BASE_URL`      | doc space adapter     | Confluence base URL.                               | No       |
| `CONFLUENCE_SPACE_KEY`     | doc space adapter     | Confluence space key.                              | No       |
| `CONFLUENCE_EMAIL`         | doc space adapter     | Confluence auth email.                             | No       |
| `SHOPIFY_API_KEY`          | Shopify adapter       | Shopify API key.                                   | No       |
| `SHOPIFY_API_SECRET`       | Shopify adapter       | Shopify API secret.                                | No       |
| `SHOPIFY_STORE_URL`        | Shopify adapter       | Shopify store URL.                                 | No       |
| `CAPCUT_API_KEY`           | CapCut adapter        | CapCut API key.                                    | No       |
| `CAPCUT_BASE_URL`          | CapCut adapter        | CapCut API base URL.                               | No       |
| `MINDSTUDIO_API_KEY`       | Mindstudio adapter    | Mindstudio API key.                                | No       |
| `MINDSTUDIO_BASE_URL`      | Mindstudio adapter    | Mindstudio base URL.                               | No       |
| `POSTHOG_API_KEY`          | analytics adapter     | PostHog API key.                                   | No       |
| `POSTHOG_HOST`             | analytics adapter     | PostHog host URL.                                  | No       |
| `POSTHOG_PROJECT_ID`       | analytics adapter     | PostHog project ID.                                | No       |
| `GA_API_KEY`               | analytics adapter     | Google Analytics API key.                          | No       |
| `GA_VIEW_ID`               | analytics adapter     | Google Analytics view ID.                          | No       |
| `ANALYTICS_BASE_URL`       | analytics adapter     | Analytics base URL for custom provider.            | No       |
