import { readHealingEntries, writeHealingSummary, healingSummaryPath } from '../tests/utils/healing-report.mjs';

const entries = await readHealingEntries();
await writeHealingSummary(entries);

console.log(`Self-healing summary written to ${healingSummaryPath}`);
console.log(`Total healed events: ${entries.length}`);
