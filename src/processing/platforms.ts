import { BlobReader, BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js/lib/zip-core-external.js';
import type { AssetFrame, PlatformAsset, PlatformPack } from '../types/platform';
import type { SteamSource } from './steam';
import { LIMITS } from './formats';
import { slugify } from '../utils/format';

export interface PackSource extends SteamSource { id: string }
export type PackSources = Record<string, PackSource[]>;
export interface AssetJob { id: string; asset: PlatformAsset; source: PackSource; width: number; height: number; frame: AssetFrame; index: number }
export interface PackOutput { job: AssetJob; blob: Blob; filename: string }
export type CustomSizes = Record<string, { width: number; height: number }>;
export const isScreenshot = (asset: PlatformAsset) => !!asset.input && ['iphone', 'ipad', 'android-phone', 'android-tablet', 'android-tv'].includes(asset.input);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
export function defaultFrame(asset: PlatformAsset): AssetFrame {
  return { fit: asset.repeat || asset.input === 'icon' ? 'contain' : 'cover', x: 50, y: 50, zoom: 1, background: '#f7f7f2', transparent: false, format: asset.format,
    logo: !!asset.brand, logoX: 50, logoY: 50, logoSize: 28, text: asset.text || '', textColor: '#151715', textY: 50, textSize: 10, template: 'plain' };
}
export function normalizeFrame(asset: PlatformAsset, value: Partial<AssetFrame>): AssetFrame {
  const f = { ...defaultFrame(asset), ...value };
  const formats = asset.formats || [asset.format];
  return { ...f, template: asset.input === 'android-tablet' || asset.input === 'android-tv' ? 'plain' : f.template, fit: isScreenshot(asset) ? 'contain' : f.fit === 'contain' ? 'contain' : 'cover', format: formats.includes(f.format) ? f.format : asset.format,
    zoom: isScreenshot(asset) ? 1 : clamp(f.zoom, 0.5, 3), x: clamp(f.x, 0, 100), y: clamp(f.y, 0, 100),
    transparent: !asset.opaque && f.format === 'png' && f.transparent,
    logo: !asset.cleanArtwork && !isScreenshot(asset) && f.logo,
    text: asset.cleanArtwork ? '' : f.text.slice(0, 140), textSize: clamp(f.textSize, 3, 20), textY: clamp(f.textY, 10, 90),
    logoSize: clamp(f.logoSize, 5, 80), logoX: clamp(f.logoX, 0, 100), logoY: clamp(f.logoY, 0, 100),
    background: /^#[0-9a-f]{6}$/i.test(f.background) ? f.background : '#ffffff', textColor: /^#[0-9a-f]{6}$/i.test(f.textColor) ? f.textColor : '#151715' };
}
export function buildAssetJobs(pack: PlatformPack, selected: string[], sources: PackSources, frames: Record<string, Partial<AssetFrame>>, sizes: CustomSizes = {}): AssetJob[] {
  return pack.assets.filter((asset) => selected.includes(asset.id)).flatMap((asset) => {
    const originals = asset.repeat ? sources[asset.input || 'images'] || (asset.input === 'images' || asset.input === 'product' ? sources.artwork : undefined) || [] : sources[asset.id] || sources[asset.input || 'artwork'] || (asset.input === 'icon' ? sources.artwork : undefined) || [];
    return originals.slice(0, asset.repeat ? asset.maxCount || 100 : 1).map((original, index) => {
      const id = `${asset.id}:${original.id}`;
      const source = sources[id]?.[0] || original;
      let { width, height } = asset.customSize && sizes[asset.id] ? sizes[asset.id] : asset;
      if (asset.landscape && source.width > source.height && width < height) [width, height] = [height, width];
      return { id, asset, source, width, height, index, frame: normalizeFrame(asset, { ...frames[asset.id], ...frames[id] }) };
    });
  });
}
export function validateDimensions(asset: PlatformAsset, width: number, height: number): string | null {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) return 'Enter whole, positive pixel dimensions.';
  if (width > (asset.maxWidth || LIMITS.dimension) || height > (asset.maxHeight || LIMITS.dimension) || width * height > (asset.maxPixels || LIMITS.pixels)) return 'Dimensions exceed the limit for this asset.';
  if (asset.customSize && (width / height > 100 || height / width > 100)) return 'Keep the aspect ratio between 1:100 and 100:1.';
  return null;
}
export function packChecklist(pack: PlatformPack, selected: string[], sources: PackSources): string[] {
  const issues: string[] = [];
  for (const asset of pack.assets) {
    if (asset.requirement === 'Required' && !selected.includes(asset.id)) { issues.push(`${asset.name}: excluded from this set`); continue; }
    if (!selected.includes(asset.id)) continue;
    const count = asset.repeat ? (sources[asset.input || 'images'] || (asset.input === 'images' || asset.input === 'product' ? sources.artwork : undefined))?.length || 0 : (sources[asset.id] || sources[asset.input || 'artwork'] || (asset.input === 'icon' ? sources.artwork : undefined))?.length || 0;
    if (!count) issues.push(`${asset.name}: add ${isScreenshot(asset) ? 'real screenshots' : 'a source image'}`);
    else if (asset.minCount && count < asset.minCount) issues.push(`${asset.name}: ${count}/${asset.minCount} images needed`);
  }
  if (pack.id === 'mobile' && selected.includes('google-play-tv-screenshot') && !selected.includes('google-play-tv-banner')) issues.push('Android TV: also include its required banner');
  if (pack.id === 'mobile' && pack.assets.some((a) => a.id.startsWith('google-play-'))) {
    const roles = new Set(pack.assets.filter((a) => selected.includes(a.id) && a.id.startsWith('google-play-') && isScreenshot(a)).map((a) => a.input!));
    const count = Array.from(roles).reduce((sum, role) => sum + (sources[role]?.length || 0), 0);
    if (count < 2) issues.push(`Google Play: ${count}/2 real screenshots across supported device sets`);
  }
  return issues;
}
export function sourceRect(sw: number, sh: number, width: number, height: number, frame: AssetFrame) {
  const scale = (frame.fit === 'cover' ? Math.max : Math.min)(width / sw, height / sh) * frame.zoom;
  const w = sw * scale, h = sh * scale;
  return { x: (width - w) * frame.x / 100, y: (height - h) * frame.y / 100, width: w, height: h, scale };
}
function drawText(ctx: CanvasRenderingContext2D, text: string, width: number, height: number, frame: AssetFrame, caption: boolean) {
  if (!text.trim()) return;
  let fontSize = Math.min(width, height) * frame.textSize / 100;
  const maxWidth = width * 0.86, maxHeight = caption ? height * 0.17 : height * 0.8;
  let lines: string[] = [];
  for (let attempt = 0; attempt < 30; attempt++) {
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    lines = [''];
    for (const word of text.trim().split(/\s+/)) {
      const line = lines[lines.length - 1], next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth || !line) lines[lines.length - 1] = next;
      else lines.push(word);
    }
    if (lines.length * fontSize * 1.2 <= maxHeight && lines.every((line) => ctx.measureText(line).width <= maxWidth)) break;
    fontSize *= 0.88;
  }
  ctx.fillStyle = frame.textColor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const center = caption ? height * 0.12 : height * frame.textY / 100;
  lines.forEach((line, i) => ctx.fillText(line, width / 2, center + (i - (lines.length - 1) / 2) * fontSize * 1.2, maxWidth));
}
export function drawAsset(canvas: HTMLCanvasElement, job: AssetJob, logo?: PackSource, previewMax?: number) {
  const { asset, source, width, height } = job, frame = normalizeFrame(asset, job.frame);
  const invalid = validateDimensions(asset, width, height); if (invalid) throw new Error(invalid);
  const scale = previewMax ? Math.min(1, previewMax / Math.max(width, height)) : 1;
  canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d', { colorSpace: 'srgb' }); if (!ctx) throw new Error('Canvas rendering is unavailable.');
  ctx.scale(canvas.width / width, canvas.height / height); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (!frame.transparent) { ctx.fillStyle = frame.background; ctx.fillRect(0, 0, width, height); }
  const caption = isScreenshot(asset) && frame.template === 'caption' && !!frame.text.trim();
  const area = caption ? { x: width * 0.04, y: height * 0.25, width: width * 0.92, height: height * 0.72 } : { x: 0, y: 0, width, height };
  const rect = sourceRect(source.width, source.height, area.width, area.height, frame);
  ctx.drawImage(source.image, area.x + rect.x, area.y + rect.y, rect.width, rect.height);
  if (frame.logo && logo) {
    const logoScale = Math.min(width * frame.logoSize / 100 / logo.width, height * 0.6 / logo.height);
    const w = logo.width * logoScale, h = logo.height * logoScale;
    ctx.drawImage(logo.image, (width - w) * frame.logoX / 100, (height - h) * frame.logoY / 100, w, h);
  }
  if (!isScreenshot(asset) || caption) drawText(ctx, frame.text, width, height, frame, caption);
  return canvas;
}

// Encode an explicit RGB (no alpha channel) or RGBA PNG, rather than relying on
// browser PNG color-type choices. App store screenshots forbid the alpha channel.
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(type: string, data: Uint8Array): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(data.length + 12), view = new DataView(bytes.buffer);
  view.setUint32(0, data.length); bytes.set(new TextEncoder().encode(type), 4); bytes.set(data, 8);
  view.setUint32(bytes.length - 4, crc32(bytes.subarray(4, bytes.length - 4))); return bytes;
}
export async function encodePng(data: ImageData, opaque: boolean): Promise<Blob> {
  if (typeof CompressionStream === 'undefined') throw new Error('PNG export needs a current browser with compression support. Try JPG where available.');
  const channels = opaque ? 3 : 4, stride = data.width * channels;
  const rows = new Uint8Array((stride + 1) * data.height);
  // Sub filtering is lossless and helps backgrounds compress without quantizing.
  for (let y = 0; y < data.height; y++) {
    const row = y * (stride + 1); rows[row] = 1;
    for (let x = 0; x < data.width; x++) for (let c = 0; c < channels; c++) {
      const at = (y * data.width + x) * 4 + c;
      rows[row + 1 + x * channels + c] = (data.data[at] - (x ? data.data[at - 4] : 0)) & 255;
    }
  }
  const compressed = new Uint8Array(await new Response(new Blob([rows]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
  const ihdr = new Uint8Array(13), view = new DataView(ihdr.buffer);
  view.setUint32(0, data.width); view.setUint32(4, data.height); ihdr[8] = 8; ihdr[9] = opaque ? 2 : 6;
  return new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk('IHDR', ihdr), pngChunk('sRGB', new Uint8Array([0])), pngChunk('IDAT', compressed), pngChunk('IEND', new Uint8Array())], { type: 'image/png' });
}
function jpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob?.type === 'image/jpeg' ? resolve(blob) : reject(new Error('JPG encoding failed.')), 'image/jpeg', quality));
}
export function assetFilename(pack: PlatformPack, job: AssetJob, locale: string): string {
  const sequence = job.asset.repeat ? `-${String(job.index + 1).padStart(2, '0')}` : '';
  return `${pack.id}/${slugify(locale)}/${slugify(job.asset.group)}/${job.asset.id}${sequence}_${job.width}x${job.height}.${job.frame.format}`;
}
export async function renderPlatformAsset(pack: PlatformPack, job: AssetJob, locale: string, signal: AbortSignal, logo?: PackSource): Promise<PackOutput> {
  signal.throwIfAborted();
  const canvas = drawAsset(document.createElement('canvas'), job, logo);
  try {
    let blob = job.frame.format === 'png' ? await encodePng(canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height), !!job.asset.opaque) : await jpegBlob(canvas, 0.94);
    const max = job.asset.maxBytes;
    if (max && blob.size > max && job.frame.format === 'jpg') {
      let low = 0.2, high = 0.94;
      const smallest = await jpegBlob(canvas, low);
      if (smallest.size <= max) {
        blob = smallest;
        for (let i = 0; i < 7; i++) { signal.throwIfAborted(); const mid = (low + high) / 2, candidate = await jpegBlob(canvas, mid); if (candidate.size <= max) { blob = candidate; low = mid; } else high = mid; }
      }
    }
    signal.throwIfAborted();
    if (max && blob.size > max) throw new Error(`${job.asset.name} exceeds its ${Math.round(max / 1024)} KB limit. ${job.frame.format === 'png' && job.asset.formats?.includes('jpg') ? 'Choose JPG in Adjust.' : 'Use simpler artwork or reduce visual detail.'}`);
    return { job, blob, filename: assetFilename(pack, job, locale) };
  } finally { canvas.width = 1; canvas.height = 1; }
}
export async function platformZip(pack: PlatformPack, outputs: PackOutput[], checklist: string[], signal: AbortSignal): Promise<Blob> {
  const writer = new ZipWriter(new BlobWriter('application/zip'), { useWebWorkers: false });
  try {
    for (const output of outputs) { signal.throwIfAborted(); await writer.add(output.filename, new BlobReader(output.blob), { level: 0, signal }); }
    const assets = outputs.map(({ job, filename, blob }) => ({ name: job.asset.name, filename, width: job.width, height: job.height, bytes: blob.size, format: job.frame.format, description: job.asset.description, requirement: job.asset.requirement, condition: job.asset.condition, source: job.asset.source, sourceRule: job.asset.sourceRule, evidence: job.asset.evidence, note: job.asset.note }));
    await writer.add('asset-guide.json', new TextReader(JSON.stringify({ platform: pack.name, checked: pack.checked, checklist, notes: pack.notes, assets }, null, 2)), { level: 0, signal });
    const text = [`${pack.name} — prepared with Batch`, `Official sources reviewed: ${pack.checked}`, 'Filenames are descriptive Batch names, not mandatory platform filenames.', 'Review content and visual crops before publishing. Technical validation does not guarantee platform approval.', '', ...pack.notes, '', 'Outstanding checklist:', ...(checklist.length ? checklist : ['No missing inputs detected for the selected assets.']), '', ...assets.flatMap((a) => [a.name, a.filename, `${a.width} × ${a.height} · ${a.format.toUpperCase()} · ${a.bytes} bytes`, a.requirement + (a.condition ? `: ${a.condition}` : ''), a.description, `Specification: ${a.sourceRule}`, a.evidence === 'preset' ? 'The exact export size is a Batch preset, not a mandatory platform size.' : '', a.note, a.source, ''])].join('\n');
    await writer.add('README.txt', new TextReader(text), { level: 0, signal });
    return await writer.close();
  } catch (error) { await writer.close().catch(() => undefined); throw error; }
}
