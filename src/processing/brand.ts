import { analyzeBrandPixels, brandFont, contrast, edgeBackground, luminance, pixelBounds, textOn, type BrandAnalysis, type BrandColor } from './brandAnalysis';
import { canvasBlob, type StudioImage, type StudioOutput } from './creative';
import { translate } from '../i18n/translate';
import { photoBase, PHOTO_SURFACES, printMug, printPlane } from './brandPhoto';
import { applicationSheet, brandCopy, typographySheet, wrapText, type BrandUseCase } from './brandLayouts';
export type BrandView = 'board' | 'cards' | 'mug' | 'tote' | 'notebook' | 'typography' | 'applications' | 'social' | 'pattern' | 'avatar';
export const BRAND_VIEWS: { id: BrandView; label: string }[] = [{ id: 'board', label: 'Brand board' }, { id: 'cards', label: 'Business cards' }, { id: 'mug', label: 'Mug mockup' }, { id: 'tote', label: 'Canvas tote' }, { id: 'notebook', label: 'Notebook' }, { id: 'typography', label: 'Type & color' }, { id: 'applications', label: 'Brand in use' }, { id: 'social', label: 'Social graphic' }, { id: 'pattern', label: 'Brand pattern' }, { id: 'avatar', label: 'Brand avatar' }];
export interface BrandOptions { name: string; tagline: string; colors: BrandColor[]; fontId: string; removeBackground: boolean; padding: number; includeFont: boolean; headline: string; body: string; action: string; useCase: BrandUseCase; printStyle: 'auto' | 'original' | 'mono' }
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
function printableLogo(prepared: PreparedBrand, o: BrandOptions) {
  const logo = logoCanvas(prepared, o), r = brandRoles(o.colors);
  const actual = prepared.analysis.colors.filter(c => c.origin === 'image');
  const oneInk = o.printStyle === 'mono' || (o.printStyle === 'auto' && actual.every(c => luminance(c.hex) > 0.65));
  if (!oneInk) return logo;
  const ink = contrast(r.ink, '#ffffff') >= 4.5 ? r.ink : '#202020';
  const c = surface(logo.width, logo.height); place(context(c), logoCanvas(prepared, o, true), 0, 0, c.width, c.height, 0, ink); return c;
}
async function scene(prepared: PreparedBrand, o: BrandOptions, view: BrandView, logo: HTMLCanvasElement, locale: 'en' | 'es'): Promise<HTMLCanvasElement> {
  const r = brandRoles(o.colors), font = brandFont(o.fontId).name, copy = brandCopy(o, locale);
  if (view === 'typography') return typographySheet(o, r, locale);
  if (view === 'applications') return applicationSheet(o, r, logo, locale);
  if (view === 'pattern') return pattern(logoCanvas(prepared, o, true), o, prepared.analysis.signature);
  if (view === 'avatar') { const c = surface(800, 800), ctx = context(c); ctx.fillStyle = logoBackground(r); ctx.fillRect(0, 0, 800, 800); place(ctx, logo, 0, 0, 800, 800, 110 + o.padding); return c; }
  if (view === 'social') {
    const c = surface(1080, 1080), ctx = context(c), panel = r.paper;
    ctx.drawImage(pattern(logoCanvas(prepared, o, true), o, prepared.analysis.signature, c.width, c.height), 0, 0);
    ctx.fillStyle = panel; ctx.fillRect(65, 65, 950, 950);
    ctx.fillStyle = r.logoBase; ctx.fillRect(110, 110, 310, 190); place(ctx, logo, 110, 110, 310, 190, 25);
    wrapText(ctx, copy.headline, 110, 430, 860, 82, 94, font, textOn(panel), 3);
    wrapText(ctx, copy.body, 115, 780, 830, 31, 44, font, textOn(panel), 3);
    label(ctx, copy.action + ' →', 115, 960, 28, textOn(panel), font, 830); return c;
  }
  if (view === 'cards') {
    const c = await photoBase('cards');
    printPlane(c, cardFace(logo, o, true), PHOTO_SURFACES.cardBack);
    printPlane(c, cardFace(logo, o, false), PHOTO_SURFACES.cardFront); return c;
  }
  if (view === 'mug') {
    const c = await photoBase('mug'), print = surface(760, 500);
    place(context(print), printableLogo(prepared, o), 0, 0, 760, 500, 30 + o.padding);
    printMug(c, print); return c;
  }
  if (view === 'tote') {
    const c = await photoBase('tote'), print = surface(700, 640), ctx = context(print);
    place(ctx, printableLogo(prepared, o), 0, 0, 700, 520, 30 + o.padding);
    wrapText(ctx, o.tagline, 50, 590, 600, 25, 32, font, r.ink, 1);
    printPlane(c, print, PHOTO_SURFACES.tote, true); return c;
  }
  if (view === 'notebook') {
    const c = await photoBase('notebook'), cover = surface(840, 1188), ctx = context(cover);
    ctx.fillStyle = r.paper; ctx.fillRect(0, 0, 840, 1188);
    ctx.fillStyle = r.primary; ctx.fillRect(0, 0, 22, 1188);
    ctx.fillStyle = r.logoBase; ctx.fillRect(90, 90, 300, 240); place(ctx, logo, 90, 90, 300, 240, 30 + o.padding * 0.35);
    wrapText(ctx, copy.headline, 90, 550, 660, 72, 88, font, textOn(r.paper), 4);
    label(ctx, o.name, 90, 1060, 28, textOn(r.paper), font, 660);
    o.colors.forEach((color, i) => { ctx.fillStyle = color.hex; ctx.fillRect(90+i*100, 1100, 80, 8); });
    printPlane(c, cover, PHOTO_SURFACES.notebook); return c;
  }
  throw new Error('Unknown brand application.');
}
export async function renderBrand(prepared: PreparedBrand, o: BrandOptions, view: BrandView, locale: 'en' | 'es' = 'en'): Promise<HTMLCanvasElement> {
  await loadBrandFont(o.fontId);
  const logo = logoCanvas(prepared, o);
  if (view !== 'board') return scene(prepared, o, view, logo, locale);
  const c = surface(1600, 2020), ctx = context(c), r = brandRoles(o.colors), font = brandFont(o.fontId).name;
  ctx.fillStyle = '#fafaf8'; ctx.fillRect(0, 0, 1600, c.height);
  label(ctx, o.name, 65, 100, 55, '#20251e', font, 1470); label(ctx, o.tagline, 65, 145, 24, '#50554a', font, 1470);
  ctx.fillStyle = logoBackground(r); ctx.fillRect(65, 185, 720, 250); place(ctx, logo, 65, 185, 720, 250, 25 + o.padding);
  ctx.fillStyle = r.ink; ctx.fillRect(815, 185, 720, 250); place(ctx, logoCanvas(prepared, o, true), 815, 185, 720, 250, 25 + o.padding, textOn(r.ink));
  const swatchWidth = 1470 / o.colors.length;
  o.colors.forEach((color, i) => { ctx.fillStyle = color.hex; ctx.fillRect(65 + i*swatchWidth, 465, swatchWidth-15, 80); label(ctx, color.hex.toUpperCase(), 65+i*swatchWidth, 578, 21, '#30352d', 'monospace', swatchWidth-20); });
  const views = ['cards', 'mug', 'tote', 'notebook'] as const;
  for (let i = 0; i < views.length; i++) { const photo = await scene(prepared, o, views[i], logo, locale); ctx.drawImage(photo, 65+(i%2)*750, 615+Math.floor(i/2)*510, 720, 480); photo.width = 1; }
  const copy = brandCopy(o, locale);
  label(ctx, font, 65, 1695, 23, '#50554a', font, 1470);
  wrapText(ctx, copy.headline, 65, 1780, 1460, 63, 76, font, r.ink, 2);
  wrapText(ctx, copy.body, 70, 1950, 1400, 26, 34, font, '#50554a', 2); return c;
}
export async function exportBrand(prepared: PreparedBrand, o: BrandOptions, signal: AbortSignal, progress: (n: number) => void, locale: 'en' | 'es'): Promise<StudioOutput[]> {
  const outputs: StudioOutput[] = [], font = brandFont(o.fontId), r = brandRoles(o.colors);
  const fontReason = translate(o.fontId === prepared.analysis.fontId ? prepared.analysis.reason : 'You chose this font instead of the automatic suggestion.', locale);
  const addText = (name: string, text: string) => outputs.push({ name, blob: new Blob([text], { type: 'text/plain;charset=utf-8' }) });
  const check = () => { if (signal.aborted) throw new DOMException('Export canceled', 'AbortError'); };
  for (let i = 0; i < BRAND_VIEWS.length; i++) { check(); const view = BRAND_VIEWS[i]; const canvas = await renderBrand(prepared, o, view.id, locale); outputs.push({ name: `${view.id}.png`, blob: await canvasBlob(canvas) }); canvas.width = 1; progress(i + 1); }
  const logo = logoCanvas(prepared, o);
  outputs.push({ name: 'logo-trimmed.png', blob: await canvasBlob(logo) });
  const silhouette = logoCanvas(prepared, o, true);
  const mono = surface(logo.width, logo.height); place(context(mono), silhouette, 0, 0, logo.width, logo.height, 0, '#ffffff'); outputs.push({ name: 'logo-white.png', blob: await canvasBlob(mono) });
  context(mono).clearRect(0, 0, mono.width, mono.height); place(context(mono), silhouette, 0, 0, logo.width, logo.height, 0, '#111111'); outputs.push({ name: 'logo-dark.png', blob: await canvasBlob(mono) });
  outputs.push({ name: 'card-front.png', blob: await canvasBlob(cardFace(logo, o, false)) }, { name: 'card-back.png', blob: await canvasBlob(cardFace(logo, o, true)) });
  const tokens = o.colors.map((c, i) => `  --brand-color-${i + 1}: ${c.hex};`).join('\n');
  addText('colors.css', `:root {\n${tokens}\n  --brand-ink: ${r.ink};\n  --brand-paper: ${r.paper};\n  --brand-font: "${font.name}";\n}\n`);
  addText('brand.json', JSON.stringify({ name: o.name, tagline: o.tagline, copy: brandCopy(o, locale), useCase: o.useCase, printStyle: o.printStyle, palette: o.colors, font: { name: font.name, url: font.url, suggestion: fontReason }, backgroundRemoved: o.removeBackground && prepared.analysis.removed, monochromeVariants: 'Recolored silhouette; review intentional light areas.', contrastRatio: Number(contrast(r.ink, r.paper).toFixed(2)) }, null, 2));
  addText('typography.txt', `${font.name}\n${font.url}\n${fontReason}\n${locale === 'es' ? (o.includeFont ? 'La fuente original y su licencia están incluidas en fonts/.' : 'Descargá la fuente desde el enlace de Google Fonts de arriba.') : (o.includeFont ? 'The original font file and its license are included in fonts/.' : 'Download the font from the Google Fonts link above.')}\n`);
  if (o.includeFont) {
    for (const filename of [font.file, font.license]) { check(); const response = await fetch(`/fonts/brand/${filename}`, { signal }); if (!response.ok) throw new Error('Could not download the font files. Try again or turn off Include font files.'); outputs.push({ name: `fonts/${filename}`, blob: await response.blob() }); }
  }
  addText('README.txt', locale === 'es' ? 'Kit generado localmente a partir de tu logo. La paleta distingue colores extraídos, sugeridos y editados. La tipografía es una sugerencia visual, no la identificación de la fuente original. Los mockups usan escenas fotorealistas generadas por IA. Tu logo se aplica localmente con perspectiva, curvatura e iluminación de la superficie. Son simulaciones de presentación. Las tarjetas son imágenes conceptuales de 1050 × 600 px, sin sangrado ni perfil de imprenta. Revisá el recorte, la limpieza de fondo y las siluetas monocromáticas antes de usar. La limpieza elimina solo fondos uniformes conectados al borde; no reconstruye zonas tapadas. Los patrones usan tu propio logo. No se inventan datos personales o de contacto.' : 'Generated locally from your logo. The palette distinguishes extracted, suggested and edited colors. Typography is a visual pairing suggestion, not identification of the original typeface. Mockups use AI-generated photorealistic base scenes. Your logo is composited locally with surface perspective, curvature and lighting. These are presentation simulations. Cards are 1050 × 600 px concept images, without print bleed or a printer color profile. Review cropping, background cleanup and monochrome silhouettes before use. Cleanup removes only uniform backgrounds connected to the border; it does not reconstruct hidden areas. Patterns use your actual logo. No personal or contact details are invented.');
  check(); return outputs;
}
