import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { File as NodeFile } from 'node:buffer';
import { BlobReader, BlobWriter, ZipReader } from '@zip.js/zip.js';
import { inspectFile, isAnimated, sniffFormat } from '../src/processing/formats';
import { processFile } from '../src/processing/codec';
import { makeZip } from '../src/processing/downloads';
import { DEFAULT_ENABLED, DEFAULT_SETTINGS } from '../src/data/defaultSettings';
import { localDateStamp, plannedName, uniqueNames } from '../src/utils/planning';
import type { RunItem } from '../src/types/run';

const bytes = (name: string) => new Uint8Array(readFileSync(new URL(`./fixtures/${name}`, import.meta.url)));

describe('real file inspection', () => {
  it('recognizes file contents, including animation and invalid data', () => {
    expect(sniffFormat(bytes('transparent.png'))).toBe('png');
    expect(sniffFormat(bytes('orientation-6.jpg'))).toBe('jpg');
    expect(sniffFormat(bytes('animated.gif'))).toBe('gif');
    expect(isAnimated(bytes('animated.gif'), 'gif')).toBe(true);
    expect(isAnimated(bytes('animated.webp'), 'webp')).toBe(true);
    expect(isAnimated(bytes('animated.png'), 'png')).toBe(true);
    const sequenceAvif = new Uint8Array([0,0,0,20,102,116,121,112,97,118,105,102,0,0,0,0,97,118,105,115]);
    expect(sniffFormat(sequenceAvif)).toBe('avif');
    expect(isAnimated(sequenceAvif, 'avif')).toBe(true);
    expect(sniffFormat(bytes('invalid.jpg'))).toBeNull();
  });
  it('keeps valid images when another file is corrupt', async () => {
    const valid = new NodeFile([bytes('transparent.png')], 'valid.dat') as unknown as File;
    const invalid = new NodeFile([bytes('invalid.jpg')], 'invalid.jpg') as unknown as File;
    const results = await Promise.allSettled([inspectFile(valid), inspectFile(invalid)]);
    expect(results.map((r) => r.status)).toEqual(['fulfilled', 'rejected']);
  });
});

describe('rename-only processing', () => {
  it('keeps every byte of an animated image unchanged', async () => {
    const original = bytes('animated.gif');
    const file = new NodeFile([original], 'animated.gif', { type: 'image/gif' }) as unknown as File;
    const result = await processFile(file, 'gif', true, DEFAULT_SETTINGS, { resize: false, compress: false, convert: false, rename: true });
    expect(result.blob).toBe(file);
    expect(new Uint8Array(await result.blob.arrayBuffer())).toEqual(original);
  });
});

describe('output naming', () => {
  it('expands tokens, sanitizes paths and resolves duplicate names in order', () => {
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.rename = { ...settings.rename, pattern: '../{name}-{n}-{date}', prefix: 'X/', suffix: '', start: '7', padding: 3 };
    const enabled = { ...DEFAULT_ENABLED, rename: true };
    const name = plannedName('My File.png', 0, settings, enabled, '2026-10-20', 'png');
    expect(name).toBe('x-..-my-file-007-2026-10-20.png');
    expect(uniqueNames(['same.jpg', 'same.jpg', 'Same.jpg'])).toEqual(['same.jpg', 'same-2.jpg', 'Same-3.jpg']);
    expect(localDateStamp(new Date(2026, 9, 20))).toBe('2026-10-20');
  });
});

describe('download archive', () => {
  it('contains exactly the successful image bytes under their planned names', async () => {
    const original = bytes('transparent.png');
    const output = new Blob([original], { type: 'image/png' });
    const items = [
      { status: 'complete', outputName: 'a.png', output, outputSize: output.size },
      { status: 'failed', outputName: 'bad.png' }
    ] as RunItem[];
    const zip = await makeZip(items, new AbortController().signal, () => undefined);
    const reader = new ZipReader(new BlobReader(zip));
    const entries = await reader.getEntries();
    expect(entries.map((entry) => entry.filename)).toEqual(['a.png']);
    if (!entries[0].getData) throw new Error('ZIP entry cannot be read');
    const extracted = await entries[0].getData(new BlobWriter());
    expect(new Uint8Array(await extracted.arrayBuffer())).toEqual(original);
    await reader.close();
  });
});
