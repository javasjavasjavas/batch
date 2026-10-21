import { describe, expect, it } from 'vitest';
import { normalizeRegion, createHeroMask, moveHeroRegion, resizeHeroRegion, type HeroRegionHandle } from '../src/processing/heroRegions';
import { STEAM_ASSETS } from '../src/data/steamAssets';

describe('Library Hero cleanup', () => {
  it('clamps selections and accepts drags in either direction', () => {
    expect(normalizeRegion(0.8, 0.7, 0.2, -0.1)).toEqual({ x: 0.2, y: 0, width: 0.6000000000000001, height: 0.7 });
    expect(normalizeRegion(-1, -1, 2, 2)).toEqual({ x: 0, y: 0, width: 1, height: 1 });
  });
  it('masks only selected pixels and combines overlapping rectangles', () => {
    const mask = createHeroMask([{ x: 0.25, y: 0.25, width: 0.5, height: 0.5 }, { x: 0.5, y: 0.5, width: 0.25, height: 0.25 }], 4, 4);
    expect([...mask]).toEqual([0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0]);
  });
  it('keeps hero at Steam resolution and excludes the separate logo overlay', () => {
    const hero = STEAM_ASSETS.find((asset) => asset.id === 'library-hero')!;
    expect(hero).toMatchObject({ width: 3840, height: 1240, format: 'png' });
    expect(hero.brand).toBeUndefined();
  });
  it('moves an area without changing its size and keeps it inside the image', () => {
    const region = { x: 0.2, y: 0.3, width: 0.4, height: 0.2 };
    expect(moveHeroRegion(region, -1, 2)).toEqual({ x: 0, y: 0.8, width: 0.4, height: 0.2 });
    expect(moveHeroRegion(region, 0.1, -0.1).x).toBeCloseTo(0.3);
    expect(region.x).toBe(0.2);
  });
  it('resizes from a corner while preserving the opposite corner', () => {
    const region = { x: 0.2, y: 0.3, width: 0.4, height: 0.2 };
    const resized = resizeHeroRegion(region, 'nw', -0.1, -0.2);
    expect(resized.x).toBeCloseTo(0.1);
    expect(resized.y).toBeCloseTo(0.1);
    expect(resized.x + resized.width).toBeCloseTo(0.6);
    expect(resized.y + resized.height).toBeCloseTo(0.5);
  });
  it('prevents handles crossing or leaving the image on all eight edges and corners', () => {
    const region = { x: 0.2, y: 0.3, width: 0.4, height: 0.2 };
    for (const handle of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as HeroRegionHandle[]) {
      for (const delta of [-2, 2]) {
        const resized = resizeHeroRegion(region, handle, delta, delta);
        expect(resized.x).toBeGreaterThanOrEqual(0);
        expect(resized.y).toBeGreaterThanOrEqual(0);
        expect(resized.x + resized.width).toBeLessThanOrEqual(1);
        expect(resized.y + resized.height).toBeLessThanOrEqual(1);
        expect(resized.width).toBeGreaterThanOrEqual(0.009999);
        expect(resized.height).toBeGreaterThanOrEqual(0.009999);
      }
    }
  });
  it('uses the adjusted rectangle in the removal mask', () => {
    const region = { x: 0, y: 0, width: 0.25, height: 0.25 };
    const moved = moveHeroRegion(region, 0.5, 0.5);
    const resized = resizeHeroRegion(moved, 'se', 0.25, 0.25);
    expect([...createHeroMask([resized], 4, 4)]).toEqual([0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1]);
  });
});
