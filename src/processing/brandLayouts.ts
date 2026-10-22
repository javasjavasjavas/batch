import { brandFont, textOn, mixColor } from './brandAnalysis';
import type { BrandOptions } from './brand';
export type BrandUseCase = 'studio' | 'shop' | 'cafe';
export function brandCopy(o: Pick<BrandOptions, 'headline' | 'body' | 'action' | 'useCase'>, locale: 'en' | 'es') {
  const samples = locale === 'es' ? {
    studio: ['Ideas que toman forma.', 'Un espacio para crear, explorar y dar vida a tu próximo proyecto.', 'Conocé nuestro trabajo'],
    shop: ['Encontrá tu próximo favorito.', 'Descubrí una selección de objetos para acompañarte todos los días.', 'Explorá la colección'],
    cafe: ['Tu momento, cada día.', 'Una pausa para disfrutar del café, de una buena charla y de las pequeñas cosas.', 'Descubrí el menú'],
  } : {
    studio: ['Ideas, made visible.', 'A space to create, explore and bring your next project to life.', 'Explore our work'],
    shop: ['Find your next favorite.', 'Discover a selection of objects to make part of your everyday life.', 'Explore the collection'],
    cafe: ['Your everyday moment.', 'Take a pause for coffee, good conversation and the little things.', 'Discover the menu'],
  };
  const [headline, body, action] = samples[o.useCase];
  return { headline: o.headline.trim() || headline, body: o.body.trim() || body, action: o.action.trim() || action };
}
type Roles = { ink: string; paper: string; accent: string; primary: string; logoBase: string };
const fontString = (font: string, size: number) => `${size}px "${font}"`;
export function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, size: number, lineHeight: number, font: string, color: string, maxLines = 4) {
  ctx.fillStyle = color;
  const split = (fontSize: number) => {
    ctx.font = fontString(font, fontSize);
    const lines: string[] = []; let line = '';
    for (const word of text.trim().split(/\s+/)) {
      if (ctx.measureText(word).width > width) {
        if (line) { lines.push(line); line = ''; }
        for (const character of word) { if (ctx.measureText(line + character).width > width) { lines.push(line); line = ''; } line += character; }
      } else if (line && ctx.measureText(`${line} ${word}`).width > width) { lines.push(line); line = word; }
      else line += (line ? ' ' : '') + word;
    }
    if (line) lines.push(line);
    return lines;
  };
  let fitted = size, lines = split(fitted);
  while (lines.length > maxLines && fitted > size * 0.65) { fitted -= 2; lines = split(fitted); }
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines) { let last = shown[maxLines-1]; while (last.length && ctx.measureText(last + '…').width > width) last = last.slice(0, -1); shown[maxLines-1] = last + '…'; }
  const leading = lineHeight * fitted / size;
  shown.forEach((value, index) => ctx.fillText(value, x, y + index * leading));
  return y + shown.length * leading;
}
function canvas(w: number, h: number) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function ctxOf(c: HTMLCanvasElement) { const ctx = c.getContext('2d'); if (!ctx) throw new Error('Canvas processing is unavailable.'); return ctx; }
function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function logoIn(ctx: CanvasRenderingContext2D, logo: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
  const scale = Math.min(w / logo.width, h / logo.height), width = logo.width * scale, height = logo.height * scale;
  ctx.drawImage(logo, x + (w-width)/2, y + (h-height)/2, width, height);
}
export function typographySheet(o: BrandOptions, r: Roles, locale: 'en' | 'es') {
  const c = canvas(1600, 1200), ctx = ctxOf(c), f = brandFont(o.fontId).name, copy = brandCopy(o, locale), ink = textOn(r.paper);
  box(ctx, 0, 0, 1600, 1200, r.paper);
  wrapText(ctx, locale === 'es' ? 'TIPOGRAFÍA / COLOR' : 'TYPE / COLOR', 80, 85, 900, 22, 28, f, ink, 1);
  wrapText(ctx, f, 80, 165, 1440, 48, 55, f, ink, 1);
  const end = wrapText(ctx, copy.headline, 80, 315, 1370, 100, 112, f, ink, 3);
  wrapText(ctx, copy.body, 85, Math.max(590, end + 40), 820, 30, 45, f, ink, 3);
  box(ctx, 1000, 580, 520, 240, r.ink);
  wrapText(ctx, 'Aa Bb Cc', 1035, 665, 450, 58, 65, f, textOn(r.ink), 1);
  wrapText(ctx, '0123456789', 1035, 735, 440, 36, 45, f, textOn(r.ink), 1);
  wrapText(ctx, 'Á É Í Ó Ú Ñ  /  ! ? & @', 1035, 785, 440, 24, 30, f, textOn(r.ink), 1);
  const w = 1440 / o.colors.length;
  o.colors.forEach((color, i) => { box(ctx, 80 + i*w, 920, w-12, 190, color.hex); wrapText(ctx, color.hex.toUpperCase(), 105+i*w, 1060, w-50, 25, 32, f, textOn(color.hex), 1); });
  return c;
}
export function applicationSheet(o: BrandOptions, r: Roles, logo: HTMLCanvasElement, locale: 'en' | 'es') {
  const c = canvas(1600, 1340), ctx = ctxOf(c), f = brandFont(o.fontId).name, copy = brandCopy(o, locale), text = textOn(r.paper);
  box(ctx, 0, 0, 1600, 1340, '#ecece7');
  wrapText(ctx, locale === 'es' ? 'TU MARCA EN USO' : 'YOUR BRAND IN USE', 65, 70, 1100, 24, 32, f, '#33362e', 1);
  wrapText(ctx, locale === 'es' ? 'Web · Redes · Comunicación' : 'Website · Social · Announcement', 65, 115, 1400, 27, 34, f, '#5d6256', 1);
  // Website hero: readable hierarchy, actual logo and a brand-colored call to action.
  box(ctx, 65, 165, 950, 650, r.paper); box(ctx, 65, 165, 950, 44, mixColor(r.paper, r.ink, 0.06));
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(87+i*19, 187, 4, 0, 7); ctx.fillStyle = mixColor(r.paper, r.ink, 0.3); ctx.fill(); }
  box(ctx, 105, 245, 180, 82, r.logoBase); logoIn(ctx, logo, 115, 255, 160, 62);
  wrapText(ctx, o.name, 680, 290, 290, 23, 30, f, text, 1);
  const headingEnd = wrapText(ctx, copy.headline, 110, 435, 840, 66, 76, f, text, 2);
  wrapText(ctx, copy.body, 112, Math.max(590, headingEnd+25), 750, 25, 36, f, text, 3);
  box(ctx, 112, 723, 430, 55, r.ink); wrapText(ctx, copy.action, 137, 760, 380, 23, 28, f, textOn(r.ink), 1);
  // Social announcement in the same font and palette, with a different scale.
  box(ctx, 1045, 165, 490, 650, r.primary);
  wrapText(ctx, o.name, 1085, 245, 410, 26, 32, f, textOn(r.primary), 1);
  wrapText(ctx, copy.headline, 1085, 350, 410, 55, 67, f, textOn(r.primary), 4);
  box(ctx, 1085, 675, 410, 90, r.logoBase); logoIn(ctx, logo, 1105, 685, 370, 70);
  // Editorial announcement: palette as layout, not only as swatches.
  box(ctx, 65, 855, 1470, 420, r.ink);
  const w = 1470 / o.colors.length; o.colors.forEach((color, i) => box(ctx, 65+i*w, 855, w, 16, color.hex));
  wrapText(ctx, copy.headline, 110, 970, 650, 57, 65, f, textOn(r.ink), 3);
  wrapText(ctx, copy.body, 855, 965, 605, 29, 43, f, textOn(r.ink), 4);
  wrapText(ctx, copy.action + ' →', 855, 1200, 605, 27, 34, f, textOn(r.ink), 1);
  return c;
}
