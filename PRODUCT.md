# Techastra — Product Specification & Brand Truth

## Product Identity
* **Name**: Techastra
* **Tagline**: The Community Operating System for Student Builders, Hackathons, and DevQuests
* **Mission**: Empower campus developers, tech communities, and organizers with seamless event discovery, verifiable credentialing, gamified DevQuests, and frictionless check-ins.

## Audience & Personas
1. **Student Hackers & Builders**: Discover upcoming hackathons, form squads via team codes, track XP, solve DevQuests, earn verifiable certificates.
2. **Community Organizers**: Host workshops, manage 5-step event wizards, send targeted announcements via MailerHub, verify tickets via rapid QR scanning.
3. **Campus Leads & Partners**: Showcase college clubs, hire verified talent, sponsor quest tracks.

## Core Pillars & Surfaces
* **Discover & Feed (Persuade / Experience)**: Curated event feed, upcoming hackathons, trending DevQuests, campus club showcases.
* **Events & Ticketing (Operate)**: 5-step event creation wizard, custom registration questions, Razorpay checkout, encrypted QR tickets with offline cache.
* **DevQuests & XP (Experience / Operate)**: Gamified developer challenges, project submissions, peer upvoting, live XP leaderboard.
* **Teams & Collaboration (Operate)**: Team generation, join codes, role balancing (Frontend, Backend, AI).
* **MailerHub & Communications (Operate)**: Multi-provider email dispatch (SMTP, Zepto, Gmail pool), broadcast announcements, automated ticket receipts.

## Technical Architecture & Stack
* **Web Frontend**: React 19, TypeScript, Tailwind CSS v4 (`@theme`), Vite.
* **Mobile Frontend**: React Native Fabric / Kotlin Multiplatform + Compose & SwiftUI.
* **Backend**: Node.js, Express REST API (`/api/v1/*`), Supabase PostgreSQL (`techastra_*` schema).
* **Integrations**: Razorpay (Payments), IMAP/SMTP/Zepto (MailerHub), Firebase/APNs (Push Notifications).
