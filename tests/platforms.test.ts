import { describe, it, expect } from 'vitest';
import { BlobReader, ZipReader, TextWriter } from '@zip.js/zip.js/lib/zip-core-external.js';
import { inflateSync } from 'node:zlib';
import { PLATFORM_PACKS } from '../src/data/platforms';
import { assetFilename, buildAssetJobs, defaultFrame, encodePng, normalizeFrame, packChecklist, platformZip, sourceRect, validateDimensions, type PackSource } from '../src/processing/platforms';

const source = (id: string, width = 1200, height = 2400): PackSource => ({ id, width, height, url: `blob:${id}`, file: new File(['x'], `${id}.png`, { type: 'image/png' }), image: {} as HTMLImageElement });
const pack = (id: string) => PLATFORM_PACKS.find((p) => p.id === id)!;
describe('Platform asset planning and export contracts', () => {
  it('ships ten independently addressed packs with source evidence and bounded output specs', () => {
    expect(PLATFORM_PACKS).toHaveLength(10);
    expect(new Set(PLATFORM_PACKS.map((p) => p.id)).size).toBe(10);
    for (const p of PLATFORM_PACKS) {
      expect(new Set(p.assets.map((a) => a.id)).size).toBe(p.assets.length);
      for (const a of p.assets) {
        expect(a.source).toMatch(/^https:\/\//); expect(a.sourceRule.length).toBeGreaterThan(15);
        expect(validateDimensions(a, a.width, a.height)).toBeNull();
        if (a.repeat) expect(a.input).toBeTruthy();
      }
    }
  });
  it('uses artwork for social variants but never fabricates screenshots from it', () => {
    const artwork = source('art');
    const yt = pack('youtube');
    expect(buildAssetJobs(yt, yt.assets.map((a) => a.id), { artwork: [artwork] }, {})).toHaveLength(yt.assets.length);
    const mobile = pack('mobile');
    const jobs = buildAssetJobs(mobile, mobile.assets.map((a) => a.id), { artwork: [artwork] }, {});
    expect(jobs.some((j) => j.asset.repeat)).toBe(false);
    expect(packChecklist(mobile, mobile.assets.map((a) => a.id), { artwork: [artwork] }).some((issue) => issue.includes('real screenshots'))).toBe(true);
  });
  it('keeps individual adjustments attached to a source when screenshots are reordered', () => {
    const mobile = pack('mobile'), a = source('a'), b = source('b', 2400, 1200);
    const ids = ['app-store-iphone-medium'];
    const frames = { [`${ids[0]}:a`]: { text: 'First screen', template: 'caption' as const } };
    const first = buildAssetJobs(mobile, ids, { iphone: [a, b] }, frames);
    const reordered = buildAssetJobs(mobile, ids, { iphone: [b, a] }, frames);
    expect(reordered[1].frame.text).toBe('First screen');
    expect(reordered[1].id).toBe(first[0].id);
    expect(reordered[0]).toMatchObject({ width: 2622, height: 1206, index: 0 });
    expect(assetFilename(mobile, reordered[1], '../../es AR')).not.toContain('..');
    expect(assetFilename(mobile, reordered[1], 'es-AR')).toContain('-02_');
  });
  it('requires Google Play total screenshots across devices, not two phone screenshots for a TV-only app', () => {
    const mobile = { ...pack('mobile'), assets: pack('mobile').assets.filter((a) => a.id.startsWith('google-play-')) };
    const selected = ['google-play-icon', 'google-play-feature', 'google-play-tv-screenshot', 'google-play-tv-banner'];
    const sources = { artwork: [source('art')], 'android-tv': [source('tv1'), source('tv2')] };
    expect(packChecklist(mobile, selected, sources)).toEqual([]);
    expect(packChecklist(mobile, selected, { ...sources, 'android-tv': [source('tv1')] })).toContain('Google Play: 1/2 real screenshots across supported device sets');
  });
  it('preserves UI and disallows captions for tablet/TV screenshots and text on clean backgrounds', () => {
    const tablet = pack('mobile').assets.find((a) => a.input === 'android-tablet')!;
    expect(normalizeFrame(tablet, { fit: 'cover', zoom: 3, transparent: true, template: 'caption', logo: true })).toMatchObject({ fit: 'contain', zoom: 1, transparent: false, template: 'plain', logo: false });
    const banner = pack('discord').assets.find((a) => a.cleanArtwork)!;
    expect(normalizeFrame(banner, { text: 'Hidden title', logo: true })).toMatchObject({ text: '', logo: false });
    const f = defaultFrame(tablet), rect = sourceRect(1200, 2400, 1080, 1920, f);
    expect(rect.width / rect.height).toBe(0.5); expect(rect.width).toBeLessThanOrEqual(1080); expect(rect.height).toBeLessThanOrEqual(1920);
  });
  it('rejects invalid custom sizes and excessive pixel budgets', () => {
    const banner = pack('shopify').assets.find((a) => a.customSize)!;
    expect(validateDimensions(banner, 6000, 5000)).toBeTruthy();
    expect(validateDimensions(banner, 0, 1200)).toBeTruthy();
    expect(validateDimensions(banner, NaN, 1200)).toBeTruthy();
    const panel = pack('twitch').assets.find((a) => a.customSize)!;
    expect(validateDimensions(panel, 320, 301)).toBeTruthy();
  });
  it('writes RGB PNG without alpha and RGBA PNG with the correct bit depth and lossless pixels', async () => {
    const input = { width: 2, height: 1, data: new Uint8ClampedArray([240, 10, 20, 255, 5, 250, 100, 255]), colorSpace: 'srgb' } as ImageData;
    for (const opaque of [true, false]) {
      const bytes = new Uint8Array(await (await encodePng(input, opaque)).arrayBuffer());
      expect(bytes[24]).toBe(8); expect(bytes[25]).toBe(opaque ? 2 : 6);
      const view = new DataView(bytes.buffer); let offset = 8; let raw: Uint8Array | undefined;
      while (offset < bytes.length) { const size = view.getUint32(offset); const tag = new TextDecoder().decode(bytes.slice(offset + 4, offset + 8)); if (tag === 'IDAT') raw = inflateSync(bytes.slice(offset + 8, offset + 8 + size)); offset += size + 12; }
      const channels = opaque ? 3 : 4;
      expect(raw![0]).toBe(1);
      const decoded = Array.from(raw!.slice(1)); for (let i = channels; i < decoded.length; i++) decoded[i] = (decoded[i] + decoded[i - channels]) & 255;
      expect(decoded).toEqual(opaque ? [240, 10, 20, 5, 250, 100] : Array.from(input.data));
    }
  });
  it('packages files with source rules and an honest partial-set checklist', async () => {
    const mobile = pack('mobile'); const job = buildAssetJobs(mobile, ['google-play-feature'], { artwork: [source('art')] }, {})[0];
    const zip = await platformZip(mobile, [{ job, filename: assetFilename(mobile, job, 'es-AR'), blob: new Blob(['image']) }], ['Missing real screenshots'], new AbortController().signal);
    const reader = new ZipReader(new BlobReader(zip), { useWebWorkers: false }); const entries = await reader.getEntries();
    const guide = JSON.parse(await entries.find((e) => e.filename === 'asset-guide.json')!.getData!(new TextWriter()));
    expect(guide.checklist).toEqual(['Missing real screenshots']); expect(guide.assets[0].sourceRule).toContain('1,024 × 500');
    expect(entries.some((e) => e.filename.includes('/es-ar/'))).toBe(true); await reader.close();
  });
});
