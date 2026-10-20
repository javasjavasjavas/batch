import { Link, useParams } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { HELP_ARTICLES } from '../data/helpArticles';
import { EditorialLayout } from '../components/site/EditorialLayout';
import { ButtonLink } from '../components/ui/ButtonLink';
import { NotFound } from './NotFound';

export function HelpArticle() {
  const { slug } = useParams();
  const article = HELP_ARTICLES.find((a) => a.slug === slug);
  if (!article) return <NotFound />;
  const related = HELP_ARTICLES.filter((a) => a.slug !== article.slug);

  return (
    <EditorialLayout
      key={article.slug}
      breadcrumb={[{ label: 'Help', to: '/help' }]}
      eyebrow={article.category}
      title={article.title}
      lede={article.summary}
      meta={article.readTime}
      sections={article.sections}
      showAd
      footer={
      <div className="mt-4 border-t border-line pt-8">
          <div className="flex flex-col gap-4 rounded-2xl bg-lime-soft p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-ink">Try it with the sample batch</p>
              <p className="mt-0.5 text-sm text-[#4A5240]">Eight product photos, ready to explore every setting.</p>
            </div>
            <ButtonLink to="/app" variant="primary">
              Open workspace
            </ButtonLink>
          </div>
          <h2 className="mt-10 text-sm font-semibold text-ink">More guides</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {related.map((a) =>
          <li key={a.slug}>
                <Link to={`/help/${a.slug}`} className="group flex items-center justify-between gap-4 py-4">
                  <span className="font-medium text-ink group-hover:underline group-hover:underline-offset-4">{a.title}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                </Link>
              </li>
          )}
          </ul>
        </div>
      } />);


}