export type Point = readonly [number, number];
export type Quad = readonly [Point, Point, Point, Point];
export type PhotoKind = 'cards' | 'mug' | 'tote' | 'notebook';
export const PHOTO_SIZE = { width: 1536, height: 1024 };
export const PHOTO_SURFACES = {
  cardFront: [[307, 383], [1017, 555], [901, 924], [154, 722]],
  cardBack: [[695, 114], [1357, 268], [1268, 573], [564, 392]],
  notebook: [[468, 151], [985, 87], [1137, 823], [550, 904]],
  tote: [[580, 470], [952, 470], [965, 814], [570, 814]],
} as const satisfies Record<string, Quad>;

/** Project a unit square onto four measured corners of a photographed surface. */
export function homography(q: Quad): number[] {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(det) < 1e-8) throw new Error('Invalid mockup surface.');
  const g = (dx3 * dy2 - dx2 * dy3) / det, h = (dx1 * dy3 - dx3 * dy1) / det;
  return [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h, 1];
}
export function invert(m: number[]) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const out = [e*i-f*h, c*h-b*i, b*f-c*e, f*g-d*i, a*i-c*g, c*d-a*f, d*h-e*g, b*g-a*h, a*e-b*d];
  const det = a * out[0] + b * out[3] + c * out[6];
  if (Math.abs(det) < 1e-8) throw new Error('Invalid mockup surface.');
  return out.map(v => v / det);
}
export function project(m: number[], x: number, y: number): Point {
  const d = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / d, (m[3] * x + m[4] * y + m[5]) / d];
}
export const MUG = { center: 740, radius: 263, angle: 1.02, top: 355, height: 335, bow: 24 };
export function mugPoint(u: number, v: number): Point {
  const theta = (u - 0.5) * MUG.angle * 2;
  return [MUG.center + MUG.radius * Math.sin(theta), MUG.top + v * MUG.height + MUG.bow * Math.cos(theta)];
}
export function mugUV(x: number, y: number): Point {
  const theta = Math.asin((x - MUG.center) / MUG.radius);
  return [theta / (MUG.angle * 2) + 0.5, (y - MUG.top - MUG.bow * Math.cos(theta)) / MUG.height];
}

const bases = new Map<PhotoKind, Promise<HTMLImageElement>>();
export async function photoBase(kind: PhotoKind): Promise<HTMLCanvasElement> {
  if (!bases.has(kind)) {
    const image = new Image(); image.src = `/images/brand-mockups/${kind}-v1.webp`;
    bases.set(kind, image.decode().then(() => image).catch(() => { bases.delete(kind); throw new Error('Could not load the mockup photo. Check your connection and try again.'); }));
  }
  const image = await bases.get(kind);
  const c = document.createElement('canvas'); c.width = PHOTO_SIZE.width; c.height = PHOTO_SIZE.height;
  const ctx = c.getContext('2d'); if (!ctx || !image) throw new Error('Canvas processing is unavailable.');
  ctx.drawImage(image, 0, 0, c.width, c.height); return c;
}

/** Inverse-map the print, then multiply ink with the actual photo's lighting and material texture. */
function printPixels(photo: HTMLCanvasElement, art: HTMLCanvasElement, bounds: [number, number, number, number], uv: (x: number, y: number, light: number) => Point) {
  const ctx = photo.getContext('2d'), ac = art.getContext('2d'); if (!ctx || !ac) throw new Error('Canvas processing is unavailable.');
  const source = ac.getImageData(0, 0, art.width, art.height).data;
  const [left, top, right, bottom] = bounds.map(Math.round);
  const region = ctx.getImageData(left, top, right - left + 1, bottom - top + 1), output = region.data;
  const width = region.width;
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    const i = ((y - top) * width + x - left) * 4;
    const [u, v] = uv(x + 0.5, y + 0.5, (output[i] + output[i + 1] + output[i + 2]) / 765);
    if (!(u >= 0 && u <= 1 && v >= 0 && v <= 1)) continue;
    const sx = u * (art.width - 1), sy = v * (art.height - 1), ix = Math.floor(sx), iy = Math.floor(sy), fx = sx - ix, fy = sy - iy;
    const samples = [[ix, iy, (1-fx)*(1-fy)], [Math.min(ix+1, art.width-1), iy, fx*(1-fy)], [ix, Math.min(iy+1, art.height-1), (1-fx)*fy], [Math.min(ix+1, art.width-1), Math.min(iy+1, art.height-1), fx*fy]];
    let alpha = 0; const color = [0, 0, 0];
    for (const [px, py, weight] of samples) { const p = (py * art.width + px) * 4, a = source[p+3] / 255 * weight; alpha += a; for (let k = 0; k < 3; k++) color[k] += source[p+k] * a; }
    if (alpha < 0.001) continue;
    for (let k = 0; k < 3; k++) output[i+k] = output[i+k] * (1-alpha) + color[k] * output[i+k] / 255;
  }
  ctx.putImageData(region, left, top);
}
export function printPlane(photo: HTMLCanvasElement, art: HTMLCanvasElement, quad: Quad, fabric = false) {
  const inv = invert(homography(quad));
  const xs = quad.map(p => p[0]), ys = quad.map(p => p[1]);
  printPixels(photo, art, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], (x, y, light) => {
    const [u, v] = project(inv, x, y);
    return fabric ? [u + (light - 0.8) * 0.014, v + Math.sin(u * 9) * 0.003 + (light - 0.8) * 0.008] : [u, v];
  });
}
export function printMug(photo: HTMLCanvasElement, art: HTMLCanvasElement) {
  const [left] = mugPoint(0, 0), [right] = mugPoint(1, 0);
  printPixels(photo, art, [left, MUG.top, right, MUG.top + MUG.height + MUG.bow], mugUV);
}
