import fs from 'fs/promises';
import path from 'path';
import autocannon from 'autocannon';

const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3001';
const artifactDir = path.join(process.cwd(), 'tests', 'artifacts', 'performance');
const summaryJsonPath = path.join(artifactDir, 'perf-summary.json');
const summaryMdPath = path.join(artifactDir, 'perf-summary.md');

const scenarios = [
  {
    id: 'health',
    title: 'Health endpoint',
    path: '/health',
    headers: {},
    connections: 5,
    duration: 5,
    maxP95Ms: 250,
    minReqPerSec: 40,
  },
  {
    id: 'meta',
    title: 'Meta endpoint',
    path: '/meta',
    headers: {},
    connections: 5,
    duration: 5,
    maxP95Ms: 350,
    minReqPerSec: 30,
  },
  {
    id: 'review-tasks',
    title: 'Review queue endpoint',
    path: '/review-tasks',
    headers: {
      'x-role': 'Administrator',
      'x-username': 'manager.one',
    },
    connections: 4,
    duration: 5,
    maxP95Ms: 500,
    minReqPerSec: 15,
  },
];

function runScenario(options) {
  return new Promise((resolve, reject) => {
    autocannon(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

function evaluateResult(scenario, result) {
  const p95 = Number(result.latency?.p95 ?? result.latency?.average ?? 0);
  const throughput = Number(result.requests?.average ?? 0);
  const errors = Number(result.errors ?? 0);
  const non2xx = Number(result.non2xx ?? 0);
  const passed = errors === 0
    && non2xx === 0
    && p95 <= scenario.maxP95Ms
    && throughput >= scenario.minReqPerSec;

  return {
    id: scenario.id,
    title: scenario.title,
    path: scenario.path,
    passed,
    metrics: {
      p95Ms: p95,
      averageReqPerSec: throughput,
      errors,
      non2xx,
      durationSeconds: scenario.duration,
      connections: scenario.connections,
    },
    thresholds: {
      maxP95Ms: scenario.maxP95Ms,
      minReqPerSec: scenario.minReqPerSec,
      zeroErrors: true,
      zeroNon2xx: true,
    },
  };
}

function toMarkdown(results) {
  const lines = [
    '# API Performance Smoke Summary',
    '',
    `- Base URL: ${apiBaseUrl}`,
    `- Scenarios: ${results.length}`,
    `- Passed: ${results.filter((item) => item.passed).length}`,
    '',
    '## Results',
  ];

  for (const result of results) {
    lines.push(
      `- ${result.title}: ${result.passed ? 'PASS' : 'FAIL'} | p95=${result.metrics.p95Ms}ms | avg req/s=${result.metrics.averageReqPerSec.toFixed(2)} | errors=${result.metrics.errors} | non2xx=${result.metrics.non2xx}`,
    );
  }

  lines.push('', '## Thresholds');

  for (const result of results) {
    lines.push(
      `- ${result.title}: p95<=${result.thresholds.maxP95Ms}ms, avg req/s>=${result.thresholds.minReqPerSec}, errors=0, non2xx=0`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

await fs.mkdir(artifactDir, { recursive: true });

const results = [];
for (const scenario of scenarios) {
  const result = await runScenario({
    url: new URL(scenario.path, apiBaseUrl).toString(),
    method: 'GET',
    connections: scenario.connections,
    duration: scenario.duration,
    headers: scenario.headers,
  });
  results.push(evaluateResult(scenario, result));
}

await fs.writeFile(summaryJsonPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  baseUrl: apiBaseUrl,
  results,
}, null, 2), 'utf8');
await fs.writeFile(summaryMdPath, toMarkdown(results), 'utf8');

console.log(toMarkdown(results));

const failed = results.filter((item) => !item.passed);
if (failed.length) {
  throw new Error(`Performance smoke failed for: ${failed.map((item) => item.id).join(', ')}`);
}
