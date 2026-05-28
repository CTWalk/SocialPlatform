# Company Social Platform

This repository presents a social platform prototype together with the quality work used to verify it. The product simulates an internal company discussion space where posts may be published directly or routed into a layered review flow when they match moderation keywords.

## What The Product Does

- lets employees sign in and browse a shared discussion feed
- supports post creation, comments, and activity history
- applies keyword-based moderation rules
- routes sensitive posts into one, two, or three review layers
- restricts actions by role, such as viewer, member, reviewer, moderator, and administrator

## What This Repository Demonstrates

This showcase is focused on software test and delivery ability.

- CI pipelines for build, API checks, DB verification, performance smoke, web E2E, and mobile smoke
- Playwright coverage for key user journeys and role-based behavior
- database integrity verification with both in-memory and real Postgres paths
- lightweight API performance checks to catch obvious regressions
- practical test design that separates blocking quality gates from richer evidence runs

## Test And CI Overview

The automated checks are arranged in layers so the release gate stays clear and maintainable.

- Build verification
- API smoke tests
- DB integrity tests
- Performance smoke tests
- Blocking web E2E tests
- Blocking mobile smoke tests
- Evidence-oriented visual and role comparison suites

Useful reading order:

1. `docs/testing/test-strategy.md`
2. `docs/testing/測試計畫.md`
3. `tests/README.md`
4. `tests/e2e/evidence-index.md`

## Technical Stack

- Frontend: Angular
- Backend: Node.js and Express
- Database: SQLite with Postgres verification support
- E2E: Playwright
- CI/CD: GitHub Actions
- Mobile shell: Capacitor

## Common Commands

```bash
npm install
npm install --prefix server
npm run build
npm run verify:api
npm run test:db
npm run verify:perf
npm run verify:e2e
npm run verify:mobile-layout
```

## Notes For Reviewers

This repository is intentionally kept focused on project behavior, automation, and delivery quality. Internal planning notes and working materials are not part of this showcase copy.

This branch is a curated showcase branch. Ongoing engineering development should happen in the active development branch first, then be selectively synced here after validation.
