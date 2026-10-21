import { useI18n } from '../i18n/LocaleContext';
import { Link, useParams } from '../i18n/router';
import { ArrowRightIcon } from 'lucide-react';
import { HELP_ARTICLES } from '../data/helpArticles';
import { EditorialLayout } from '../components/site/EditorialLayout';
import { ButtonLink } from '../components/ui/ButtonLink';
import { NotFound } from './NotFound';
import { GUIDE_TOOLS } from '../data/workflowGuides';
import { SEO_PAGES } from '../data/seo';
import { GUIDE_SCREENSHOTS, localizedScreenshot } from '../data/guideScreenshots';

export function HelpArticle() {
  const { tr, locale } = useI18n();
  const { slug } = useParams();
  const article = HELP_ARTICLES.find((a) => a.slug === slug);
  if (!article) return <NotFound />;
  const related = HELP_ARTICLES.filter((a) => a.slug !== article.slug);

  return (
    <EditorialLayout
      key={article.slug}
      breadcrumb={[{ label: 'Help', to: '/help' }]}
      eyebrow={article.category}
      title={tr(article.title)}
      lede={article.summary}
      meta={article.readTime}
      sections={article.sections.map((section) => ({ ...section, image: localizedScreenshot(GUIDE_SCREENSHOTS[article.slug]?.[section.id], locale) }))}
      showAd
      footer={
      <div className="mt-4 border-t border-line pt-8">
          {GUIDE_TOOLS[article.slug] && <nav aria-label={tr("Tools for this guide")} className="mb-8"><h2 className="text-lg font-semibold">{tr("Try the tools in this guide")}</h2><ul className="mt-3 flex flex-wrap gap-4">{GUIDE_TOOLS[article.slug].map((slug) => <li key={slug}><Link to={`/tools/${slug}`} className="text-sm font-medium underline underline-offset-4">{tr(SEO_PAGES.find((page) => page.path === `/tools/${slug}`)?.name)}</Link></li>)}</ul></nav>}
          <div className="flex flex-col gap-4 rounded-2xl bg-lime-soft p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink">{tr("Try it with the sample batch")}</p>
              <p className="mt-0.5 text-sm text-[#4A5240]">{tr("Eight product photos, ready to explore every setting.")}</p>
            </div>
            <ButtonLink to="/app" variant="primary">{tr("Open workspace")}</ButtonLink>
          </div>
          <h2 className="mt-10 text-sm font-semibold text-ink">{tr("More guides")}</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {related.map((a) =>
          <li key={a.slug}>
                <Link to={`/help/${a.slug}`} className="group flex items-center justify-between gap-4 py-4">
                  <span className="font-medium text-ink group-hover:underline group-hover:underline-offset-4">{tr(a.title)}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                </Link>
              </li>
          )}
          </ul>
        </div>
      } />);


}
