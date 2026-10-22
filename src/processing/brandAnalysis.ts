export interface BrandColor { hex: string; origin: 'image' | 'suggested' | 'custom' }
export interface BrandAnalysis { colors: BrandColor[]; fontId: string; reason: string; ratio: number; density: number; signature: number; removed: boolean }
export const BRAND_FONTS = [
  { id: 'space', name: 'Space Grotesk', file: 'SpaceGrotesk.ttf', license: 'spacegrotesk-OFL.txt', url: 'https://fonts.google.com/specimen/Space+Grotesk' },
  { id: 'mono', name: 'IBM Plex Mono', file: 'IBMPlexMono.ttf', license: 'ibmplexmono-OFL.txt', url: 'https://fonts.google.com/specimen/IBM+Plex+Mono' },
  { id: 'serif', name: 'DM Serif Display', file: 'DMSerifDisplay.ttf', license: 'dmserifdisplay-OFL.txt', url: 'https://fonts.google.com/specimen/DM+Serif+Display' },
  { id: 'rounded', name: 'Nunito Sans', file: 'NunitoSans.ttf', license: 'nunitosans-OFL.txt', url: 'https://fonts.google.com/specimen/Nunito+Sans' },
] as const;
export const brandFont = (id: string) => BRAND_FONTS.find(font => font.id === id) || BRAND_FONTS[0];
const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const hex = (values: number[]) => '#' + values.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const mixColor = (a: string, b: string, amount: number) => hex(rgb(a).map((v, i) => v * (1 - amount) + rgb(b)[i] * amount));
export function luminance(color: string) {
  const [r, g, b] = rgb(color).map(v => { const n = v / 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
export const contrast = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
export const textOn = (color: string) => contrast(color, '#111111') >= contrast(color, '#ffffff') ? '#111111' : '#ffffff';

/** Remove only a nearly uniform background connected to the perimeter. Interior white artwork stays intact. */
export function edgeBackground(input: Uint8ClampedArray, width: number, height: number): { data: Uint8ClampedArray<ArrayBuffer>; removed: boolean; background?: number[] } {
  const data = new Uint8ClampedArray(input), samples: number[][] = [];
  for (let x = 0; x < width; x++) for (const y of [0, height - 1]) { const i = (y * width + x) * 4; if (data[i + 3] > 245) samples.push([data[i], data[i + 1], data[i + 2]]); }
  for (let y = 1; y < height - 1; y++) for (const x of [0, width - 1]) { const i = (y * width + x) * 4; if (data[i + 3] > 245) samples.push([data[i], data[i + 1], data[i + 2]]); }
  if (samples.length < (width + height) * 1.6) return { data, removed: false };
  const bg = [0, 1, 2].map(c => samples.map(p => p[c]).sort((a, b) => a - b)[Math.floor(samples.length / 2)]);
  if (samples.filter(p => p.every((v, c) => Math.abs(v - bg[c]) < 24)).length / samples.length < 0.96) return { data, removed: false };
  const seen = new Uint8Array(width * height), queue = new Int32Array(width * height);
  let head = 0, tail = 0, cleared = 0;
  const visit = (p: number) => {
    if (seen[p]) return; seen[p] = 1;
    const i = p * 4;
    if (data[i + 3] < 16 || bg.every((v, c) => Math.abs(data[i + c] - v) < 38)) queue[tail++] = p;
  };
  for (let x = 0; x < width; x++) { visit(x); visit((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { visit(y * width); visit(y * width + width - 1); }
  while (head < tail) {
    const p = queue[head++], x = p % width, y = Math.floor(p / width);
    data[p * 4 + 3] = 0; cleared++;
    if (x) visit(p - 1); if (x < width - 1) visit(p + 1); if (y) visit(p - width); if (y < height - 1) visit(p + width);
  }
  // A blank image is not a logo: retain it so analysis can report a useful error.
  if (cleared > width * height * 0.998) return { data: new Uint8ClampedArray(input), removed: false };
  return { data, removed: cleared > width * height * 0.01, background: bg };
}
export function pixelBounds(data: Uint8ClampedArray, width: number, height: number) {
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] > 32) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  return right < 0 ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}
export function analyzeBrandPixels(data: Uint8ClampedArray, width: number, height: number): BrandAnalysis {
  const cleaned = edgeBackground(data, width, height), pixels = cleaned.data;
  const bounds = pixelBounds(pixels, width, height);
  if (!bounds) throw new Error('No visible logo found. Choose another image.');
  const bins = new Map<string, { n: number; sum: number[] }>();
  const interiors = new Map<string, { n: number; sum: number[] }>();
  let interiorCount = 0;
  let visible = 0, transitions = 0, signature = 2166136261;
  for (let y = bounds.y; y < bounds.y + bounds.height; y++) for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
    const i = (y * width + x) * 4;
    if (pixels[i + 3] < 200) continue;
    visible++;
    const p = [pixels[i], pixels[i + 1], pixels[i + 2]], key = p.map(v => Math.round(v / 24)).join(',');
    const bin = bins.get(key) || { n: 0, sum: [0, 0, 0] }; bin.n++; p.forEach((v, c) => bin.sum[c] += v); bins.set(key, bin);
    // Flat interior pixels represent ink colors more faithfully than antialiased edges.
    if (x > 0 && x < width - 1 && y > 0 && y < height - 1 && [-4, 4, -width * 4, width * 4].every(offset => pixels[i + offset + 3] >= 200 && p.every((v, c) => Math.abs(v - pixels[i + offset + c]) < 18))) {
      const stable = interiors.get(key) || { n: 0, sum: [0, 0, 0] }; stable.n++; p.forEach((v, c) => stable.sum[c] += v); interiors.set(key, stable); interiorCount++;
    }
    signature = Math.imul(signature ^ (p[0] + p[1] * 3 + p[2] * 7 + x + y * 11), 16777619) >>> 0;
    if (x < width - 1 && (pixels[i + 7] < 128 || Math.abs(pixels[i] - pixels[i + 4]) > 80)) transitions++;
  }
  if (!visible) throw new Error('No visible logo found. Choose another image.');
  const useInteriors = interiorCount > visible * 0.2;
  const ranked = [...(useInteriors ? interiors : bins).values()].sort((a, b) => b.n - a.n);
  const extracted: string[] = [];
  for (const bin of ranked) {
    if (bin.n < (useInteriors ? interiorCount : visible) * 0.025) continue;
    const color = hex(bin.sum.map(v => v / bin.n));
    if (extracted.every(other => Math.hypot(...rgb(other).map((v, i) => v - rgb(color)[i])) > 65)) extracted.push(color);
    if (extracted.length === 3) break;
  }
  const primary = extracted[0] || '#202020';
  const colors: BrandColor[] = extracted.map(color => ({ hex: color, origin: 'image' }));
  const add = (color: string) => { if (colors.every(c => Math.hypot(...rgb(c.hex).map((v, i) => v - rgb(color)[i])) > 35)) colors.push({ hex: color, origin: 'suggested' }); };
  if (colors.length < 4) add(mixColor(primary, luminance(primary) > 0.4 ? '#111111' : '#ffffff', 0.94));
  if (colors.length < 3) add(mixColor(primary, luminance(primary) > 0.4 ? '#111111' : '#ffffff', 0.52));
  const channels = rgb(primary), saturation = Math.max(...channels) - Math.min(...channels);
  if (colors.length < 4) {
    // Chromatic marks get a muted complementary color; monochrome marks get an image-derived restrained accent.
    const complement = saturation > 35 ? channels.map(v => 255 - v) : [0, 1, 2].map(i => 65 + ((signature >>> (i * 8)) & 127));
    add(mixColor(hex(complement), '#ffffff', 0.25));
  }
  if (colors.length < 4) add(mixColor(primary, '#ffffff', 0.75));
  for (const amount of [0.15, 0.3, 0.65, 0.85]) {
    if (colors.length >= 4) break;
    add(mixColor(primary, luminance(primary) > 0.4 ? '#000000' : '#ffffff', amount));
  }
  const ratio = bounds.width / bounds.height, density = visible / (bounds.width * bounds.height), edgeRate = transitions / visible;
  const monochrome = extracted.every(c => { const v = rgb(c); return Math.max(...v) - Math.min(...v) < 30; });
  const fontId = monochrome && (edgeRate > 0.06 || density > 0.38) ? 'mono' : density < 0.3 && ratio > 1.6 ? 'serif' : saturation > 70 && ratio < 1.8 ? 'rounded' : 'space';
  const reason = { mono: 'A structured monospace pairs with the compact, high-contrast shapes in this logo.', serif: 'An editorial serif balances the wide, airy proportions of this logo.', rounded: 'A soft sans serif complements this compact, colorful mark.', space: 'A geometric sans serif supports the proportions and clear shapes in this logo.' }[fontId];
  return { colors: colors.slice(0, 4), fontId, reason, ratio, density, signature, removed: cleaned.removed };
}
