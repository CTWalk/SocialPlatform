import fs from 'fs/promises';
import path from 'path';

export const healingArtifactsDir = path.join(process.cwd(), 'tests', 'artifacts', 'self-healing');
export const healingReportPath = path.join(healingArtifactsDir, 'healing-report.ndjson');
export const healingSummaryPath = path.join(healingArtifactsDir, 'healing-summary.md');

async function ensureHealingDir() {
  await fs.mkdir(healingArtifactsDir, { recursive: true });
}

export async function resetHealingArtifacts() {
  await ensureHealingDir();
  await Promise.all([
    fs.rm(healingReportPath, { force: true }),
    fs.rm(healingSummaryPath, { force: true }),
  ]);
}

export async function appendHealingEntry(entry) {
  await ensureHealingDir();
  await fs.appendFile(healingReportPath, `${JSON.stringify(entry)}\n`, 'utf8');
}

export async function readHealingEntries() {
  try {
    const raw = await fs.readFile(healingReportPath, 'utf8');
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function writeHealingSummary(entries) {
  await ensureHealingDir();

  const total = entries.length;
  const byStrategy = entries.reduce((acc, entry) => {
    acc[entry.strategy] = (acc[entry.strategy] || 0) + 1;
    return acc;
  }, {});

  const byTarget = entries.reduce((acc, entry) => {
    const key = entry.description || entry.primary;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const lines = [
    '# Self-Healing Summary',
    '',
    `- Total healed events: ${total}`,
    '',
    '## By Strategy',
    ...Object.entries(byStrategy)
      .sort((a, b) => b[1] - a[1])
      .map(([strategy, count]) => `- ${strategy}: ${count}`),
    '',
    '## By Target',
    ...Object.entries(byTarget)
      .sort((a, b) => b[1] - a[1])
      .map(([target, count]) => `- ${target}: ${count}`),
    '',
    '## Events',
    ...entries.map((entry) => {
      const testName = entry.testTitle ? ` | ${entry.testTitle}` : '';
      return `- ${entry.timestamp} | ${entry.strategy} | ${entry.primary} -> ${entry.healed}${testName}`;
    }),
    '',
  ];

  await fs.writeFile(healingSummaryPath, lines.join('\n'), 'utf8');
}
