import assert from 'node:assert/strict';
import { SEO_PAGES, WORKSPACE_PATHS, TOOL_ALIASES, SITE_URL } from '../dist-ssr/entry-server.js';

const jobs = [
  ...SEO_PAGES.map((page) => ({ path: page.path, kind: 'public' })),
  ...WORKSPACE_PATHS.map((path) => ({ path, kind: 'workspace' })),
  ...Object.entries(TOOL_ALIASES).map(([path, target]) => ({ path, target, kind: 'alias' })),
  { path: '/seo-audit-page-that-does-not-exist', kind: '404' },
];
async function check(job) {
  const response = await fetch(SITE_URL + job.path, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  if (job.kind === 'alias') {
    assert.equal(response.status, 301, `Alias status: ${job.path}`);
    assert.equal(new URL(response.headers.get('location'), SITE_URL).pathname, job.target);
  } else {
    assert.equal(response.status, job.kind === '404' ? 404 : 200, `Status: ${job.path}`);
    const html = await response.text();
    if (job.kind === 'public') {
      assert(html.includes(`<link rel="canonical" href="${SITE_URL}${job.path}">`), `Canonical: ${job.path}`);
      assert(html.includes('content="index,follow,max-image-preview:large"'), `Indexability: ${job.path}`);
      assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `H1: ${job.path}`);
    } else assert(html.includes('content="noindex,follow"'), `Noindex: ${job.path}`);
  }
}
for (let i = 0; i < jobs.length; i += 6) await Promise.all(jobs.slice(i, i + 6).map(check));
const sitemap = await fetch(`${SITE_URL}/sitemap.xml`).then((response) => { assert.equal(response.status, 200); return response.text(); });
assert.equal([...sitemap.matchAll(/<loc>/g)].length, SEO_PAGES.length);
const robots = await fetch(`${SITE_URL}/robots.txt`).then((response) => { assert.equal(response.status, 200); return response.text(); });
assert(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
console.log(`Live SEO passed: ${SEO_PAGES.length} public pages, ${WORKSPACE_PATHS.length} workspace routes, ${Object.keys(TOOL_ALIASES).length} redirects, true 404, robots.txt and sitemap.xml.`);
