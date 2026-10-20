import { BlobReader, BlobWriter, ZipWriter, TextReader } from '@zip.js/zip.js/lib/zip-core-external.js';
import { inspectFile, LIMITS } from './formats';
import { STEAM_CHECKED, STEAM_DOCS, type SteamAsset } from '../data/steamAssets';
import { cleanLogo } from './logo';

export interface SteamSource { file: File; url: string; image: HTMLImageElement; width: number; height: number; originalUrl?: string; backgroundRemoved?: boolean }
export interface SteamFrame { fit: 'cover' | 'contain'; x: number; y: number }
export interface SteamOutput { asset: SteamAsset; filename: string; blob: Blob; width: number; height: number }
export const DEFAULT_FRAME: SteamFrame = { fit: 'cover', x: 50, y: 50 };
export function fitRect(sw: number, sh: number, width: number, height: number, frame: SteamFrame) {
  const scale = (frame.fit === 'cover' ? Math.max : Math.min)(width / sw, height / sh);
  const w = sw * scale, h = sh * scale;
  return { x: (width - w) * frame.x / 100, y: (height - h) * frame.y / 100, width: w, height: h, scale };
}
export function assetSize(asset: SteamAsset, source: Pick<SteamSource, 'width' | 'height'>) {
  if (!asset.logo) return { width: asset.width, height: asset.height };
  const scale = Math.min(asset.width / source.width, asset.height / source.height);
  return { width: Math.max(1, Math.round(source.width * scale)), height: Math.max(1, Math.round(source.height * scale)) };
}
export async function loadSteamSource(file: File, logo = false, report: (message: string) => void = () => undefined, forceAI = false): Promise<SteamSource> {
  const info = await inspectFile(file);
  if (info.animated) throw new Error('Use a still image for Steam assets.');
  const url = URL.createObjectURL(file);
  let cleanedUrl: string | undefined;
  try {
    const image = new Image(); image.src = url; await image.decode();
    const width = image.naturalWidth, height = image.naturalHeight;
    if (!width || !height || width * height > LIMITS.pixels || Math.max(width, height) > LIMITS.dimension) throw new Error('Use an image up to 10,000 px per side and 40 megapixels.');
    if (logo) {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 2048 / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const cleaned = await cleanLogo(ctx.getImageData(0, 0, canvas.width, canvas.height), report, forceAI);
      if (cleaned.removed) {
        ctx.putImageData(cleaned.data, 0, 0);
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not prepare the transparent logo.')), 'image/png'));
        cleanedUrl = URL.createObjectURL(blob);
        const cleanImage = new Image(); cleanImage.src = cleanedUrl; await cleanImage.decode();
        return { file, url: cleanedUrl, image: cleanImage, width: canvas.width, height: canvas.height, originalUrl: url, backgroundRemoved: true };
      }
    }
    return { file, url, image, width, height };
  } catch (error) { URL.revokeObjectURL(url); if (cleanedUrl) URL.revokeObjectURL(cleanedUrl); throw error; }
}
export async function renderSteamAsset(asset: SteamAsset, source: SteamSource, frame: SteamFrame, background: string, logo?: SteamSource): Promise<SteamOutput> {
  const { width, height } = assetSize(asset, source);
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Image rendering is unavailable in this browser.');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (!asset.logo) { ctx.fillStyle = background; ctx.fillRect(0, 0, width, height); }
  const rect = fitRect(source.width, source.height, width, height, asset.logo ? { ...DEFAULT_FRAME, fit: 'contain' } : frame);
  ctx.drawImage(source.image, rect.x, rect.y, rect.width, rect.height);
  if (asset.brand && logo) {
    const scale = Math.min(width * 0.8 / logo.width, height * 0.3 / logo.height);
    const w = logo.width * scale, h = logo.height * scale;
    ctx.drawImage(logo.image, (width - w) / 2, height * 0.9 - h, w, h);
  }
  const mime = asset.format === 'jpg' ? 'image/jpeg' : 'image/png';
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Could not encode this asset.')), mime, 0.94));
  if (blob.type !== mime) throw new Error('The browser could not encode the requested output format.');
  return { asset, width, height, blob, filename: `${asset.group.toLowerCase()}/${asset.id}_${width}x${height}.${asset.format}` };
}
export async function steamZip(outputs: SteamOutput[], missing: string[], signal: AbortSignal): Promise<Blob> {
  const writer = new ZipWriter(new BlobWriter('application/zip'), { useWebWorkers: false });
  try {
    for (const output of outputs) await writer.add(output.filename, new BlobReader(output.blob), { level: 0, signal });
    const manifest = { specificationsChecked: STEAM_CHECKED, documentation: STEAM_DOCS, missing, assets: outputs.map(({ asset, width, height, filename }) => ({ ...asset, width, height, filename })) };
    await writer.add('asset-guide.json', new TextReader(JSON.stringify(manifest, null, 2)), { level: 0, signal });
    const guide = ['Steam asset set — prepared with Batch', `Specifications checked: ${STEAM_CHECKED}`, STEAM_DOCS, '', 'Review crops, legibility and content before uploading. Dimensions alone do not guarantee Steam approval.', 'Filenames are descriptive Batch filenames, not mandatory Steam upload names.', 'Store/library capsules need the game name/logo. The library hero must have no text. Library logo needs transparency.', 'Provide at least five real gameplay screenshots. Steam generates its documented half-size library assets.', 'For macOS releases, provide a separate ICNS icon in the Mac Icon field. This pack exports raster assets, not ICNS.', '', 'Missing or excluded required assets:', ...missing.map((name) => `- ${name}`), '', ...outputs.flatMap((o) => [o.asset.name, `${o.filename} — ${o.width} × ${o.height}`, o.asset.requirement, o.asset.description, o.asset.note, o.asset.source, ''])].join('\n');
    await writer.add('README.txt', new TextReader(guide), { level: 0, signal });
    return await writer.close();
  } catch (error) { await writer.close().catch(() => undefined); throw error; }
}
