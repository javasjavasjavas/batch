import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { render, SEO_PAGES, WORKSPACE_PATHS, TOOL_ALIASES, SITE_URL, metaForPath, structuredData } from '../dist-ssr/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
if (!template.includes('<!--seo-head-->')) throw new Error('Missing metadata insertion point');
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const paths = [...SEO_PAGES.map((page) => page.path), ...WORKSPACE_PATHS, '/404'];
for (const path of paths) {
  const meta = metaForPath(path);
  const tags = [
    `<title>${escape(meta.title)}</title>`,
    `<meta name="description" content="${escape(meta.description)}">`,
    `<meta name="robots" content="${meta.robots}">`,
    `<meta property="og:title" content="${escape(meta.title)}">`,
    `<meta property="og:description" content="${escape(meta.description)}">`,
    `<meta property="og:type" content="${meta.type}">`,
    '<meta property="og:site_name" content="Batch Image Kit">',
    '<meta property="og:locale" content="en_US">',
    `<meta property="og:image" content="${SITE_URL}/social-card.png">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="Batch Image Kit: free bulk image tools for every platform">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:image" content="${SITE_URL}/social-card.png">`,
    '<meta name="twitter:image:alt" content="Batch Image Kit: free bulk image tools for every platform">',
    `<meta name="twitter:title" content="${escape(meta.title)}">`,
    `<meta name="twitter:description" content="${escape(meta.description)}">`,
    ...(meta.canonical ? [`<link rel="canonical" href="${meta.canonical}">`, `<meta property="og:url" content="${meta.canonical}">`] : []),
    `<script id="page-schema" type="application/ld+json">${JSON.stringify(structuredData(path)).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');
  const file = path === '/' ? 'dist/index.html' : `dist${path}.html`;
  await mkdir(dirname(file), { recursive: true });
  const body = await render(path);
  if (!body.includes('<h1')) throw new Error(`Missing page content: ${path}`);
  await writeFile(file, template.replace('<!--seo-head-->', tags).replace('<div id="root"></div>', () => `<div id="root">${body}</div>`));
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${SEO_PAGES.map((page) => `  <url><loc>${SITE_URL}${page.path}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const redirects = [
  // Host redirects belong in Cloudflare Redirect Rules / Bulk Redirects.
  // Pages _redirects supports path redirects, not domain-level source rules.
  ...Object.entries(TOOL_ALIASES).flatMap(([from, to]) => [`${from} ${to} 301`, `${from}/ ${to} 301`]),
];
await writeFile('dist/_redirects', redirects.join('\n') + '\n');
await writeFile('dist/_headers', '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
console.log(`Prerendered ${SEO_PAGES.length} public pages, ${WORKSPACE_PATHS.length} workspace routes and a real 404. Sitemap and redirects generated.`);
