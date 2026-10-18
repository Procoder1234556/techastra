# TechAstra platform status

Last updated after MailerHub / upload / payment / event-wizard pass.

## Frontend routes (44/44)

All production paths remain registered. **Host event** is now a 4-step wizard (basics → schedule → details → publish) with banner upload and paid-event checkout hook.

| Area | Depth |
|------|--------|
| Events, jobs, communities, profile, auth | **Working** with Supabase |
| DevQuests, teams, certificates, organizer shell | **Working** (core flows) |
| Organizer mailer UI | **Working** against MailerHub subset |
| Marketing/legal | **Thin** copy |
| Visual parity vs devnovate.co | **Partial** — hero polish only |

## API (`/api/v1`)

| Status | Domains |
|--------|---------|
| **Implemented** | `events` (+ PATCH/DELETE/duplicate), `jobs`, `communities`, `users`, `organizer`, `teams`, `quests`, `registrations`, `certificates`, `notifications`, `communications` (send → campaigns), **`mailerhub`** (templates, campaigns, send, stats, inbox stub), **`upload`**, **`payment`** (mock + optional Razorpay keys), `checkin` (light) |
| **Still missing** | Full MailerHub (~30 more routes), `colleges`, `manager` API, rich `projects` API, production SMTP/Zepto, live AdSense/GA, full QR jsQR flow |

### MailerHub subset (implemented)

- `GET/POST /mailerhub/templates`
- `GET/POST /mailerhub/campaigns`
- `GET /mailerhub/campaigns/:id`
- `POST /mailerhub/campaigns/:id/send`
- `GET /mailerhub/campaigns/:id/stats`
- `GET /mailerhub/inbox` (stub)

## Data (Supabase `techastra_*`)

Core entities plus `mailer_templates`, `mailer_campaigns`, `mailer_deliveries`, `uploads`, `payments`.

## To refresh demo data

```bash
npm run migrate   # only if renaming legacy tables
npm run seed
```

## Environment

Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` for live orders; otherwise payment runs in **mock** mode.
