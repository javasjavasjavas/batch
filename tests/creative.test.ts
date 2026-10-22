import { describe, expect, it } from 'vitest';
import { ZipReader, BlobReader, BlobWriter } from '@zip.js/zip.js/lib/zip-core-external.js';
import { faviconManifest, icoBlob, safeStem, screenshotDimensions, STUDIO_DEFAULTS, watermarkBox, zipStudio } from '../src/processing/creative';
import { encodeToTarget } from '../src/processing/targetSize';
import { CREATIVE_TOOLS } from '../src/data/creativeTools';
import { localizedPath } from '../src/i18n/paths';
import { metaForPath } from '../src/data/seo';
import { translate } from '../src/i18n/translate';

describe('maximum image size', () => {
  it('finds the highest fitting quality without resizing', async () => {
    const result = await encodeToTarget({ width: 1200, height: 800, quality: 90, maxBytes: 4700, lossy: true, allowResize: false, encode: async (_w, _h, q) => new Uint8Array(1000 + q * 100) });
    expect(result.bytes.byteLength).toBe(4700);
    expect([result.width, result.height]).toEqual([1200, 800]);
  });
  it('never returns an oversized image or silently resizes', async () => {
    await expect(encodeToTarget({ width: 1000, height: 500, quality: 82, maxBytes: 1000, lossy: true, allowResize: false, encode: async () => new Uint8Array(2000) })).rejects.toThrow('could not be reached');
  });
  it('reduces lossless dimensions only with explicit permission', async () => {
    const result = await encodeToTarget({ width: 1000, height: 500, quality: 82, maxBytes: 100000, lossy: false, allowResize: true, encode: async (w, h) => new Uint8Array(w * h) });
    expect(result.bytes.byteLength).toBeLessThanOrEqual(100000);
    expect(result.width).toBeLessThan(1000);
    expect(result.width / result.height).toBeCloseTo(2, 1);
  });
  it('terminates when encoder overhead exceeds the requested limit', async () => {
    let calls = 0;
    await expect(encodeToTarget({ width: 10000, height: 100, quality: 82, maxBytes: 1000, lossy: false, allowResize: true, encode: async () => { calls++; return new Uint8Array(2000); } })).rejects.toThrow('could not be reached');
    expect(calls).toBeLessThanOrEqual(13);
  });
});

describe('creative tool exports', () => {
  it('adds frame and padding without distorting the screenshot', () => {
    expect(screenshotDimensions(1100, 680, STUDIO_DEFAULTS)).toEqual({ width: 1228, height: 848 });
    expect(screenshotDimensions(1100, 680, { padding: 16, frame: false })).toEqual({ width: 1132, height: 712 });
  });
  it('positions marks consistently on portrait and landscape images', () => {
    expect(watermarkBox(1000, 500, 200, 50, 4, 'bottom-right')).toEqual({ x: 780, y: 430 });
    expect(watermarkBox(500, 1000, 100, 50, 4, 'top-left')).toEqual({ x: 20, y: 20 });
    expect(watermarkBox(500, 1000, 100, 50, 4, 'center-center')).toEqual({ x: 200, y: 475 });
  });
  it('writes ICO directories with correct offsets and image bytes', async () => {
    const first = new Uint8Array([137, 80, 78, 71, 1]), second = new Uint8Array([137, 80, 78, 71, 2, 3]);
    const blob = await icoBlob([{ size: 16, blob: new Blob([first]) }, { size: 32, blob: new Blob([second]) }]);
    const buffer = await blob.arrayBuffer(), view = new DataView(buffer);
    expect(view.getUint16(2, true)).toBe(1); expect(view.getUint16(4, true)).toBe(2);
    expect(view.getUint32(18, true)).toBe(38); expect(view.getUint32(34, true)).toBe(43);
    expect([...new Uint8Array(buffer).slice(38)]).toEqual([...first, ...second]);
  });
  it('exports a real readable ZIP and respects cancellation', async () => {
    const outputs = [{ name: 'brand.json', blob: new Blob([JSON.stringify({ name: 'Test' })]) }, { name: 'colors.css', blob: new Blob([':root { --brand: #ffffff; }']) }];
    const zip = await zipStudio(outputs, new AbortController().signal);
    const reader = new ZipReader(new BlobReader(zip), { useWebWorkers: false });
    const entries = await reader.getEntries();
    expect(entries.map(e => e.filename)).toEqual(['brand.json', 'colors.css']);
    const first = entries[0];
    if (!first.directory) expect(await (await first.getData!(new BlobWriter())).text()).toBe('{"name":"Test"}');
    await reader.close();
    const controller = new AbortController(); controller.abort();
    await expect(zipStudio(outputs, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
  });
  it('keeps filenames safe and the manifest valid for unusual brand names', () => {
    expect(safeStem('../../My logo?.png')).toBe('My-logo');
    const manifest = JSON.parse(JSON.stringify(faviconManifest('A "quoted" brand', '#ffffff')));
    expect(manifest.name).toBe('A "quoted" brand');
    expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(['192x192', '512x512']);
  });
  it('publishes each tool in both languages with translated metadata and content', () => {
    for (const tool of CREATIVE_TOOLS) {
      for (const copy of [tool.name, tool.title, tool.description, tool.intro, tool.note, ...tool.steps]) expect(translate(copy, 'es')).not.toBe(copy);
      const path = `/tools/${tool.slug}`, es = localizedPath(path, 'es');
      expect(metaForPath(path).robots).toContain('index,follow');
      expect(metaForPath(es).canonical).toBe('https://batchimagekit.com' + es);
      expect(metaForPath(path).alternates).toEqual(metaForPath(es).alternates);
    }
  });
});
