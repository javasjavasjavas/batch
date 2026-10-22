import type { BatchSettings, EnabledTools, SettingsIssue, ToolId } from '../types/batch';
import { TOOL_ORDER } from './planning';

const HEX = /^#[0-9a-f]{6}$/i;
const isWhole = (v: string) => /^\d+$/.test(v.trim());

export function isHexColor(value: string): boolean {
  return HEX.test(value);
}

export function validateBatch(settings: BatchSettings, enabled: EnabledTools, imageCount: number): SettingsIssue[] {
  const issues: SettingsIssue[] = [];
  const add = (issue: SettingsIssue) => issues.push(issue);

  if (imageCount === 0) {
    add({ id: 'batch-empty', tool: 'batch', level: 'error', message: 'Add at least one image to the batch.' });
  }
  if (!TOOL_ORDER.some((t) => enabled[t])) {
    add({ id: 'batch-tools', tool: 'batch', level: 'error', message: 'Turn on at least one tool so there’s something to plan.' });
  }

  if (enabled.resize) {
    const r = settings.resize;
    if (r.backgroundMode === 'transparent' && (!enabled.convert || settings.convert.format === 'jpg')) {
      add({ id: 'resize-alpha', tool: 'resize', level: 'error', message: 'Transparent output needs Convert enabled with PNG or WebP. JPG cannot keep transparency.' });
    }
    if (r.backgroundMode === 'extend' && (r.unit !== 'px' || r.lockAspect || r.fit !== 'pad')) {
      add({ id: 'resize-extend', tool: 'resize', level: 'error', message: 'Extend gradient needs exact width and height, with Pad to fit selected.' });
    }
    if (r.backgroundMode === 'color' && !HEX.test(r.padColor)) {
      add({ id: 'resize-background', tool: 'resize', field: 'padColor', level: 'error', message: 'Use a six-digit hex color, like #FFFFFF.' });
    }
    if (r.unit === 'percent') {
      const n = Number(r.percent);
      if (!isWhole(r.percent) || n < 1 || n > 400) {
        add({ id: 'resize-percent', tool: 'resize', field: 'percent', level: 'error', message: 'Enter a whole percentage from 1 to 400.' });
      } else if (n > 100) {
        add({ id: 'resize-upscale', tool: 'resize', level: 'warning', message: 'Scaling above 100% enlarges every image and can make details look soft.' });
      }
    } else {
      (['width', 'height'] as const).forEach((f) => {
        const v = r[f].trim();
        if (v && (!isWhole(v) || Number(v) < 1 || Number(v) > 10000)) {
          add({
            id: `resize-${f}`,
            tool: 'resize',
            field: f,
            level: 'error',
            message: `${f === 'width' ? 'Width' : 'Height'} must be a whole number from 1 to 10,000.`
          });
        }
      });
      if (r.lockAspect && !r.width.trim() && !r.height.trim()) {
        add({ id: 'resize-box', tool: 'resize', field: 'width', level: 'error', message: 'Enter a width, a height, or both.' });
      }
      if (!r.lockAspect) {
        if (!r.width.trim()) add({ id: 'resize-width-required', tool: 'resize', field: 'width', level: 'error', message: 'Width is required for an exact size.' });
        if (!r.height.trim()) add({ id: 'resize-height-required', tool: 'resize', field: 'height', level: 'error', message: 'Height is required for an exact size.' });
        if (r.fit === 'pad' && r.backgroundMode === 'original' && !HEX.test(r.padColor)) {
          add({ id: 'resize-pad', tool: 'resize', field: 'padColor', level: 'error', message: 'Use a six-digit hex color, like #FFFFFF.' });
        }
      }
    }
  }

  if (enabled.compress) {
    const target = settings.compress.targetKB?.trim();
    if (target && (!/^\d+$/.test(target) || Number(target) < 1 || Number(target) > 40000)) {
      add({ id: 'compress-target', tool: 'compress', field: 'targetKB', level: 'error', message: 'Enter a maximum size from 1 to 40,000 KB, or leave it empty.' });
    }
    if (!settings.compress.stripMetadata) {
      add({ id: 'metadata-preserve', tool: 'compress', level: 'error', message: 'Metadata preservation is available for Rename only. Turn on Remove metadata to re-encode images.' });
    }
    if (settings.compress.quality < 40 && !(enabled.convert && (settings.convert.format === 'png' || settings.convert.format === 'webp' && settings.convert.webpLossless))) {
      add({ id: 'compress-low', tool: 'compress', level: 'warning', message: 'Quality below 40 often shows visible blocks and banding.' });
    }
    if (enabled.convert && settings.convert.format === 'png') {
      add({ id: 'compress-png', tool: 'compress', level: 'warning', message: 'PNG output is lossless, so the quality setting won’t change these files.' });
    }
    if (enabled.convert && settings.convert.format === 'webp' && settings.convert.webpLossless) {
      add({ id: 'compress-webp-lossless', tool: 'compress', level: 'warning', message: 'WebP lossless keeps every pixel. Quality is ignored; turn off Lossless for adjustable compression.' });
    }
  }

  if (enabled.convert && settings.convert.format === 'jpg' && !HEX.test(settings.convert.background)) {
    add({ id: 'convert-bg', tool: 'convert', field: 'background', level: 'error', message: 'Use a six-digit hex color, like #FFFFFF.' });
  }

  if (enabled.rename) {
    const r = settings.rename;
    if (!r.pattern.trim()) {
      add({ id: 'rename-empty', tool: 'rename', field: 'pattern', level: 'error', message: 'Enter a naming pattern, such as product-{n}.' });
    } else if (imageCount > 1 && !r.pattern.includes('{n}') && !r.pattern.includes('{name}')) {
      add({ id: 'rename-unique', tool: 'rename', field: 'pattern', level: 'error', message: 'Add {n} or {name} so every file gets a unique name.' });
    }
    if (!isWhole(r.start) || Number(r.start) > 999999) {
      add({ id: 'rename-start', tool: 'rename', field: 'start', level: 'error', message: 'Start with a whole number, 0 or higher.' });
    }
  }

  return issues;
}

export function fieldError(issues: SettingsIssue[], tool: ToolId, field: string): string | undefined {
  return issues.find((i) => i.tool === tool && i.field === field && i.level === 'error')?.message;
}
