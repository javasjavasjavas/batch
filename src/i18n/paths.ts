export type Locale = 'en' | 'es';
export const localeForPath = (path: string): Locale => /^\/es(?:\/|$)/.test(path) ? 'es' : 'en';
const slugs: Record<string, string> = {
  'bulk-image-resizer': 'redimensionar-imagenes', 'image-compressor': 'comprimir-imagenes',
  'image-converter': 'convertir-imagenes', 'bulk-file-renamer': 'renombrar-imagenes',
  'getting-started-with-a-batch': 'primeros-pasos', 'choosing-output-settings': 'elegir-ajustes-de-exportacion',
  'local-processing-and-browser-limits': 'procesamiento-local-y-limites',
  'resize-product-photos-without-cropping': 'redimensionar-fotos-de-productos-sin-recortar',
  'reduce-image-file-size': 'reducir-peso-de-imagenes', 'convert-webp-png-jpg': 'convertir-webp-png-jpg',
};
const sections: Record<string, string> = { tools: 'herramientas', help: 'guias', about: 'acerca-de', privacy: 'privacidad', terms: 'terminos' };
const reverse = (map: Record<string, string>, value: string) => Object.keys(map).find(key => map[key] === value) || value;
export function englishPath(path: string): string {
  if (localeForPath(path) === 'en') return path;
  const parts = path.replace(/^\/es(?=\/|$)/, '').split('/');
  parts[1] = reverse(sections, parts[1]);
  if (parts[1] === 'tools' || parts[1] === 'help') parts[2] = reverse(slugs, parts[2]);
  return parts.filter((part, i) => i === 0 || part !== undefined).join('/').replace(/\/$/, '') || '/';
}
export function localizedPath(url: string, locale: Locale): string {
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  const [, path, suffix = ''] = url.match(/^([^?#]*)(.*)$/)!;
  const base = englishPath(path).replace(/\/$/, '') || '/';
  if (locale === 'en') return base + suffix;
  const parts = base.split('/');
  if (parts[1] === 'tools' || parts[1] === 'help') parts[2] = slugs[parts[2]] || parts[2];
  parts[1] = sections[parts[1]] || parts[1];
  return '/es' + parts.filter((part, i) => i === 0 || part !== undefined).join('/') + suffix;
}
