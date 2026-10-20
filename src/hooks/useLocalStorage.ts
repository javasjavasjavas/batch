import { useEffect, useState } from 'react';
import { DEFAULT_ENABLED, DEFAULT_SETTINGS } from '../data/defaultSettings';
import type { BatchSettings, EnabledTools, Preset } from '../types/batch';

const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const bool = (value: unknown, fallback: boolean) => typeof value === 'boolean' ? value : fallback;
const str = (value: unknown, fallback: string) => typeof value === 'string' ? value.slice(0, 200) : fallback;
const choice = <T extends string>(value: unknown, choices: readonly T[], fallback: T): T => choices.includes(value as T) ? value as T : fallback;

function settingsValue(value: unknown): BatchSettings {
  const source = object(value), r = object(source.resize), c = object(source.compress), v = object(source.convert), n = object(source.rename);
  const d = DEFAULT_SETTINGS;
  return {
    resize: {
      unit: choice(r.unit, ['px', 'percent'], d.resize.unit), width: str(r.width, d.resize.width), height: str(r.height, d.resize.height),
      percent: str(r.percent, d.resize.percent), lockAspect: bool(r.lockAspect, d.resize.lockAspect),
      fit: choice(r.fit, ['cover', 'pad'], d.resize.fit), padColor: str(r.padColor, d.resize.padColor), allowUpscale: bool(r.allowUpscale, d.resize.allowUpscale),
      backgroundMode: choice(r.backgroundMode, ['original', 'extend', 'transparent', 'color'], d.resize.backgroundMode)
    },
    compress: { quality: typeof c.quality === 'number' && Number.isFinite(c.quality) && c.quality >= 1 && c.quality <= 100 ? c.quality : d.compress.quality, stripMetadata: bool(c.stripMetadata, d.compress.stripMetadata) },
    convert: { format: choice(v.format, ['jpg', 'png', 'webp'], d.convert.format), background: str(v.background, d.convert.background), progressive: bool(v.progressive, d.convert.progressive), pngLevel: choice(v.pngLevel, ['fast', 'balanced', 'smallest'], d.convert.pngLevel), webpLossless: bool(v.webpLossless, d.convert.webpLossless) },
    rename: { pattern: str(n.pattern, d.rename.pattern), prefix: str(n.prefix, d.rename.prefix), suffix: str(n.suffix, d.rename.suffix), start: str(n.start, d.rename.start), padding: typeof n.padding === 'number' && Number.isInteger(n.padding) && n.padding >= 1 && n.padding <= 10 ? n.padding : d.rename.padding, lowercase: bool(n.lowercase, d.rename.lowercase), hyphenate: bool(n.hyphenate, d.rename.hyphenate) }
  };
}

function enabledValue(value: unknown): EnabledTools {
  const v = object(value);
  return { resize: bool(v.resize, DEFAULT_ENABLED.resize), compress: bool(v.compress, DEFAULT_ENABLED.compress), convert: bool(v.convert, DEFAULT_ENABLED.convert), rename: bool(v.rename, DEFAULT_ENABLED.rename) };
}

function hydrate<T>(key: string, raw: unknown, initial: T): T {
  const envelope = object(raw);
  const data = envelope.version === 1 ? envelope.data : raw;
  if (key === 'batch.settings' || key.startsWith('batch.settings.')) return settingsValue(data) as T;
  if (key === 'batch.enabled') return enabledValue(data) as T;
  if (key === 'batch.presets') {
    const presets = Array.isArray(data) ? data.slice(0, 100) : [];
    return presets.filter((item) => typeof item?.id === 'string' && typeof item?.name === 'string').map((item): Preset => ({
      id: item.id.slice(0, 100), name: item.name.slice(0, 100), settings: settingsValue(item.settings), enabled: enabledValue(item.enabled),
      createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now()
    })) as T;
  }
  if (key === 'batch.prefs') {
    const v = object(data), d = object(initial);
    return { view: choice(v.view, ['grid', 'list'], d.view as 'grid' | 'list'), density: choice(v.density, ['comfortable', 'compact'], d.density as 'comfortable' | 'compact'), motion: choice(v.motion, ['system', 'reduce'], d.motion as 'system' | 'reduce') } as T;
  }
  if (key === 'batch.consent') {
    const v = object(data), d = object(initial);
    return { decided: bool(v.decided, d.decided as boolean), preferences: bool(v.preferences, d.preferences as boolean), measurement: bool(v.measurement, d.measurement as boolean), advertising: bool(v.advertising, d.advertising as boolean), updatedAt: typeof v.updatedAt === 'number' && Number.isFinite(v.updatedAt) ? v.updatedAt : null } as T;
  }
  return initial;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initial : hydrate(key, JSON.parse(raw), initial);
    } catch { return initial; }
  });

  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify({ version: 1, data: value })); }
    catch { /* Storage may be unavailable. Keep working in memory. */ }
  }, [key, value]);

  return [value, setValue] as const;
}
