# Phase 0: Repo Reconnaissance Findings

## Executive Summary
The Keys project has solid infrastructure but critical gaps in authentication, authorization, and security enforcement. Core user data tables lack RLS, frontend uses hardcoded demo-user IDs, and backend routes don't consistently enforce ownership.

## Critical Security Issues

### 1. Frontend Authentication (CRITICAL)
**Location**: `frontend/src/app/dashboard/page.tsx`, `chat/page.tsx`, `profile/page.tsx`, `profile/settings/page.tsx`
- **Issue**: All pages use hardcoded `const userId = 'demo-user'`
- **Impact**: No real user authentication, any user can access any data
- **Fix Required**: Implement AuthProvider, session management, route protection

### 2. Missing Auth Pages (CRITICAL)
**Location**: No `/signin` or `/signup` pages exist
- **Issue**: No way for users to authenticate
- **Impact**: System is unusable for real users
- **Fix Required**: Create signin/signup pages with Supabase auth

### 3. Backend Route Security (CRITICAL)
**Location**: `backend/src/routes/profiles.ts`, `assemble-prompt.ts`, `vibe-configs.ts`
- **Issue**: Routes accept `userId` from params/body without verifying it matches authenticated user
- **Example**: `GET /profiles/:userId` allows any authenticated user to read any profile
- **Impact**: Complete tenant isolation failure
- **Fix Required**: Enforce `req.userId` matches requested resource owner

### 4. Missing RLS on Core Tables (CRITICAL)
**Location**: `backend/supabase/migrations/001_create_user_profiles.sql`, `003_create_vibe_configs.sql`, `004_create_agent_runs.sql`, `005_create_background_events.sql`
- **Issue**: No `ENABLE ROW LEVEL SECURITY` on:
  - `user_profiles`
  - `vibe_configs`
  - `agent_runs`
  - `background_events`
- **Impact**: Even with backend enforcement, direct DB access bypasses security
- **Fix Required**: Add RLS policies for all user-owned tables

### 5. Schema Type Mismatch (HIGH)
**Location**: Core tables use `user_id TEXT`, template tables use `user_id UUID`
- **Issue**: Inconsistent user_id types across schema
- **Impact**: Potential join failures, confusion
- **Fix Required**: Standardize on UUID (Supabase auth.users.id is UUID)

### 6. Chrome Extension Auth Missing (MEDIUM)
**Location**: `chrome-extension/background.js`
- **Issue**: No token exchange or auth handling
- **Impact**: Extension cannot authenticate users
- **Fix Required**: Implement OAuth-like token exchange flow

## Documentation Drift

### Conflicting Status Documents
1. `TODO_REMAINING.md` - Lists 30 remaining tasks
2. `WHAT_IS_LEFT.md` - Says frontend integration 90% complete
3. `IMPLEMENTATION_STATUS.md` - Claims "production-ready"
4. `FINAL_STATUS.md` - Says "Core System: 100% Complete"
5. `NEXT_STEPS.md` - Focuses on CI/CD setup

**Action**: Consolidate into single `STATUS.md` and `ROADMAP.md`

## Auth Touchpoints Inventory

### Frontend
- ✅ `frontend/src/services/supabaseClient.ts` - Client exists but not using SSR properly
- ✅ `frontend/src/services/api.ts` - Has auth interceptor but pages don't use it
- ❌ No AuthProvider/context
- ❌ No signin/signup pages
- ❌ No route protection middleware

### Backend
- ✅ `backend/src/middleware/auth.ts` - Auth middleware exists
- ⚠️ `backend/src/index.ts` - Only admin routes use `authMiddleware`, others use `optionalAuthMiddleware`
- ❌ Routes don't verify ownership (accept userId from params/body)

### Database
- ⚠️ Template tables have RLS
- ❌ Core tables (profiles, vibe_configs, agent_runs, background_events) have NO RLS

## Files Requiring Changes

### Frontend (Phase 1)
- `frontend/src/contexts/AuthContext.tsx` (NEW)
- `frontend/src/app/signin/page.tsx` (NEW)
- `frontend/src/app/signup/page.tsx` (NEW)
- `frontend/src/middleware.ts` (NEW - route protection)
- `frontend/src/app/dashboard/page.tsx` (REPLACE demo-user)
- `frontend/src/app/chat/page.tsx` (REPLACE demo-user)
- `frontend/src/app/profile/page.tsx` (REPLACE demo-user)
- `frontend/src/app/profile/settings/page.tsx` (REPLACE demo-user)
- `frontend/src/services/supabaseClient.ts` (FIX SSR)
- `frontend/src/components/Providers.tsx` (ADD AuthProvider)

### Backend (Phase 2)
- `backend/src/routes/profiles.ts` (ENFORCE ownership)
- `backend/src/routes/vibe-configs.ts` (ENFORCE ownership)
- `backend/src/routes/assemble-prompt.ts` (ENFORCE ownership)
- `backend/src/routes/orchestrate-agent.ts` (ENFORCE ownership)
- `backend/src/routes/feedback.ts` (ENFORCE ownership)
- `backend/src/index.ts` (APPLY authMiddleware to protected routes)
- `backend/supabase/migrations/012_add_rls_core_tables.sql` (NEW - Add RLS)

### Chrome Extension (Phase 4)
- `chrome-extension/background.js` (ADD auth token exchange)
- `chrome-extension/popup.js` (ADD signin flow)
- `chrome-extension/options.js` (ADD token management)

## Verification Commands

```bash
# Check for demo-user usage
grep -r "demo-user" frontend/src

# Check for RLS on tables
grep -r "ENABLE ROW LEVEL SECURITY" backend/supabase/migrations

# Check auth middleware usage
grep -r "authMiddleware" backend/src/routes

# Check for userId in params/body
grep -r "req.params.userId\|req.body.userId" backend/src/routes
```

## Next Steps Priority

1. **IMMEDIATE**: Fix frontend auth (Phase 1)
2. **IMMEDIATE**: Add RLS to core tables (Phase 2.2)
3. **IMMEDIATE**: Enforce ownership on backend routes (Phase 2.1)
4. **HIGH**: Fix Chrome extension auth (Phase 4)
5. **MEDIUM**: Consolidate documentation (Phase 0)
6. **MEDIUM**: Standardize user_id type (Phase 2)
