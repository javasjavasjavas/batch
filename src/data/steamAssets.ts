export const STEAM_DOCS = 'https://partner.steamgames.com/doc/store/assets';
export const STEAM_CHECKED = '2026-10-20';
export interface SteamAsset {
  id: string; name: string; group: 'Store' | 'Library' | 'Icons' | 'Extras' | 'Screenshots';
  width: number; height: number; format: 'png' | 'jpg'; requirement: string;
  description: string; note: string; source: string; logo?: boolean; brand?: boolean;
}
const store = `${STEAM_DOCS}/standard`;
const library = `${STEAM_DOCS}/libraryassets`;
const icons = `${STEAM_DOCS}/community`;
const events = `${STEAM_DOCS}/eventassets`;
export const STEAM_ASSETS: SteamAsset[] = [
  { id: 'header-capsule', name: 'Header Capsule', group: 'Store', width: 920, height: 430, format: 'png', requirement: 'Required', description: 'Primary store-page banner and recommendation artwork.', note: 'Keep the game title readable. Artwork and game branding only.', source: store, brand: true },
  { id: 'small-capsule', name: 'Small Capsule', group: 'Store', width: 462, height: 174, format: 'png', requirement: 'Required', description: 'Compact artwork for store lists and search results.', note: 'Use a large, readable game title at this small size.', source: store, brand: true },
  { id: 'main-capsule', name: 'Main Capsule', group: 'Store', width: 1232, height: 706, format: 'png', requirement: 'Required', description: 'Featured artwork for prominent store placements.', note: 'Game artwork, title and official subtitle only.', source: store, brand: true },
  { id: 'vertical-capsule', name: 'Vertical Capsule', group: 'Store', width: 748, height: 896, format: 'png', requirement: 'Required', description: 'Portrait artwork for sales and store promotions.', note: 'Check the portrait crop and keep the title readable.', source: store, brand: true },
  { id: 'library-capsule', name: 'Library Capsule', group: 'Library', width: 600, height: 900, format: 'png', requirement: 'Required', description: 'Game cover in library collections and overview.', note: 'Must include the game logo. Steam creates the 300 × 450 version.', source: library, brand: true },
  { id: 'library-header', name: 'Library Header', group: 'Library', width: 920, height: 430, format: 'png', requirement: 'Required', description: 'Wide artwork for library placements such as Recent Games.', note: 'Keep the game logo readable. Store header is the fallback.', source: library, brand: true },
  { id: 'library-hero', name: 'Library Hero', group: 'Library', width: 3840, height: 1240, format: 'png', requirement: 'Required', description: 'Wide background above the library details page.', note: 'Artwork only: no title or text. Replace the source if it has lettering. Check the official safe-area template. Steam creates 1920 × 620.', source: library },
  { id: 'library-logo', name: 'Library Logo', group: 'Library', width: 1280, height: 720, format: 'png', requirement: 'Required', description: 'Transparent game logo placed over the library hero.', note: 'Separate transparent logo required. Preserves its ratio within 1280 × 720, touching at least one limit. Steam creates the half-size version.', source: library, logo: true },
  { id: 'shortcut-icon', name: 'Shortcut Icon', group: 'Icons', width: 256, height: 256, format: 'png', requirement: 'Required', description: 'Icon for desktop shortcuts.', note: 'Steam accepts PNG and creates the ICO file. Use a recognizable symbol.', source: icons },
  { id: 'shortcut-icon-512', name: 'Shortcut Icon · 512', group: 'Icons', width: 512, height: 512, format: 'png', requirement: 'Alternative', description: 'Larger accepted shortcut icon size.', note: 'Alternative to the 256 px icon; both sizes are accepted.', source: icons },
  { id: 'app-icon', name: 'App Icon', group: 'Icons', width: 184, height: 184, format: 'jpg', requirement: 'Required', description: 'Small icon for library lists, chat and notifications.', note: 'JPG output. Transparent areas use the chosen background color.', source: icons },
  { id: 'page-background', name: 'Page Background', group: 'Extras', width: 1438, height: 810, format: 'png', requirement: 'Optional', description: 'Ambient background behind the store page.', note: 'Keep the artwork subtle so page content remains readable.', source: store },
  { id: 'bundle-header', name: 'Bundle Header', group: 'Extras', width: 707, height: 232, format: 'png', requirement: 'For bundles', description: 'Banner at the top of a bundle detail page.', note: 'Only needed when publishing a bundle.', source: store, brand: true },
  { id: 'event-cover', name: 'Event Cover', group: 'Extras', width: 800, height: 450, format: 'png', requirement: 'For events', description: 'Cover for event and announcement listings.', note: 'Required when creating an event, not for the base game release.', source: events },
  { id: 'event-header', name: 'Event Header', group: 'Extras', width: 1920, height: 622, format: 'png', requirement: 'Optional for events', description: 'Wide header for an event detail page.', note: 'Review the event template for clipping.', source: events },
];
export function screenshotAsset(index: number): SteamAsset {
  return { id: `screenshot-${String(index + 1).padStart(2, '0')}`, name: `Screenshot ${index + 1}`, group: 'Screenshots', width: 1920, height: 1080, format: 'jpg', requirement: 'Required · at least 5', description: 'Real gameplay capture for the store gallery.', note: 'Actual gameplay only. Do not substitute key art. 1920 × 1080 is the minimum 16:9 export.', source: store };
}
