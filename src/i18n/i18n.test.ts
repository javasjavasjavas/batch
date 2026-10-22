import { describe, expect, it } from 'vitest';
import { englishPath, localizedPath, localeForPath } from './paths';
import { translate } from './translate';
import { searchText } from './search';
import { SEO_PAGES, WORKSPACE_PATHS, metaForPath, structuredData } from '../data/seo';

describe('language navigation and indexation', () => {
  it('keeps English as the default without altering existing URLs', () => {
    expect(localeForPath('/')).toBe('en');
    expect(localeForPath('/tools/image-compressor')).toBe('en');
    expect(localeForPath('/es/')).toBe('es');
    expect(localizedPath('/es/', 'en')).toBe('/');
  });
  it('round-trips every public and workspace route', () => {
    for (const path of [...SEO_PAGES.map(p => p.path), ...WORKSPACE_PATHS]) {
      const en = localizedPath(path, 'en');
      expect(localizedPath(localizedPath(en, 'es'), 'en')).toBe(en);
      expect(englishPath(localizedPath(en, 'es'))).toBe(en);
    }
  });
  it('retains queries and anchors and leaves external links alone', () => {
    expect(localizedPath('/help/choosing-output-settings?from=tool#quality','es')).toBe('/es/guias/elegir-ajustes-de-exportacion?from=tool#quality');
    expect(localizedPath('https://example.com/a', 'es')).toBe('https://example.com/a');
    expect(localizedPath('#quality','es')).toBe('#quality');
    expect(localizedPath('//example.com', 'es')).toBe('//example.com');
  });
  it('publishes independent, reciprocal canonicals and alternates', () => {
    for (const page of SEO_PAGES) {
      const meta = metaForPath(page.path);
      expect(meta.canonical).toBe('https://batchimagekit.com' + page.path);
      expect(meta.alternates?.['x-default']).toBe(meta.alternates?.en);
      const other = metaForPath(localizedPath(page.path, meta.locale === 'en' ? 'es' : 'en'));
      expect(other.alternates).toEqual(meta.alternates);
      expect(other.title).not.toBe(meta.title);
      expect(other.description).not.toBe(meta.description);
    }
    expect(metaForPath('/es/app/resize/run').robots).toBe('noindex,follow');
    expect(metaForPath('/es/no-existe').canonical).toBeUndefined();
  });
  it('lists each tool exactly once in each localized directory schema', () => {
    for(const path of ['/tools','/es/herramientas']) {
      const schema = structuredData(path) as { '@graph': Array<Record<string, unknown>> };
      const list = schema['@graph'].find(item => item['@type'] === 'ItemList')?.itemListElement as {url:string}[];
      expect(list).toHaveLength(19);
      expect(new Set(list.map(item=>item.url)).size).toBe(19);
      expect(list.every(item=>item.url.includes('/es/') === path.startsWith('/es/'))).toBe(true);
    }
  });
});

describe('Spanish display copy', () => {
  it('leaves English and unknown content unchanged', () => {
    expect(translate('Resize', 'en')).toBe('Resize');
    expect(translate('My original file.jpg', 'es')).toBe('My original file.jpg');
    expect(translate(undefined, 'es')).toBeUndefined();
  });
  it('translates dynamic UI without changing user names or search queries', () => {
    expect(translate('Processing 8 images','es')).toBe('Procesando 8 imágenes');
    expect(translate('Quality 75','es')).toBe('Calidad 75');
    expect(translate('Add Content images','es')).toBe('Añadir Imágenes de contenido');
    expect(translate('Include Video thumbnail','es')).toBe('Incluir Miniatura de vídeo');
    expect(translate('How to prepare YouTube images','es')).toBe('Cómo preparar imágenes para YouTube');
    expect(translate('Rename batch, currently Home','es')).toBe('Renombrar lote, actualmente Home');
    expect(translate('Preset “Resize” saved','es')).toBe('Preajuste «Resize» guardado');
    expect(translate('No tools match “Home”','es')).toBe('No hay herramientas para «Home»');
    expect(translate('Open details for image.jpg','es')).toBe('Ver detalles de image.jpg');
    expect(translate('  images ', 'es')).toBe('  imágenes ');
  });
  it('handles Spanish search without requiring accents', () => {
    expect(searchText(' Compresión ')).toBe('compresion');
    expect(searchText('Imágenes')).toBe('imagenes');
  });
});
