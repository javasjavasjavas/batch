import assert from 'node:assert/strict';
import { SEO_PAGES, WORKSPACE_PATHS, TOOL_ALIASES, SITE_URL } from '../dist-ssr/entry-server.js';

const jobs = [
  ...SEO_PAGES.map((page) => ({ ...page, kind: 'public' })),
  ...WORKSPACE_PATHS.map((path) => ({ path, kind: 'workspace' })),
  ...Object.entries(TOOL_ALIASES).map(([path, target]) => ({ path, target, kind: 'alias' })),
  { path: '/seo-audit-page-that-does-not-exist', kind: '404' },
];
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
async function check(job) {
  const response = await fetch(SITE_URL + job.path, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  if (job.kind === 'alias') {
    assert.equal(response.status, 301, `Alias status: ${job.path}`);
    assert.equal(new URL(response.headers.get('location'), SITE_URL).pathname, job.target);
  } else {
    assert.equal(response.status, job.kind === '404' ? 404 : 200, `Status: ${job.path}`);
    const html = await response.text();
    if (job.kind === 'public') {
      assert(html.includes(`<title>${escape(job.title)}</title>`), `Published title: ${job.path}`);
      assert(html.includes(`<meta name="description" content="${escape(job.description)}">`), `Published description: ${job.path}`);
      assert(html.includes('<meta property="og:image:type" content="image/png">'), `Social image metadata: ${job.path}`);
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
const socialImage = await fetch(`${SITE_URL}/social-card.png`, { signal: AbortSignal.timeout(20000) });
assert.equal(socialImage.status, 200);
assert(socialImage.headers.get('content-type')?.includes('image/png'));
const png = Buffer.from(await socialImage.arrayBuffer());
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);
const hostRedirects = ['www.batchimagekit.com', 'batchimagekit.pages.dev'];
await Promise.all(hostRedirects.flatMap((host) => ['http:', 'https:'].flatMap((protocol) =>
  ['/', '/tools/youtube-assets?utm_source=seo-audit&test=1'].map(async (path) => {
    const source = `${protocol}//${host}${path}`;
    const response = await fetch(source, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 301, `Host redirect status: ${source}`);
    assert.equal(response.headers.get('location'), SITE_URL + path, `Host redirect destination: ${source}`);
  })
)));
console.log(`Live SEO passed: ${SEO_PAGES.length} public pages, ${WORKSPACE_PATHS.length} workspace routes, ${Object.keys(TOOL_ALIASES).length} route redirects, ${hostRedirects.length} canonical host redirects (HTTP/HTTPS, paths and query strings), true 404, robots.txt and sitemap.xml.`);
