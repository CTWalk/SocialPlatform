# Test Folder Guide

This folder keeps the automated checks that support release confidence and showcase quality design.

## Main Structure

- `tests/api/`
  - API smoke tests
- `tests/db/`
  - DB integrity verification
- `tests/e2e/`
  - Playwright suites for web, mobile, roles, and evidence
- `tests/utils/`
  - shared helpers used by the Playwright suites
- `tests/mvp-smoke.spec.mjs`
  - small end-to-end showcase journey

## How The Suites Are Split

### Blocking suites

These are the suites used to protect the release path in CI.

- API smoke
- DB integrity
- performance smoke
- web E2E critical path
- mobile smoke

### Evidence-oriented suites

These are useful for review, screenshots, and deeper discussion, but they are kept outside the smallest blocking gate.

- desktop visual evidence
- mobile visual evidence
- role comparison evidence
- locator resilience showcase

## Helpful Reference Files

- `tests/e2e/evidence-index.md`
- `tests/role-permission-matrix.md`
- `tests/self-healing-locators.md`

## Typical Commands

```bash
npm run test:api
npm run test:db
npm run test:perf
npm run verify:e2e
npm run verify:mobile-layout
npm run test:evidence
```
