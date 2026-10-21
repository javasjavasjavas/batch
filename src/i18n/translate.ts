import messages from './es.json';
import type { Locale } from './paths';
const catalog: Record<string, string> = messages;
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const patterns = Object.entries(catalog).filter(([key]) => /\{\d+\}/.test(key)).sort(([a],[b]) => b.replace(/\{\d+\}/g, '').length - a.replace(/\{\d+\}/g, '').length).map(([key, value]) => ({
  regex: new RegExp('^' + key.split(/(\{\d+\})/).map(part => /^\{\d+\}$/.test(part) ? (/^\{0\} (?:images|files|file|image|results|issues|issue)$/.test(key) ? '(\\d+)' : '(.+?)') : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$'),
  value,
  preserveValues: /^(?:Rename batch,|Preset |Applied |Nothing found|No tools match|Open details|Select |Move |Planned name:|Original:|Processed:|Compare |Download |Rename |Delete |Remove )/.test(key),
}));
/** Translate display copy only. Identifiers, user inputs and processing settings stay unchanged. */
export function translate<T>(value: T, locale: Locale): T {
  if (locale === 'en') return value;
  if (Array.isArray(value)) return value.map(item => translate(item, locale)) as T;
  if (typeof value !== 'string') return value;
  const key = normalize(value);
  let translated = catalog[key];
  if (!translated) for (const pattern of patterns) {
    const match = key.match(pattern.regex);
    if (match) { translated = pattern.value.replace(/\{(\d+)\}/g, (_, index) => String(pattern.preserveValues ? match[Number(index) + 1] : translate(match[Number(index) + 1], locale))); break; }
  }
  return (translated ? value.replace(value.trim(), translated) : value) as T;
}
