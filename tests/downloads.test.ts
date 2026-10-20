import { describe, expect, it } from 'vitest';
import { ZipReader, BlobReader, Uint8ArrayWriter } from '@zip.js/zip.js/lib/zip-core-external.js';
import { makeZip } from '../src/processing/downloads';
import type { RunItem } from '../src/types/run';

function item(name: string, bytes: number[], status: RunItem['status'] = 'complete'): RunItem {
  return { outputName: name, output: new Blob([new Uint8Array(bytes)]), status } as RunItem;
}

describe('ZIP export', () => {
  it.each(['index-D8jMrnd2.js', 'index-CL41cNlq.js', 'index-82FLp1yE.js', 'index-Cb5nRLPQ.js'])(
    'supports an already-open version requesting %s',
    async (filename) => {
      const legacy = await import(/* @vite-ignore */ `../public/assets/${filename}`);
      const writer = new legacy.ZipWriter(new legacy.BlobWriter('application/zip'));
      await writer.add('existing-result.jpg', new legacy.BlobReader(new Blob(['saved image bytes'])), { level: 0 });
      const zip = await writer.close();
      const reader = new ZipReader(new BlobReader(zip), { useWebWorkers: false });
      const [entry] = await reader.getEntries();
      expect(entry.filename).toBe('existing-result.jpg');
      const bytes = await entry.getData!(new Uint8ArrayWriter(), { checkSignature: true });
      expect(new TextDecoder().decode(bytes)).toBe('saved image bytes');
      await reader.close();
    },
  );

  it('exports only completed files with their original bytes and names', async () => {
    const progress: number[] = [];
    const zip = await makeZip([
      item('product-001.jpg', [255, 216, 1, 2, 3]),
      item('café-002.png', [137, 80, 78, 71]),
      item('failed.jpg', [1], 'failed'),
    ], new AbortController().signal, (done) => progress.push(done));
    const reader = new ZipReader(new BlobReader(zip), { useWebWorkers: false });
    const entries = await reader.getEntries();
    expect(entries.map((entry) => entry.filename)).toEqual(['product-001.jpg', 'café-002.png']);
    const outputs = await Promise.all(entries.map((entry) => entry.getData!(new Uint8ArrayWriter(), { checkSignature: true })));
    expect(outputs.map((bytes) => Array.from(bytes as Uint8Array))).toEqual([[255, 216, 1, 2, 3], [137, 80, 78, 71]]);
    expect(progress).toEqual([1, 2]);
    await reader.close();
  });

  it('rejects cancellation and empty completed sets', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(makeZip([item('one.jpg', [1])], controller.signal, () => {})).rejects.toMatchObject({ name: 'AbortError' });
    await expect(makeZip([], new AbortController().signal, () => {})).rejects.toThrow('No completed images');
  });
});
