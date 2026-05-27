# Self-Healing Locators Showcase

This project includes a **scoped self-healing locator utility** for Playwright.

The goal is not to hide real regressions.  
The goal is to show understanding of a modern SDET topic:

- how self-healing locators work
- where they help
- where they become dangerous
- how to log healing events instead of silently masking them

## What Is Implemented

- `tests/utils/resilient-locator.mjs`
  - explicit resilient locator helper
- `tests/utils/healing-report.mjs`
  - writes healing events to an artifact log
- `tests/e2e/self-healing-showcase.spec.mjs`
  - intentionally demonstrates healing with stale primary locators
- `scripts/summarize-healing-report.mjs`
  - generates a markdown summary from the healing log

## Design Principle

This implementation is **opt-in**, not global.

That means:

- core tests do not automatically heal everything
- healing is only used where we explicitly choose to use it
- every healed event is logged

This is important because fully automatic healing can become risky:

- it may keep tests green for the wrong reason
- it may hide real UI regressions
- it may make debugging harder if no evidence is recorded

## Healing Strategy Order

Typical fallback order used in this project:

1. primary locator
2. `aria-label` / user-facing label
3. `getByRole(..., { name })`
4. `data-testid`
5. semantic fallback like `button[type="submit"]`

This order is intentional:

- user-facing and accessibility-aware signals are preferred
- brittle CSS fallback comes later

## Logged Evidence

When healing happens, we record:

- timestamp
- description
- original locator
- healed locator
- strategy used
- test file
- test title

Artifacts are generated under:

- `tests/artifacts/self-healing/healing-report.ndjson`
- `tests/artifacts/self-healing/healing-summary.md`

## Commands

- Run the healing showcase:

```bash
npm run test:self-healing
```

- Generate the summary again:

```bash
npm run report:self-healing
```

## What This Proves in Interview

This feature helps demonstrate that you understand:

- flaky-test maintenance cost
- selector strategy hierarchy
- auditability of self-healing behavior
- why self-healing should be constrained and observable

## Recommended Interview Framing

Use wording like this:

> I added a scoped self-healing locator layer to my Playwright project. It does not globally override locators. Instead, it allows explicit fallback strategies such as role-name, aria-label, and data-testid, and every healed event is logged into a report. That let me demonstrate how to reduce locator fragility while keeping the behavior auditable so we do not silently hide regressions.

## Important Limitation

This implementation should be presented honestly:

- it is a showcase of understanding
- it is not a claim that every flaky problem should be solved by healing
- it should support maintenance decisions, not replace them
