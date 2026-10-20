import { processFile } from './codec';
import type { BatchSettings, EnabledTools } from '../types/batch';
import type { InputFormat } from './formats';

self.onmessage = async (event: MessageEvent<{id: string; file: File; input: InputFormat; animated: boolean; settings: BatchSettings; enabled: EnabledTools}>) => {
  const { id, file, input, animated, settings, enabled } = event.data;
  try {
    const result = await processFile(file, input, animated, settings, enabled, (message) => self.postMessage({ id, message }));
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) });
  }
};
