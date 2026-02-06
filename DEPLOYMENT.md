# GigHub Deployment Guide

> **Note**: Deployment is optional. Complete local development first, then deploy when ready.

## Required Services (All Free Tier)
1. **Vercel** - Frontend hosting
2. **Railway** - Backend hosting
3. **Supabase** - PostgreSQL database

## Database (Supabase)

**Setup:**
1. Create account at https://supabase.com
2. Create new project
3. Wait for provisioning (~2 minutes)
4. Go to Project Settings > Database
5. Copy connection string (Connection pooling mode recommended)
6. Save for Railway configuration

**Connection String Format:**
```
postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
```

## Backend (Railway)

**Setup:**
1. Create account at https://railway.app
2. New Project > Deploy from GitHub repo
3. Select `gighub` repository
4. Root Directory: `backend`
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://... (from Supabase)
   JWT_SECRET=your-random-secret-key-min-32-chars
   JWT_ACCESS_EXPIRY=3600000
   JWT_REFRESH_EXPIRY=604800000
   SPRING_PROFILES_ACTIVE=prod
   ```
6. Deploy

**Generate JWT Secret:**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**railway.json** (optional, in `backend/`):
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "./gradlew bootRun",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Get Backend URL:**
- Railway generates URL like: `https://gighub-backend-production.up.railway.app`
- Save this for Vercel configuration

## Frontend (Vercel)

**Setup:**
1. Create account at https://vercel.com
2. Import Git Repository > Select `gighub`
3. Configure project:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. Deploy

**vercel.json** (optional, in `frontend/`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

**Custom Domain (Optional):**
- Vercel provides free `.vercel.app` domain
- Can add custom domain in project settings

## Post-Deployment

**Initialize Database:**
```bash
# Run Flyway migrations against Supabase
cd backend
./gradlew flywayMigrate -Dflyway.url="postgresql://..." -Dflyway.user=postgres -Dflyway.password=your-password
```

**Create First Band & Invite Code:**
```bash
# Option 1: Use API endpoint (create admin endpoint)
curl -X POST https://your-backend.railway.app/api/admin/init

# Option 2: Direct database insert via Supabase SQL Editor
INSERT INTO bands (name, description, created_at)
VALUES ('My Band', 'First band', NOW());

INSERT INTO invite_codes (code, band_id, invite_role, created_at, expires_at)
VALUES (gen_random_uuid(), 1, 'LEADER', NOW(), NOW() + INTERVAL '30 days');
```

**Test Deployment:**
1. Visit frontend URL: `https://your-app.vercel.app`
2. Register with invite code
3. Create a poll
4. Invite band members

## Monitoring

**Railway:**
- View logs in Railway dashboard
- Monitor memory/CPU usage
- Set up alerts

**Vercel:**
- View deployment logs
- Analytics available in dashboard
- Error tracking

**Supabase:**
- Monitor database size (500MB limit)
- Query performance
- Connection pooling stats
