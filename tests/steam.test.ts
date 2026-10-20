import { describe, expect, it } from 'vitest';
import { assetSize, fitRect, steamZip } from '../src/processing/steam';
import { STEAM_ASSETS, screenshotAsset } from '../src/data/steamAssets';
import { BlobReader, ZipReader, TextWriter } from '@zip.js/zip.js/lib/zip-core-external.js';

describe('Steam asset set', () => {
  it('uses current Steamworks dimensions and explicit conditional assets', () => {
    expect(STEAM_ASSETS.filter((a) => a.requirement === 'Required')).toHaveLength(10);
    expect(STEAM_ASSETS.find((a) => a.id === 'library-hero')).toMatchObject({ width: 3840, height: 1240, format: 'png' });
    expect(STEAM_ASSETS.find((a) => a.id === 'header-capsule')).toMatchObject({ width: 920, height: 430 });
    expect(STEAM_ASSETS.find((a) => a.id === 'app-icon')).toMatchObject({ width: 184, height: 184, format: 'jpg' });
    expect(screenshotAsset(4)).toMatchObject({ id: 'screenshot-05', width: 1920, height: 1080, group: 'Screenshots' });
    expect(new Set(STEAM_ASSETS.map((a) => a.id)).size).toBe(STEAM_ASSETS.length);
  });
  it('crops without distortion and maps focal positions to the visible edge', () => {
    const left = fitRect(2000, 1000, 500, 500, { fit: 'cover', x: 0, y: 50 });
    expect(left.x).toBeCloseTo(0);
    expect(left).toMatchObject({ y: 0, width: 1000, height: 500, scale: 0.5 });
    expect(fitRect(2000, 1000, 500, 500, { fit: 'cover', x: 100, y: 50 }).x).toBe(-500);
    expect(fitRect(2000, 1000, 500, 500, { fit: 'contain', x: 50, y: 50 })).toMatchObject({ width: 500, height: 250, y: 125 });
  });
  it('preserves transparent logo proportions with one mandated edge', () => {
    const logo = STEAM_ASSETS.find((a) => a.logo)!;
    expect(assetSize(logo, { width: 2000, height: 500 })).toEqual({ width: 1280, height: 320 });
    expect(assetSize(logo, { width: 400, height: 1000 })).toEqual({ width: 288, height: 720 });
  });
  it('exports named assets and an accurate missing-items guide', async () => {
    const asset = STEAM_ASSETS[0];
    const zip = await steamZip([{ asset, filename: 'store/header-capsule_920x430.png', blob: new Blob(['image']), width: 920, height: 430 }], ['Library Logo', 'Gameplay screenshots (0/5 minimum)'], new AbortController().signal);
    const reader = new ZipReader(new BlobReader(zip), { useWebWorkers: false });
    const entries = await reader.getEntries();
    expect(entries.map((e) => e.filename)).toEqual(['store/header-capsule_920x430.png', 'asset-guide.json', 'README.txt']);
    const manifest = JSON.parse(await entries[1].getData!(new TextWriter()));
    expect(manifest.missing).toContain('Library Logo');
    expect(manifest.assets[0]).toMatchObject({ name: 'Header Capsule', width: 920, height: 430, description: asset.description });
    await reader.close();
  });
});
