# GitHub Secrets & Environment Variables Checklist

## ✅ Already Configured
- ✅ Database URL (likely `SUPABASE_URL` or `DATABASE_URL`)
- ✅ Next.js Public Supabase URL (`NEXT_PUBLIC_SUPABASE_URL`)

## 🔴 Required GitHub Secrets

### Supabase Secrets (for CI/CD)
These are needed for running tests and builds in GitHub Actions:

1. **`SUPABASE_URL`** - Your Supabase project URL
   - Used by: Backend CI tests
   - Get from: Supabase Dashboard → Settings → API → Project URL

2. **`SUPABASE_SERVICE_ROLE_KEY`** - Supabase service role key (⚠️ Keep secret!)
   - Used by: Backend CI tests, backend services
   - Get from: Supabase Dashboard → Settings → API → service_role key
   - ⚠️ **CRITICAL**: This key bypasses Row Level Security - never expose publicly

3. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Supabase anonymous/public key
   - Used by: Frontend CI build, frontend application
   - Get from: Supabase Dashboard → Settings → API → anon/public key

### Vercel Secrets (for deployments)
These are needed for automatic deployments to Vercel:

4. **`VERCEL_TOKEN`** - Vercel authentication token
   - Used by: Vercel production & preview workflows
   - Get from: Vercel Dashboard → Settings → Tokens → Create Token

5. **`VERCEL_ORG_ID`** - Your Vercel organization ID
   - Used by: Vercel workflows
   - Get from: Vercel Dashboard → Settings → General → Team ID

6. **`VERCEL_PROJECT_ID`** - Your Vercel project ID
   - Used by: Vercel workflows
   - Get from: Vercel project settings → General → Project ID

### Optional GitHub Secrets

7. **`SNYK_TOKEN`** (Optional) - For security scanning
   - Used by: Security scan workflow
   - Get from: Snyk Dashboard → Account Settings → Auth Token

## 📋 Vercel Environment Variables

These need to be configured in **Vercel Dashboard** (not GitHub Secrets):

1. **`NEXT_PUBLIC_SUPABASE_URL`** - Already added ✅
2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Supabase anonymous key
3. **`NEXT_PUBLIC_API_BASE_URL`** - Your backend API URL
   - Production: `https://your-backend-domain.com`
   - Preview: `https://your-backend-preview.vercel.app` (or your preview URL)

## 🔧 How to Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret with the exact name listed above
5. Paste the value and click **"Add secret"**

## 🔧 How to Add Vercel Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Navigate to: **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environment**: Production, Preview, Development (select all)
5. Repeat for other variables

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] `SUPABASE_URL` added to GitHub Secrets
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to GitHub Secrets
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to GitHub Secrets
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to GitHub Secrets
- [ ] `VERCEL_TOKEN` added to GitHub Secrets
- [ ] `VERCEL_ORG_ID` added to GitHub Secrets
- [ ] `VERCEL_PROJECT_ID` added to GitHub Secrets
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to Vercel Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to Vercel Environment Variables
- [ ] `NEXT_PUBLIC_API_BASE_URL` added to Vercel Environment Variables

## 🧪 Test Your Setup

1. **Test CI/CD**:
   ```bash
   # Create a test branch
   git checkout -b test/secrets-setup
   echo "Test" >> README.md
   git commit -m "test: verify secrets"
   git push origin test/secrets-setup
   # Create PR and watch CI workflow run
   ```

2. **Check Workflow Logs**:
   - Go to GitHub → Actions tab
   - Check if backend tests pass (requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`)
   - Check if frontend build succeeds (requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 📝 Additional Notes

### Backend Deployment (if separate)
If you're deploying the backend separately (not just frontend), you'll also need:

- `SUPABASE_URL` (environment variable)
- `SUPABASE_SERVICE_ROLE_KEY` (environment variable)
- `PORT` (defaults to 3001)
- `NODE_ENV` (production/staging)
- `CORS_ORIGINS` (comma-separated list of allowed origins)
- `REDIS_URL` (if using Redis caching)
- LLM API keys (if using AI features):
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `GOOGLE_AI_API_KEY`
  - etc.

### Frontend Environment Variables
The frontend also uses:
- `NEXT_PUBLIC_SITE_URL` - Your production site URL (for metadata, sitemap, etc.)
  - Can be set in Vercel or as a build-time variable

## 🆘 Troubleshooting

### CI Tests Failing
- Check if `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly
- Verify the service role key has proper permissions
- Check workflow logs for specific error messages

### Frontend Build Failing
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check that the Supabase project is accessible
- Review build logs in GitHub Actions

### Vercel Deployment Failing
- Verify all Vercel secrets are set (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- Check Vercel environment variables are configured
- Ensure Vercel project is linked correctly

## 📚 Related Documentation

- `.env.example` - Full list of all environment variables
- `README_CI_CD.md` - CI/CD setup guide
- `README_DEPLOYMENT.md` - Deployment instructions
- `.github/workflows/README.md` - Workflow documentation
