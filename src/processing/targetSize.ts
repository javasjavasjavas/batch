/** A bounded search: never label an oversized result as successful. */
export async function encodeToTarget<T extends { byteLength: number }>(options: {
  width: number; height: number; maxBytes: number; quality: number; lossy: boolean; allowResize: boolean;
  encode: (width: number, height: number, quality: number) => Promise<T>;
}) {
  const { maxBytes, lossy, allowResize, encode } = options;
  if (!Number.isFinite(maxBytes) || maxBytes < 1000) throw new Error('Enter a maximum size from 1 to 40,000 KB, or leave it empty.');
  let width = options.width, height = options.height;
  for (let attempt = 0; attempt < 13; attempt++) {
    const highQuality = Math.min(100, Math.max(1, Math.round(options.quality)));
    const full = await encode(width, height, highQuality);
    if (full.byteLength <= maxBytes) return { bytes: full, width, height };
    if (lossy) {
      let low = 1, high = highQuality - 1;
      let best: T | undefined;
      while (low <= high) {
        const quality = Math.floor((low + high) / 2);
        const bytes = await encode(width, height, quality);
        if (bytes.byteLength <= maxBytes) { best = bytes; low = quality + 1; }
        else high = quality - 1;
      }
      if (best) return { bytes: best, width, height };
    }
    if (!allowResize || Math.max(width, height) <= 64) break;
    const scale = Math.max(64 / Math.max(width, height), 0.75);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }
  throw new Error('This size limit could not be reached. Increase the limit, allow smaller dimensions, or choose JPG or lossy WebP.');
}
