import sharp from 'sharp';
import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const [directory, mode, suffix = ''] = process.argv.slice(2);
if (!directory || !['transparent', 'gradient', 'color'].includes(mode)) throw new Error('Usage: node scripts/inspect-background-outputs.mjs <downloads> <mode> [suffix]');
await mkdir('artifacts/background-proof', { recursive: true });
for (const [name, stem] of [['bottle', 'cac62e28-3a1b-4ca0-b65f-50afb11e22c7'], ['sneaker', '0f8e9c78-f8ec-47d6-858a-6c19973b8dfd']]) {
  const path = join(directory, `${stem}${suffix}.png`);
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0, opaque = 0, solid = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) transparent++;
    if (data[i] === 255) opaque++;
    if (data[i] >= 250) solid++;
  }
  if (mode === 'transparent' && (transparent < info.width * info.height * 0.2 || solid < 1000)) throw new Error(`${name}: incomplete alpha output`);
  if (mode !== 'transparent' && transparent !== 0) throw new Error(`${name}: unexpected transparency`);
  if (mode === 'color' && [...data.slice(0, 3)].join() !== '185,203,220') throw new Error(`${name}: wrong background color`);
  if (mode === 'gradient') {
    const original = await sharp(`public/${stem}.jpg`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const dx = (info.width - original.info.width) / 2, dy = (info.height - original.info.height) / 2;
    let maxPixelDifference = 0;
    for (let y = 0; y < original.info.height; y++) for (let x = 0; x < original.info.width; x++) for (let c = 0; c < 3; c++) {
      maxPixelDifference = Math.max(maxPixelDifference, Math.abs(data[((y + dy) * info.width + x + dx) * 4 + c] - original.data[(y * original.info.width + x) * 4 + c]));
    }
    if (maxPixelDifference > 3) throw new Error(`${name}: original image changed (${maxPixelDifference})`);
    console.log(name, { maxPixelDifference });
  }
  await copyFile(path, `artifacts/background-proof/${name}-${mode}-browser.png`);
  console.log(name, { mode, width: info.width, height: info.height, transparent, opaque, solid, corner: [...data.slice(0, 4)] });
}
