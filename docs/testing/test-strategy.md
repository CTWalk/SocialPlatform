# Test Strategy

## Purpose

This document explains how the project verifies product behavior, API correctness, database integrity, performance health, and mobile experience.

It answers three practical questions:

1. What is covered by automation today?
2. Which tests block release confidence, and which are kept as supporting evidence?
3. How does the test design balance realistic user behavior with stable CI execution?

## Testing Approach

The project uses layered validation instead of relying on one oversized end-to-end suite.

- fast checks first:
  - web build
  - API smoke
  - DB integrity
  - performance smoke
- release-facing user confidence next:
  - blocking web E2E
  - blocking mobile smoke
- richer supporting evidence separately:
  - visual capture
  - role comparison
  - locator resilience showcase

This separation keeps the blocking pipeline smaller and more stable, while still preserving useful demonstration material.

## Test Layers

| Layer | Goal | Main Entry Points | Blocking In CI |
| --- | --- | --- | --- |
| Build verification | Confirm the app compiles in its main target environments | `npm run build`, `npm run build:sit`, `npm run build:uat`, `npm run build:preprod` | Yes |
| API smoke | Verify key backend behavior quickly | `npm run test:api`, `npm run verify:api` | Yes |
| DB integrity | Verify schema, seed data, migration path, and read/write behavior | `npm run test:db`, `npm run verify:db` | Yes |
| Performance smoke | Catch obvious backend regressions with conservative thresholds | `npm run test:perf`, `npm run verify:perf` | Yes |
| Blocking web E2E | Validate critical user-facing flows end to end | `npm run test:e2e:ci`, `npm run verify:e2e` | Yes |
| Blocking mobile smoke | Validate critical mobile flows without full screenshot cost | `npm run test:mobile:smoke`, `npm run verify:mobile-layout` | Yes |
| Evidence suites | Preserve visual and role-based proof for review and demonstration | `npm run test:visual`, `npm run test:evidence`, `npm run test:mobile:evidence`, `npm run test:self-healing` | No |

## Current Automated Coverage

### API smoke

Primary file:
- `tests/api/api-smoke.test.mjs`

High-level coverage:
- health endpoint
- metadata endpoint
- role restrictions
- post creation
- moderation-triggered post state
- keyword rule administration

### DB integrity

Primary file:
- `tests/db/db-integrity.test.mjs`

High-level coverage:
- schema bootstrap
- core table presence
- seeded records
- basic insert and read behavior
- legacy schema migration
- Postgres-like verification via `pg-mem`
- real Postgres verification when `DATABASE_URL` is available

### Performance smoke

Primary file:
- `scripts/perf-smoke.mjs`

High-level coverage:
- `/health`
- `/meta`
- `/review-tasks`

Checks:
- p95 latency threshold
- minimum throughput floor
- zero request errors
- zero non-2xx responses

This is intentionally a smoke-level gate, not a full capacity or soak test.

### Blocking web E2E

Current blocking suite:
- `tests/e2e/case-detail-attachments-comments.spec.mjs`
- `tests/e2e/cases-search-history.spec.mjs`
- `tests/e2e/comment-review-moderation.spec.mjs`
- `tests/e2e/profile-settings-drilldown.spec.mjs`
- `tests/e2e/role-403.spec.mjs`

Protected behavior:
- thread reopening and detail continuity
- navigation and history continuity
- moderation approve and reject flows
- profile and settings drill-down reachability
- hard permission denial through API

### Blocking mobile smoke

Current blocking suite:
- `tests/e2e/mobile-smoke.spec.mjs`

Protected behavior:
- mobile tab navigation
- search entry on mobile
- mobile thread detail access
- mobile settings, rules, and admin reachability for admin role

### Evidence-oriented suites

Current evidence suite files:
- `tests/e2e/front-end-visual.spec.mjs`
- `tests/e2e/mobile-iphone-visual.spec.mjs`
- `tests/e2e/mobile-pixel-visual.spec.mjs`
- `tests/e2e/role-matrix.spec.mjs`
- `tests/e2e/self-healing-showcase.spec.mjs`
- `tests/mvp-smoke.spec.mjs`

Supporting references:
- `tests/e2e/evidence-index.md`
- `tests/README.md`
- `tests/self-healing-locators.md`
- `tests/role-permission-matrix.md`

## How The E2E Design Works

The Playwright strategy is intentionally hybrid.

### Real UI interaction

The suites use real user-facing interaction for:
- signing in
- tab and sidebar navigation
- moderation actions
- drill-down navigation
- profile and settings entry points

This protects real UI behavior instead of only testing backend contracts.

### Direct routes

Some scenarios also use direct route navigation for deterministic reopening and continuity checks.

Examples:
- deep-linking to a board thread with `board` and `postId`
- directly reopening moderation-related context

### Direct API setup

Some scenarios create posts, comments, or review-state setup through the API.

This is intentional:
- it avoids long UI setup chains
- it reduces flakiness
- it keeps E2E focused on the behavior under validation

The result is a practical balance:
- real UI for user journeys
- API and route shortcuts for stable setup and state control

## CI Lane Design

The CI design separates blocking confidence from richer evidence collection.

### Blocking lanes

- `verify:api`
- `verify:db`
- `verify:perf`
- `verify:e2e`
- `verify:mobile-layout`

These are optimized for:
- repeatability
- lower runtime cost
- lower flake risk
- release confidence

### Evidence lanes

- `test:visual`
- `test:evidence`
- `test:mobile:evidence`
- `test:self-healing`

These are optimized for:
- screenshots
- visual review
- role comparisons
- resilience demonstration

They are intentionally kept separate from the smallest blocking gate.

## Why This Is Showcase-Worthy

This strategy demonstrates more than test execution.

It shows deliberate testing design:
- layered coverage instead of one oversized suite
- role-based risk thinking
- mobile-specific coverage rather than desktop-only automation
- DB and performance verification in addition to UI tests
- explicit separation between release gates and supporting evidence
- practical flake control through focused CI subsets

## Current Boundaries

The current strategy does not claim to provide:
- full production load testing
- exhaustive visual regression across every screen state
- complete device-cloud coverage as a blocking gate

Instead, it provides:
- strong release-facing confidence on critical paths
- auditable evidence for review and demonstration
- a clear growth path for deeper performance and mobile expansion
