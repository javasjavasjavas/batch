import { useI18n } from '../i18n/LocaleContext';
import { searchText } from '../i18n/search';
import React, { useMemo, useState } from 'react';
import { Link } from '../i18n/router';
import { ArrowRightIcon, BookOpenIcon, LifeBuoyIcon, SearchXIcon, SlidersHorizontalIcon, WrenchIcon, ShieldCheckIcon } from 'lucide-react';
import { HELP_ARTICLES } from '../data/helpArticles';
import { HELP_CATEGORIES, HELP_FAQS, TROUBLESHOOTING } from '../data/helpContent';
import { SearchInput } from '../components/ui/SearchInput';
import { Accordion } from '../components/ui/Accordion';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { AdSlot } from '../components/ui/AdSlot';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'getting-started': <BookOpenIcon className="h-5 w-5" strokeWidth={1.75} />,
  settings: <SlidersHorizontalIcon className="h-5 w-5" strokeWidth={1.75} />,
  local: <ShieldCheckIcon className="h-5 w-5" strokeWidth={1.75} />,
  troubleshooting: <WrenchIcon className="h-5 w-5" strokeWidth={1.75} />
};


export function Help() {
  const { tr } = useI18n();
  const [query, setQuery] = useState('');
  const q = searchText(query);

  const results = useMemo(() => {
    const matches = (query: string, ...parts: string[]) => searchText([...parts, ...tr(parts)].join(' ')).includes(query);
    if (!q) return null;
    return {
      articles: HELP_ARTICLES.filter((a) =>
      matches(q, a.title, a.summary, ...a.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.list ?? [])]))
      ),
      faqs: HELP_FAQS.filter((f) => matches(q, f.q, f.a)),
      fixes: TROUBLESHOOTING.filter((t) => matches(q, t.problem, t.fix))
    };
  }, [q, tr]);

  const total = results ? results.articles.length + results.faqs.length + results.fixes.length : 0;

  return (
    <div className="mx-auto max-w-content px-5 pb-20 sm:px-8">
      <header className="max-w-2xl pb-8 pt-12 sm:pt-16">
        <h1 className="text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[48px]">{tr("Help center")}</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">{tr("Short answers about batches, settings, and what your browser can handle.")}</p>
      </header>
      <SearchInput id="help-search" label={tr("Search help")} value={query} onChange={setQuery} placeholder={tr("Search for “HEIC”, “presets”, “quality”…")} className="max-w-xl" />
      <p className="sr-only" role="status" aria-live="polite">
        {tr(results ? `${total} results` : '')}
      </p>

      {results ?
      <div className="mt-10">
          {total === 0 ?
        <div className="rounded-2xl border border-dashed border-line-strong bg-white">
              <EmptyState
            icon={<SearchXIcon className="h-5 w-5" />}
            title={tr(`Nothing found for “${query.trim()}”`)}
            description={tr("Try a shorter word, or browse the categories below.")}>
            
                <Button variant="secondary" onClick={() => setQuery('')}>{tr("Clear search")}</Button>
              </EmptyState>
            </div> :

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
              {results.articles.length > 0 &&
          <section aria-labelledby="r-articles">
                  <h2 id="r-articles" className="text-sm font-semibold text-ink">{tr("Articles")}</h2>
                  <ul className="mt-3 divide-y divide-line border-y border-line">
                    {results.articles.map((a) =>
              <li key={a.slug}>
                        <Link to={`/help/${a.slug}`} className="group flex items-center justify-between gap-4 py-4">
                          <span>
                            <span className="block font-medium text-ink group-hover:underline group-hover:underline-offset-4">{tr(a.title)}</span>
                            <span className="mt-0.5 block text-sm text-muted">{tr(a.summary)}</span>
                          </span>
                          <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                        </Link>
                      </li>
              )}
                  </ul>
                </section>
          }
              {(results.faqs.length > 0 || results.fixes.length > 0) &&
          <section aria-labelledby="r-answers">
                  <h2 id="r-answers" className="text-sm font-semibold text-ink">{tr("Answers")}</h2>
                  <Accordion
              className="mt-3"
              items={[...results.faqs, ...results.fixes.map((f) => ({ q: f.problem, a: f.fix }))]} />
            
                </section>
          }
            </div>
        }
        </div> :

      <>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HELP_CATEGORIES.map((c) =>
          <li key={c.id}>
                <Link
              to={c.href}
              className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-soft">
              
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-soft text-ink" aria-hidden="true">
                    {tr(CATEGORY_ICONS[c.id])}
                  </span>
                  <span className="mt-4 font-semibold text-ink">{tr(c.title)}</span>
                  <span className="mt-1 text-sm leading-relaxed text-muted">{tr(c.description)}</span>
                </Link>
              </li>
          )}
          </ul>

          <div className="mt-16 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <section aria-labelledby="faq-title">
              <h2 id="faq-title" className="text-[24px] font-semibold tracking-[-0.025em] text-ink">{tr("Frequently asked")}</h2>
              <Accordion className="mt-4" items={HELP_FAQS} />
            </section>
            <section aria-labelledby="articles-title">
              <h2 id="articles-title" className="text-[24px] font-semibold tracking-[-0.025em] text-ink">{tr("Guides")}</h2>
              <ul className="mt-4 space-y-3">
                {HELP_ARTICLES.map((a) =>
              <li key={a.slug}>
                    <Link to={`/help/${a.slug}`} className="group block rounded-2xl border border-line bg-white p-5 transition-[border-color] duration-150 hover:border-line-strong">
                      <span className="text-[12.5px] text-muted">{tr(a.category)}{tr(" · ")}{tr(a.readTime)}</span>
                      <span className="mt-1 block font-semibold text-ink group-hover:underline group-hover:underline-offset-4">{tr(a.title)}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{tr(a.summary)}</span>
                    </Link>
                  </li>
              )}
              </ul>
            </section>
          </div>

          <section id="troubleshooting" aria-labelledby="ts-title" className="mt-16 scroll-mt-24">
            <div className="flex items-center gap-2.5">
              <LifeBuoyIcon className="h-5 w-5 text-ink" strokeWidth={1.75} aria-hidden="true" />
              <h2 id="ts-title" className="text-[24px] font-semibold tracking-[-0.025em] text-ink">{tr("Troubleshooting")}</h2>
            </div>
            <dl className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
              {TROUBLESHOOTING.map((t) =>
            <div key={t.problem} className="bg-white p-5 sm:p-6">
                  <dt className="font-semibold text-ink">{tr(t.problem)}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted">{tr(t.fix)}</dd>
                </div>
            )}
              {TROUBLESHOOTING.length % 2 === 1 &&
            <div className="hidden bg-white p-6 md:flex md:flex-col md:justify-center">
                  <p className="text-sm text-muted">{tr("Still stuck?")}</p>
                  <Link to="/help/getting-started-with-a-batch" className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:underline hover:underline-offset-4">{tr("Read the getting started guide")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
            }
            </dl>
          </section>
        </>
      }

      <AdSlot placement="help" className="mt-16" />
    </div>);

}
