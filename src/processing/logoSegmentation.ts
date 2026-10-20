/** Keep model inference off the UI thread so preview and progress stay responsive. */
export function segmentLogo(input: ImageData, report: (message: string) => void): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./logo.worker.ts', import.meta.url), { type: 'module' });
    const stop = () => { clearTimeout(timeout); worker.terminate(); };
    const timeout = setTimeout(() => { stop(); reject(new Error('Background removal took too long. Try a smaller logo or a simpler background.')); }, 180_000);
    worker.onmessage = (event) => {
      if (event.data.message) report(event.data.message);
      else if (event.data.error) { stop(); reject(new Error(event.data.error)); }
      else if (event.data.pixels) {
        stop(); resolve(new ImageData(event.data.pixels, event.data.width, event.data.height));
      }
    };
    worker.onerror = () => { stop(); reject(new Error('Could not load background removal. Check your connection and try again.')); };
    worker.postMessage({ pixels: input.data, width: input.width, height: input.height });
  });
}
