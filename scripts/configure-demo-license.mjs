import { readFile, writeFile } from 'node:fs/promises';
const file = new URL('../public/license-config.json', import.meta.url);
const config = JSON.parse(await readFile(file, 'utf8'));
const origin = 'https://wts-data-table.github.io';
const key = process.env.WTS_DATA_TABLE_DEMO_KEY?.trim() || config.deployments?.[origin];
if (typeof key !== 'string' || !key.trim() || /[\x00-\x20]/.test(key)) {
  throw new Error('A real origin-bound WTS_DATA_TABLE_DEMO_KEY is required before deployment.');
}
config.deployments ??= {};
config.deployments[origin] = key;
await writeFile(file, JSON.stringify(config, null, 2) + '\n');
console.log('Public demo deployment key configured (value not logged).');
