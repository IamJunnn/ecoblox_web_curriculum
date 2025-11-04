# Quick Deploy Reference Card

**EcoBlox Academy - Railway + Vercel**

---

## 🚀 TL;DR - Deploy in 30 Minutes

### 1️⃣ Railway (Backend) - 15 min

```bash
# 1. Create project → Deploy from GitHub
# 2. Add PostgreSQL database
# 3. Set environment variables:

DATABASE_URL=<auto-set-by-railway>
JWT_SECRET=<generate-new-one>
FRONTEND_URL=https://your-app.vercel.app
JWT_EXPIRES_IN=24h
```

**Root Directory**: `backend`
**Build**: `npm install && npx prisma generate && npm run build`
**Start**: `npx prisma migrate deploy && npm run start:prod`

Get Railway URL → Copy for next step

---

### 2️⃣ Vercel (Frontend) - 10 min

```bash
# 1. Import GitHub repo
# 2. Set environment variable:

NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
```

**Root Directory**: `frontend`
**Framework**: Next.js (auto-detected)

Get Vercel URL → Update Railway `FRONTEND_URL`

---

### 3️⃣ Connect Them - 5 min

1. Copy Vercel URL
2. Go back to Railway
3. Update `FRONTEND_URL` to Vercel URL
4. Redeploy Railway

**DONE!** 🎉

---

## ⚠️ Critical Before Deploy

- [ ] Generate NEW `JWT_SECRET`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Rotate email password (if using email)
- [ ] Verify `.env` not in git

---

## 🧪 Test After Deploy

1. Open frontend: `https://your-app.vercel.app`
2. Login as student: `student@test.com` / PIN: `1234`
3. Login as admin: `admin@ecoblox.build` / `admin123`
4. Check browser console for errors

---

## 🆘 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | Update `FRONTEND_URL` in Railway to exact Vercel URL |
| 401 errors | Check `JWT_SECRET` is set in Railway |
| Can't connect | Check `NEXT_PUBLIC_API_URL` in Vercel |
| Build fails | Check logs, verify root directory settings |

---

## 📚 Full Guides

- Detailed steps: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Security fixes: [SECURITY_FIXES_APPLIED.md](SECURITY_FIXES_APPLIED.md)
- Full analysis: [DEPLOYMENT_READINESS_REPORT.md](DEPLOYMENT_READINESS_REPORT.md)

---

## 💰 Cost

- Railway: ~$10-20/month
- Vercel: Free (Hobby) or $20/month (Pro)
- **Total**: $10-40/month

---

## ✅ What We Fixed

- ✅ Added authentication to Progress endpoints
- ✅ Added admin role guards
- ✅ Improved CORS configuration
- ✅ Created environment templates
- ✅ Ready for production deployment

---

**Ready to deploy? Start with Railway!** 🚂
