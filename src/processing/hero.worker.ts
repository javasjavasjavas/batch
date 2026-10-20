import * as ort from 'onnxruntime-web/wasm';
import wasmUrl from '../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm?url';
import wasmModuleUrl from '../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs?url';
import { createHeroMask, type HeroRegion } from './heroRegions';

const MODEL_URL = 'https://huggingface.co/sapienkit/LaMa-ONNX/resolve/0153b00d76c01058d825296ee162b46ff75ce05d/lama_fp32.onnx';
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = { wasm: wasmUrl, mjs: wasmModuleUrl };
ort.env.logLevel = 'error';
const report = (message: string) => self.postMessage({ message });
self.onmessage = async (event: MessageEvent<{ pixels: Uint8ClampedArray; regions: HeroRegion[] }>) => {
  let session: ort.InferenceSession | undefined;
  try {
    report('Loading the image repair model (first use downloads the model)…');
    const cache = await caches.open('batch-hero-model-v1').catch(() => undefined);
    let response = await cache?.match(MODEL_URL);
    if (!response) {
      response = await fetch(MODEL_URL, { credentials: 'omit' });
      if (!response.ok) throw new Error('Could not download the image repair model. Check your connection and retry.');
      if (cache) await cache.put(MODEL_URL, response.clone()).catch(() => undefined);
    }
    const model = await response.arrayBuffer();
    report('Preparing image repair…');
    session = await ort.InferenceSession.create(model, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
    const n = 512 * 512, rgb = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) rgb[c * n + i] = event.data.pixels[i * 4 + c] / 255;
    const mask = createHeroMask(event.data.regions, 512, 512);
    report('Rebuilding the selected area on your device…');
    const output = await session.run({ image: new ort.Tensor('float32', rgb, [1, 3, 512, 512]), mask: new ort.Tensor('float32', mask, [1, 1, 512, 512]) });
    const values = output[session.outputNames[0]].data as Float32Array;
    if (values.length !== n * 3) throw new Error('Unexpected image repair output.');
    const pixels = new Uint8ClampedArray(n * 4);
    for (let i = 0; i < n; i++) { for (let c = 0; c < 3; c++) pixels[i * 4 + c] = values[c * n + i]; pixels[i * 4 + 3] = 255; }
    self.postMessage({ pixels });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'Image repair failed. Try a smaller selection or upload text-free artwork.' });
  } finally { await session?.release(); }
};
