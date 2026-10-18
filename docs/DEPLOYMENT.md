# Deploy TechAstra on Vercel

Full-stack deployment: **Vite React** (static) + **Express API** (serverless function) + **Supabase PostgreSQL**.

## Prerequisites

- [Vercel](https://vercel.com) account
- [GitHub](https://github.com) repo (this project is pushed via `gh` + `vercel`)
- Supabase project with **pooler** `DATABASE_URL` (port `6543`)

## Production URL

- **App:** https://techastra-zeta.vercel.app  
- **GitHub:** https://github.com/Procoder1234556/techastra  

## 1. Environment variables (Vercel project settings)

Set these in **Vercel → Project → Settings → Environment Variables** (Production, Preview, Development).

> **Required for API to run:** without `DATABASE_URL` and `SESSION_SECRET`, `/health` and `/api/*` will return 500.

Optional helper (run locally, never commit secrets):

```powershell
.\scripts\vercel-env-sync.ps1
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | Supabase PostgreSQL connection string |
| `SESSION_SECRET` | **Yes** | Random string, 32+ characters |
| `CLIENT_URL` | **Yes** (prod) | `https://your-project.vercel.app` (your canonical URL) |
| `DEMO_ACCESS_CODE` | Recommended | Protects dev login when not using `@techastra.local` |
| `VITE_DEMO_ACCESS_CODE` | Recommended | Same value — baked into client at build time |
| `API_PUBLIC_URL` | Optional | Defaults to `https://$VERCEL_URL` |
| `VITE_API_URL` | Leave empty | Same-origin API on Vercel (do not set unless API is on another host) |
| `RAZORPAY_KEY_ID` | Optional | Live payments |
| `RAZORPAY_KEY_SECRET` | Optional | Live payments |

After changing `VITE_*` variables, **redeploy** so the client rebuilds.

**One-time setup in Vercel UI** (Project → Settings → Environment Variables):

1. `DATABASE_URL` — Supabase pooler URL  
2. `SESSION_SECRET` — long random string  
3. `CLIENT_URL` = `https://techastra-zeta.vercel.app`  
4. `DEMO_ACCESS_CODE` and `VITE_DEMO_ACCESS_CODE` — same value (e.g. your demo gate)  
5. Redeploy: `vercel --prod` or push to GitHub if the repo is connected  

Schema is applied via `npm run seed` / local API against the same database (Vercel skips full `schema.sql` on boot to avoid timeouts). Run once from your machine:

```bash
npm run seed
```

## 2. Database setup

On first deploy the API runs `schema.sql` and seeds demo data if tables are empty.

To reset demo data locally or from CI:

```bash
npm run migrate   # only if upgrading from `devnovate_*` tables
npm run seed
```

Sessions on Vercel use **`techastra_session`** in Postgres (`connect-pg-simple`).

## 3. Deploy from Git

```bash
cd techastra   # or devnovate-clone
git init
git add .
git commit -m "Prepare TechAstra for Vercel"
gh repo create techastra --public --source=. --remote=origin --push
vercel link
vercel env pull .env.vercel.local   # optional
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard and enable **Production** deploys on `main`.

## 4. Verify production

| Check | URL |
|-------|-----|
| Health | `https://techastra-zeta.vercel.app/health` → `{"ok":true,...}` |
| App | `https://YOUR_DOMAIN/` |
| Dev login | **Join with 1-Click** or `/auth/google?email=student@techastra.local&code=YOUR_DEMO_CODE` |

Organizer mailer, uploads, and payments use the same origin (`/api/v1/...`).

## 5. Limitations on Vercel

- **Uploads** are stored under `/tmp` on serverless — files are **not durable** across invocations. Use S3/Supabase Storage for production banners.
- **Cold starts** — first request after idle may be slower; DB pool is reused when possible.
- **MailerHub** delivers in-app notifications + DB log; wire SMTP/Zepto for real email.

## 6. Local development (unchanged)

```bash
npm install
npm install --prefix client --legacy-peer-deps
npm install --prefix server
copy .env.example .env
npm run seed
npm run dev
```

API: `http://localhost:3001` · Web: `http://localhost:5173`

## 7. Split deployment (optional)

If you prefer a always-on API (Railway/Render/Fly):

1. Deploy `server/` there with `PORT`, `DATABASE_URL`, `CLIENT_URL=https://your-vercel-app.vercel.app`
2. On Vercel set `VITE_API_URL=https://your-api-host` and enable CORS on the API.

Default setup in this repo is **monorepo on Vercel** (no `VITE_API_URL`).
