import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';

// An alternative accepted format derived from the canonical XML, not maintained
// separately. It does not guarantee Google will fetch or index the URLs.
export function textSitemap(xml) {
  const dom = new JSDOM(xml, { contentType: 'application/xml' });
  try {
    const root = dom.window.document.documentElement;
    const namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9';
    assert.equal(root.localName, 'urlset');
    assert.equal(root.namespaceURI, namespace);
    const urls = [...root.getElementsByTagNameNS(namespace, 'loc')].map(node => node.textContent.trim());
    assert(urls.length > 0);
    assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
    for (const value of urls) {
      const url = new URL(value);
      assert.equal(url.origin, 'https://wts-data-table.github.io', 'Only owned site URLs belong in this sitemap');
      assert(!url.hash && !url.search && !url.username && !url.password && !/\s/.test(value));
    }
    return urls.join('\n') + '\n';
  } finally { dom.window.close(); }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const root = new URL('../dist/wts-data-table-angular-example/browser/', import.meta.url);
  const content = textSitemap(await readFile(new URL('sitemap.xml', root), 'utf8'));
  await writeFile(new URL('sitemap.txt', root), content);
  console.log('Generated plain-text sitemap from the canonical XML URL list.');
}
