import assert from 'node:assert/strict';
import test from 'node:test';
import { textSitemap } from './build-text-sitemap.mjs';

const sitemap = urls => `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`;
test('creates one canonical URL per line without HTML or comments', () => {
  const urls = ['https://wts-data-table.github.io/', 'https://wts-data-table.github.io/docs/'];
  assert.equal(textSitemap(sitemap(urls)), urls.join('\n') + '\n');
});
test('rejects external npm pages, duplicates, and query or fragment variants', () => {
  for (const urls of [
    ['https://www.npmjs.com/package/wts-data-table'],
    ['https://wts-data-table.github.io/', 'https://wts-data-table.github.io/'],
    ['https://wts-data-table.github.io/docs/#install'],
    ['https://wts-data-table.github.io/docs/?framework=react'],
  ]) assert.throws(() => textSitemap(sitemap(urls)));
});
test('rejects empty and malformed XML', () => {
  assert.throws(() => textSitemap(sitemap([])));
  assert.throws(() => textSitemap('<urlset>'));
});
