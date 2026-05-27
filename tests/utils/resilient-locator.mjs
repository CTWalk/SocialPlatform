import { appendHealingEntry } from './healing-report.mjs';

async function locatorIsReady(locator, timeoutMs, state) {
  try {
    await locator.first().waitFor({ state, timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

function resolveLocator(page, candidate) {
  if (typeof candidate.locator === 'function') {
    return candidate.locator(page);
  }

  if (candidate.selector) {
    return page.locator(candidate.selector);
  }

  throw new Error(`Invalid locator candidate "${candidate.name || candidate.strategy || 'unknown'}"`);
}

function describeCandidate(candidate) {
  return candidate.selector || candidate.name || candidate.strategy || 'anonymous-candidate';
}

export async function resilientLocator(page, config, testInfo, options = {}) {
  const {
    description = config.description || 'unnamed-target',
    timeoutMs = 400,
    requireVisible = true,
  } = options;
  const readinessState = requireVisible ? 'visible' : 'attached';

  const primary = resolveLocator(page, config.primary);
  if (await locatorIsReady(primary, timeoutMs, readinessState)) {
    return {
      element: primary.first(),
      strategy: config.primary.strategy || 'primary',
      healed: false,
      description,
      primary: describeCandidate(config.primary),
    };
  }

  for (const fallback of config.fallbacks || []) {
    const locator = resolveLocator(page, fallback);
    if (await locatorIsReady(locator, timeoutMs, readinessState)) {
      const entry = {
        timestamp: new Date().toISOString(),
        description,
        primary: describeCandidate(config.primary),
        healed: describeCandidate(fallback),
        strategy: fallback.strategy || 'fallback',
        testFile: testInfo?.file || null,
        testTitle: testInfo?.title || null,
      };
      await appendHealingEntry(entry);
      return {
        element: locator.first(),
        strategy: fallback.strategy || 'fallback',
        healed: true,
        description,
        primary: describeCandidate(config.primary),
      };
    }
  }

  throw new Error(
    `[HEALING FAILED] Unable to locate "${description}" with primary "${describeCandidate(config.primary)}"` +
    ` after trying ${(config.fallbacks || []).length} fallback strategies.`,
  );
}
