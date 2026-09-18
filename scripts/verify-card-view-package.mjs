import * as licensing from 'wts-data-table/license';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const installed = JSON.parse(await readFile(new URL('../node_modules/wts-data-table/package.json', import.meta.url), 'utf8'));
const version = manifest.dependencies['wts-data-table'];
assert.match(version, /^\d+\.\d+\.\d+$/, 'Pin the exact published SDK version');
assert.equal(installed.version, version, 'Installed SDK must match the package pin');
assert.equal(lock.packages[''].dependencies['wts-data-table'], version, 'Root lockfile must match the package pin');
assert.equal(lock.packages['node_modules/wts-data-table'].version, version);
assert.equal(lock.packages['node_modules/wts-data-table'].resolved, `https://registry.npmjs.org/wts-data-table/-/wts-data-table-${version}.tgz`, 'Deploy the npm artifact, not a local development tarball');
if (typeof licensing.connectDataTableLicense !== 'function' || licensing.verifyDataTableLicense !== undefined) {
  throw new Error('Install WTS Data Table 1.1.1 or a compatible subscription-only release before deploying.');
}
console.log('Verified subscription-only licensing API.');
