import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js/lib/zip-core-external.js';
import { inspectFile, LIMITS } from './formats';
import type { CreativeToolId } from '../data/creativeTools';

export interface StudioImage { id: string; name: string; file: File; url: string; width: number; height: number }
export interface StudioOptions {
  name: string; tagline: string; background: string; secondary: string; accent: string;
  font: 'sans-serif' | 'serif' | 'monospace'; padding: number; transparent: boolean;
  markType: 'text' | 'logo'; text: string; color: string; opacity: number; size: number; margin: number;
  position: string; frame: boolean; rounded: number; shadow: boolean; gradient: boolean;
  format: 'png' | 'jpg' | 'webp'; quality: number;
}
export const STUDIO_DEFAULTS: StudioOptions = {
  name: 'Your brand', tagline: 'Made with care.', background: '#eeece1', secondary: '#20251e', accent: '#d3f36a',
  font: 'sans-serif', padding: 64, transparent: false, markType: 'text', text: '© Your brand', color: '#ffffff',
  opacity: 65, size: 24, margin: 4, position: 'bottom-right', frame: true, rounded: 18, shadow: true, gradient: false,
  format: 'png', quality: 90,
};
export interface StudioOutput { name: string; blob: Blob }
export const safeStem = (name: string) => name.replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'image';

export async function loadStudioImage(file: File): Promise<StudioImage> {
  const info = await inspectFile(file);
  if (info.animated) throw new Error('Use a still image. Animated files are not supported by this tool.');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width > LIMITS.dimension || bitmap.height > LIMITS.dimension || bitmap.width * bitmap.height > LIMITS.pixels) throw new Error('Image dimensions exceed the browser processing limit.');
    return { id: crypto.randomUUID(), name: file.name, file, url: URL.createObjectURL(file), width: bitmap.width, height: bitmap.height };
  } finally { bitmap.close(); }
}
function canvas(width: number, height: number) {
  if (width > LIMITS.dimension || height > LIMITS.dimension || width * height > LIMITS.pixels) throw new Error('Output dimensions exceed the browser processing limit.');
  const c = document.createElement('canvas'); c.width = width; c.height = height;
  return c;
}
export function screenshotDimensions(width: number, height: number, o: Pick<StudioOptions, 'padding' | 'frame'>) {
  return { width: width + o.padding * 2, height: height + o.padding * 2 + (o.frame ? 40 : 0) };
}
export function watermarkBox(width: number, height: number, markWidth: number, markHeight: number, margin: number, position: string) {
  const gap = Math.min(width, height) * margin / 100;
  const x = position.endsWith('left') ? gap : position.endsWith('right') ? width - markWidth - gap : (width - markWidth) / 2;
  const y = position.startsWith('top') ? gap : position.startsWith('bottom') ? height - markHeight - gap : (height - markHeight) / 2;
  return { x, y };
}
function contain(ctx: CanvasRenderingContext2D, source: ImageBitmap, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / source.width, height / source.height);
  const w = source.width * scale, h = source.height * scale;
  ctx.drawImage(source, x + (width - w) / 2, y + (height - h) / 2, w, h);
}
function icon(source: ImageBitmap, size: number, o: StudioOptions, background = o.transparent ? '' : o.background) {
  const c = canvas(size, size), ctx = c.getContext('2d')!;
  if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, size, size); }
  const pad = size * Math.min(o.padding, 160) / 512;
  contain(ctx, source, pad, pad, size - pad * 2, size - pad * 2);
  return c;
}
export async function renderStudio(kind: CreativeToolId, source: StudioImage, o: StudioOptions, logo?: StudioImage, preview = false): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(source.file);
  let mark: ImageBitmap | undefined;
  try {
    if (kind === 'favicon') return icon(bitmap, 512, o);
    if (kind === 'brand') {
      const c = canvas(1600, 1000), ctx = c.getContext('2d')!;
      ctx.fillStyle = '#f8f8f5'; ctx.fillRect(0, 0, 1600, 1000);
      ctx.fillStyle = '#20251e'; ctx.font = `600 62px ${o.font}`; ctx.fillText(o.name || 'Your brand', 80, 126, 1440);
      ctx.font = `26px ${o.font}`; ctx.fillText(o.tagline, 80, 178, 1440);
      const colors = ['#ffffff', o.secondary, o.background];
      colors.forEach((color, i) => { const x = 80 + i * 490; ctx.fillStyle = color; ctx.fillRect(x, 235, 460, 310); const pad = 310 * o.padding / 512; contain(ctx, bitmap, x + pad, 235 + pad, 460 - pad * 2, 310 - pad * 2); });
      [o.background, o.secondary, o.accent].forEach((color, i) => { const x = 80 + i * 490; ctx.fillStyle = color; ctx.fillRect(x, 600, 460, 100); ctx.fillStyle = '#20251e'; ctx.font = '24px monospace'; ctx.fillText(color.toUpperCase(), x, 740); });
      ctx.font = `48px ${o.font}`; ctx.fillText('Aa Bb Cc 0123456789', 80, 850);
      ctx.font = '22px sans-serif'; ctx.fillText(o.font, 80, 905);
      return c;
    }
    const dimensions = kind === 'screenshot' ? screenshotDimensions(bitmap.width, bitmap.height, o) : bitmap;
    // Limit preview memory; export always renders at the requested full dimensions.
    const scale = preview ? Math.min(1, 1400 / Math.max(dimensions.width, dimensions.height)) : 1;
    const c = canvas(Math.round(dimensions.width * scale), Math.round(dimensions.height * scale)), ctx = c.getContext('2d')!;
    ctx.scale(scale, scale);
    if (kind === 'screenshot') {
      const { width, height } = dimensions;
      const gradient = ctx.createLinearGradient(0, 0, width, height); gradient.addColorStop(0, o.background); gradient.addColorStop(1, o.accent);
      ctx.fillStyle = o.gradient ? gradient : o.background; ctx.fillRect(0, 0, width, height);
      const p = o.padding, bar = o.frame ? 40 : 0, radius = Math.min(o.rounded, bitmap.width / 2, (bitmap.height + bar) / 2);
      ctx.save(); ctx.beginPath(); ctx.roundRect(p, p, bitmap.width, bitmap.height + bar, radius);
      if (o.shadow) { ctx.shadowColor = '#00000030'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; }
      ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.roundRect(p, p, bitmap.width, bitmap.height + bar, radius); ctx.clip();
      ctx.fillStyle = '#f5f5f5'; ctx.fillRect(p, p, bitmap.width, bar);
      if (o.frame) ['#ed9a91', '#e8ce88', '#abc5a2'].forEach((color, i) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p + 18 + i * 17, p + 20, 5, 0, Math.PI * 2); ctx.fill(); });
      ctx.drawImage(bitmap, p, p + bar); ctx.restore();
    } else {
      if (o.format === 'jpg') { ctx.fillStyle = o.background; ctx.fillRect(0, 0, bitmap.width, bitmap.height); }
      ctx.drawImage(bitmap, 0, 0); ctx.globalAlpha = o.opacity / 100;
      const maxW = bitmap.width * o.size / 100;
      let w = maxW, h: number;
      if (o.markType === 'logo') {
        if (!logo) throw new Error('Add a watermark logo first.');
        mark = await createImageBitmap(logo.file);
        const factor = Math.min(maxW / mark.width, bitmap.height * 0.5 / mark.height);
        w = mark.width * factor; h = mark.height * factor;
      } else {
        if (!o.text.trim()) throw new Error('Enter watermark text.');
        ctx.font = `600 100px ${o.font}`;
        const fontSize = Math.min(maxW / Math.max(1, ctx.measureText(o.text).width) * 100, bitmap.height * 0.2);
        ctx.font = `600 ${fontSize}px ${o.font}`; ctx.textBaseline = 'top'; w = ctx.measureText(o.text).width; h = fontSize * 1.2;
      }
      const { x, y } = watermarkBox(bitmap.width, bitmap.height, w, h, o.margin, o.position);
      if (mark) ctx.drawImage(mark, x, y, w, h);
      else { ctx.fillStyle = o.color; ctx.fillText(o.text, x, y); }
    }
    return c;
  } finally { bitmap.close(); mark?.close(); }
}
export function canvasBlob(c: HTMLCanvasElement, format = 'png', quality = 90): Promise<Blob> {
  const mime = `image/${format === 'jpg' ? 'jpeg' : format}`;
  return new Promise((resolve, reject) => c.toBlob(blob => {
    if (!blob || blob.type !== mime) reject(new Error('This browser cannot export the selected format. Choose PNG.'));
    else resolve(blob);
  }, mime, quality / 100));
}
/** ICO directory with PNG entries (supported by modern browsers and Windows). */
export async function icoBlob(entries: { size: number; blob: Blob }[]) {
  const bytes = await Promise.all(entries.map(e => e.blob.arrayBuffer()));
  const header = new Uint8Array(6 + entries.length * 16), view = new DataView(header.buffer);
  view.setUint16(2, 1, true); view.setUint16(4, entries.length, true);
  let offset = header.length;
  entries.forEach((entry, i) => { const p = 6 + i * 16; header[p] = entry.size === 256 ? 0 : entry.size; header[p + 1] = header[p]; view.setUint16(p + 4, 1, true); view.setUint16(p + 6, 32, true); view.setUint32(p + 8, bytes[i].byteLength, true); view.setUint32(p + 12, offset, true); offset += bytes[i].byteLength; });
  return new Blob([header, ...bytes], { type: 'image/x-icon' });
}
export function faviconManifest(name: string, background: string) {
  return { name, short_name: name.slice(0, 24), start_url: '/', display: 'standalone', background_color: background, theme_color: background, icons: [192, 512].map(size => ({ src: `/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'any' })) };
}
export async function createStudioOutputs(kind: CreativeToolId, sources: StudioImage[], o: StudioOptions, logo: StudioImage | undefined, signal: AbortSignal, progress: (done: number) => void, locale: 'en' | 'es'): Promise<StudioOutput[]> {
  const outputs: StudioOutput[] = [];
  const add = (name: string, blob: Blob) => { if (outputs.reduce((n, item) => n + item.blob.size, 0) + blob.size > LIMITS.zipBytes) throw new Error('The export exceeds 300 MB. Try fewer images.'); outputs.push({ name, blob }); };
  const text = (name: string, value: string) => add(name, new Blob([value], { type: 'text/plain;charset=utf-8' }));
  const check = () => { if (signal.aborted) throw new DOMException('Export canceled', 'AbortError'); };
  check();
  if (!sources.length) throw new Error('Add an image first.');
  if (kind === 'favicon' || kind === 'brand') {
    const bitmap = await createImageBitmap(sources[0].file);
    try {
      if (kind === 'favicon') {
        const entries = [];
        for (const size of [16, 32, 48, 96, 180, 192, 512]) {
          check(); const blob = await canvasBlob(icon(bitmap, size, o, size === 180 ? o.background : undefined));
          add(size === 180 ? 'apple-touch-icon.png' : size >= 192 ? `icon-${size}.png` : `favicon-${size}.png`, blob);
          if (size <= 48) entries.push({ size, blob });
        }
        add('favicon.ico', await icoBlob(entries));
        text('site.webmanifest', JSON.stringify(faviconManifest(o.name, o.background), null, 2));
        text('head-snippet.html', '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">');
        text('README.txt', locale === 'es' ? 'Subí estos archivos a la raíz de tu sitio. Pegá head-snippet.html dentro de <head>. Si usás una subcarpeta, actualizá las rutas del HTML y del manifest. Revisá el nombre y start_url del manifest. Los iconos no garantizan que Google los muestre ni convierten el sitio en una app instalable. El icono de Apple tiene fondo sólido.' : 'Upload these files to your site root. Paste head-snippet.html inside <head>. For a subdirectory, update paths in both the HTML and manifest. Review the manifest name and start_url. Icons do not guarantee display in Google or make a site installable on their own. The Apple icon has a solid background.');
      } else {
        for (const [name, bg] of [['original', ''], ['light', '#ffffff'], ['dark', o.secondary]] as const) { check(); add(`logo-${name}.png`, await canvasBlob(icon(bitmap, 1024, o, bg))); }
        add('brand-board.png', await canvasBlob(await renderStudio('brand', sources[0], o)));
        text('brand.json', JSON.stringify({ name: o.name, tagline: o.tagline, colors: { background: o.background, ink: o.secondary, accent: o.accent }, fontFamily: o.font }, null, 2));
        text('colors.css', `:root {\n  --brand-background: ${o.background};\n  --brand-ink: ${o.secondary};\n  --brand-accent: ${o.accent};\n  --brand-font: ${o.font};\n}\n`);
        text('README.txt', locale === 'es' ? 'El kit conserva los colores y el fondo de tu logo original. Usá un PNG transparente para obtener variantes limpias. Revisá el contraste de las variantes antes de publicarlas. La familia tipográfica usa las fuentes disponibles en cada dispositivo; no se incluyen archivos de fuentes.' : 'This kit preserves the colors and background of your source logo. Use a transparent PNG for clean variants. Check contrast before publishing. The font family uses fonts available on each device; font files are not included.');
      }
    } finally { bitmap.close(); }
    progress(1);
  } else {
    for (let i = 0; i < sources.length; i++) {
      check(); const c = await renderStudio(kind, sources[i], o, logo);
      add(`${String(i + 1).padStart(3, '0')}-${safeStem(sources[i].name)}-${kind}.${o.format}`, await canvasBlob(c, o.format, o.quality));
      c.width = 1; c.height = 1; progress(i + 1);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  check(); return outputs;
}
export async function zipStudio(outputs: StudioOutput[], signal: AbortSignal) {
  const writer = new ZipWriter(new BlobWriter('application/zip'), { useWebWorkers: false });
  try {
    for (const output of outputs) { if (signal.aborted) throw new DOMException('Export canceled', 'AbortError'); await writer.add(output.name, new BlobReader(output.blob), { level: 0, signal }); }
    return await writer.close();
  } catch (error) { await writer.close().catch(() => undefined); throw error; }
}
