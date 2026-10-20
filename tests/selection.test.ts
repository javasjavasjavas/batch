import { describe, expect, it } from 'vitest';
import { SAMPLE_IMAGES } from '../src/data/sampleImages';
import { DEFAULT_SETTINGS } from '../src/data/defaultSettings';
import { createRun, imagesForReview } from '../src/utils/runPlan';
import { validateBatch } from '../src/utils/validation';

const enabled = { resize: false, compress: false, convert: false, rename: true };

describe('selected image review', () => {
  it('processes only the reviewed images in batch order with contiguous names', () => {
    const selected = imagesForReview(SAMPLE_IMAGES, [SAMPLE_IMAGES[6].id, SAMPLE_IMAGES[1].id]);
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.rename.pattern = 'product-{n}';
    settings.rename.start = '1';
    settings.rename.padding = 3;
    const run = createRun(selected, settings, enabled);
    expect(run.items.map((item) => item.imageId)).toEqual([SAMPLE_IMAGES[1].id, SAMPLE_IMAGES[6].id]);
    expect(run.items.map((item) => item.outputName)).toEqual(['product-001.jpg', 'product-002.jpg']);
    expect(SAMPLE_IMAGES).toHaveLength(8);
  });

  it('never falls back to the full batch for an empty or removed selection', () => {
    for (const ids of [[], ['removed-image']]) {
      const selected = imagesForReview(SAMPLE_IMAGES, ids);
      expect(selected).toEqual([]);
      expect(validateBatch(DEFAULT_SETTINGS, enabled, selected.length).some((issue) => issue.id === 'batch-empty')).toBe(true);
    }
    expect(imagesForReview(SAMPLE_IMAGES, null)).toHaveLength(8);
  });

  it('validates naming against the selected count instead of the entire batch', () => {
    const settings = structuredClone(DEFAULT_SETTINGS);
    settings.rename.pattern = 'hero';
    const selected = imagesForReview(SAMPLE_IMAGES, [SAMPLE_IMAGES[0].id]);
    expect(validateBatch(settings, enabled, selected.length).filter((issue) => issue.level === 'error')).toEqual([]);
    expect(validateBatch(settings, enabled, SAMPLE_IMAGES.length).some((issue) => issue.id === 'rename-unique')).toBe(true);
    expect(createRun(selected, settings, enabled).items).toHaveLength(1);
  });
});
