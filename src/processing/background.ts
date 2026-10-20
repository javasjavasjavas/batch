import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';

const MODEL = 'studioludens/birefnet-lite-512';
env.allowLocalModels = false;
// One thread also works without cross-origin isolation. Everything runs locally.
if (env.backends.onnx.wasm) env.backends.onnx.wasm.numThreads = 1;
let loaded: Promise<{ model: Awaited<ReturnType<typeof AutoModel.from_pretrained>>; processor: Awaited<ReturnType<typeof AutoProcessor.from_pretrained>> }> | undefined;

export async function removeBackground(data: ImageData, report: (message: string) => void): Promise<ImageData> {
  if (!loaded) {
    report('Loading background model (183 MB download on first use)…');
    loaded = Promise.all([
      AutoModel.from_pretrained(MODEL, { dtype: 'fp32', device: 'wasm',
        progress_callback: (event: { status: string; progress?: number; file?: string }) => {
          if (!event.file?.endsWith('.onnx')) return;
          if (event.status === 'progress' && event.progress !== undefined) report(`Loading background model: ${Math.round(event.progress)}%`);
          if (event.status === 'done') report('Preparing the background model…');
        }
      }),
      AutoProcessor.from_pretrained(MODEL)
    ]).then(([model, processor]) => ({ model, processor })).catch((error) => { loaded = undefined; throw error; });
  }
  const { model, processor } = await loaded;
  report('Removing background on your device…');
  const image = new RawImage(new Uint8ClampedArray(data.data), data.width, data.height, 4);
  const { pixel_values } = await processor(image);
  const outputs = await model({ input_image: pixel_values });
  const logits = outputs.logits ?? Object.values(outputs)[0];
  if (!logits) throw new Error('The background model did not return a mask.');
  const mask = (await RawImage.fromTensor(logits.sigmoid().mul(255).to('uint8').squeeze(0)).resize(data.width, data.height)).grayscale();
  const result = new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
  for (let i = 0; i < mask.data.length; i++) result.data[i * 4 + 3] = Math.round(result.data[i * 4 + 3] * mask.data[i] / 255);
  return result;
}
