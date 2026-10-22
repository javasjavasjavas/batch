import type { BatchSettings, EnabledTools, FitMode, OutputFormat, ToolId } from '../types/batch';
import { getExtension, normalizeExtension, stripExtension } from './format';

export const TOOL_ORDER: ToolId[] = ['resize', 'compress', 'convert', 'rename'];

export const TOOL_LABEL: Record<ToolId, string> = {
  resize: 'Resize',
  compress: 'Compress',
  convert: 'Convert',
  rename: 'Rename'
};

export const FORMAT_LABEL: Record<OutputFormat, string> = { jpg: 'JPG', png: 'PNG', webp: 'WebP' };
export const FIT_LABEL: Record<FitMode, string> = { cover: 'Crop to fill', pad: 'Pad to fit' };
const backgroundLabel = (s: BatchSettings) => ({
  original: 'Keep original', extend: 'Extend gradient', transparent: 'Remove background · transparent', color: `Replace background · ${s.resize.padColor}`
 }[s.resize.backgroundMode || 'original']);

export interface Dimensions {
  width: number;
  height: number;
}

export interface SettingRow {
  label: string;
  value: string;
}

export function parsePositiveInt(value: string): number | null {
  const v = value.trim();
  if (!/^\d+$/.test(v)) return null;
  const n = Number(v);
  return n > 0 ? n : null;
}

/** Planned output dimensions. Returns null when the original size is unknown or settings are incomplete. */
export function plannedDimensions(
width: number | null,
height: number | null,
settings: BatchSettings,
enabled: EnabledTools)
: Dimensions | null {
  if (!width || !height) return null;
  if (!enabled.resize) return { width, height };
  const r = settings.resize;
  if (r.unit === 'percent') {
    const p = parsePositiveInt(r.percent);
    if (!p) return null;
    const scale = r.allowUpscale ? p / 100 : Math.min(1, p / 100);
    return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
  }
  const w = parsePositiveInt(r.width);
  const h = parsePositiveInt(r.height);
  if (r.lockAspect) {
    if (!w && !h) return null;
    let scale = Math.min(w ? w / width : Infinity, h ? h / height : Infinity);
    if (!r.allowUpscale) scale = Math.min(scale, 1);
    return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
  }
  if (!w || !h) return null;
  return { width: w, height: h };
}

export function outputExtension(name: string, settings: BatchSettings, enabled: EnabledTools): string {
  if (enabled.convert) return settings.convert.format;
  return normalizeExtension(getExtension(name)) || 'jpg';
}

export function localDateStamp(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function plannedName(name: string, index: number, settings: BatchSettings, enabled: EnabledTools, date = localDateStamp(), inputFormat?: string): string {
  const ext = enabled.convert ? settings.convert.format : inputFormat || outputExtension(name, settings, enabled);
  if (!enabled.rename) return `${safeBase(stripExtension(name))}.${ext}`;
  const r = settings.rename;
  const start = /^\d+$/.test(r.start.trim()) ? Number(r.start) : 1;
  const num = String(start + index).padStart(r.padding, '0');
  let base = (r.pattern || '{name}').
  replace(/\{name\}/g, stripExtension(name)).
  replace(/\{n\}/g, num).
  replace(/\{date\}/g, date);
  base = `${r.prefix}${base}${r.suffix}`;
  if (r.hyphenate) base = base.trim().replace(/\s+/g, '-');
  if (r.lowercase) base = base.toLowerCase();
  return `${safeBase(base)}.${ext}`;
}

function safeBase(value: string): string {
  return value.split('').filter((character) => character.charCodeAt(0) >= 32).join('').replace(/[\\/:*?"<>|]/g, '-').replace(/\.+$/g, '').trim().slice(0, 180) || 'image';
}

export function uniqueNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let candidate = name, n = 2;
    while (used.has(candidate.toLowerCase())) candidate = `${base}-${n++}${ext}`;
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

export function toolSummary(tool: ToolId, s: BatchSettings): string {
  switch (tool) {
    case 'resize':{
        const r = s.resize;
        const background = r.backgroundMode && r.backgroundMode !== 'original' ? ` · ${backgroundLabel(s)}` : '';
        if (r.unit === 'percent') return `${r.percent || '–'}% of original${background}`;
        const w = r.width || 'auto';
        const h = r.height || 'auto';
        return (r.lockAspect ? `Fit within ${w} × ${h}` : `${w} × ${h}, ${FIT_LABEL[r.fit].toLowerCase()}`) + background;
      }
    case 'compress':
      return s.compress.targetKB ? `≤ ${s.compress.targetKB} KB` : `Quality ${s.compress.quality}`;
    case 'convert':
      return `${FORMAT_LABEL[s.convert.format]}${
      s.convert.format === 'webp' && s.convert.webpLossless ? ' lossless' : ''}`;

    case 'rename':
      return `${s.rename.prefix}${s.rename.pattern || '—'}${s.rename.suffix}`;
  }
}

const capitalize = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

export function settingRows(tool: ToolId, s: BatchSettings): SettingRow[] {
  switch (tool) {
    case 'resize':{
        const r = s.resize;
        if (r.unit === 'percent') {
          return [
          { label: 'Scale', value: `${r.percent || '—'}% of original` },
          { label: 'Background', value: backgroundLabel(s) },
          { label: 'Enlarge smaller images', value: r.allowUpscale ? 'Yes' : 'No' }];

        }
        const rows: SettingRow[] = [
        { label: 'Width', value: r.width ? `${r.width} px` : 'Auto' },
        { label: 'Height', value: r.height ? `${r.height} px` : 'Auto' },
        { label: 'Background', value: backgroundLabel(s) },
        { label: 'Proportions', value: r.lockAspect ? 'Kept, fit within box' : 'Exact size' }];

        if (!r.lockAspect) {
          rows.push({ label: 'Fit', value: FIT_LABEL[r.fit] });
          if (r.fit === 'pad' && r.backgroundMode === 'original') rows.push({ label: 'Padding color', value: r.padColor.toUpperCase() });
        } else {
          rows.push({ label: 'Enlarge smaller images', value: r.allowUpscale ? 'Yes' : 'No' });
        }
        return rows;
      }
    case 'compress':
      return [
      { label: 'Quality', value: String(s.compress.quality) },
      ...(s.compress.targetKB ? [{ label: 'Maximum size per image (KB)', value: s.compress.targetKB }, { label: 'Allow smaller dimensions', value: s.compress.allowTargetResize ? 'Yes' : 'No' }] : []),
      { label: 'Metadata', value: s.compress.stripMetadata ? 'Removed' : 'Kept' }];

    case 'convert':{
        const c = s.convert;
        const rows: SettingRow[] = [{ label: 'Format', value: FORMAT_LABEL[c.format] }];
        if (c.format === 'jpg') {
          rows.push({ label: 'Transparent areas', value: `Filled with ${c.background.toUpperCase()}` });
          rows.push({ label: 'Progressive', value: c.progressive ? 'On' : 'Off' });
        }
        if (c.format === 'png') rows.push({ label: 'Compression effort', value: capitalize(c.pngLevel) });
        if (c.format === 'webp') rows.push({ label: 'Encoding', value: c.webpLossless ? 'Lossless' : 'Lossy' });
        return rows;
      }
    case 'rename':{
        const r = s.rename;
        const cleanup = [r.lowercase && 'lowercase', r.hyphenate && 'spaces to hyphens'].filter(Boolean).join(', ');
        return [
        { label: 'Pattern', value: r.pattern || '—' },
        { label: 'Prefix', value: r.prefix || 'None' },
        { label: 'Suffix', value: r.suffix || 'None' },
        { label: 'Numbering', value: `From ${r.start || '—'}, ${r.padding} digits` },
        { label: 'Clean-up', value: cleanup ? capitalize(cleanup) : 'None' }];

      }
  }
}
