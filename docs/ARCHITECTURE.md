# Architecture — Health Unveiled
*DB schema, API routes, data flows, folder structure notes.*
*For shared admin module contracts (auth, CRM, inbox, analytics), see `shared/SHARED_ADMIN_MODULES.md`.*

---

## Database Schema

Full Person-as-hub base schema per `shared/SHARED_ADMIN_MODULES.md`. No site-specific spoke models at this time. See `prisma/schema.prisma` for the canonical definition.

### Models

| Model | Table | Purpose |
|-------|-------|---------|
| `Person` | `person` | Hub — unified record for every person who interacts with the site |
| `NewsletterSubscriber` | `newsletter_subscriber` | Newsletter subscription spoke |
| `ContactMessage` | `contact_message` | Contact form submissions spoke |
| `RefreshToken` | `refresh_token` | Admin session refresh tokens |
| `DailyAnalytics` | `daily_analytics` | Persisted Cloudflare analytics aggregates |

### Source Site String

`'health-unveiled'` — used on `NewsletterSubscriber.sourceSite` and `ContactMessage.sourceSite`.

### Subscribe Flow

`POST /api/subscribe` → validates email → `SubscriberService.subscribe()` → upserts `Person` (by email) → upserts `NewsletterSubscriber` spoke (sets `active: true` on re-subscribe).

---

## API Routes

### Public

| Method | Path | File | Notes |
|--------|------|------|-------|
| GET | `/api/health` | `server/src/index.ts` | Health check — Railway healthcheck target |
| POST | `/api/subscribe` | `server/src/routes/subscribe.ts` | Email capture; rate-limited (10 req/15 min/IP) |

### Admin (Phase 4 — not yet implemented)

Auth, People CRM, Contact Inbox, Analytics routes — see `shared/SHARED_ADMIN_MODULES.md` for contracts.

---

## Folder Structure

```
repo-root/
├── CLAUDE.md
├── package.json          ← scripts + prisma deps (see docs/TECH_STACK.md — deviation from scripts-only)
├── prisma.config.ts      ← Prisma 6 config; at root alongside prisma/
├── railway.toml
├── .env.example
│
├── server/
│   ├── package.json      ← server runtime deps; no @prisma/client (resolves from root)
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts             ← Express entry point
│       ├── lib/
│       │   └── prisma.ts        ← PrismaClient singleton
│       ├── middleware/
│       │   └── rateLimiter.ts   ← formLimiter + loginLimiter
│       ├── routes/
│       │   └── subscribe.ts
│       ├── services/
│       │   └── SubscriberService.ts
│       └── scripts/             ← seed-admin.ts added in Phase 4
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── index.html        ← locked design reference (see CLAUDE.md What Never Changes)
│   ├── js/main.js        ← static teaser JS; removed when React replaces the teaser
│   └── images/
│
├── client/               ← Phase 5; React 18 + Vite
│
├── docs/
│   ├── TECH_STACK.md
│   ├── ARCHITECTURE.md   ← this file
│   ├── SITE_DESIGN.md
│   ├── wip/
│   ├── archive/
│   └── adr/
│
├── shared/               ← READ ONLY
│   ├── SHARED_TECH_STACK.md
│   ├── SHARED_ADMIN_MODULES.md
│   └── SHARED_FEEDBACK.md
│
└── incoming/             ← permanent; empty when no transition in progress
```

---

## Environment Variables

| Variable | Required | Where set | Purpose |
|----------|----------|-----------|---------|
| `DATABASE_URL` | Yes | Railway (auto-injected) | PostgreSQL connection string |
| `PORT` | No | Railway (auto-injected) | Server port; defaults to 3000 |
| `NODE_ENV` | Yes | Railway (set explicitly) | Set to `production`; do not rely on Railway injecting it |
| `JWT_SECRET` | Phase 4 | Railway | 64-byte random hex for JWT signing |
| `CF_ANALYTICS_TOKEN` | Phase 4 | Railway | Cloudflare Zone Analytics API token |
| `CF_ZONE_ID` | Phase 4 | Railway | Cloudflare zone ID |
| `CF_ACCOUNT_ID` | Phase 4 | Railway | Cloudflare account ID |
| `CF_WEB_ANALYTICS_SITE_TAG` | Phase 4 | Railway | Web Analytics site tag (Pro plan required) |
| `NOTIFICATION_EMAIL_ENDPOINT` | Optional | Railway | Fire-and-forget POST on contact submission |
