import type { RunItem } from '../types/run';
import { LIMITS } from './formats';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function makeZip(items: RunItem[], signal: AbortSignal, onProgress: (done: number, total: number) => void): Promise<Blob> {
  const ready = items.filter((item) => item.status === 'complete' && item.output);
  if (!ready.length) throw new Error('No completed images to export.');
  if (ready.reduce((sum, item) => sum + (item.outputSize || 0), 0) > LIMITS.zipBytes) throw new Error('The ZIP would exceed the 300 MB in-memory limit. Download images individually.');
  const { ZipWriter, BlobWriter, BlobReader } = await import('@zip.js/zip.js');
  const writer = new ZipWriter(new BlobWriter('application/zip'));
  try {
    for (let i = 0; i < ready.length; i++) {
      if (signal.aborted) throw new DOMException('Export canceled', 'AbortError');
      const item = ready[i];
      await writer.add(item.outputName, new BlobReader(item.output as Blob), { level: 0, signal });
      onProgress(i + 1, ready.length);
    }
    const zip = await writer.close();
    if (!zip || zip.size < 22) throw new Error('ZIP creation failed.');
    return zip;
  } catch (error) {
    await writer.close().catch(() => undefined);
    throw error;
  }
}
