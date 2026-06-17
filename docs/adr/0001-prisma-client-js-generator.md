# ADR-0001: Use prisma-client-js generator, not prisma-client

**Date:** 2026-06-16
**Status:** Accepted

## Context

Prisma 6 introduced a new default generator `prisma-client` which outputs the generated client to `src/generated/prisma/`. This conflicts with `rootDir: ./src` in tsconfig — TypeScript treats everything under `src/` as application source and the generated output causes module resolution failures at build time.

## Decision

Use the classic generator:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

This outputs to `node_modules/@prisma/client`, which sits outside `rootDir` and causes no tsconfig conflicts.

## Consequences

- Build succeeds cleanly with `rootDir: ./src`
- Same approach used in AbundanceArchitecture (see that repo's ADR-0003 for full rationale)
- Revisit when Prisma 7+ is adopted (requires Node >=20.19)
