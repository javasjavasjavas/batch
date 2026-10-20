import { describe, expect, it } from 'vitest';
import { cleanLogo, hasTransparency, removeSolidLogoBackground } from '../src/processing/logo';

class PixelImage {
  data: Uint8ClampedArray;
  constructor(public width: number, public height: number) { this.data = new Uint8ClampedArray(width * height * 4); }
}
Object.assign(globalThis, { ImageData: PixelImage });
const solid = (r = 255, g = 255, b = 255) => {
  const image = new ImageData(20, 20);
  for (let i = 0; i < image.data.length; i += 4) image.data.set([r, g, b, 255], i);
  return image;
};
const pixel = (image: ImageData, x: number, y: number, color: number[]) => image.data.set(color, (y * image.width + x) * 4);

describe('automatic logo background removal', () => {
  it('removes white backgrounds including enclosed letter counters while retaining lettering', async () => {
    const image = solid();
    for (let y = 5; y < 15; y++) for (let x = 5; x < 15; x++) pixel(image, x, y, [20, 50, 90, 255]);
    pixel(image, 10, 10, [255, 255, 255, 255]);
    const result = await cleanLogo(image, () => undefined);
    expect(result.removed).toBe(true);
    expect(result.data.data[3]).toBe(0);
    expect(result.data.data[(10 * 20 + 10) * 4 + 3]).toBe(0);
    expect([...result.data.data.slice((6 * 20 + 6) * 4, (6 * 20 + 6) * 4 + 4)]).toEqual([20, 50, 90, 255]);
    expect(image.data[3]).toBe(255);
  });
  it('handles a colored background and softens antialiased edges', () => {
    const image = solid(30, 80, 150);
    pixel(image, 8, 8, [255, 220, 70, 255]);
    pixel(image, 9, 8, [50, 90, 150, 255]);
    const result = removeSolidLogoBackground(image)!;
    expect(result.data[3]).toBe(0);
    expect(result.data[(8 * 20 + 8) * 4 + 3]).toBe(255);
    expect(result.data[(8 * 20 + 9) * 4 + 3]).toBeGreaterThan(0);
    expect(result.data[(8 * 20 + 9) * 4 + 3]).toBeLessThan(255);
  });
  it('preserves existing transparency and rejects blank logos', async () => {
    const image = solid(); image.data[3] = 0;
    expect(hasTransparency(image)).toBe(true);
    expect(await cleanLogo(image, () => undefined)).toEqual({ data: image, removed: false });
    await expect(cleanLogo(solid(), () => undefined)).rejects.toThrow('Could not separate');
  });
  it('routes a complex border to segmentation rather than erasing its colors', () => {
    const image = solid();
    for (let y = 0; y < 20; y++) for (let x = 0; x < 10; x++) pixel(image, x, y, [0, 0, 0, 255]);
    expect(removeSolidLogoBackground(image)).toBeNull();
  });
});
