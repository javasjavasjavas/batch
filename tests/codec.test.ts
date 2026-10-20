import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { DEFAULT_SETTINGS, DEFAULT_ENABLED } from '../src/data/defaultSettings';
import { encodingOptions } from '../src/processing/encodingOptions';
import { toolsForWorkspace } from '../src/utils/workspace';

class TestImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray, width: number, height: number) { this.data = data; this.width = width; this.height = height; }
}
Object.assign(globalThis, { ImageData: TestImageData });

const wasm = (path: string) => readFileSync(new URL(`../node_modules/${path}`, import.meta.url));
const image = () => {
  const rgba = new Uint8ClampedArray(16 * 12 * 4);
  for (let y = 0; y < 12; y++) for (let x = 0; x < 16; x++) {
    const i = (y * 16 + x) * 4;
    if (x >= 4 && x < 12 && y >= 3 && y < 9) { rgba[i] = 255; rgba[i+3] = 255; }
  }
  return new TestImageData(rgba, 16, 12) as ImageData;
};

describe('actual WASM encoders', () => {
  it('applies quality 82 and 44 to the same photo in the standalone compression workspace', async () => {
    const { default: decode, init: initDecode } = await import('@jsquash/jpeg/decode.js');
    const { default: jpeg, init: initJpeg } = await import('@jsquash/jpeg/encode.js');
    const { default: webp, init: initWebp } = await import('@jsquash/webp/encode.js');
    await initDecode({ wasmBinary: wasm('@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm') });
    await initJpeg(await WebAssembly.compile(wasm('@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm')));
    await initWebp(await WebAssembly.compile(wasm('@jsquash/webp/codec/enc/webp_enc_simd.wasm')));
    const photo = readFileSync(new URL('../public/0f8e9c78-f8ec-47d6-858a-6c19973b8dfd.jpg', import.meta.url));
    const data = await decode(photo.buffer.slice(photo.byteOffset, photo.byteOffset + photo.byteLength));
    const enabled = toolsForWorkspace('compress', DEFAULT_ENABLED);
    const results = [];
    for (const quality of [82, 44]) {
      const settings = { ...DEFAULT_SETTINGS, compress: { ...DEFAULT_SETTINGS.compress, quality } };
      const options = encodingOptions(settings, enabled);
      results.push({ jpeg: (await jpeg(data, options.jpeg)).byteLength, webp: (await webp(data, options.webp)).byteLength });
    }
    expect(results[1].jpeg).toBeLessThan(results[0].jpeg);
    expect(results[1].webp).toBeLessThan(results[0].webp);
    console.info('Same-photo compression bytes (quality 82, 44):', results);
  }, 20000);

  it('switches between progressive and baseline JPEG scan formats', async () => {
    const { default: encode, init } = await import('@jsquash/jpeg/encode.js');
    await init(await WebAssembly.compile(wasm('@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm')));
    const scan = (bytes: Uint8Array) => {
      for (let i = 2; i + 1 < bytes.length; i++) if (bytes[i] === 0xff && [0xc0, 0xc2].includes(bytes[i+1])) return bytes[i+1];
      return null;
    };
    const data = image();
    expect(scan(new Uint8Array(await encode(data, { quality: 80, progressive: true, baseline: false })))).toBe(0xc2);
    expect(scan(new Uint8Array(await encode(data, { quality: 80, progressive: false, baseline: true })))).toBe(0xc0);
  });

  it('makes real lossless WebP whose decoded pixels match the input', async () => {
    const { default: encode, init: initEncode } = await import('@jsquash/webp/encode.js');
    const { default: decode, init: initDecode } = await import('@jsquash/webp/decode.js');
    await initEncode(await WebAssembly.compile(wasm('@jsquash/webp/codec/enc/webp_enc_simd.wasm')));
    await initDecode(await WebAssembly.compile(wasm('@jsquash/webp/codec/dec/webp_dec.wasm')));
    const data = image();
    const encoded = await encode(data, { lossless: 1, near_lossless: 100, quality: 100 });
    const decoded = await decode(encoded);
    expect([...decoded.data]).toEqual([...data.data]);
  });

  it('optimizes PNG at different effort levels without changing decoded pixels', async () => {
    const { default: encode, init: initEncode } = await import('@jsquash/png/encode.js');
    const { default: decode, init: initDecode } = await import('@jsquash/png/decode.js');
    const { default: optimise, init: initOptimise } = await import('@jsquash/oxipng/optimise.js');
    const png = wasm('@jsquash/png/codec/pkg/squoosh_png_bg.wasm');
    await initEncode(png); await initDecode(png); await initOptimise(wasm('@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm'));
    const data = image();
    const raw = await encode(data);
    for (const level of [0, 2, 5]) {
      const optimized = await optimise(raw, { level, interlace: false, optimiseAlpha: false });
      const decoded = await decode(optimized);
      expect([...decoded.data]).toEqual([...data.data]);
    }
  });
});
