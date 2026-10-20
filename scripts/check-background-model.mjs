import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
env.cacheDir = new URL('../.cache/models/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const modelId = 'studioludens/birefnet-lite-512';
console.log('Loading background model');
const model = await AutoModel.from_pretrained(modelId, { dtype: 'fp32', device: 'cpu' });
const processor = await AutoProcessor.from_pretrained(modelId);
await mkdir('artifacts/background-proof', { recursive: true });
for (const [label, file] of [
  ['bottle', 'cac62e28-3a1b-4ca0-b65f-50afb11e22c7.jpg'],
  ['sneaker', '0f8e9c78-f8ec-47d6-858a-6c19973b8dfd.jpg'],
]) {
  const image = await RawImage.read(`public/${file}`);
  const { pixel_values } = await processor(image);
  const started = Date.now();
  const result = await model({ input_image: pixel_values });
  const logits = result.logits ?? Object.values(result)[0];
  const mask = (await RawImage.fromTensor(logits.sigmoid().mul(255).to('uint8').squeeze(0)).resize(image.width, image.height)).grayscale();
  console.log('mask', logits.dims, mask.channels, Math.min(...mask.data.slice(0, 1000)), mask.data[0], mask.data[Math.floor(mask.data.length / 2)]);
  image.rgba();
  for (let i = 0; i < mask.data.length; i++) image.data[i * 4 + 3] = mask.data[i];
  await image.save(`artifacts/background-proof/${label}-transparent.png`);
  await sharp(`artifacts/background-proof/${label}-transparent.png`).flatten({ background: '#b9cbdc' }).toFile(`artifacts/background-proof/${label}-color.png`);
  console.log(label, { milliseconds: Date.now() - started, width: image.width, height: image.height });
}
await model.dispose();
