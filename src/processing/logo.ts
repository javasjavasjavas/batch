/** Flat-color matting keeps small lettering and enclosed counters intact. */
export function hasTransparency(data: ImageData) {
  for (let i = 3; i < data.data.length; i += 4) if (data.data[i] < 250) return true;
  return false;
}

export function removeSolidLogoBackground(input: ImageData): ImageData | null {
  const { width, height, data } = input;
  const border: number[][] = [];
  const sample = (x: number, y: number) => { const i = (y * width + x) * 4; border.push([data[i], data[i + 1], data[i + 2]]); };
  const step = Math.max(1, Math.floor(Math.max(width, height) / 128));
  for (let x = 0; x < width; x += step) { sample(x, 0); sample(x, height - 1); }
  for (let y = 0; y < height; y += step) { sample(0, y); sample(width - 1, y); }
  const bg = [0, 1, 2].map((channel) => border.map((pixel) => pixel[channel]).sort((a, b) => a - b)[Math.floor(border.length / 2)]);
  // A textured border needs segmentation rather than a color key.
  if (border.filter((pixel) => pixel.every((v, c) => Math.abs(v - bg[c]) < 28)).length / border.length < 0.9) return null;
  const result = new ImageData(width, height);
  for (let i = 0; i < data.length; i += 4) {
    const distance = Math.max(...bg.map((v, c) => Math.abs(data[i + c] - v)));
    const alpha = Math.max(0, Math.min(1, (distance - 8) / 32));
    for (let c = 0; c < 3; c++) result.data[i + c] = alpha ? (data[i + c] - bg[c] * (1 - alpha)) / alpha : 0;
    result.data[i + 3] = Math.round(data[i + 3] * alpha);
  }
  return result;
}

export async function cleanLogo(input: ImageData, report: (message: string) => void) {
  if (hasTransparency(input)) return { data: input, removed: false };
  report('Removing the logo background…');
  await new Promise((resolve) => setTimeout(resolve, 0));
  let result = removeSolidLogoBackground(input);
  if (!result) {
    const { removeBackground } = await import('./background');
    result = await removeBackground(input, report);
  }
  let visible = 0, clear = 0;
  for (let i = 3; i < result.data.length; i += 4) { if (result.data[i] > 128) visible++; if (result.data[i] < 32) clear++; }
  const pixels = input.width * input.height;
  if (visible < Math.max(4, pixels * 0.0005) || clear < pixels * 0.005) throw new Error('Could not separate this logo from its background. Try a logo with a clearer, contrasting background.');
  return { data: result, removed: true };
}
