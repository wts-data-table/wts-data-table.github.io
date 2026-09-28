import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const siteOrigin = 'https://wts-data-table.github.io';

// Validate the published HTML, not Angular route declarations. This catches links
// that work through client-side fallbacks but have no deployed page or anchor.
export function checkSiteLinks(pages, files, origin = siteOrigin) {
  const documents = new Map();
  const errors = new Set();
  let checked = 0;
  const pageUrl = file => new URL(file.replace(/index\.html$/, ''), origin + '/').href;
  for (const [file, html] of pages) {
    documents.set(file, new JSDOM(html, { url: pageUrl(file) }));
  }
  const redirectFor = document => {
    const refresh = [...document.querySelectorAll('meta[http-equiv]')]
      .find(tag => tag.httpEquiv.toLowerCase() === 'refresh');
    return refresh?.content.match(/;\s*url\s*=\s*(.+)$/i)?.[1].replace(/^["']|["']$/g, '');
  };
  const resolveFile = url => {
    const path = decodeURIComponent(url.pathname).replace(/^\//, '');
    if (files.has(path)) return path;
    const index = path.replace(/\/$/, '') + (path ? '/' : '') + 'index.html';
    return files.has(index) ? index : undefined;
  };

  function inspect(source, raw, base, kind = 'link') {
    try {
      let target = new URL(raw, base);
      if (target.protocol === 'javascript:') throw new Error('JavaScript URL is not a crawlable link');
      if (!['http:', 'https:'].includes(target.protocol) || target.origin !== origin) return;
      checked++;
      const visited = new Set();
      for (;;) {
        const file = resolveFile(target);
        if (!file) throw new Error(`missing file/page ${target.pathname}`);
        if (visited.has(file)) throw new Error(`redirect loop at ${target.pathname}`);
        visited.add(file);
        const document = documents.get(file)?.window.document;
        if (!document) return; // Downloadable assets do not have HTML anchors.
        const redirect = redirectFor(document);
        if (redirect) {
          const next = new URL(redirect, document.baseURI);
          if (!next.hash) next.hash = target.hash;
          if (next.origin !== origin) return;
          target = next;
          continue;
        }
        const fragment = decodeURIComponent(target.hash.slice(1).split(':~:')[0]);
        if (kind !== 'image' && fragment && !document.getElementById(fragment)
          && ![...document.querySelectorAll('a[name]')].some(a => a.name === fragment)) {
          throw new Error(`missing anchor #${fragment} on ${target.pathname}`);
        }
        return;
      }
    } catch (error) {
      errors.add(`${source}: ${kind} ${JSON.stringify(raw)} — ${error.message}`);
    }
  }

  try {
    for (const [file, dom] of documents) {
      const document = dom.window.document;
      for (const anchor of document.querySelectorAll('a[href], area[href]')) {
        inspect(file, anchor.getAttribute('href'), document.baseURI);
      }
      for (const image of document.querySelectorAll('img[src]')) {
        inspect(file, image.getAttribute('src'), document.baseURI, 'image');
      }
      const redirect = redirectFor(document);
      if (redirect) inspect(file, redirect, document.baseURI, 'redirect');
    }
  } finally {
    for (const dom of documents.values()) dom.window.close();
  }
  return { checked, errors: [...errors] };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const root = new URL('../dist/wts-data-table-angular-example/browser/', import.meta.url);
  const rootPath = fileURLToPath(root);
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  const files = new Set(entries.filter(entry => entry.isFile()).map(entry =>
    relative(rootPath, resolve(entry.parentPath, entry.name))));
  const pages = new Map(await Promise.all([...files]
    .filter(file => file.endsWith('.html') && file !== 'index.csr.html')
    .map(async file => [file, await readFile(new URL(file, root), 'utf8')])));
  assert(pages.size > 0, 'Build the portal before checking links');
  const result = checkSiteLinks(pages, files);
  assert.equal(result.errors.length, 0, '\n' + result.errors.join('\n'));
  console.log(`Verified ${result.checked} internal links, anchors, redirects, and images across ${pages.size} HTML pages.`);
}
