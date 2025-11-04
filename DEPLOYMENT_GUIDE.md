# EcoBlox Academy - Deployment Guide
**Deploy to Railway (Backend) + Vercel (Frontend)**

Last Updated: November 4, 2025

---

## Prerequisites

- [ ] Git repository with latest code
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] GitHub repository connected to both services

---

## Part 1: Pre-Deployment Checklist

### Security Fixes Applied ✅
- [x] Added JWT authentication to Progress controller
- [x] Added Admin role guards to Admin controller
- [x] Created .env.example templates
- [x] Improved CORS configuration
- [x] Created frontend environment configuration

### Before You Deploy
- [ ] Ensure `.env` is in `.gitignore` (already done ✅)
- [ ] Remove any hardcoded secrets from code
- [ ] Review test credentials in login page (optional: remove for production)
- [ ] Commit all security fixes to git

---

## Part 2: Railway Deployment (Backend)

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `eco_curriculum` repository
5. Railway will detect the NestJS app

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically creates a database and sets `DATABASE_URL` variable
3. Wait for database to initialize (takes ~30 seconds)

### Step 3: Configure Environment Variables

1. Click on your backend service
2. Go to **"Variables"** tab
3. Add the following variables:

```env
# JWT Configuration (REQUIRED)
JWT_SECRET=bd992775746a261605bcca0557ee844e10e4d55e25575860f9d1dc984341fd87
JWT_EXPIRES_IN=24h

# Frontend URL (REQUIRED - will update after Vercel deployment)
FRONTEND_URL=http://localhost:3000

# Email Configuration (OPTIONAL - for parent notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Port (Railway sets this automatically, but you can specify)
PORT=3400
```

**IMPORTANT**:
- Generate YOUR OWN JWT_SECRET using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Don't use the example above in production!
- We'll update `FRONTEND_URL` after Vercel deployment

### Step 4: Configure Build Settings

1. Go to **"Settings"** tab
2. Set **Root Directory**: `backend`
3. Set **Build Command**:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
4. Set **Start Command**:
   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```
5. Click **"Deploy"**

### Step 5: Monitor Deployment

1. Go to **"Deployments"** tab
2. Watch the build logs
3. Ensure migrations run successfully
4. Look for: `🚀 NestJS server running on...`

### Step 6: Get Railway URL

1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `eco-curriculum-production.up.railway.app`)
5. **Save this URL** - you'll need it for Vercel!

### Step 7: Test Backend

Open your Railway URL in browser:
```
https://your-railway-url.up.railway.app/api
```

You should see the NestJS API running.

---

## Part 3: Vercel Deployment (Frontend)

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your `eco_curriculum` repository
4. Vercel will detect Next.js automatically

### Step 2: Configure Project Settings

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
```

**Replace `your-railway-url` with the Railway URL from Part 2, Step 6!**

Example:
```env
NEXT_PUBLIC_API_URL=https://eco-curriculum-production.up.railway.app
```

**IMPORTANT**:
- Do NOT include trailing slash
- Use the HTTPS Railway URL
- This variable is exposed to the browser (that's okay)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Vercel will provide a URL (e.g., `eco-curriculum.vercel.app`)

### Step 5: Get Vercel URL

1. After deployment, copy your Vercel URL
2. **Important**: Copy the production URL (usually `your-app.vercel.app`)

---

## Part 4: Connect Backend to Frontend

### Update Railway CORS Configuration

1. Go back to **Railway Dashboard**
2. Click on your backend service
3. Go to **"Variables"** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```env
   FRONTEND_URL=https://eco-curriculum.vercel.app
   ```
5. Click **"Deploy"** to redeploy with new CORS settings

**This step is CRITICAL** - without it, the frontend won't be able to connect to the backend!

---

## Part 5: Database Setup

### Run Database Migrations

Migrations run automatically during deployment (in the start command), but you can verify:

1. In Railway, go to your backend service
2. Check **"Deployments"** tab logs
3. Look for: `Running migrations...`
4. Confirm: `Migration complete`

### Seed Database (Optional)

If you have a seed script, run it manually:

1. In Railway, click your backend service
2. Go to **"Deployments"** tab
3. Click the **"..."** menu → **"View Logs"**
4. Or connect to the database directly via Railway CLI

For initial data, you might want to:
```bash
# Connect to Railway locally
railway login
railway link
railway run npm run seed
```

---

## Part 6: Testing Deployment

### Test Backend API

1. Open: `https://your-railway-url.up.railway.app/api`
2. Should see NestJS running

Test authentication endpoint:
```bash
curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecoblox.build","password":"admin123"}'
```

### Test Frontend

1. Open: `https://your-vercel-url.vercel.app`
2. You should see the login page
3. Try logging in with test credentials

### Test Full Flow

1. **Student Login**:
   - Email: `student@test.com`
   - PIN: `1234`

2. **Teacher Login**:
   - Email: `teacher@robloxacademy.com`
   - Password: `teacher123`

3. **Admin Login**:
   - Email: `admin@ecoblox.build`
   - Password: `admin123`

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Check for errors:
   - ❌ CORS errors → Update `FRONTEND_URL` in Railway
   - ❌ 401 errors → Check JWT configuration
   - ❌ Network errors → Check Railway URL in Vercel env vars

### Test Real-Time Chat

1. Login as teacher
2. Login as student (different browser/incognito)
3. Send messages
4. Verify real-time updates work

---

## Part 7: Post-Deployment Configuration

### Enable Auto-Deployments

**Railway:**
1. Go to **"Settings"** → **"Service"**
2. Enable **"Auto Deploy"** for main branch

**Vercel:**
1. Go to **"Settings"** → **"Git"**
2. Verify **"Production Branch"** is `main`
3. Auto-deploy is enabled by default

### Set Up Monitoring

1. **Railway**: Built-in metrics in dashboard
2. **Vercel**: Analytics available in dashboard
3. **Consider adding**:
   - Sentry for error tracking
   - LogRocket for session replay
   - Uptime monitoring (UptimeRobot)

### Database Backups

1. Railway PostgreSQL includes automatic backups
2. Go to **Database** → **"Backups"** tab
3. Verify backups are enabled
4. Test restore procedure

---

## Part 8: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. In Vercel project, go to **"Settings"** → **"Domains"**
2. Add your domain (e.g., `ecoblox.academy`)
3. Follow DNS configuration instructions
4. Update Railway `FRONTEND_URL` to your custom domain

### Add Custom Domain to Railway (Optional)

1. In Railway backend, go to **"Settings"** → **"Networking"**
2. Add custom domain for API (e.g., `api.ecoblox.academy`)
3. Update Vercel `NEXT_PUBLIC_API_URL` to custom domain

---

## Troubleshooting

### Issue: CORS Errors in Browser

**Symptom**: Console shows "Access blocked by CORS policy"

**Solution**:
1. Check `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. Make sure it includes `https://`
3. No trailing slash
4. Redeploy Railway after changing

### Issue: 401 Unauthorized Errors

**Symptom**: All API requests return 401

**Solution**:
1. Check `JWT_SECRET` is set in Railway
2. Verify it's not the default value
3. Check token is being sent in Authorization header
4. Verify time is synced (JWT expiration)

### Issue: Database Connection Errors

**Symptom**: "Can't connect to database"

**Solution**:
1. Check `DATABASE_URL` is set in Railway (should be automatic)
2. Verify PostgreSQL database is running
3. Check migrations completed successfully
4. Try redeploying

### Issue: WebSocket/Chat Not Working

**Symptom**: Real-time chat doesn't update

**Solution**:
1. Verify Socket.IO is configured for production
2. Check WebSocket connection in Network tab
3. Ensure Railway supports WebSocket (it does)
4. Check firewall/security settings

### Issue: Environment Variables Not Updating

**Symptom**: Changes don't take effect

**Solution**:
1. **Railway**: Redeploy after changing variables
2. **Vercel**: Redeploy after changing variables
3. Clear browser cache
4. Hard refresh (Ctrl+Shift+R)

### Issue: Build Fails

**Railway Backend**:
- Check logs in Deployments tab
- Verify `backend` root directory is correct
- Check `package.json` scripts exist
- Verify Node version compatibility

**Vercel Frontend**:
- Check build logs
- Verify `frontend` root directory is correct
- Check for TypeScript errors
- Verify dependencies are installed

---

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | ✅ Auto | `postgresql://...` | Set by Railway PostgreSQL |
| `JWT_SECRET` | ✅ | `bd9927757...` | Generate with crypto |
| `JWT_EXPIRES_IN` | ✅ | `24h` | Token expiration time |
| `FRONTEND_URL` | ✅ | `https://app.vercel.app` | Your Vercel URL |
| `PORT` | Auto | `3400` | Railway sets automatically |
| `EMAIL_USER` | Optional | `admin@ecoblox.build` | Gmail for notifications |
| `EMAIL_PASS` | Optional | `abc123def456` | Gmail app password |

### Frontend (Vercel)

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://api.railway.app` | Your Railway URL |

---

## Cost Breakdown

### Railway
- **Hobby Plan**: $5/month base
- **PostgreSQL**: ~$5-10/month
- **Egress**: Depends on traffic
- **Estimated**: $10-20/month

### Vercel
- **Hobby**: Free (personal projects)
- **Pro**: $20/month (recommended for production)
- **Estimated**: $0-20/month

### Total
**$10-40/month** depending on plan and traffic

---

## Security Checklist

Before going live:
- [ ] JWT_SECRET is unique and secure (not default)
- [ ] Email credentials rotated (if exposed)
- [ ] `.env` not committed to git
- [ ] CORS configured correctly
- [ ] Authentication guards on all endpoints
- [ ] Admin role guards working
- [ ] Test credentials removed from UI (optional)
- [ ] HTTPS enabled (automatic with Vercel/Railway)
- [ ] Database backups enabled
- [ ] Error tracking configured

---

## Next Steps After Deployment

1. **Monitor Performance**:
   - Check Railway metrics
   - Review Vercel analytics
   - Monitor error rates

2. **Set Up Alerts**:
   - Downtime alerts
   - Error rate alerts
   - Database backup alerts

3. **Documentation**:
   - Document admin procedures
   - Create teacher onboarding guide
   - Write student help documentation

4. **Enhancements**:
   - Add rate limiting
   - Implement caching
   - Add comprehensive logging
   - Set up CI/CD tests

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## Emergency Rollback

If something goes wrong:

### Railway:
1. Go to **"Deployments"** tab
2. Click on previous successful deployment
3. Click **"Redeploy"**

### Vercel:
1. Go to **"Deployments"** tab
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

---

**Good luck with your deployment!** 🚀

If you encounter issues not covered here, check the logs first:
- Railway: **Deployments** → **View Logs**
- Vercel: **Deployments** → Click deployment → **Building**
