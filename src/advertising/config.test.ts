import { describe, expect, it } from 'vitest';
import { isAdHost, isAdRoute, validAdUnit } from './config';

describe('AdSense delivery boundaries', () => {
  it('never serves paid inventory on development or deployment preview hosts', () => {
    for (const host of ['localhost', '127.0.0.1', 'batchimagekit.pages.dev', 'preview.batchimagekit.pages.dev', 'batchimagekit.com.example.org']) expect(isAdHost(host)).toBe(false);
    expect(isAdHost('batchimagekit.com')).toBe(true);
  });
  it('excludes review, processing, legal and error screens', () => {
    for (const path of ['/app/run', '/app/resize/run', '/app/review', '/app/convert/review', '/privacy', '/terms', '/404']) expect(isAdRoute(path)).toBe(false);
    for (const path of ['/', '/tools/bulk-image-resizer', '/tools/steam-assets', '/help/reduce-image-file-size', '/app', '/app/resize/results']) expect(isAdRoute(path)).toBe(true);
  });
  it('does not accept placeholder identifiers', () => {
    for (const id of ['', 'YOUR_SLOT_ID', '123', '1234567890x']) expect(validAdUnit(id)).toBe(false);
    expect(validAdUnit('1234567890')).toBe(true);
  });
});
