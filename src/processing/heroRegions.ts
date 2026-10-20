export interface HeroRegion { x: number; y: number; width: number; height: number }
export function normalizeRegion(x0: number, y0: number, x1: number, y1: number): HeroRegion {
  const x = Math.max(0, Math.min(1, Math.min(x0, x1))), y = Math.max(0, Math.min(1, Math.min(y0, y1)));
  return { x, y, width: Math.max(0, Math.min(1, Math.max(x0, x1)) - x), height: Math.max(0, Math.min(1, Math.max(y0, y1)) - y) };
}
export function regionContains(region: HeroRegion, x: number, y: number) {
  return x >= region.x && x <= region.x + region.width && y >= region.y && y <= region.y + region.height;
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
