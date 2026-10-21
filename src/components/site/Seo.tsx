import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { metaForPath, structuredData, SITE_URL } from '../../data/seo';

/** Keep client navigation in sync with the metadata already present in static HTML. */
export function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = metaForPath(pathname);
    document.title = meta.title;
    function setMeta(key: string, content: string, property = false) {
      const attribute = property ? 'property' : 'name';
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.append(element); }
      element.content = content;
    }
    setMeta('description', meta.description);
    setMeta('robots', meta.robots);
    for (const [key, value] of Object.entries({ title: meta.title, description: meta.description, type: meta.type, site_name: 'Batch Image Kit' })) setMeta(`og:${key}`, value, true);
    setMeta('og:image', `${SITE_URL}/social-card.png`, true);
    setMeta('og:image:type', 'image/png', true);
    setMeta('og:locale', 'en_US', true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);
    setMeta('og:image:alt', 'Batch — Free Bulk Image Tools', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:image', `${SITE_URL}/social-card.png`);
    setMeta('twitter:image:alt', 'Batch — Free Bulk Image Tools');
    setMeta('twitter:title', meta.title);
    setMeta('twitter:description', meta.description);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (meta.canonical) {
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
      canonical.href = meta.canonical;
      setMeta('og:url', meta.canonical, true);
    } else { canonical?.remove(); document.head.querySelector('meta[property="og:url"]')?.remove(); }
    let schema = document.getElementById('page-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'page-schema'; schema.setAttribute('type', 'application/ld+json'); document.head.append(schema); }
    schema.textContent = JSON.stringify(structuredData(pathname));
  }, [pathname]);
  return null;
}
