# NEXT_PUBLIC_API_BASE_URL - Explanation

## ❌ It's NOT in Supabase!

`NEXT_PUBLIC_API_BASE_URL` is **NOT** a Supabase setting. It's the URL of **your backend API server**.

## 🔍 What is it?

This is the URL where your **backend API** (the Express.js server in the `backend/` folder) is running. The frontend uses this to make API calls to your backend.

## 📍 Where to Find/Set It

### For Local Development:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
- Your backend runs on port 3001 by default (see `backend/src/index.ts`)

### For Production:
You need to deploy your backend first, then use that URL:

**Option 1: Deploy Backend to Vercel**
```bash
cd backend
vercel
# After deployment, you'll get a URL like:
# https://your-backend-name.vercel.app
```
Then set:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-name.vercel.app
```

**Option 2: Deploy Backend to Railway**
1. Connect your GitHub repo to Railway
2. Deploy the `backend/` folder
3. Railway will give you a URL like: `https://your-app.up.railway.app`
4. Set:
```
NEXT_PUBLIC_API_BASE_URL=https://your-app.up.railway.app
```

**Option 3: Deploy Backend to Render**
1. Create a new Web Service on Render
2. Point it to your `backend/` folder
3. Render will give you a URL like: `https://your-app.onrender.com`
4. Set:
```
NEXT_PUBLIC_API_BASE_URL=https://your-app.onrender.com
```

**Option 4: Deploy Backend to Heroku**
1. Create a Heroku app
2. Deploy the `backend/` folder
3. Heroku will give you a URL like: `https://your-app.herokuapp.com`
4. Set:
```
NEXT_PUBLIC_API_BASE_URL=https://your-app.herokuapp.com
```

**Option 5: Deploy Backend to Your Own Server**
- If you have your own server/VPS, deploy the backend there
- Use your server's domain/IP address
- Example: `https://api.yourdomain.com` or `https://your-ip-address:3001`

## 🔧 How to Set It

### In Vercel (for Frontend):
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Key**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.vercel.app`)
   - **Environment**: Select Production, Preview, and Development

### In GitHub Secrets (for CI/CD):
1. Go to **GitHub** → Repository → **Settings** → **Secrets and variables** → **Actions**
2. Add:
   - **Name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: Your backend URL

## 📋 Current Setup

Looking at your code:
- **Backend default port**: `3001` (from `backend/src/index.ts`)
- **Frontend expects**: `NEXT_PUBLIC_API_BASE_URL` or defaults to `http://localhost:3001`
- **Frontend file**: `frontend/src/services/api.ts` uses this URL

## ✅ Quick Checklist

- [ ] **Deploy your backend** to a hosting service (Vercel, Railway, Render, etc.)
- [ ] **Get the backend URL** from your hosting provider
- [ ] **Add to Vercel** environment variables: `NEXT_PUBLIC_API_BASE_URL`
- [ ] **Add to GitHub Secrets** (if needed for CI/CD): `NEXT_PUBLIC_API_BASE_URL`

## 🆘 If You Haven't Deployed Backend Yet

If you haven't deployed your backend, you have two options:

### Option A: Deploy Backend Now
1. Choose a hosting provider (Vercel is easiest)
2. Deploy the `backend/` folder
3. Get the URL
4. Set `NEXT_PUBLIC_API_BASE_URL` to that URL

### Option B: Use Local Development URL (Temporary)
For testing only, you can temporarily use:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
⚠️ **Warning**: This only works locally. For production, you MUST deploy the backend.

## 🔗 Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ──────> │   Backend    │ ──────> │  Supabase   │
│  (Next.js)  │         │  (Express)   │         │  (Database) │
│             │         │              │         │             │
│ Port: 3000  │         │ Port: 3001  │         │  Cloud      │
└─────────────┘         └──────────────┘         └─────────────┘
     │                        │
     │                        │
     └────────────────────────┘
     NEXT_PUBLIC_API_BASE_URL
     (points to backend)
```

- **Frontend** → Uses `NEXT_PUBLIC_API_BASE_URL` to call **Backend**
- **Backend** → Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to connect to **Supabase**

## 📚 Related Files

- `frontend/src/services/api.ts` - Uses `NEXT_PUBLIC_API_BASE_URL`
- `backend/src/index.ts` - Backend server (runs on port 3001)
- `.env.example` - Shows `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`
