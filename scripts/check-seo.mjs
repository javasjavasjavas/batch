import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { SEO_PAGES, WORKSPACE_PATHS, TOOL_ALIASES, SITE_URL } from '../dist-ssr/entry-server.js';

const titles = new Set(), descriptions = new Set();
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const redirects = await readFile('dist/_redirects', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
assert(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
assert(!robots.includes('Disallow: /app'), 'Noindex routes must remain crawlable');
assert.equal([...sitemap.matchAll(/<loc>/g)].length, SEO_PAGES.length);
const publicPaths = new Set(SEO_PAGES.map((page) => page.path));
const inbound = new Set();
let checkedLinks = 0;
for (const page of SEO_PAGES) {
  const html = await readFile(page.path === '/' ? 'dist/index.html' : `dist${page.path}.html`, 'utf8');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert(title && description, `Missing metadata: ${page.path}`);
  assert(!titles.has(title), `Duplicate title: ${page.path}`); titles.add(title);
  assert(!descriptions.has(description), `Duplicate description: ${page.path}`); descriptions.add(description);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `Expected one H1: ${page.path}`);
  assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1, `Expected one canonical: ${page.path}`);
  assert(html.includes(`<link rel="canonical" href="${SITE_URL}${page.path}">`), `Incorrect canonical: ${page.path}`);
  assert(html.includes('content="index,follow,max-image-preview:large"'));
  assert(!html.includes('noindex'), `Public route marked noindex: ${page.path}`);
  assert(sitemap.includes(`<loc>${SITE_URL}${page.path}</loc>`), `Missing sitemap URL: ${page.path}`);
  assert(!html.includes('<!--seo-head-->') && !html.includes('vite.svg'));
  const schema = JSON.parse(html.match(/<script id="page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@context'], 'https://schema.org');
  assert(schema['@graph'].some((node) => node['@type'] === 'WebPage' && node.url === SITE_URL + page.path));
  assert(!JSON.stringify(schema).includes('aggregateRating'), 'Do not invent ratings');
  if (page.kind === 'tool') assert(schema['@graph'].some((node) => node['@type'] === 'WebApplication'));
  assert(html.includes(`${SITE_URL}/social-card.png`));
  for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:type', 'og:image:alt', 'og:image:width', 'og:image:height', 'og:locale']) {
    assert.equal([...html.matchAll(new RegExp(`<meta property="${key}" content="[^"]+"`, 'g'))].length, 1, `Missing or duplicate ${key}: ${page.path}`);
  }
  for (const key of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
    assert.equal([...html.matchAll(new RegExp(`<meta name="${key}" content="[^"]+"`, 'g'))].length, 1, `Missing or duplicate ${key}: ${page.path}`);
  }
  assert(html.includes('<main'), `No rendered main content: ${page.path}`);
  assert(!html.includes('Something went wrong'), `Rendered route error: ${page.path}`);
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    if (href === '/') { inbound.add(href); continue; }
    if (publicPaths.has(href) || WORKSPACE_PATHS.includes(href)) inbound.add(href);
    else {
      assert(!TOOL_ALIASES[href], `Internal link uses redirected alias: ${page.path} -> ${href}`);
      await access(`dist${href}`).catch(() => { throw new Error(`Broken internal link: ${page.path} -> ${href}`); });
    }
    checkedLinks++;
  }
  for (const [, src] of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) await access(`dist${src}`);
  for (const [, src] of html.matchAll(/src="(\/guides\/[^"?#]+)"/g)) await access(`dist${src}`);
  if (page.kind === 'article') assert(html.includes('<figcaption') && html.includes('loading="lazy"'), `Missing illustrated instructions: ${page.path}`);
}
for (const page of SEO_PAGES) assert(inbound.has(page.path), `Orphan public page: ${page.path}`);
for (const path of [...WORKSPACE_PATHS, '/404']) {
  const html = await readFile(`dist${path}.html`, 'utf8');
  assert(html.includes('content="noindex,follow"'), `Internal/404 route indexable: ${path}`);
  assert(!html.includes('rel="canonical"'), `Unnecessary internal canonical: ${path}`);
  assert(!sitemap.includes(`<loc>${SITE_URL}${path}</loc>`));
}
for (const [from, to] of Object.entries(TOOL_ALIASES)) assert(redirects.includes(`${from} ${to} 301`));
assert(!redirects.split('\n').some((line) => line.startsWith('https://')), 'Pages does not support domain-level source rules');
for (const path of ['/tools/bulk-image-resizer', '/tools/image-compressor', '/tools/image-converter', '/tools/bulk-file-renamer']) {
  const html = await readFile(`dist${path}.html`, 'utf8');
  assert(html.includes('<details') && html.includes('<summary'), 'FAQ answers must exist in initial HTML');
}
await access('dist/favicon.svg'); await access('dist/social-card.png');
console.log(`SEO checks passed: ${SEO_PAGES.length} public pages, ${WORKSPACE_PATHS.length} internal routes, 404, ${Object.keys(TOOL_ALIASES).length} aliases and ${checkedLinks} internal links.`);
