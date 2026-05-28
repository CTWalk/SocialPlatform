# E2E Evidence Index

This index explains the Playwright suites that are most useful for demo review and quality discussion.

## Critical User Flow Protection

- `tests/e2e/case-detail-attachments-comments.spec.mjs`
- `tests/e2e/cases-search-history.spec.mjs`
- `tests/e2e/comment-review-moderation.spec.mjs`
- `tests/e2e/profile-settings-drilldown.spec.mjs`
- `tests/e2e/role-403.spec.mjs`

These suites form the main blocking web E2E lane.

## Visual Evidence

- `tests/e2e/front-end-visual.spec.mjs`
- `tests/e2e/mobile-iphone-visual.spec.mjs`
- `tests/e2e/mobile-pixel-visual.spec.mjs`

These suites are intended for screenshots and review material, not the smallest blocking gate.

## Role And Permission Evidence

- `tests/e2e/role-matrix.spec.mjs`
- `tests/e2e/role-403.spec.mjs`
- `tests/role-permission-matrix.md`

## Mobile Coverage

- `tests/e2e/mobile-smoke.spec.mjs`
- `tests/e2e/mobile-iphone-visual.spec.mjs`
- `tests/e2e/mobile-pixel-visual.spec.mjs`

## Locator Resilience Showcase

- `tests/e2e/self-healing-showcase.spec.mjs`
- `tests/self-healing-locators.md`

This part of the suite is used to discuss locator maintenance strategy and auditability.
