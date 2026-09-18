import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const tracker = 'https://github.com/wts-data-table/wts-data-table.github.io/issues';
const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const html = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert(match, 'Software structured metadata is required');
const metadata = JSON.parse(match[1]);
assert.equal(manifest.bugs?.url, tracker);
assert.equal(metadata.softwareVersion, manifest.dependencies['wts-data-table'], 'Site version must match the pinned npm package');
assert.equal(metadata.license, 'https://wts-data-table.github.io/pricing', 'Package metadata must explain Standard MIT and Premium commercial licensing');
const docs = await readFile(new URL('../src/app/pages/docs-page.html', import.meta.url), 'utf8');
assert(docs.includes('class="version-badge">v' + manifest.dependencies['wts-data-table'] + '</span>'), 'Docs version badge must match the installed release');
assert.equal(metadata.softwareHelp?.url, tracker);
assert.equal(metadata.softwareHelp?.['@type'], 'WebPage');
assert(html.includes('<link rel="help" href="' + tracker + '"'), 'HTML help link must point to the issue tracker');
console.log('Portal package and structured metadata link to the public issue tracker.');

const analytics = html.match(/<script id="wts-google-analytics">([\s\S]*?)<\/script>/);
assert(analytics, 'Production Google Analytics initialization is required');
assert.equal((html.match(/id="wts-google-analytics"/g) ?? []).length, 1, 'Initialize analytics only once');
for (const origin of ['https://wts-data-table.github.io', 'http://localhost:4300', 'http://127.0.0.1:4300', 'https://preview.example']) {
  const scripts = [];
  const window = { location: { origin } };
  const document = {
    createElement(name) { assert.equal(name, 'script'); return {}; },
    head: { appendChild(script) { scripts.push(script); } },
  };
  runInNewContext(analytics[1], { window, document });
  if (origin === 'https://wts-data-table.github.io') {
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].async, true);
    assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-9W47VR2YWH');
    assert.deepEqual(Array.from(window.dataLayer[1]), ['config', 'G-9W47VR2YWH']);
    assert.equal(window.dataLayer.length, 2);
  } else {
    assert.equal(scripts.length, 0, 'Previews must not load Google Analytics');
    assert.equal(window.dataLayer, undefined);
  }
}
console.log('Google Analytics G-9W47VR2YWH is configured only for the production portal.');
