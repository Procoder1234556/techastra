# Techastra — project status

Last updated after inbox sync, Razorpay host checkout, MailerHub support UI, and analytics env pass.

### REA / reference bundle (`/.rea-devnovate`)

| Check | Result |
|--------|--------|
| Normalized `/api/v1` paths | **0 missing** (`node .rea-devnovate/compare-apis-fixed.mjs`) |
| REA `analyze_javascript_application` | Reference SPA graph analyzed (summary evidence in MCP session) |
| Report script | `node scripts/rea-parity-report.mjs` |

Recent additions & parity fixes:
- Vite explicit root configuration resolving junction path discrepancies during production build.
- Fixed TypeScript compile errors (`TS6133` unused imports in `MyCertificates.tsx` and `SuperadminInvites.tsx`).
- Extended `/api/v1/teams/members/:teamCode` & `/api/v1/teams/members/:eventName/:teamCode` with joined event metadata and `isSubmitted`.
- Normalized `/api/v1/projects/*` and `/api/v1/quests/*` response envelopes (`success: true`) with dual backward-compatibility.
- Added `/api/v1/quests/submissions/:id/upvote` endpoint.
- Enriched `/api/v1/organizer/dashboard` with targeted `event` resolution when `?eventId=` query is provided.

## Frontend routes (44/44)

All registered app routes match the reference production SPA. **Host event** uses a **5-step** wizard (basic → details → content → FAQ → reg questions).

| Area | Depth |
|------|--------|
| Events, jobs, communities, profile, auth | **Working** with Supabase |
| Home / marketing | **Closer** — hero, stats, partners, testimonials, motion on key sections |
| DevQuests, teams, certificates, organizer shell | **Working** (core flows) |
| Organizer mailer UI | **Working** (MailerHub + organizer-mailer API) |
| Manager / superadmin | **Functional** dashboards + invites |
| MailerHub console | **Working** — support inbox, newsletter/unsubscribes tab, analytics campaigns |
| Payments | **Razorpay** on host publish + **paid event registration** (`lib/razorpay.ts`) |
| Nav | **Notification bell** — `/api/v1/notifications`, unread count, read-all |
| Discovery | Events/jobs/communities use **`/search`** and jobs **`/featured`** APIs |

## API (`/api/v1`)

| Status | Domains |
|--------|---------|
| **Implemented** | Core domains + **`colleges`**, **`manager/event`**, **`projects/*`**, **`invites/*`**, **`organizer-mailer/*`**, MailerHub **`providers/status`**, **`history`**, **`userbase/count`**, **`inbox/*`** (live IMAP when configured), registrations **bulk/download**, communities **search**, checkin **all/my** |
| **MailerHub console** | `/admin/mailerhub` — certificates, invitations, notifications, Gmail pool, support, admin, contacts, data, analytics, history, settings |
| **Email delivery** | **SMTP** (`EMAIL_*`), **Zepto** (`ZEPTOMAIL_TOKEN`), or **Gmail pool**; always logs + in-app notify |
| **Analytics (client)** | `VITE_GA_MEASUREMENT_ID`, `VITE_ADSENSE_CLIENT` via `AnalyticsScripts` (see `.env.example` for production IDs) |

## Data (Supabase `techastra_*`)

Schema in `server/src/schema.sql`. Run migrate/seed after pulling schema changes.

## To refresh demo data

```bash
npm run migrate   # legacy table renames only if needed
npm run seed
```

## Environment

Set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` for live orders.

**Email (see `.env.example`):** `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, or `ZEPTOMAIL_TOKEN`. Test from **Admin → MailerHub → Settings**.

**Inbox:** add a Gmail pool account with category **support** (app password). Install deps in `server/` (`imapflow` is listed in `package.json`) and **restart the API**.
