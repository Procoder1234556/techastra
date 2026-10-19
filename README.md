# Techastra

Hackathons, jobs, and communities platform — React + Express + Supabase PostgreSQL.

**Agents:** read [`AGENTS.md`](./AGENTS.md) and [`../AGENTS.md`](../AGENTS.md). Product name is **Techastra** only.

## Stack

| Layer | Tech |
|--------|------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, React Router, Axios, Framer Motion |
| Backend | Node.js, Express, **Supabase PostgreSQL** (`pg`), express-session |
| Auth (local) | Dev login via `/auth/google?email=…` (+ `DEMO_ACCESS_CODE` when set) |

## Prerequisites

- **Node.js** 22.12+ recommended (22.11 may work with warnings)
- **Supabase** project with `DATABASE_URL` (pooler URL on port 6543)

Tables are prefixed `techastra_*` so they do not collide with other apps in the same database.

## Quick start

```bash
cd techastra
npm install
npm install --prefix client --legacy-peer-deps
npm install --prefix server

# configure env (single file at project root)
copy .env.example .env

# apply schema, seed demo data
npm run migrate
npm run seed

# API :3001 + web :5173
npm run dev
```

All keys live in **`.env`** at the project root (`DEMO_ACCESS_CODE` and `VITE_DEMO_ACCESS_CODE` should match).

Open [http://localhost:5173](http://localhost:5173).

### Demo accounts

Use **Join with 1-Click** or visit:

- `http://localhost:3001/auth/google?email=student@techastra.local`
- `http://localhost:3001/auth/google?email=organizer@techastra.local`
- `http://localhost:3001/auth/google?email=admin@techastra.local`

## What’s implemented

- Public **events** list & detail, **1-click register**, **5-step host wizard**
- **Jobs** board, **communities**, **DevQuests**, teams, certificates
- **MailerHub** (templates, campaigns, Gmail pool, contacts, data export) + communications bulk send
- **File upload** (`POST /api/v1/upload`, `/upload/banner`)
- **Payments** — mock checkout by default; set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` for live orders
- Organizer / admin dashboards (role-gated); see [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)

## Deploy to Vercel

| | |
|--|--|
| **Live app** | https://techastra-zeta.vercel.app |
| **GitHub** | https://github.com/Procoder1234556/techastra |
| **Docs** | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

Production is a **monorepo deploy**: Vite static site + Express API (`api/index.js` serverless) + Supabase.

**Before the API works**, add `DATABASE_URL`, `SESSION_SECRET`, and `CLIENT_URL` in the Vercel project settings (see deployment doc), then redeploy.

```bash
vercel link
vercel --prod
```

## Environment

Copy `.env.example` to `.env` at the project root for `DATABASE_URL`, ports, and demo access code.

## Legacy database prefixes

If an old database used non-`techastra_*` table names, run `npm run migrate` (see `server/src/migrate-devnovate-to-techastra.sql`) or re-seed on a fresh schema.
