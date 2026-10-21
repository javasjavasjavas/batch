export interface HeroRegion { x: number; y: number; width: number; height: number }
export function normalizeRegion(x0: number, y0: number, x1: number, y1: number): HeroRegion {
  const x = Math.max(0, Math.min(1, Math.min(x0, x1))), y = Math.max(0, Math.min(1, Math.min(y0, y1)));
  return { x, y, width: Math.max(0, Math.min(1, Math.max(x0, x1)) - x), height: Math.max(0, Math.min(1, Math.max(y0, y1)) - y) };
}
export function regionContains(region: HeroRegion, x: number, y: number) {
  return x >= region.x && x <= region.x + region.width && y >= region.y && y <= region.y + region.height;
}
export type HeroRegionHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export function moveHeroRegion(region: HeroRegion, dx: number, dy: number): HeroRegion {
  return { ...region, x: clamp(region.x + dx, 0, 1 - region.width), y: clamp(region.y + dy, 0, 1 - region.height) };
}
export function resizeHeroRegion(region: HeroRegion, handle: HeroRegionHandle, dx: number, dy: number): HeroRegion {
  let left = region.x, top = region.y, right = region.x + region.width, bottom = region.y + region.height;
  const minWidth = Math.min(0.01, region.width), minHeight = Math.min(0.01, region.height);
  if (handle.includes('w')) left = clamp(left + dx, 0, right - minWidth);
  if (handle.includes('e')) right = clamp(right + dx, left + minWidth, 1);
  if (handle.includes('n')) top = clamp(top + dy, 0, bottom - minHeight);
  if (handle.includes('s')) bottom = clamp(bottom + dy, top + minHeight, 1);
  return { x: left, y: top, width: right - left, height: bottom - top };
}
export function createHeroMask(regions: HeroRegion[], width: number, height: number) {
  const mask = new Float32Array(width * height);
  for (const region of regions) {
    const r = normalizeRegion(region.x, region.y, region.x + region.width, region.y + region.height);
    for (let y = Math.floor(r.y * height); y < Math.min(height, Math.ceil((r.y + r.height) * height)); y++) {
      for (let x = Math.floor(r.x * width); x < Math.min(width, Math.ceil((r.x + r.width) * width)); x++) mask[y * width + x] = 1;
    }
  }
  return mask;
}
