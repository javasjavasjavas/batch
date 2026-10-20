import { createWorker, PSM } from 'tesseract.js';
import workerPath from 'tesseract.js/dist/worker.min.js?url';
import { normalizeRegion, type HeroRegion } from './heroRegions';
import type { SteamSource } from './steam';

export async function detectHeroText(source: SteamSource, report: (message: string) => void, signal: AbortSignal): Promise<HeroRegion[]> {
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  const abort = () => { void worker?.terminate(); };
  signal.addEventListener('abort', abort);
  try {
    worker = await createWorker('eng', 1, { workerPath, logger: (event) => report(event.status === 'recognizing text' ? `Detecting text: ${Math.round(event.progress * 100)}%` : 'Loading text detection…') });
    if (signal.aborted) throw new DOMException('Canceled', 'AbortError');
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
    const canvas = document.createElement('canvas'), scale = Math.min(1, 1800 / Math.max(source.width, source.height));
    canvas.width = Math.round(source.width * scale); canvas.height = Math.round(source.height * scale);
    canvas.getContext('2d')!.drawImage(source.image, 0, 0, canvas.width, canvas.height);
    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    return (data.blocks || []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines.flatMap((l) => l.words)))
      .filter((word) => word.confidence >= 65 && /[a-zA-Z0-9]{2}/.test(word.text) && word.bbox.y1 - word.bbox.y0 > Math.max(16, canvas.height * 0.045))
      .slice(0, 24).map(({ bbox }) => {
        const padding = Math.max(8, (bbox.y1 - bbox.y0) * 0.35);
        return normalizeRegion((bbox.x0 - padding) / canvas.width, (bbox.y0 - padding) / canvas.height, (bbox.x1 + padding) / canvas.width, (bbox.y1 + padding) / canvas.height);
      });
  } finally { signal.removeEventListener('abort', abort); await worker?.terminate(); }
}

export async function repairHero(source: SteamSource, regions: HeroRegion[], report: (message: string) => void, signal: AbortSignal): Promise<Blob> {
  if (!regions.length) throw new Error('Select the text or logo to remove.');
  const small = document.createElement('canvas'); small.width = small.height = 512;
  const ctx = small.getContext('2d')!; ctx.drawImage(source.image, 0, 0, 512, 512);
  const pixels = ctx.getImageData(0, 0, 512, 512).data;
  const repaired = await new Promise<Uint8ClampedArray>((resolve, reject) => {
    const worker = new Worker(new URL('./hero.worker.ts', import.meta.url), { type: 'module' });
    const stop = () => { clearTimeout(timeout); signal.removeEventListener('abort', abort); worker.terminate(); };
    const abort = () => { stop(); reject(new DOMException('Canceled', 'AbortError')); };
    const timeout = setTimeout(() => { stop(); reject(new Error('Image repair took too long. Try a smaller image or upload a clean version.')); }, 240_000);
    signal.addEventListener('abort', abort);
    if (signal.aborted) return abort();
    worker.onmessage = ({ data }) => {
      if (data.message) report(data.message);
      else if (data.error) { stop(); reject(new Error(data.error)); }
      else if (data.pixels) { stop(); resolve(data.pixels); }
    };
    worker.onerror = () => { stop(); reject(new Error('Image repair is unavailable in this browser. Upload a text-free version instead.')); };
    worker.postMessage({ pixels, regions });
  });
  ctx.putImageData(new ImageData(new Uint8ClampedArray(repaired), 512, 512), 0, 0);
  // Only replace the marked area. Preserve original pixels everywhere else.
  const result = document.createElement('canvas'); result.width = source.width; result.height = source.height;
  const out = result.getContext('2d')!; out.drawImage(source.image, 0, 0);
  out.save(); out.beginPath();
  for (const r of regions) out.rect(Math.floor(r.x * source.width), Math.floor(r.y * source.height), Math.ceil(r.width * source.width), Math.ceil(r.height * source.height));
  out.clip(); out.drawImage(small, 0, 0, source.width, source.height); out.restore();
  return new Promise((resolve, reject) => result.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not save the cleaned hero.')), 'image/png'));
}
