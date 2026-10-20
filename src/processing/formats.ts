export type InputFormat = 'jpg' | 'png' | 'webp' | 'gif' | 'avif';
export const LIMITS = { fileBytes: 40 * 1024 * 1024, batchBytes: 300 * 1024 * 1024, dimension: 10000, pixels: 40_000_000, batchFiles: 100, zipBytes: 300 * 1024 * 1024 } as const;

export function sniffFormat(bytes: Uint8Array): InputFormat | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if ([137,80,78,71,13,10,26,10].every((n, i) => bytes[i] === n)) return 'png';
  const ascii = (at: number, len: number) => String.fromCharCode(...bytes.slice(at, at + len));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'webp';
  if (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a') return 'gif';
  if (ascii(4, 4) === 'ftyp' && (['avif', 'avis'].includes(ascii(8, 4)) || ['avif', 'avis'].some((brand) => ascii(16, 32).includes(brand)))) return 'avif';
  return null;
}

export function isAnimated(bytes: Uint8Array, format: InputFormat): boolean {
  if (format === 'png') {
    for (let i = 8; i + 8 < bytes.length;) {
      const size = ((bytes[i] * 0x1000000) + (bytes[i+1] << 16) + (bytes[i+2] << 8) + bytes[i+3]) >>> 0;
      if (String.fromCharCode(...bytes.slice(i+4, i+8)) === 'acTL') return true;
      i += size + 12;
      if (size > bytes.length || i > bytes.length) break;
    }
  }
  if (format === 'webp') {
    for (let i = 12; i + 8 < bytes.length;) {
      const tag = String.fromCharCode(...bytes.slice(i, i+4));
      if (tag === 'ANIM') return true;
      const size = (bytes[i+4] | bytes[i+5] << 8 | bytes[i+6] << 16 | bytes[i+7] << 24) >>> 0;
      i += 8 + size + (size & 1);
      if (i > bytes.length) break;
    }
  }
  if (format === 'avif') {
    const boxSize = ((bytes[0] * 0x1000000) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3]) >>> 0;
    const end = Math.min(bytes.length, boxSize || 0);
    for (let i = 8; i + 4 <= end; i += i === 8 ? 8 : 4) {
      if (String.fromCharCode(...bytes.slice(i, i + 4)) === 'avis') return true;
    }
    return false;
  }
  if (format === 'gif') {
    let frames = 0;
    let i = 13;
    if (bytes[10] & 0x80) i += 3 * (1 << ((bytes[10] & 7) + 1));
    for (; i < bytes.length;) {
      const mark = bytes[i++];
      if (mark === 0x2c) {
        if (++frames > 1) return true;
        if (i + 9 > bytes.length) break;
        const packed = bytes[i + 8]; i += 9;
        if (packed & 0x80) i += 3 * (1 << ((packed & 7) + 1));
        i++; // LZW minimum code size
        while (i < bytes.length) { const size = bytes[i++]; if (!size) break; i += size; }
      } else if (mark === 0x21) {
        i++; // extension label
        while (i < bytes.length) { const size = bytes[i++]; if (!size) break; i += size; }
      } else if (mark === 0x3b) break;
      else break;
    }
  }
  return false;
}

export async function inspectFile(file: File): Promise<{format: InputFormat; animated: boolean}> {
  if (!file.size) throw new Error('This file is empty.');
  if (file.size > LIMITS.fileBytes) throw new Error('File exceeds the 40 MB limit.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = sniffFormat(bytes);
  if (!format) throw new Error('File contents are not a supported JPG, PNG, WebP, GIF or AVIF image.');
  return { format, animated: isAnimated(bytes, format) };
}

export const mimeFor = (format: string) => `image/${format === 'jpg' ? 'jpeg' : format}`;
