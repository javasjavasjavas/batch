import { removeBackground } from './background';

self.onmessage = async (event: MessageEvent<{ pixels: Uint8ClampedArray; width: number; height: number }>) => {
  try {
    const { pixels, width, height } = event.data;
    const result = await removeBackground(new ImageData(new Uint8ClampedArray(pixels), width, height), (message) => self.postMessage({ message }));
    self.postMessage({ pixels: result.data, width: result.width, height: result.height });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'Could not remove the logo background.' });
  }
};
