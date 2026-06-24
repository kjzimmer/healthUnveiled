# WIP: Phase 4 — Admin Foundation

**Status:** In progress
**Branch:** main
**Started:** 2026-06-24

## Scope

Backend API only. No admin UI (that is Phase 5 — React/Vite client).

Modules per `shared/SHARED_ADMIN_MODULES.md`:
- **Auth** — JWT + refresh tokens, seed-admin script
- **People CRM** — list, detail, update, delete
- **Contact Inbox** — submit (public), list (admin), mark-read
- **Analytics** — Cloudflare Zone Analytics, DailyAnalytics persistence, 15-min cache

## New Files

| File | Purpose |
|------|---------|
| `server/src/middleware/auth.ts` | `requireAdmin` middleware; AdminPayload type; Request augmentation |
| `server/src/services/AuthService.ts` | `login`, `refresh`, `logout` |
| `server/src/services/PersonService.ts` | `upsertPerson`, `listPeople`, `getPerson`, `updatePerson`, `deletePerson` |
| `server/src/services/ContactService.ts` | `createMessage`, `listMessages`, `markRead` |
| `server/src/services/AnalyticsService.ts` | CF GraphQL fetch, 15-min cache, DailyAnalytics upsert, local fallback |
| `server/src/routes/auth.ts` | `/api/auth/login`, `/refresh`, `/logout`, `/me` |
| `server/src/routes/people.ts` | `/api/people` CRUD |
| `server/src/routes/contact.ts` | `/api/contact` — public POST + admin GET/PATCH |
| `server/src/routes/analytics.ts` | `/api/analytics?range=7\|14\|30` |
| `server/src/scripts/seed-admin.ts` | CLI: `npm run seed:admin <email> <password>` |

## Updated Files

| File | Change |
|------|--------|
| `server/src/index.ts` | Add cookie-parser, mount new routers |
| `server/package.json` | Add bcryptjs, jsonwebtoken, cookie-parser (+ @types) |
| `package.json` | Update seed:admin script to pass --env-file |

## New Env Vars Required

| Var | Notes |
|-----|-------|
| `JWT_SECRET` | Required for auth. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |

## Optional Env Vars (analytics)

| Var | Notes |
|-----|-------|
| `CF_ANALYTICS_TOKEN` | Zone Analytics API token — returns `source: 'unavailable'` if not set |
| `CF_ZONE_ID` | Cloudflare zone ID |
| `CF_ACCOUNT_ID` | Cloudflare account ID (not used in analytics query but doc-required) |
| `CF_WEB_ANALYTICS_SITE_TAG` | Pro plan only — for RUM cards (not implemented in Phase 4 backend) |

## Post-Deploy Steps

After merging and deploying to Railway:
1. Verify `/api/health` still passes Railway health check
2. Run `npm run seed:admin <email> <password>` to create the first admin
3. Test `POST /api/auth/login` with admin creds → get accessToken
4. Smoke test all admin endpoints with Bearer token

## API Surface Added

```
POST /api/auth/login            Public + loginLimiter
POST /api/auth/refresh          Public (cookie)
POST /api/auth/logout           requireAdmin
GET  /api/auth/me               requireAdmin

GET    /api/people              requireAdmin
GET    /api/people/:id          requireAdmin
PATCH  /api/people/:id          requireAdmin
DELETE /api/people/:id          requireAdmin

POST   /api/contact             Public + formLimiter
GET    /api/contact             requireAdmin
PATCH  /api/contact/:id/read    requireAdmin

GET    /api/analytics?range=    requireAdmin (7|14|30, default 30)
```
