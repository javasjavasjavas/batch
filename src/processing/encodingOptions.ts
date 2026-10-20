import type { BatchSettings, EnabledTools } from '../types/batch';

export function encodingOptions(settings: BatchSettings, enabled: EnabledTools) {
  const quality = enabled.compress ? settings.compress.quality : 82;
  const progressive = enabled.convert ? settings.convert.progressive : true;
  const lossless = enabled.convert && settings.convert.webpLossless;
  return {
    jpeg: { quality, progressive, baseline: !progressive },
    webp: { quality: lossless ? 100 : quality, lossless: lossless ? 1 : 0, near_lossless: 100, method: 4 }
  };
}
