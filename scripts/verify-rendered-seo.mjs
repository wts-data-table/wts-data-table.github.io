import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const root = new URL('../dist/wts-data-table-angular-example/browser/', import.meta.url);
const files = (await readdir(root, { recursive: true })).filter(file => /(^|\/)index\.html$/.test(file));
const titles = new Set();
const keywordSets = new Set();
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
  if (file === 'index.html') assert.equal(keywords.length, 12, 'Homepage must contain the 12 reviewed phrases');
  count++;
  dom.window.close();
}
assert.equal(count, 22, 'Verify all public content pages');
console.log(`Verified keywords, distinct titles, social metadata, and canonical URLs in ${count} prerendered pages.`);
