import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkSiteLinks } from './verify-site-links.mjs';

const origin = 'https://wts-data-table.github.io';
function audit(html, otherPages = {}, assets = []) {
  const pages = new Map(Object.entries({ 'index.html': html, ...otherPages }));
  return checkSiteLinks(pages, new Set([...pages.keys(), ...assets]));
}

test('resolves internal routes, canonical URLs, queries, base href, and encoded anchors', () => {
  const result = audit(`<base href="/"><a href="/docs?framework=react#install">Docs</a>
    <a href="${origin}/docs/#install">Canonical</a><a href="docs/index.html#hello%20world">Encoded</a>
    <a href="/docs#install:~:text=Install">Text fragment</a><a href="/docs#old">Legacy anchor</a>
    <a href="/manual.pdf">Download</a><img src="/preview.webp">
    <a href="https://example.com/no-page">External</a><a href="mailto:team@example.com">Email</a>`, {
    'docs/index.html': '<base href="/"><h1 id="install">Install</h1><p id="hello world"></p><a name="old"></a><a href="docs#install">Relative</a>',
  }, ['manual.pdf', 'preview.webp']);
  assert.deepEqual(result.errors, []);
  assert.equal(result.checked, 8);
});

test('fails for missing pages, anchors, images, and non-crawlable JavaScript links', () => {
  const result = audit('<a href="/missing">Missing</a><a href="/docs#missing">Anchor</a><img src="/gone.png"><a href="javascript:void(0)">Bad</a>', {
    'docs/index.html': '<h1>Docs</h1>',
  });
  assert.equal(result.errors.length, 4);
  assert(result.errors.some(error => error.includes('missing file/page /missing')));
  assert(result.errors.some(error => error.includes('missing anchor #missing')));
  assert(result.errors.some(error => error.includes('image "/gone.png"')));
  assert(result.errors.some(error => error.includes('not a crawlable link')));
});

test('honors the deployed base tag for fragment-only links', () => {
  const result = audit('<h1>Home</h1>', {
    'docs/index.html': '<base href="/"><a href="#install">Wrong route</a><h2 id="install">Install</h2>',
  });
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /missing anchor #install on \/$/);
});

test('follows redirects and checks anchors at the final document', () => {
  const result = audit('<a href="/examples#demo">Example</a>', {
    'examples/index.html': '<meta http-equiv="refresh" content="0;url=/examples/portfolio/">',
    'examples/portfolio/index.html': '<section id="demo"></section>',
  });
  assert.deepEqual(result.errors, []);
});

test('reports broken redirect targets and loops', () => {
  const result = audit('<a href="/a">Loop</a>', {
    'a/index.html': '<meta http-equiv="refresh" content="0;url=/b/">',
    'b/index.html': '<meta http-equiv="refresh" content="0;url=/a/">',
    'c/index.html': '<meta http-equiv="refresh" content="0;url=/missing/">',
  });
  assert(result.errors.some(error => error.includes('redirect loop')));
  assert(result.errors.some(error => error.includes('missing file/page /missing/')));
});

test('checks redirect fragments even without an incoming link', () => {
  const result = audit('<h1>Home</h1>', {
    'old/index.html': '<meta http-equiv="refresh" content="0;url=/docs#gone">',
    'docs/index.html': '<h1>Docs</h1>',
  });
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /missing anchor #gone/);
});

test('reports malformed paths without aborting the remaining audit', () => {
  const result = audit('<a href="/docs#%ZZ">Bad encoding</a><a href="/missing">Missing</a>', {
    'docs/index.html': '<h1>Docs</h1>',
  });
  assert.equal(result.errors.length, 2);
});
