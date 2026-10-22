import { describe, expect, it } from 'vitest';
import { ARTICLE_META } from '../src/data/articleMetadata';
import { HELP_ARTICLES } from '../src/data/helpArticles';
import { TOOL_USE_CASES } from '../src/data/toolUseCases';
import { HOME_USE_CASES } from '../src/data/homeUseCases';
import { SEO_PAGES } from '../src/data/seo';
import { localizedPath } from '../src/i18n/paths';
import { translate } from '../src/i18n/translate';

// Metadata is intentionally independent of article bodies so it can stay in the entry bundle.
describe('discoverable guide and tool content', () => {
  it('keeps the metadata registry and the rendered articles in sync', () => {
    expect(HELP_ARTICLES.map(a => a.slug).sort()).toEqual(Object.keys(ARTICLE_META).sort());
    for (const article of HELP_ARTICLES) {
      const { sections, ...meta } = article;
      expect(meta).toEqual(ARTICLE_META[article.slug]);
      expect(new Set(sections.map(s => s.id)).size).toBe(sections.length);
    }
  });
  it('links task cards to existing public pages and existing section anchors in both languages', () => {
    const cards = [...HOME_USE_CASES, ...Object.values(TOOL_USE_CASES).flat()];
    for (const card of cards) {
      const [path, anchor] = card.href.split('#');
      expect(SEO_PAGES.some(page => page.path === path)).toBe(true);
      expect(SEO_PAGES.some(page => page.path === localizedPath(path, 'es'))).toBe(true);
      if (anchor) expect(HELP_ARTICLES.find(a => path === `/help/${a.slug}`)?.sections.some(s => s.id === anchor)).toBe(true);
      for (const value of [card.title, card.body, card.label]) expect(translate(value, 'es')).not.toBe(value);
    }
  });
  it('translates the new guide and keeps its primary-source references', () => {
    const article = HELP_ARTICLES.find(a => a.slug === 'image-seo-filenames-alt-text')!;
    for (const section of article.sections) {
      for (const text of [section.heading, ...section.paragraphs, ...(section.list || [])]) expect(translate(text, 'es')).not.toBe(text);
    }
    const sources = article.sections.flatMap(s => s.links || []).filter(l => l.href.startsWith('https://'));
    expect(sources.map(s => new URL(s.href).hostname).sort()).toEqual(['developers.google.com', 'web.dev']);
  });
});
