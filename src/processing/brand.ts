import { analyzeBrandPixels, brandFont, contrast, edgeBackground, luminance, mixColor, pixelBounds, textOn, type BrandAnalysis, type BrandColor } from './brandAnalysis';
import { canvasBlob, type StudioImage, type StudioOutput } from './creative';
import { translate } from '../i18n/translate';
export type BrandView = 'board' | 'cards' | 'mug' | 'social' | 'pattern' | 'avatar';
export const BRAND_VIEWS: { id: BrandView; label: string }[] = [{ id: 'board', label: 'Brand board' }, { id: 'cards', label: 'Business cards' }, { id: 'mug', label: 'Mug mockup' }, { id: 'social', label: 'Social graphic' }, { id: 'pattern', label: 'Brand pattern' }, { id: 'avatar', label: 'Brand avatar' }];
export interface BrandOptions { name: string; tagline: string; colors: BrandColor[]; fontId: string; removeBackground: boolean; padding: number; includeFont: boolean }
export interface PreparedBrand { image: HTMLCanvasElement; original: HTMLCanvasElement; analysis: BrandAnalysis; background?: number[] }
const fontLoads = new Map<string, Promise<void>>();
export async function loadBrandFont(id: string) {
  if (!fontLoads.has(id)) {
    const font = brandFont(id);
    const promise = new FontFace(font.name, `url('/fonts/brand/${font.file}')`).load().then(face => { document.fonts.add(face); }).catch(() => { fontLoads.delete(id); throw new Error('Could not load the font. Check your connection and try again.'); });
    fontLoads.set(id, promise);
  }
  await fontLoads.get(id);
}
const surface = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const context = (c: HTMLCanvasElement) => { const ctx = c.getContext('2d'); if (!ctx) throw new Error('Canvas processing is unavailable.'); return ctx; };
export async function prepareBrand(source: StudioImage): Promise<PreparedBrand> {
  const bitmap = await createImageBitmap(source.file);
  try {
    const factor = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const original = surface(Math.max(1, Math.round(bitmap.width * factor)), Math.max(1, Math.round(bitmap.height * factor)));
    const ctx = context(original); ctx.drawImage(bitmap, 0, 0, original.width, original.height);
    const sampleScale = Math.min(1, 512 / Math.max(original.width, original.height));
    const sample = surface(Math.max(1, Math.round(original.width * sampleScale)), Math.max(1, Math.round(original.height * sampleScale)));
    const sc = context(sample); sc.drawImage(original, 0, 0, sample.width, sample.height);
    const analysis = analyzeBrandPixels(sc.getImageData(0, 0, sample.width, sample.height).data, sample.width, sample.height);
    const pixels = ctx.getImageData(0, 0, original.width, original.height);
    const cleaned = edgeBackground(pixels.data, original.width, original.height);
    const image = surface(original.width, original.height); context(image).putImageData(new ImageData(cleaned.data, original.width, original.height), 0, 0);
    return { original, image, analysis: { ...analysis, removed: cleaned.removed }, background: cleaned.background };
  } finally { bitmap.close(); }
}
function logoCanvas(prepared: PreparedBrand, o: BrandOptions, monochrome = false) {
  const source = o.removeBackground ? prepared.image : prepared.original;
  const bounds = pixelBounds(context(source).getImageData(0, 0, source.width, source.height).data, source.width, source.height);
  if (!bounds) throw new Error('No visible logo found. Choose another image.');
  const c = surface(bounds.width, bounds.height), ctx = context(c); ctx.drawImage(source, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);
  // Knock out enclosed background-colored counters for a readable one-ink variant.
  // The full-color original remains unchanged; intentional light areas require review.
  if (monochrome && o.removeBackground && prepared.analysis.removed && prepared.background) {
    const pixels = ctx.getImageData(0, 0, c.width, c.height), bg = prepared.background;
    for (let i = 0; i < pixels.data.length; i += 4) if (bg.every((v, channel) => Math.abs(pixels.data[i + channel] - v) < 38)) pixels.data[i + 3] = 0;
    ctx.putImageData(pixels, 0, 0);
  }
  return c;
}
export function brandRoles(colors: BrandColor[]) {
  const sorted = colors.map(c => c.hex).sort((a, b) => luminance(a) - luminance(b));
  const ink = sorted[0], paper = sorted[sorted.length - 1];
  const extracted = colors.filter(c => c.origin === 'image').map(c => c.hex);
  const artwork = extracted.length ? extracted : [colors[0].hex];
  const logoBase = Math.min(...artwork.map(c => contrast(c, paper))) >= Math.min(...artwork.map(c => contrast(c, ink))) ? paper : ink;
  return { ink, paper, primary: colors[0].hex, accent: colors[colors.length - 1].hex, logoBase };
}
function place(ctx: CanvasRenderingContext2D, logo: HTMLCanvasElement, x: number, y: number, width: number, height: number, padding = 0, tint?: string) {
  const scale = Math.min((width - padding * 2) / logo.width, (height - padding * 2) / logo.height), w = logo.width * scale, h = logo.height * scale;
  if (tint) {
    const tinted = surface(logo.width, logo.height), tc = context(tinted); tc.drawImage(logo, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = tint; tc.fillRect(0, 0, tinted.width, tinted.height);
    ctx.drawImage(tinted, x + (width - w) / 2, y + (height - h) / 2, w, h);
  } else ctx.drawImage(logo, x + (width - w) / 2, y + (height - h) / 2, w, h);
}
function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, font: string, max: number) {
  ctx.fillStyle = color; ctx.font = `${size}px ${['monospace', 'sans-serif', 'serif'].includes(font) ? font : `"${font}"`}`; ctx.fillText(text, x, y, max);
}
function cardFace(logo: HTMLCanvasElement, o: BrandOptions, back: boolean) {
  const c = surface(1050, 600), ctx = context(c), r = brandRoles(o.colors), font = brandFont(o.fontId).name;
  ctx.fillStyle = back ? r.ink : logoBackground(r); ctx.fillRect(0, 0, c.width, c.height);
  if (!back) place(ctx, logo, 100, 100, 850, 400, o.padding, undefined);
  else {
    const color = textOn(r.ink);
    label(ctx, o.name, 85, 205, 66, color, font, 880);
    label(ctx, o.tagline, 85, 280, 29, color, font, 880);
    ctx.fillStyle = r.accent; ctx.fillRect(85, 390, Math.min(880, 220 + logo.width / logo.height * 100), 14);
    o.colors.forEach((swatch, i) => { ctx.fillStyle = swatch.hex; ctx.fillRect(85 + i * 70, 465, 50, 50); });
  }
  return c;
}
function logoBackground(r: ReturnType<typeof brandRoles>) {
  return r.logoBase;
}
function pattern(logo: HTMLCanvasElement, o: BrandOptions, seed: number, w = 1600, h = 1000) {
  const c = surface(w, h), ctx = context(c), r = brandRoles(o.colors);
  ctx.fillStyle = r.paper; ctx.fillRect(0, 0, w, h);
  const stepX = logo.width / logo.height > 2 ? 330 : 230, stepY = 190 + seed % 50;
  for (let row = -1; row < h / stepY + 1; row++) for (let col = -1; col < w / stepX + 1; col++) {
    ctx.save(); ctx.translate(col * stepX + (row % 2 ? stepX / 2 : 0), row * stepY); ctx.rotate(((seed % 3) - 1) * Math.PI / 12);
    ctx.globalAlpha = 0.12 + ((row + col + 12) % 3) * 0.06;
    place(ctx, logo, -stepX * 0.35, -stepY * 0.3, stepX * 0.7, stepY * 0.6, 12, r.ink); ctx.restore();
  }
  return c;
}
function scene(prepared: PreparedBrand, o: BrandOptions, view: BrandView, logo: HTMLCanvasElement): HTMLCanvasElement {
  const r = brandRoles(o.colors), font = brandFont(o.fontId).name;
  if (view === 'pattern') return pattern(logoCanvas(prepared, o, true), o, prepared.analysis.signature);
  if (view === 'avatar') { const c = surface(800, 800), ctx = context(c); ctx.fillStyle = logoBackground(r); ctx.fillRect(0, 0, 800, 800); place(ctx, logo, 0, 0, 800, 800, 110 + o.padding); return c; }
  if (view === 'social') {
    const wide = prepared.analysis.ratio > 1.8, c = surface(wide ? 1600 : 1080, wide ? 900 : 1080), ctx = context(c);
    ctx.drawImage(pattern(logoCanvas(prepared, o, true), o, prepared.analysis.signature, c.width, c.height), 0, 0);
    const panel = logoBackground(r);
    ctx.fillStyle = panel; ctx.fillRect(65, 65, c.width - 130, c.height - 130);
    place(ctx, logo, 120, 140, c.width - 240, c.height * 0.45, o.padding);
    label(ctx, o.name, 120, c.height - 220, wide ? 62 : 56, textOn(panel), font, c.width - 240);
    label(ctx, o.tagline, 120, c.height - 155, 28, textOn(panel), font, c.width - 240);
    ctx.fillStyle = r.accent; ctx.fillRect(120, c.height - 115, c.width - 240, 10); return c;
  }
  const c = surface(1600, 1000), ctx = context(c);
  const sceneColor = mixColor(r.paper, r.accent, 0.1);
  const bg = ctx.createLinearGradient(0, 0, 1600, 1000); bg.addColorStop(0, sceneColor); bg.addColorStop(1, mixColor(sceneColor, r.ink, 0.1)); ctx.fillStyle = bg; ctx.fillRect(0, 0, 1600, 1000);
  if (view === 'cards') {
    for (const [x, y, angle, back] of [[970, 390, 0.14, true], [610, 630, -0.12, false]] as const) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.shadowColor = '#00000035'; ctx.shadowBlur = 45; ctx.shadowOffsetY = 28;
      ctx.fillStyle = back ? r.ink : r.paper; ctx.fillRect(-380, -217, 760, 434); ctx.shadowColor = 'transparent'; ctx.drawImage(cardFace(logo, o, back), -380, -217, 760, 434); ctx.restore();
    }
    return c;
  }
  if (view === 'mug') {
    const material = logoBackground(r), highlight = luminance(material) < 0.3 ? 0.12 : 0.7;
    ctx.save(); ctx.translate(780, 855); ctx.scale(1, 0.2); const shadow = ctx.createRadialGradient(0, 0, 10, 0, 0, 390); shadow.addColorStop(0, '#00000045'); shadow.addColorStop(1, '#00000000'); ctx.fillStyle = shadow; ctx.fillRect(-420, -420, 840, 840); ctx.restore();
    // Ceramic handle, shaded body and cylindrical print mapping, built from the current brand.
    ctx.strokeStyle = mixColor(material, '#ffffff', highlight); ctx.lineWidth = 65; ctx.beginPath(); ctx.ellipse(1050, 520, 140, 180, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#00000012'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(1050, 520, 140, 180, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    const ceramic = ctx.createLinearGradient(510, 0, 1040, 0); ceramic.addColorStop(0, mixColor(material, '#000000', 0.18)); ceramic.addColorStop(0.22, mixColor(material, '#ffffff', highlight)); ceramic.addColorStop(0.65, mixColor(material, '#ffffff', highlight * 0.6)); ceramic.addColorStop(1, mixColor(material, '#000000', 0.2));
    ctx.beginPath(); ctx.moveTo(510, 280); ctx.lineTo(1040, 280); ctx.lineTo(1020, 760); ctx.bezierCurveTo(1020, 850, 530, 850, 530, 760); ctx.closePath(); ctx.fillStyle = ceramic; ctx.fill();
    ctx.beginPath(); ctx.ellipse(775, 280, 265, 60, 0, 0, Math.PI * 2); ctx.fillStyle = '#fdfdfb'; ctx.fill();
    const inside = ctx.createLinearGradient(0, 240, 0, 330); inside.addColorStop(0, mixColor(r.paper, r.ink, 0.35)); inside.addColorStop(1, mixColor(r.paper, '#ffffff', 0.7)); ctx.beginPath(); ctx.ellipse(775, 282, 242, 43, 0, 0, Math.PI * 2); ctx.fillStyle = inside; ctx.fill();
    const print = surface(500, 300); place(context(print), logo, 0, 0, 500, 300, 45 + o.padding);
    // Fill exact destination pixels to avoid seams between resampled strips.
    for (let dx = Math.ceil(775 - Math.sin(0.8) * 280); dx < 775 + Math.sin(0.8) * 280 - 1; dx++) {
      const u = Math.asin((dx - 775) / 280), next = Math.asin((dx + 1 - 775) / 280);
      const sx = (u / 1.6 + 0.5) * 500, sw = (next - u) / 1.6 * 500;
      const vertical = 1 - Math.abs(u) * 0.05;
      ctx.drawImage(print, sx, 0, sw, 300, dx, 440 + (1 - vertical) * 150, 1, 300 * vertical);
    }
    return c;
  }
  return c;
}
export async function renderBrand(prepared: PreparedBrand, o: BrandOptions, view: BrandView): Promise<HTMLCanvasElement> {
  await loadBrandFont(o.fontId);
  const logo = logoCanvas(prepared, o);
  if (view !== 'board') return scene(prepared, o, view, logo);
  const c = surface(1600, 1320), ctx = context(c), r = brandRoles(o.colors), font = brandFont(o.fontId).name;
  ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, 1600, 1320);
  label(ctx, o.name, 70, 115, 60, '#20251e', font, 1460); label(ctx, o.tagline, 70, 165, 26, '#50554a', font, 1460);
  ctx.fillStyle = logoBackground(r); ctx.fillRect(70, 215, 700, 340); place(ctx, logo, 70, 215, 700, 340, 45 + o.padding);
  ctx.fillStyle = r.ink; ctx.fillRect(800, 215, 730, 340); place(ctx, logoCanvas(prepared, o, true), 800, 215, 730, 340, 45 + o.padding, textOn(r.ink));
  const swatchWidth = 1460 / o.colors.length;
  o.colors.forEach((color, i) => { ctx.fillStyle = color.hex; ctx.fillRect(70 + i * swatchWidth, 595, swatchWidth - 15, 90); label(ctx, color.hex.toUpperCase(), 70 + i * swatchWidth, 720, 22, '#30352d', 'monospace', swatchWidth - 20); });
  ctx.drawImage(scene(prepared, o, 'cards', logo), 70, 770, 700, 438); ctx.drawImage(scene(prepared, o, 'mug', logo), 800, 770, 730, 438);
  label(ctx, `${font}  /  Aa Bb Cc 0123456789`, 70, 1270, 28, '#20251e', font, 1460); return c;
}
export async function exportBrand(prepared: PreparedBrand, o: BrandOptions, signal: AbortSignal, progress: (n: number) => void, locale: 'en' | 'es'): Promise<StudioOutput[]> {
  const outputs: StudioOutput[] = [], font = brandFont(o.fontId), r = brandRoles(o.colors);
  const fontReason = translate(o.fontId === prepared.analysis.fontId ? prepared.analysis.reason : 'You chose this font instead of the automatic suggestion.', locale);
  const addText = (name: string, text: string) => outputs.push({ name, blob: new Blob([text], { type: 'text/plain;charset=utf-8' }) });
  const check = () => { if (signal.aborted) throw new DOMException('Export canceled', 'AbortError'); };
  for (let i = 0; i < BRAND_VIEWS.length; i++) { check(); const view = BRAND_VIEWS[i]; const canvas = await renderBrand(prepared, o, view.id); outputs.push({ name: `${view.id}.png`, blob: await canvasBlob(canvas) }); canvas.width = 1; progress(i + 1); }
  const logo = logoCanvas(prepared, o);
  outputs.push({ name: 'logo-trimmed.png', blob: await canvasBlob(logo) });
  const silhouette = logoCanvas(prepared, o, true);
  const mono = surface(logo.width, logo.height); place(context(mono), silhouette, 0, 0, logo.width, logo.height, 0, '#ffffff'); outputs.push({ name: 'logo-white.png', blob: await canvasBlob(mono) });
  context(mono).clearRect(0, 0, mono.width, mono.height); place(context(mono), silhouette, 0, 0, logo.width, logo.height, 0, '#111111'); outputs.push({ name: 'logo-dark.png', blob: await canvasBlob(mono) });
  outputs.push({ name: 'card-front.png', blob: await canvasBlob(cardFace(logo, o, false)) }, { name: 'card-back.png', blob: await canvasBlob(cardFace(logo, o, true)) });
  const tokens = o.colors.map((c, i) => `  --brand-color-${i + 1}: ${c.hex};`).join('\n');
  addText('colors.css', `:root {\n${tokens}\n  --brand-ink: ${r.ink};\n  --brand-paper: ${r.paper};\n  --brand-font: "${font.name}";\n}\n`);
  addText('brand.json', JSON.stringify({ name: o.name, tagline: o.tagline, palette: o.colors, font: { name: font.name, url: font.url, suggestion: fontReason }, backgroundRemoved: o.removeBackground && prepared.analysis.removed, monochromeVariants: 'Recolored silhouette; review intentional light areas.', contrastRatio: Number(contrast(r.ink, r.paper).toFixed(2)) }, null, 2));
  addText('typography.txt', `${font.name}\n${font.url}\n${fontReason}\n${locale === 'es' ? (o.includeFont ? 'La fuente original y su licencia están incluidas en fonts/.' : 'Descargá la fuente desde el enlace de Google Fonts de arriba.') : (o.includeFont ? 'The original font file and its license are included in fonts/.' : 'Download the font from the Google Fonts link above.')}\n`);
  if (o.includeFont) {
    for (const filename of [font.file, font.license]) { check(); const response = await fetch(`/fonts/brand/${filename}`, { signal }); if (!response.ok) throw new Error('Could not download the font files. Try again or turn off Include font files.'); outputs.push({ name: `fonts/${filename}`, blob: await response.blob() }); }
  }
  addText('README.txt', locale === 'es' ? 'Kit generado localmente a partir de tu logo. La paleta distingue colores extraídos, sugeridos y editados. La tipografía es una sugerencia visual, no la identificación de la fuente original. Los mockups son composiciones ilustradas de presentación. Las tarjetas son imágenes conceptuales de 1050 × 600 px, sin sangrado ni perfil de imprenta. Revisá el recorte, la limpieza de fondo y las siluetas monocromáticas antes de usar. La limpieza elimina solo fondos uniformes conectados al borde; no reconstruye zonas tapadas. Los patrones usan tu propio logo. No se inventan datos personales o de contacto.' : 'Generated locally from your logo. The palette distinguishes extracted, suggested and edited colors. Typography is a visual pairing suggestion, not identification of the original typeface. Mockups are illustrated presentation compositions. Cards are 1050 × 600 px concept images, without print bleed or a printer color profile. Review cropping, background cleanup and monochrome silhouettes before use. Cleanup removes only uniform backgrounds connected to the border; it does not reconstruct hidden areas. Patterns use your actual logo. No personal or contact details are invented.');
  check(); return outputs;
}
