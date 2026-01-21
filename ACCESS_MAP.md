# Access Map

## Scope
This map covers all Next.js routes in `frontend/src/app`, plus public API routes surfaced by the app. It inventories navigation links, logged-out behavior, data sensitivity, and access classification.

## Navigation Inventory (Observed Links)
- **Home page quick links:** `/dashboard`, `/profile/settings`, `/pricing`, `/compare`, `/features`, `/templates`, `/terms`.
- **Home CTAs:** `/marketplace`, `/marketplace?demo=true`, `/discover`, `/profile`.
- **Templates layout nav:** `/templates`, `/templates/shared`, `/templates/presets`, `/templates/analytics`.
- **Templates page header:** `/templates/shared`, `/templates/presets`, `/templates/analytics`.

## Route Inventory

### Public Marketing / Trust / CRO Routes
| Route | In nav? | Logged-out behavior | Data sensitivity | Access | Required change |
| --- | --- | --- | --- | --- | --- |
| `/` | Home quick links/CTAs | 200 | Public | PUBLIC | None |
| `/pricing` | Home quick links | 200 | Public | PUBLIC | None |
| `/support` | No | 200 | Public | PUBLIC | Added public page |
| `/docs` | No | 200 | Public | PUBLIC | Added public page |
| `/about` | No | 200 | Public | PUBLIC | Added public page |
| `/blog` | No | 200 | Public | PUBLIC | Added public page |
| `/changelog` | No | 200 | Public | PUBLIC | Added public page |
| `/security` | No | 200 | Public | PUBLIC | Added public page |
| `/privacy` | No | 200 | Public | PUBLIC | Added public page |
| `/terms` | Home quick links | 200 | Public | PUBLIC | Updated links to `/terms` |
| `/status` | No | 200 | Public | PUBLIC | Added public page |
| `/contact` | No | 200 | Public | PUBLIC | Added public page |
| `/faq` | No | 200 | Public | PUBLIC | Added public page |
| `/integrations` | No | 200 | Public | PUBLIC | Added public page |
| `/roadmap` | No | 200 | Public | PUBLIC | Added public page |
| `/examples` | No | 200 | Public | PUBLIC | Added public page |
| `/compare` | Home quick links | 200 | Public | PUBLIC | None |
| `/features` | Home quick links | 200 | Public | PUBLIC | None |
| `/for-developers` | No | 200 | Public | PUBLIC | None |
| `/for-founders` | No | 200 | Public | PUBLIC | None |
| `/venture-strategy` | No | 200 | Public | PUBLIC | None |
| `/discover` | Home CTA | 200 | Public | PUBLIC | None |
| `/marketplace` | Home CTA | 200 (demo fallback) | Public | HYBRID | Existing public-safe fallback |
| `/marketplace/bundles` | No | 200 | Public | PUBLIC | None |
| `/marketplace/[slug]` | No | 200 | Public | PUBLIC | None |

### Hybrid Routes (Public read-only + authenticated enhancements)
| Route | In nav? | Logged-out behavior | Data sensitivity | Access | Required change |
| --- | --- | --- | --- | --- | --- |
| `/templates` | Home quick link + Templates nav | 200 with catalog fallback + sign-in CTA | Public | HYBRID | Removed auth gating + added public catalog fallback |
| `/templates/[id]` | Template browser cards | 200 with summary + sign-in CTA | Public | HYBRID | Added public summary fallback + gated customization |

### Auth-Required Routes (Private App)
| Route | In nav? | Logged-out behavior | Data sensitivity | Access | Required change |
| --- | --- | --- | --- | --- | --- |
| `/signin` | Auth entry | 200 | Public | PUBLIC (auth) | None |
| `/signup` | Auth entry | 200 | Public | PUBLIC (auth) | None |
| `/dashboard` | Home quick link | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware + client guard |
| `/chat` | No | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware + client guard |
| `/profile` | Home CTA | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware + client guard |
| `/profile/settings` | Home quick link | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware + client guard |
| `/account/billing` | No | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware guard |
| `/account/keys` | No | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware guard |
| `/account/entitlements` | No | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware guard |
| `/admin/dashboard` | No | Redirect to `/signin` | Private/admin | AUTH_REQUIRED | Middleware + admin checks |
| `/admin/apm` | No | Redirect to `/signin` | Private/admin | AUTH_REQUIRED | Middleware + admin checks |
| `/admin/health` | No | Redirect to `/signin` | Private/admin | AUTH_REQUIRED | Middleware + admin checks |
| `/admin/marketplace` | No | Redirect to `/signin` | Private/admin | AUTH_REQUIRED | Middleware + admin checks |
| `/onboarding` | No | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware + client guard |
| `/image-control` | No | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware guard |
| `/playground` | No | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware guard |
| `/dev/ux-events` | No | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware guard |
| `/extension-auth` | No | Redirect to `/signin` | Private | AUTH_REQUIRED | Middleware guard |
| `/templates/shared` | Templates nav | Sign-in CTA | Private | AUTH_REQUIRED | Added auth guard in page |
| `/templates/presets` | Templates nav | Sign-in CTA | Private | AUTH_REQUIRED | Added auth guard in page |
| `/templates/analytics` | Templates nav | Sign-in CTA | Private | AUTH_REQUIRED | Added auth guard in page |
| `/templates/export` | No | Sign-in CTA | Private | AUTH_REQUIRED | Added auth guard in page |
| `/templates/[id]/customize` | Template detail | Redirect to `/signin` | Private | AUTH_REQUIRED | Client guard + middleware |
| `/templates/[id]/share` | Template detail | Redirect to `/signin` | Private | AUTH_REQUIRED | Client guard + middleware |
| `/__review` | No | 404 (public) | Internal | AUTH_REQUIRED | Existing internal review gate |

### API Routes
| Route | Logged-out behavior | Data sensitivity | Access | Required change |
| --- | --- | --- | --- | --- |
| `/api/ui-config` | 200 public config | Public | PUBLIC | None |
| `/api/public/templates` | 200 catalog | Public | PUBLIC | Added public catalog route |
| `/api/public/templates/[id]` | 200 catalog entry | Public | PUBLIC | Added public catalog route |
| `/api/internal/ui-config` | 401/403 for non-admin | Private/admin | AUTH_REQUIRED | Existing admin guard |
