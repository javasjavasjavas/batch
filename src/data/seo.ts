import { TOOLS } from './tools';
import { PLATFORM_PACKS } from './platforms';
import { HELP_ARTICLES } from './helpArticles';

export const SITE_URL = 'https://batchimagekit.com';
export interface SeoPage { path: string; title: string; description: string; kind: 'website' | 'tool' | 'article'; name: string }

export const PLATFORM_SEARCH: Record<string, { title: string; description: string; heading: string }> = {
  youtube: { title: 'YouTube Thumbnail & Banner Maker', heading: 'YouTube thumbnail and channel banner maker', description: 'Resize YouTube thumbnails, channel banners, Shorts covers and podcast artwork. Preview crops and safe areas, then download your creator kit for free.' },
  instagram: { title: 'Instagram Image Resizer: Posts, Stories & Reels', heading: 'Instagram image resizer for posts, Stories and Reels covers', description: 'Resize Instagram photos for square and portrait posts, Stories and Reels covers. Adjust framing and prepare multiple images locally, without an account.' },
  facebook: { title: 'Facebook Cover & Post Image Resizer', heading: 'Facebook cover photo and post image resizer', description: 'Prepare Facebook cover photos, profile pictures, posts and event covers. Preview each crop and download your image set without uploading photos to a server.' },
  linkedin: { title: 'LinkedIn Banner & Profile Picture Resizer', heading: 'LinkedIn banner and profile picture resizer', description: 'Create LinkedIn personal banners, company cover images, profile pictures and feed graphics. Adjust crops and export a consistent brand kit for free.' },
  discord: { title: 'Discord Server Icon & Banner Maker', heading: 'Discord server icon and banner maker', description: 'Prepare Discord server icons, banners, invite backgrounds and profile images. Review cropping and feature requirements before downloading your image kit.' },
  x: { title: 'X (Twitter) Header & Profile Picture Resizer', heading: 'X (Twitter) header and profile picture resizer', description: 'Resize X (Twitter) headers, profile pictures and post images. Keep your artwork framed consistently and export images locally in your browser for free.' },
  twitch: { title: 'Twitch Banner & Panel Image Resizer', heading: 'Twitch banner and panel image resizer', description: 'Prepare Twitch profile images, offline banners and information panels. Review each preset, adjust the crop and download a named image set from your browser.' },
  etsy: { title: 'Etsy Listing Photo & Shop Banner Resizer', heading: 'Etsy listing photo and shop banner resizer', description: 'Resize Etsy listing photos, shop banners and your shop icon. Prepare consistent product images with individual crop controls and download a named set.' },
  shopify: { title: 'Shopify Product Image Resizer', heading: 'Shopify product image resizer and store image kit', description: 'Batch resize Shopify product photos and prepare collection images and theme banners. Review framing and image dimensions before downloading your store kit.' },
  mobile: { title: 'App Store & Google Play Screenshot Maker', heading: 'App Store and Google Play screenshot maker', description: 'Resize real app screenshots and prepare App Store and Google Play icons and graphics. Organize images by device, add captions and export your launch kit.' },
};

const coreDescriptions: Record<string, string> = {
  resize: 'Resize up to 100 images at once for free. Set pixel dimensions or a percentage, crop or pad to fit, and download a ZIP. Photos stay on your device.',
  compress: 'Compress JPG, PNG and WebP images in bulk for free. Adjust quality, compare output sizes and download a ZIP. No account or server uploads required.',
  convert: 'Convert images to JPG, PNG or WebP in bulk for free. Choose transparency and quality settings, then download a ZIP. Files are processed on your device.',
  rename: 'Rename image files in bulk online with numbering, prefixes, suffixes and custom patterns. Preview every filename and download a ZIP without changing originals.',
};

export const SEO_PAGES: SeoPage[] = [
  { path: '/', name: 'Batch Image Kit', title: 'Free Bulk Image Tools & Asset Generators | Batch Image Kit', description: 'Resize, compress, convert and rename images in bulk. Create Steam, social media, shop and app store image kits for free. No account; images stay on your device.', kind: 'website' },
  { path: '/tools', name: 'Free image tools', title: 'Free Online Image Tools & Platform Asset Kits | Batch Image Kit', description: 'Find free bulk image tools and asset generators for Steam, YouTube, Instagram, Etsy, Shopify and more. Prepare images locally and download ready-to-use files.', kind: 'website' },
  ...TOOLS.map((tool): SeoPage => ({ path: `/tools/${tool.slug}`, name: tool.name, title: `${tool.name} Online – Free | Batch Image Kit`, description: coreDescriptions[tool.id], kind: 'tool' })),
  { path: '/tools/steam-assets', name: 'Steam Asset Generator', title: 'Steam Capsule & Library Asset Generator | Batch Image Kit', description: 'Create Steam store capsules, library artwork, icons and screenshot exports. Adjust each crop and download a named ZIP with dimensions and an asset guide.', kind: 'tool' },
  ...PLATFORM_PACKS.map((pack): SeoPage => ({ path: `/tools/${pack.id}-assets`, name: PLATFORM_SEARCH[pack.id].heading, title: `${PLATFORM_SEARCH[pack.id].title} | Batch Image Kit`, description: PLATFORM_SEARCH[pack.id].description, kind: 'tool' })),
  { path: '/help', name: 'Image processing guides', title: 'Bulk Image Processing Guides & Help | Batch Image Kit', description: 'Learn to resize, compress, convert and rename images in batches. Find output settings, supported formats, browser limits and practical step-by-step guides.', kind: 'website' },
  ...HELP_ARTICLES.map((article): SeoPage => ({ path: `/help/${article.slug}`, name: article.title, title: `${article.title} | Batch Image Kit`, description: article.summary, kind: 'article' })),
  { path: '/about', name: 'About Batch Image Kit', title: 'About Our Free Image Tools | Batch Image Kit', description: 'Learn how Batch Image Kit prepares images locally in your browser, why the tools are free, and how batch processing keeps your original files unchanged.', kind: 'website' },
  { path: '/privacy', name: 'Privacy policy', title: 'Privacy Policy & Local Image Processing | Batch Image Kit', description: 'Read how Batch Image Kit handles local image processing, browser storage, preferences and cookies, and what happens to the images you select.', kind: 'website' },
  { path: '/terms', name: 'Terms of use', title: 'Terms of Use | Batch Image Kit', description: 'Read the terms for using Batch Image Kit, including acceptable use, image ownership, browser limitations and responsibility for exported files.', kind: 'website' },
];

export const WORKSPACE_PATHS = ['', '/resize', '/compress', '/convert', '/rename'].flatMap((tool) => ['', '/review', '/run', '/results'].map((step) => `/app${tool}${step}`));
export const TOOL_ALIASES: Record<string, string> = Object.fromEntries(['steam', ...PLATFORM_PACKS.map((pack) => pack.id)].map((id) => [`/app/${id}`, `/tools/${id}-assets`]));
export const normalizePath = (path: string) => path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
export function pageForPath(path: string) {
  const normalized = normalizePath(path);
  return SEO_PAGES.find((page) => page.path === (TOOL_ALIASES[normalized] || normalized));
}
export function metaForPath(path: string) {
  const page = pageForPath(path);
  return {
    title: page?.title || (WORKSPACE_PATHS.includes(normalizePath(path)) ? 'Image Workspace | Batch Image Kit' : 'Page Not Found | Batch Image Kit'),
    description: page?.description || 'Use the free image tools at Batch Image Kit to prepare and download images locally in your browser.',
    canonical: page ? SITE_URL + page.path : undefined,
    robots: page ? 'index,follow,max-image-preview:large' : 'noindex,follow',
    type: page?.kind === 'article' ? 'article' : 'website',
  };
}
export function structuredData(path: string) {
  const page = pageForPath(path);
  if (!page) return [];
  const url = SITE_URL + page.path;
  const graph: Record<string, unknown>[] = [
    { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Batch Image Kit', url: SITE_URL, logo: `${SITE_URL}/favicon.svg` },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Batch Image Kit', url: SITE_URL, inLanguage: 'en', publisher: { '@id': `${SITE_URL}/#organization` } },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: 'en', isPartOf: { '@id': `${SITE_URL}/#website` } },
  ];
  if (page.path !== '/') {
    const parent = page.path.startsWith('/tools/') ? { name: 'Tools', path: '/tools' } : page.path.startsWith('/help/') ? { name: 'Help', path: '/help' } : null;
    const crumbs = [{ name: 'Home', path: '/' }, ...(parent ? [parent] : []), { name: page.name, path: page.path }];
    graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, name: crumb.name, item: SITE_URL + crumb.path })) });
  }
  if (page.kind === 'tool') graph.push({ '@type': 'WebApplication', '@id': `${url}#application`, name: page.name, url, description: page.description, applicationCategory: 'MultimediaApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript and a modern browser.', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, provider: { '@id': `${SITE_URL}/#organization` } });
  if (page.kind === 'article') graph.push({ '@type': 'TechArticle', headline: page.name, description: page.description, mainEntityOfPage: url, author: { '@id': `${SITE_URL}/#organization` }, publisher: { '@id': `${SITE_URL}/#organization` } });
  if (page.path === '/tools') graph.push({ '@type': 'ItemList', itemListElement: SEO_PAGES.filter((item) => item.kind === 'tool').map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, url: SITE_URL + item.path })) });
  return { '@context': 'https://schema.org', '@graph': graph };
}
