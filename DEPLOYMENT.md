# 🚀 Badger App Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Method 1: CLI (2 minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd "c:\Claude apps\Badger"
vercel --prod
```

You'll get a URL like: `https://badger-xyz.vercel.app`

---

## Deploy to Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build

# 4. Deploy
netlify deploy --prod
```

---

## Deploy to Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository
5. Railway auto-detects Next.js and deploys

---

## Important: Database Persistence

### Vercel (Serverless)
- SQLite doesn't persist between deployments
- **Solution 1**: Use Vercel Postgres (free tier)
- **Solution 2**: Use Turso (SQLite at edge, free tier)
- **Solution 3**: Export data regularly via Data Safety feature

### To Add Turso (SQLite Edge Database):

```bash
# 1. Install
npm install @libsql/client dotenv

# 2. Create Turso account
https://turso.tech

# 3. Create database
turso db create badger

# 4. Get connection URL
turso db show badger

# 5. Add to .env.local
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

Then update `src/lib/db.ts`:

```typescript
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export default client;
```

---

## Free Tier Limits

| Platform | Bandwidth | Build Time | Storage |
|----------|-----------|------------|---------|
| **Vercel** | 100GB/month | 6,000 min/month | 1GB |
| **Netlify** | 100GB/month | 300 min/month | 100GB |
| **Railway** | $5 credit/month | Unlimited | 1GB |

---

## Custom Domain (Free)

### On Vercel:
1. Go to Project Settings
2. Domains → Add Domain
3. Add your domain (e.g., `mybadger.com`)
4. Update DNS records as shown
5. SSL auto-configured

### Free Domain Options:
- Freenom: `.tk`, `.ml`, `.ga` domains (free)
- GitHub Student Pack: Free `.me` domain (if student)
- Use Vercel subdomain: `badger-yourname.vercel.app`

---

## Environment Variables

If using external database, set in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
3. Redeploy

---

## CI/CD (Automatic Deployments)

### Vercel:
- Push to main branch → auto-deploys
- Pull requests → preview deployments

### Setup:
1. Push code to GitHub
2. Import project in Vercel
3. Connect GitHub repo
4. Every push auto-deploys

---

## Mobile App (PWA)

Make Badger installable on phones:

1. Add to `public/manifest.json`:
```json
{
  "name": "Badger Finance",
  "short_name": "Badger",
  "description": "Personal finance tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F6FBF8",
  "theme_color": "#ADEBB3",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

2. Users can "Add to Home Screen" on mobile

---

## Monitoring

### Free Options:
- **Vercel Analytics** (built-in)
- **Sentry** (error tracking, free tier)
- **LogRocket** (session replay, free tier)

---

## Backup Strategy

1. **Export weekly** via Data Safety feature
2. **Store in**:
   - Google Drive
   - Dropbox
   - GitHub (private repo)
   - Local backup

3. **Automate**:
   - Set calendar reminder
   - Use 30-day backup reminder in app

---

## Troubleshooting

### Build fails?
```bash
# Local build test
npm run build

# Check logs
vercel logs
```

### Database not persisting?
- Switch to Turso or Vercel Postgres
- Or use export/import feature

### Slow loading?
- Vercel's edge network is already optimized
- Images auto-optimized
- No additional config needed

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Turso Docs**: https://docs.turso.tech
- **Next.js Docs**: https://nextjs.org/docs

---

**🎉 Your Badger app is now live and accessible from anywhere!**
