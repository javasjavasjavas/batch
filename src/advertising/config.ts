import settings from '../config/advertising.json';

export type AdPlacement = keyof typeof settings.units;
export const advertising = settings;
export const advertisingReady = settings.enabled && /^ca-pub-\d{16}$/.test(settings.publisherId)
  && settings.consentMessagePublished && settings.manualPlacementsConfirmed;
export const isAdHost = (host: string) => host === 'batchimagekit.com' || host === 'www.batchimagekit.com';
export const validAdUnit = (id: string) => /^\d{10}$/.test(id);
export function isAdRoute(path: string) {
  return path === '/' || path === '/tools' || path.startsWith('/tools/') || path === '/help' || path.startsWith('/help/')
    || /^\/app(?:\/(?:resize|compress|convert|rename))?(?:\/results)?\/?$/.test(path);
}
export const AD_FORMATS: Record<AdPlacement, string> = {
  'home-primary': 'banner', 'home-secondary': 'billboard',
  'tool-primary': 'tool', 'tool-secondary': 'content',
  'platform-primary': 'banner', 'platform-secondary': 'billboard',
  workspace: 'workspace', results: 'rectangle', directory: 'content',
  'guide-rail': 'rail', 'guide-inline': 'rectangle', help: 'content',
};
// Inline media queries are an officially supported AdSense code modification.
export const AD_SIZE_CSS = `
.batch-ad-banner,.batch-ad-tool{width:320px;height:100px}
.batch-ad-content,.batch-ad-billboard,.batch-ad-rectangle{width:300px;height:250px}
.batch-ad-rail{width:300px;height:600px}
.batch-ad-workspace{width:728px;height:90px}
@media(max-width:359px){.batch-ad-banner,.batch-ad-tool{width:280px;height:100px}.batch-ad-content,.batch-ad-billboard,.batch-ad-rectangle{width:280px;height:250px}}
@media(min-width:800px){.batch-ad-banner,.batch-ad-content,.batch-ad-billboard{width:728px;height:90px}}
@media(min-width:1024px){.batch-ad-tool{width:300px;height:250px}}
@media(min-width:1100px){.batch-ad-billboard{width:970px;height:250px}}
`;
