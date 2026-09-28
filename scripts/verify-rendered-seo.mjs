import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const root = new URL('../dist/wts-data-table-angular-example/browser/', import.meta.url);
const files = (await readdir(root, { recursive: true })).filter(file => /(^|\/)index\.html$/.test(file));
const titles = new Set();
const keywordSets = new Set();
const canonicalUrls = new Set();
let count = 0;
for (const file of files) {
  const dom = new JSDOM(await readFile(new URL(file, root), 'utf8'));
  const document = dom.window.document;
  if (document.querySelector('meta[http-equiv="refresh"]')) { dom.window.close(); continue; }
  const tags = document.querySelectorAll('meta[name="keywords"]');
  assert.equal(tags.length, 1, `${file}: exactly one keyword tag must be prerendered`);
  const keywords = tags[0].content.split(',').map(word => word.trim());
  assert(keywords.length >= 4 && keywords.length <= 12, `${file}: keep keywords focused`);
  assert.equal(new Set(keywords).size, keywords.length, `${file}: no repeated phrases`);
  assert(!keywordSets.has(tags[0].content), `${file}: use page-specific keywords`);
  keywordSets.add(tags[0].content);
  assert(!titles.has(document.title), `${file}: use a distinct page title`);
  titles.add(document.title);
  const description = document.querySelector('meta[name="description"]')?.content;
  assert(description, `${file}: description is required`);
  assert.equal(document.querySelector('meta[property="og:title"]')?.content, document.title, file);
  assert.equal(document.querySelector('meta[name="twitter:title"]')?.content, document.title, file);
  assert.equal(document.querySelector('meta[name="twitter:description"]')?.content, description, file);
  const path = file === 'index.html' ? '/' : '/' + file.replace(/index\.html$/, '');
  assert.equal(document.querySelector('link[rel="canonical"]')?.href, 'https://wts-data-table.github.io' + path, `${file}: canonical must identify this page`);
  canonicalUrls.add('https://wts-data-table.github.io' + path);
  if (path.startsWith('/docs/')) {
    const breadcrumbs = document.querySelectorAll('[itemscope][itemtype="https://schema.org/BreadcrumbList"]');
    assert.equal(breadcrumbs.length, 1, `${file}: one visible breadcrumb trail must be prerendered`);
    const items = [...breadcrumbs[0].querySelectorAll('[itemprop="itemListElement"]')];
    const names = path === '/docs/' ? ['Home', 'Documentation']
      : ['Home', 'Documentation', document.querySelector('h1')?.textContent.trim()];
    assert.deepEqual(items.map(item => item.querySelector('[itemprop="name"]')?.textContent.trim()), names, `${file}: breadcrumbs must identify the current page`);
    for (const [index, item] of items.entries()) {
      assert(item.hasAttribute('itemscope'), `${file}: ListItem requires a scope`);
      assert.equal(item.getAttribute('itemtype'), 'https://schema.org/ListItem', file);
      assert.equal(item.querySelector('meta[itemprop="position"]')?.content, String(index + 1), file);
      const link = item.querySelector('a[itemprop="item"]');
      if (index < items.length - 1) {
        assert.equal(link?.getAttribute('href'), index === 0 ? '/' : '/docs', `${file}: breadcrumb parents must link to the correct pages`);
      } else {
        assert(item.querySelector('[itemprop="name"][aria-current="page"]'), `${file}: identify the current breadcrumb accessibly`);
      }
    }
  }
  if (file === 'index.html') assert.equal(keywords.length, 12, 'Homepage must contain the 12 reviewed phrases');
  count++;
  dom.window.close();
}
assert.equal(count, 25, 'Verify all public content pages');
const sitemap = new JSDOM(await readFile(new URL('sitemap.xml', root), 'utf8'), { contentType: 'application/xml' });
const namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9';
assert.equal(sitemap.window.document.documentElement.localName, 'urlset', 'Sitemap must be a URL set');
assert.equal(sitemap.window.document.documentElement.namespaceURI, namespace, 'Sitemap must use the standard namespace');
const urls = [...sitemap.window.document.getElementsByTagNameNS(namespace, 'loc')].map(node => node.textContent.trim());
assert.equal(new Set(urls).size, urls.length, 'Sitemap must not contain duplicate URLs');
assert.deepEqual([...urls].sort(), [...canonicalUrls].sort(), 'Sitemap must list every prerendered canonical page, with no missing or stale URLs');
sitemap.window.close();
console.log(`Verified metadata, documentation breadcrumbs, canonical URLs, and complete sitemap coverage for ${count} prerendered pages.`);
