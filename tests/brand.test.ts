import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { analyzeBrandPixels, BRAND_FONTS, contrast, edgeBackground, pixelBounds } from '../src/processing/brandAnalysis';
import { brandRoles } from '../src/processing/brand';
function mark(color: number[], transparent = false) {
  const data = new Uint8ClampedArray(40 * 30 * 4);
  for (let y = 0; y < 30; y++) for (let x = 0; x < 40; x++) {
    const inside = x >= 8 && x < 32 && y >= 8 && y < 22;
    data.set(inside ? [...color, 255] : [255, 255, 255, transparent ? 0 : 255], (y * 40 + x) * 4);
  }
  return data;
}
describe('image-derived branding', () => {
  it('extracts the actual logo color instead of the page defaults or flat background', () => {
    const result = analyzeBrandPixels(mark([220, 40, 60]), 40, 30);
    expect(result.colors[0]).toEqual({ hex: '#dc283c', origin: 'image' });
    expect(result.colors).toHaveLength(4);
    expect(new Set(result.colors.map(c => c.hex)).size).toBe(4);
    expect(result.colors.some(c => c.origin === 'suggested')).toBe(true);
    expect(result.removed).toBe(true);
  });
  it('produces repeatable but different kits for different artwork', () => {
    const a = analyzeBrandPixels(mark([220, 40, 60]), 40, 30);
    const b = analyzeBrandPixels(mark([10, 50, 160]), 40, 30);
    expect(a).toEqual(analyzeBrandPixels(mark([220, 40, 60]), 40, 30));
    expect(a.colors).not.toEqual(b.colors);
    expect(a.signature).not.toEqual(b.signature);
  });
  it('keeps enclosed white artwork while removing only the connected border', () => {
    const data = mark([0, 0, 0]); data.set([255, 255, 255, 255], (15 * 40 + 20) * 4);
    const result = edgeBackground(data, 40, 30);
    expect(result.data[3]).toBe(0);
    expect(result.data[(15 * 40 + 20) * 4 + 3]).toBe(255);
    expect(data[3]).toBe(255);
    expect(pixelBounds(result.data, 40, 30)).toEqual({ x: 8, y: 8, width: 24, height: 14 });
  });
  it('does not remove non-uniform backgrounds or already-transparent borders', () => {
    const transparent = mark([25, 25, 25], true);
    expect(edgeBackground(transparent, 40, 30).data).toEqual(transparent);
    expect(edgeBackground(transparent, 40, 30).removed).toBe(false);
    const textured = mark([0, 0, 0]);
    for (let y = 0; y < 30; y++) for (let x = 0; x < 40; x++) if ((x + y) % 2 === 0) textured.set([100, 50, 10, 255], (y * 40 + x) * 4);
    expect(edgeBackground(textured, 40, 30).removed).toBe(false);
  });
  it('supports monochrome palettes and rejects fully invisible artwork', () => {
    for (const color of [[0, 0, 0], [255, 255, 255], [128, 128, 128]]) {
      const result = analyzeBrandPixels(mark(color, true), 40, 30);
      expect(result.colors).toHaveLength(4);
      expect(result.colors.every(c => /^#[0-9a-f]{6}$/.test(c.hex))).toBe(true);
      expect(BRAND_FONTS.some(f => f.id === result.fontId)).toBe(true);
    }
    expect(() => analyzeBrandPixels(new Uint8ClampedArray(16), 2, 2)).toThrow('No visible logo');
  });
  it('calculates text contrast against standard reference colors', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrast('#ffffff', '#ffffff')).toBe(1);
    expect(contrast('#123456', '#ffffff')).toEqual(contrast('#ffffff', '#123456'));
  });
  it('keeps light logos visible without hiding dark lettering in multicolor logos', () => {
    expect(brandRoles([{ hex: '#ffffff', origin: 'image' }, { hex: '#111111', origin: 'suggested' }, { hex: '#777777', origin: 'suggested' }]).logoBase).toBe('#111111');
    expect(brandRoles([{ hex: '#ef663e', origin: 'image' }, { hex: '#6657c7', origin: 'image' }, { hex: '#262345', origin: 'image' }, { hex: '#fef6f3', origin: 'suggested' }]).logoBase).toBe('#fef6f3');
    expect(brandRoles([{ hex: '#111111', origin: 'image' }, { hex: '#ffffff', origin: 'image' }, { hex: '#777777', origin: 'suggested' }]).logoBase).toBe('#ffffff');
  });
  it('ships real, locally available Google font binaries and their licenses', () => {
    for (const font of BRAND_FONTS) {
      const bytes = readFileSync(new URL(`../public/fonts/brand/${font.file}`, import.meta.url));
      expect(bytes.length).toBeGreaterThan(50000);
      expect(bytes.readUInt32BE(0)).toBe(0x00010000);
      const license = readFileSync(new URL(`../public/fonts/brand/${font.license}`, import.meta.url), 'utf8');
      expect(license).toContain('SIL OPEN FONT LICENSE');
      expect(license).toContain('Copyright');
    }
  });
});
