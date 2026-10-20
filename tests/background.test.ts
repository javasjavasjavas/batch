import { describe, expect, it } from 'vitest';
import { extendGradient } from '../src/processing/gradient';
import { validateBatch } from '../src/utils/validation';
import { DEFAULT_SETTINGS, DEFAULT_ENABLED } from '../src/data/defaultSettings';

class TestImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width; this.height = height; this.data = new Uint8ClampedArray(width * height * 4);
  }
}
Object.assign(globalThis, { ImageData: TestImageData });

describe('background output', () => {
  it('extends a constant background without color seams in the new area', () => {
    const source = new ImageData(32, 32);
    for (let i = 0; i < source.data.length; i += 4) source.data.set([180, 200, 220, 255], i);
    const result = extendGradient(source, 64, 32, 16, 0, 32, 32);
    for (const x of [0, 15, 48, 63]) {
      expect([...result.data.slice((16 * 64 + x) * 4, (16 * 64 + x) * 4 + 4)]).toEqual([180, 200, 220, 255]);
    }
  });

  it('continues the direction of a soft gradient with opaque finite pixels', () => {
    const source = new ImageData(64, 64);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) source.data.set([150 + x, 150 + x, 150 + x, 255], (y * 64 + x) * 4);
    const result = extendGradient(source, 128, 64, 32, 0, 64, 64);
    const red = (x: number) => result.data[(32 * 128 + x) * 4];
    expect(red(0)).toBeLessThan(red(31));
    expect(red(127)).toBeGreaterThan(red(96));
    expect(Math.abs(red(31) - 150)).toBeLessThan(3);
    expect(result.data[(32 * 128 + 127) * 4 + 3]).toBe(255);
  });

  it('blocks JPG for transparent background and incompatible gradient sizing', () => {
    const transparent = { ...DEFAULT_SETTINGS, resize: { ...DEFAULT_SETTINGS.resize, backgroundMode: 'transparent' as const }, convert: { ...DEFAULT_SETTINGS.convert, format: 'jpg' as const } };
    expect(validateBatch(transparent, { ...DEFAULT_ENABLED, convert: true }, 1).some((i) => i.id === 'resize-alpha')).toBe(true);
    expect(validateBatch({ ...transparent, convert: { ...transparent.convert, format: 'png' } }, { ...DEFAULT_ENABLED, convert: true }, 1).some((i) => i.id === 'resize-alpha')).toBe(false);
    const gradient = { ...DEFAULT_SETTINGS, resize: { ...DEFAULT_SETTINGS.resize, backgroundMode: 'extend' as const } };
    expect(validateBatch(gradient, DEFAULT_ENABLED, 1).some((i) => i.id === 'resize-extend')).toBe(true);
    expect(validateBatch({ ...gradient, resize: { ...gradient.resize, lockAspect: false } }, DEFAULT_ENABLED, 1).some((i) => i.id === 'resize-extend')).toBe(false);
  });
});
