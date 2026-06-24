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
| `RefreshToken` | `refresh_token` | Admin session refresh tokens (hashed, revocable) |
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
| POST | `/api/auth/login` | `server/src/routes/auth.ts` | Verify credentials; issue access + refresh tokens |
| POST | `/api/auth/refresh` | `server/src/routes/auth.ts` | Validate refresh token cookie; issue new access token |

### Admin (requireAdmin middleware)

| Method | Path | File | Notes |
|--------|------|------|-------|
| POST | `/api/auth/logout` | `server/src/routes/auth.ts` | Revoke refresh token; clear cookie |
| GET | `/api/auth/me` | `server/src/routes/auth.ts` | Session check; return token payload |
| GET | `/api/people` | `server/src/routes/people.ts` | List all people with `_count` of relations |
| GET | `/api/people/:id` | `server/src/routes/people.ts` | Person detail with full relation history |
| PATCH | `/api/people/:id` | `server/src/routes/people.ts` | Update name, phone, notes, tags |
| DELETE | `/api/people/:id` | `server/src/routes/people.ts` | Delete person + cascade all relations |
| GET | `/api/contact` | `server/src/routes/contact.ts` | List all messages, newest first |
| PATCH | `/api/contact/:id/read` | `server/src/routes/contact.ts` | Mark message read |
| GET | `/api/analytics` | `server/src/routes/analytics.ts` | CF Zone Analytics; `?range=7\|14\|30` |

### SPA Catch-All

```typescript
app.get(['/admin', '/admin/*path'], (_req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'admin', 'index.html'));
});
```

Must come after all API routes. Named wildcard (`*path`) required for Express 5.

---

## Folder Structure

```
repo-root/
├── CLAUDE.md
├── package.json          ← scripts + prisma/dotenv deps (root-level; see docs/TECH_STACK.md)
├── prisma.config.ts      ← Prisma 6 config
├── railway.toml
├── .env.example
│
├── server/
│   ├── package.json      ← server runtime deps; no @prisma/client (resolves from root)
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts             ← Express entry; startup env validation; global JSON error handler
│       ├── lib/
│       │   └── prisma.ts        ← PrismaClient singleton
│       ├── middleware/
│       │   ├── auth.ts          ← requireAdmin; AdminPayload type; Request augmentation
│       │   └── rateLimiter.ts   ← formLimiter (subscribe/contact) + loginLimiter
│       ├── routes/
│       │   ├── subscribe.ts
│       │   ├── auth.ts          ← login, refresh, logout, me
│       │   ├── people.ts
│       │   ├── contact.ts       ← mixed: public POST + admin GET/PATCH
│       │   └── analytics.ts
│       ├── services/
│       │   ├── SubscriberService.ts
│       │   ├── AuthService.ts       ← login, refresh, logout
│       │   ├── PersonService.ts     ← upsertPerson, listPeople, getPerson, updatePerson, deletePerson
│       │   ├── ContactService.ts    ← createMessage, listMessages, markRead
│       │   └── AnalyticsService.ts  ← CF GraphQL; 15-min in-memory cache; DailyAnalytics upsert; local fallback
│       └── scripts/
│           └── seed-admin.ts        ← npm run seed:admin <email> <password>
│
├── client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts           ← admin SPA; base: '/admin/'; outDir: ../public/admin
│   ├── vite.teaser.config.ts    ← teaser; root: src/teaser/; base: '/'; outDir: ../public
│   ├── index.html               ← admin SPA HTML entry
│   └── src/
│       ├── admin.css            ← admin SPA styles
│       ├── main.tsx             ← admin SPA entry; BrowserRouter basename="/admin"
│       ├── App.tsx              ← routes: /login, / → /analytics, /analytics, /people, /contact
│       ├── context/
│       │   └── AuthContext.tsx  ← access token state (memory only); session restore on mount via /refresh
│       ├── lib/
│       │   └── apiFetch.ts      ← Bearer injection; auto-refresh on 401; redirects to /login on expiry
│       ├── components/
│       │   └── Layout.tsx       ← left nav: Dashboard → People → Inbox; site name links to public site
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── PeoplePage.tsx   ← two-panel: scrollable list + detail/edit panel
│       │   ├── ContactPage.tsx  ← inbox; inline expand; auto-mark-read on expand
│       │   └── AnalyticsPage.tsx ← 6-card grid (3 Zone + 3 RUM notices) + line chart + country bars
│       ├── types/
│       │   └── index.ts         ← Person, PersonDetail, Message, DailyData, AnalyticsResult, etc.
│       └── teaser/
│           ├── index.html
│           ├── main.tsx
│           ├── TeaserApp.tsx    ← teaser landing page; email subscribe form
│           └── teaser.css
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/                      ← all build output; committed to git for Railway
│   ├── index.html               ← React teaser build output (vite.teaser.config.ts)
│   ├── admin/                   ← React admin SPA build output (vite.config.ts)
│   │   ├── index.html
│   │   └── assets/
│   └── images/
│
├── docs/
│   ├── TECH_STACK.md
│   ├── ARCHITECTURE.md          ← this file
│   ├── SITE_DESIGN.md
│   ├── wip/                     ← empty; all features shipped
│   ├── archive/
│   └── adr/
│
├── shared/                      ← READ ONLY — do not edit in this repo
│   ├── SHARED_TECH_STACK.md
│   ├── SHARED_ADMIN_MODULES.md
│   └── SHARED_FEEDBACK.md
│
└── incoming/                    ← permanent; empty when no transition in progress
```

---

## Environment Variables

| Variable | Required | Where set | Purpose |
|----------|----------|-----------|---------|
| `DATABASE_URL` | Yes | Railway (auto-injected) | PostgreSQL connection string |
| `PORT` | No | Railway (auto-injected) | Server port; defaults to 3000 |
| `NODE_ENV` | Yes | Railway (set explicitly) | Set to `production`; do not rely on Railway injecting it |
| `JWT_SECRET` | Yes | Railway | 64-byte random hex for JWT signing; server exits on startup if missing |
| `CF_ANALYTICS_TOKEN` | Optional | Railway | Cloudflare Zone Analytics API token; analytics returns `source: 'unavailable'` if unset |
| `CF_ZONE_ID` | Optional | Railway | Cloudflare zone ID |
| `CF_ACCOUNT_ID` | Optional | Railway | Cloudflare account ID (not currently used in queries) |
| `CF_WEB_ANALYTICS_SITE_TAG` | Optional | Railway | Web Analytics site tag (Pro plan); RUM cards show setup notice if unset |
| `NOTIFICATION_EMAIL_ENDPOINT` | Optional | Railway | Fire-and-forget POST on contact form submission |
