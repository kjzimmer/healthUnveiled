# Health Unveiled — Teaser Page Setup Instructions
*For Claude Code sessions on the foa-health-unveiled repository*

---

## What This Document Is

A complete, step-by-step build spec for the HealthUnveiled.world teaser page. A
functionally identical teaser was already built for AbundanceArchitecture.world — that
repo (`kjzimmer/abundanceArchitecture`) is the canonical reference implementation.
Read this document, use that repo as the pattern, and you will reproduce the same
result for Health Unveiled.

---

## What Already Exists

- `docs/health-unveiled-teaser.html` — the approved teaser page design. The text
  differs from the AbundanceArchitecture teaser but the HTML/CSS structure is
  **identical**. Treat it as a pixel-perfect spec. Do not restyle, restructure, or
  improve the visual design or copy.
- The GitHub repo (`kjzimmer/healthUnveiled` or equivalent — confirm with user)
  has been created and is empty.
- A Railway project for this site exists (confirm project name with user).

---

## Target Repository Structure

```
src/
  server.ts                Express entry point
  db.ts                    Singleton PrismaClient
  routes/
    subscribe.ts           POST /api/subscribe route
  services/
    SubscriberService.ts   Subscriber persistence logic
public/
  index.html               Teaser page (moved from docs/ — do not modify)
  js/
    main.js                Client-side subscribe form + localStorage gate
  images/
    .gitkeep               Placeholder for future hero artwork
prisma/
  schema.prisma            People model + SubscriptionStatus enum
  migrations/              Committed migration history
  prisma.config.ts         Prisma 6 config (at project root, not in prisma/)
docs/
  adr/
    0001-...               ADRs for significant decisions
.env.example
.gitignore
package.json
tsconfig.json
railway.json
README.md
CHANGELOG.md
```

---

## Step 1 — Place the HTML

Copy `docs/health-unveiled-teaser.html` to `public/index.html`. Verify the copy is
byte-identical (`diff docs/health-unveiled-teaser.html public/index.html`).

The original in `docs/` can remain as a design reference.

---

## Step 2 — Apply CSS Fixes to public/index.html

The base HTML file has the same CSS variables and masthead styles as the original
AbundanceArchitecture teaser. Apply these exact CSS changes before serving the page —
they were iterated and approved on the AbundanceArchitecture build.

### 2a — Update CSS variables in `:root`

```css
/* Change these three values: */
--ink-mid: #1f1d1b;    /* was #4a4844 — body paragraphs now near-black, not gray */
--ink-light: #6b6764;  /* was #8a8780 — lighter elements more readable */
--paper: #eeeae0;      /* was #f7f5f0 — warm parchment rather than white */
```

### 2b — Replace the `.masthead` block and its text/link rules

Replace the existing masthead CSS with:

```css
.masthead {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--ink);
  box-shadow: 0 1px 6px rgba(0,0,0,0.18);
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.masthead-title {
  font-family: var(--sans);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--paper);          /* was var(--ink-mid) */
}

.masthead-links a {
  font-family: var(--sans);
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(247,245,240,0.6); /* was var(--ink-light) */
  text-decoration: none;
  transition: color 0.2s;
}

.masthead-links a:hover { color: var(--paper); } /* was var(--ink) */
```

### 2c — Wire the subscribe form

The form element will have `onsubmit="handleSubmit(event)"` inline. Remove that
attribute and replace the inline `<script>` block at the bottom of `<body>` with an
external reference:

```html
<script src="/js/main.js"></script>
```

---

## Step 3 — package.json

```json
{
  "name": "health-unveiled-teaser",
  "version": "0.1.0",
  "description": "Health Unveiled teaser landing page and Express server",
  "private": true,
  "main": "dist/server.js",
  "engines": { "node": ">=20.12.0" },
  "scripts": {
    "dev": "tsx watch --env-file .env src/server.ts",
    "build": "prisma generate && tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^6.19.3",
    "express": "^5.2.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.9.3",
    "dotenv": "^17.4.2",
    "prisma": "^6.19.3",
    "tsx": "^4.22.4",
    "typescript": "^6.0.3"
  }
}
```

**Why Prisma ^6, not latest:** the local development machine runs Node 20.12.2. Prisma
7+ requires Node >=20.19. Pin to `^6` until Node is upgraded. See the AbundanceArchitecture
ADR-0003 for full rationale.

Run `npm install` to populate `package-lock.json` with real resolved versions rather
than using the version numbers above verbatim.

---

## Step 4 — tsconfig.json

Exact baseline from the shared tech stack doc:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Step 5 — Prisma Schema

Run `npx prisma init --datasource-provider postgresql` first (generates
`prisma/schema.prisma` and `prisma.config.ts`).

**Critical:** Prisma 6 defaults to the new `prisma-client` generator which outputs
to `src/generated/prisma/`. This conflicts with `rootDir: ./src` in tsconfig and
causes TypeScript module resolution failures. Use the classic generator instead:

```prisma
generator client {
  provider = "prisma-client-js"   /* NOT "prisma-client" */
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum SubscriptionStatus {
  SUBSCRIBED
  UNSUBSCRIBED
}

model People {
  id           Int                @id @default(autoincrement())
  email        String             @unique
  status       SubscriptionStatus @default(SUBSCRIBED)
  subscribedAt DateTime           @default(now()) @map("subscribed_at")
  sourceSite   String             @default("health-unveiled") @map("source_site")

  @@map("people")
}
```

After updating the schema, run: `npx prisma generate`

The `prisma.config.ts` file generated at the project root is fine as-is (it uses
`dotenv/config` and `defineConfig` from `prisma/config`).

---

## Step 6 — Source Files

Copy these directly from `kjzimmer/abundanceArchitecture` — they are identical except
where noted.

### src/db.ts
No changes needed from the reference. Import is from `@prisma/client`.

### src/services/SubscriberService.ts
Identical to the reference. The `sourceSite` default in the Prisma schema handles
the `'health-unveiled'` value — no code change needed in the service.

### src/routes/subscribe.ts
Identical to the reference.

### src/server.ts
Identical to the reference.

### public/js/main.js
One change from the reference: update the localStorage key to be site-specific
(localStorage is origin-scoped so collision is impossible, but explicit keys are
clearer):

```js
const STORAGE_KEY = 'hu_subscribed';  /* reference uses 'aa_subscribed' */
```

Everything else in `main.js` is identical.

---

## Step 7 — Config Files

### .gitignore
```
node_modules/
dist/
.env
*.log
.DS_Store
```

### .env.example
```
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/health_unveiled_dev"
```

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm run start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Note: `prisma migrate deploy` runs migrations at boot. The app will not start if
`DATABASE_URL` is missing or the DB is unreachable.

---

## Step 8 — Local Database and Migration

1. Create a local Postgres database: `createdb health_unveiled_dev` (or via psql/pgAdmin).
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` with the local connection string.
3. Run the migration: `npx prisma migrate dev --name init`
4. Confirm the `people` table and `SubscriptionStatus` enum were created.

---

## Step 9 — Build and Smoke Test

```bash
npm run build    # should compile cleanly with no TypeScript errors
```

Start the server and verify all endpoints:
```bash
PORT=3100 node --env-file .env dist/server.js &

curl http://localhost:3100/health
# → {"status":"ok"}

curl -X POST http://localhost:3100/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# → {"success":true}

curl -X POST http://localhost:3100/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"bad-email"}'
# → {"success":false,"error":"Invalid email"}
```

Also open the page in a browser, submit the form, verify "Thank you" state, reload,
verify the localStorage gate holds.

---

## Step 10 — Railway Setup (Manual Steps)

After connecting the GitHub repo to the Railway project in the dashboard:

1. Add the Railway Postgres service's `DATABASE_URL` as a **Variable Reference** in
   the app service's Variables panel (Railway dashboard → app service → Variables →
   Add Reference → Postgres → DATABASE_URL).
2. Set `NODE_ENV=production` in the app service's variables.

The first deploy will run `prisma migrate deploy`, creating the `people` table in
production automatically.

---

## Step 11 — Git Workflow

This project follows the same rules as all FoA sites (see `shared-tech-stack-v1.1.md`):
feature branches + PRs, never push directly to `main`.

**Exception for the initial scaffold commit:** the GitHub repo is empty and has no
`main` branch yet, so the first commit must go directly to `main` to bootstrap it.
Document this in ADR-0002 (copy the ADR from AbundanceArchitecture, it's identical).

After the bootstrap commit, all subsequent work follows the branch + PR workflow.

---

## ADRs to Write

Copy ADR-0002 (`bootstrap-commit-to-main`) verbatim from AbundanceArchitecture —
the rationale is identical.

Write fresh ADRs for any decisions that differ from the AbundanceArchitecture build.
If the build is identical, a brief ADR noting "same approach as AbundanceArchitecture,
see that repo's ADRs for rationale" is acceptable.

---

## Reference Implementation

For any file where these instructions are ambiguous, read the corresponding file in
`kjzimmer/abundanceArchitecture` (the Health Unveiled build should be structurally
identical). Key files to reference:

- `src/server.ts`
- `src/db.ts`
- `src/routes/subscribe.ts`
- `src/services/SubscriberService.ts`
- `public/js/main.js`
- `railway.json`
- `prisma/schema.prisma`
- `prisma.config.ts`

---

## What Not to Do

- Do not use `prisma-client` as the generator provider — use `prisma-client-js`.
- Do not run `prisma migrate reset` on a database that has other projects' tables in it.
  Always create a fresh dedicated database for local development.
- Do not modify the visual design, typography, layout, or copy in `public/index.html`
  beyond the CSS changes specified in Step 2 of this document.
- Do not push directly to `main` after the bootstrap commit.
- Do not install Prisma 7+ until the local Node version is upgraded to >=20.19.
