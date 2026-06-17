# ADR-0002: Bootstrap commit pushed directly to main

**Date:** 2026-06-16
**Status:** Accepted

## Context

The GitHub repository was created empty with no `main` branch. The project's standard git workflow (feature branches + PRs, never push directly to main) cannot be applied to the very first commit because there is no base branch to PR against.

## Decision

The initial scaffold commit is pushed directly to `main` to bootstrap the branch. All subsequent work follows the branch + PR workflow.

## Consequences

- This is a one-time exception documented here so future contributors understand why the first commit has no associated PR.
- Identical rationale and decision as AbundanceArchitecture ADR-0002.
- After this commit, `main` is the protected base branch and direct pushes are disallowed.
