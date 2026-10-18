# TechAstra

Hackathons, jobs, and communities platform — React + Express + Supabase PostgreSQL.

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
cd techastra   # junction at repo root → `devnovate-clone` (same project)
npm install
npm install --prefix client --legacy-peer-deps
npm install --prefix server

# configure env (single file at project root)
copy .env.example .env

# rename legacy tables (if any), apply schema, seed demo data
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

Legacy `@devnovate.local` emails still work if your database was seeded before the rebrand.

## What’s implemented

- Public **events** list & detail, **1-click register**, **4-step host wizard** (banner upload, custom questions, paid events)
- **Jobs** board, **communities**, **DevQuests**, teams, certificates
- **MailerHub subset** (templates, campaigns, send, stats) + communications bulk send
- **File upload** (`POST /api/v1/upload`, `/upload/banner`)
- **Payments** — mock checkout by default; set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` for live orders
- Organizer / admin dashboards (role-gated); see `CLONE_STATUS.md` for gaps vs production

## Deploy to Vercel

Production deploy (frontend + API + Supabase) is documented in **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — env vars, verify checklist, and limitations.

Quick deploy after env is set in Vercel:

```bash
vercel --prod
```

## Environment

Copy `.env.example` to `.env` at the project root for `DATABASE_URL`, ports, and demo access code.

## Migrating from `devnovate_*` tables

If you already have data under the old `devnovate_*` prefix, either re-run `npm run seed` on a fresh schema or rename tables in Supabase (e.g. `ALTER TABLE devnovate_users RENAME TO techastra_users;` for each table) and re-apply `server/src/schema.sql` for any new tables.
