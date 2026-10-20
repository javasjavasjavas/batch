import { describe, expect, it } from 'vitest';
import { normalizeRegion, createHeroMask } from '../src/processing/heroRegions';
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
});
