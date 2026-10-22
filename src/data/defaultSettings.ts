import type { BatchSettings, EnabledTools, FitMode } from '../types/batch';

export const DEFAULT_SETTINGS: BatchSettings = {
  resize: {
    unit: 'px',
    width: '1600',
    height: '1600',
    percent: '50',
    lockAspect: true,
    fit: 'pad',
    padColor: '#FFFFFF',
    allowUpscale: false,
    backgroundMode: 'original'
  },
  compress: { quality: 82, stripMetadata: true, targetKB: '', allowTargetResize: false },
  convert: { format: 'webp', background: '#FFFFFF', progressive: true, pngLevel: 'balanced', webpLossless: false },
  rename: { pattern: 'product-{n}', prefix: '', suffix: '', start: '1', padding: 3, lowercase: true, hyphenate: true }
};

export const DEFAULT_ENABLED: EnabledTools = { resize: true, compress: false, convert: false, rename: false };

export interface ResizePreset {
  id: string;
  label: string;
  hint: string;
  width: string;
  height: string;
  lockAspect: boolean;
  fit: FitMode;
}

export const RESIZE_PRESETS: ResizePreset[] = [
{ id: 'square-1080', label: 'Square 1080', hint: 'Social posts', width: '1080', height: '1080', lockAspect: false, fit: 'pad' },
{ id: 'product-2000', label: 'Product 2000', hint: 'Marketplaces', width: '2000', height: '2000', lockAspect: false, fit: 'pad' },
{ id: 'web-1920', label: 'Web 1920', hint: 'Max width', width: '1920', height: '', lockAspect: true, fit: 'pad' },
{ id: 'thumb-400', label: 'Thumbnail 400', hint: 'Cropped', width: '400', height: '400', lockAspect: false, fit: 'cover' }];


export const QUALITY_PRESETS = [
{ label: 'Smaller', value: 60 },
{ label: 'Balanced', value: 75 },
{ label: 'High', value: 85 },
{ label: 'Maximum', value: 95 }];
