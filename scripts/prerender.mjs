import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { render, routeModules, SEO_PAGES, WORKSPACE_PATHS, TOOL_ALIASES, SITE_URL, metaForPath, structuredData } from '../dist-ssr/entry-server.js';

const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const template = await readFile('dist/index.html', 'utf8');
const advertising = JSON.parse(await readFile('src/config/advertising.json', 'utf8'));
const publisherConfigured = /^ca-pub-\d{16}$/.test(advertising.publisherId);
if (publisherConfigured) {
  await writeFile('dist/ads.txt', `google.com, ${advertising.publisherId.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
}
if (!template.includes('<!--seo-head-->')) throw new Error('Missing metadata insertion point');
const escape = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const pageImages = new Map();
const paths = [...SEO_PAGES.map((page) => page.path), ...WORKSPACE_PATHS, '/404', '/es/404'];
for (const path of paths) {
  const meta = metaForPath(path);
  // Discover the current route's modules from the HTML, without waiting for the app entry.
  const preloadFiles = new Set();
  function preload(module) {
    const chunk = manifest[module];
    if (!chunk) throw new Error('Missing route chunk: ' + module);
    if (preloadFiles.has(chunk.file)) return;
    preloadFiles.add(chunk.file);
    for (const dependency of chunk.imports || []) preload(dependency);
  }
  for (const module of routeModules(path)) preload(module);
  const routeTags = [...preloadFiles].filter(file => !template.includes('"/' + file + '"')).map(file => '<link rel="modulepreload" crossorigin href="/' + file + '">');
  const tags = [
    ...routeTags,
    ...(publisherConfigured ? [`<meta name="google-adsense-account" content="${advertising.publisherId}">`] : []),
    `<title>${escape(meta.title)}</title>`,
    `<meta name="description" content="${escape(meta.description)}">`,
    `<meta name="robots" content="${meta.robots}">`,
    `<meta property="og:title" content="${escape(meta.title)}">`,
    `<meta property="og:description" content="${escape(meta.description)}">`,
    `<meta property="og:type" content="${meta.type}">`,
    '<meta property="og:site_name" content="Batch Image Kit">',
    `<meta property="og:locale" content="${meta.locale === 'es' ? 'es_ES' : 'en_US'}">`,
    `<meta property="og:locale:alternate" content="${meta.locale === 'es' ? 'en_US' : 'es_ES'}">`,
    `<meta property="og:image" content="${SITE_URL}/social-card.png">`,
    '<meta property="og:image:type" content="image/png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${meta.locale === 'es' ? 'Batch — Herramientas gratis para imágenes en lote' : 'Batch — Free Bulk Image Tools'}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:image" content="${SITE_URL}/social-card.png">`,
    `<meta name="twitter:image:alt" content="${meta.locale === 'es' ? 'Batch — Herramientas gratis para imágenes en lote' : 'Batch — Free Bulk Image Tools'}">`,
    `<meta name="twitter:title" content="${escape(meta.title)}">`,
    `<meta name="twitter:description" content="${escape(meta.description)}">`,
    ...(meta.canonical ? [`<link rel="canonical" href="${meta.canonical}">`, `<meta property="og:url" content="${meta.canonical}">`] : []),
    ...Object.entries(meta.alternates || {}).map(([lang, url]) => `<link rel="alternate" hreflang="${lang}" href="${url}">`),
    `<script id="page-schema" type="application/ld+json">${JSON.stringify(structuredData(path)).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');
  const file = path.endsWith('/') ? `dist${path}index.html` : `dist${path}.html`;
  await mkdir(dirname(file), { recursive: true });
  const body = await render(path);
  pageImages.set(path, [...new Set([...body.matchAll(/<img[^>]+src="(\/guides\/[^"?#]+)"/g)].map(match => match[1]))]);
  if (!body.includes('<h1')) throw new Error(`Missing page content: ${path}`);
  await writeFile(file, template.replace('<html lang="en">', `<html lang="${meta.locale}">`).replace('<!--seo-head-->', tags).replace('<div id="root"></div>', () => `<div id="root">${body}</div>`));
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${SEO_PAGES.map((page) => `  <url><loc>${SITE_URL}${page.path}</loc>${(pageImages.get(page.path) || []).map(src => `<image:image><image:loc>${SITE_URL}${escape(src)}</image:loc></image:image>`).join('')}</url>`).join('\n')}\n</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const redirects = [
  // Host redirects belong in Cloudflare Redirect Rules / Bulk Redirects.
  // Pages _redirects supports path redirects, not domain-level source rules.
  ...Object.entries(TOOL_ALIASES).flatMap(([from, to]) => [`${from} ${to} 301`, `${from}/ ${to} 301`]),
];
await writeFile('dist/_redirects', redirects.join('\n') + '\n');
await writeFile('dist/_headers', '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
console.log(`Prerendered ${SEO_PAGES.length} public pages, ${WORKSPACE_PATHS.length} workspace routes and a real 404. Sitemap and redirects generated.`);
