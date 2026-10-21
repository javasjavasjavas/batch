import { localizedPath } from '../../i18n/paths';
import { useI18n } from '../../i18n/LocaleContext';
import React from 'react';
import { Link, useLocation } from '../../i18n/router';
import { ChevronRightIcon, FilePenLineIcon } from 'lucide-react';
import type { ArticleSection } from '../../types/content';
import { AdSlot } from '../ui/AdSlot';
import { advertisingReady } from '../../advertising/config';

interface EditorialLayoutProps {
  breadcrumb?: {label: string;to: string;}[];
  eyebrow?: string;
  title: string;
  lede?: string;
  meta?: string;
  draft?: boolean;
  sections: ArticleSection[];
  footer?: React.ReactNode;
  showAd?: boolean;
}

export function EditorialLayout({ breadcrumb, eyebrow, title, lede, meta, draft, sections, footer, showAd }: EditorialLayoutProps) {
  const { tr, locale } = useI18n();
  const { search } = useLocation();
  const hasAd = showAd && (advertisingReady || (import.meta.env.DEV && new URLSearchParams(search).get('ads') === 'preview'));
  return (
    <div className="mx-auto max-w-content px-5 pb-20 sm:px-8">
      {breadcrumb &&
      <nav aria-label={tr("Breadcrumb")} className="pt-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
            {breadcrumb.map((b) =>
          <React.Fragment key={b.to}>
                <li>
                  <Link to={b.to} className="rounded hover:text-ink">
                    {tr(b.label)}
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </li>
              </React.Fragment>
          )}
            <li aria-current="page" className="text-ink">
              {tr(title)}
            </li>
          </ol>
        </nav>
      }
      <header className="max-w-3xl pb-10 pt-8 sm:pt-12">
        {eyebrow && <p className="text-sm font-medium text-muted">{tr(eyebrow)}</p>}
        <h1 className="mt-2 text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[46px]">{tr(title)}</h1>
        {lede && <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted">{tr(lede)}</p>}
        {meta && <p className="mt-4 text-[13px] text-muted">{tr(meta)}</p>}
        {draft &&
        <div role="note" className="mt-6 flex gap-3 rounded-xl border border-warning/25 bg-warning-soft p-4">
            <FilePenLineIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-warning" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-[#5C4A2A]">
              <span className="font-semibold text-ink">{tr("Draft for layout review.")}</span>{tr(" This text is placeholder content. It must be reviewed and completed by qualified counsel before publication and is not a final legal document.")}</p>
          </div>
        }
      </header>

      <div className={`grid gap-10 border-t border-line pt-10 lg:grid-cols-[180px_minmax(0,1fr)] ${hasAd ? 'xl:grid-cols-[180px_minmax(0,1fr)_300px]' : ''}`}>
        <nav aria-label={tr("On this page")} className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-[13px] font-semibold text-ink">{tr("On this page")}</p>
            <ul className="mt-3 space-y-2 border-l border-line">
              {sections.map((s) =>
              <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-3 text-[13px] text-muted transition-colors duration-150 hover:border-ink hover:text-ink">
                    {tr(s.heading)}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </nav>

        <article className="min-w-0 max-w-[68ch]">
          {sections.map((s, index) =>
          <section key={s.id} id={s.id} className="scroll-mt-24 pb-10">
              <h2 className="text-[21px] font-semibold tracking-[-0.02em] text-ink">{tr(s.heading)}</h2>
              {s.paragraphs.map((p) =>
            <p key={p.slice(0, 40)} className="mt-3 text-[16px] leading-[1.7] text-[#3A3E38]">
                  {tr(p)}
                </p>
            )}
              {s.list &&
            <ul className="mt-3 space-y-2">
                  {s.list.map((item) =>
              <li key={item} className="flex gap-3 text-[16px] leading-[1.6] text-[#3A3E38]">
                      <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
                      {tr(item)}
                    </li>
              )}
                </ul>
            }
              {s.links && <ul className="mt-3 space-y-2">
                {s.links.map((link) => <li key={link.href}><a href={localizedPath(link.href, locale)} className="text-sm underline underline-offset-4 hover:text-muted">{tr(link.label)}</a></li>)}
              </ul>}
              {s.image && <figure className="mt-6">
                <a href={s.image.src} target="_blank" rel="noreferrer" className="block w-fit max-w-full rounded-xl border border-line bg-white p-2 transition-colors hover:border-line-strong" aria-label={tr(`Enlarge screenshot: ${s.image.alt}`)}>
                  <img src={s.image.src} alt={tr(s.image.alt)} width={s.image.width} height={s.image.height} loading="lazy" decoding="async" className="h-auto max-w-full rounded-lg" />
                </a>
                <figcaption className="mt-2 max-w-[60ch] text-[13px] leading-relaxed text-muted">{tr(s.image.caption)} <span className="whitespace-nowrap">{tr("Select image to enlarge.")}</span></figcaption>
              </figure>}
              {showAd && index === 1 && <AdSlot placement="guide-inline" className="mt-10 xl:hidden" />}
            </section>
          )}
          {tr(footer)}
        </article>

        {hasAd &&
        <div className="hidden xl:block">
            <AdSlot placement="guide-rail" />
          </div>
        }
      </div>
    </div>);

}
