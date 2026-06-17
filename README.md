# Health Unveiled

Teaser landing page for [HealthUnveiled.world](https://healthunveiled.world) — an Express app serving a static teaser page with email capture backed by PostgreSQL via Prisma.

## Local Setup

### Prerequisites
- Node.js >=20.12.0
- PostgreSQL (local instance)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Create a local database
createdb health_unveiled_dev

# 3. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your local connection string

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Start dev server
npm run dev
# → http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Generate Prisma client + compile TypeScript to dist/ |
| `npm run start` | Start production server from dist/ |
| `npm run typecheck` | Type-check without emitting |

## API

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/health` | GET | — | `{ status: 'ok' }` |
| `/api/subscribe` | POST | `{ email: string }` | `{ success: true }` or `{ success: false, error: string }` |

## Deployment

Railway project: `foa-health-unveiled`

Branch `main` deploys to production. Railway runs:
1. Build: `npm run build`
2. Start: `npx prisma migrate deploy && npm run start`

Required Railway variables:
- `DATABASE_URL` — set as a Variable Reference to the Railway Postgres service
- `NODE_ENV=production`

## Hero Image

The hero background image slot is `public/images/hero.jpg`. Drop the final artwork there when ready — no code changes needed.
