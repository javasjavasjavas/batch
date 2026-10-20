import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { ButtonLink } from '../components/ui/ButtonLink';

const LINKS = [
{ to: '/tools', label: 'Tools', body: 'Resize, compress, convert, and rename.' },
{ to: '/help', label: 'Help center', body: 'Guides and troubleshooting.' },
{ to: '/about', label: 'About Batch', body: 'What it is and how it works.' }];


export function NotFound() {
  return (
    <div className="mx-auto max-w-content px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      <div className="max-w-2xl">
        <p className="tabular text-sm font-medium text-muted">Error 404</p>
        <h1 className="mt-2 text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[54px]">
          This page didn’t make it into the batch.
        </h1>
        <p className="mt-4 max-w-[50ch] text-[17px] leading-relaxed text-muted">
          The link may be outdated, or the address has a typo. Your current batch, if you have one, is still open in the workspace.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <ButtonLink to="/app" variant="primary" size="lg">
            Go to workspace
          </ButtonLink>
          <ButtonLink to="/" variant="secondary" size="lg">
            Home page
          </ButtonLink>
        </div>
      </div>
      <ul className="mt-14 grid gap-3 md:grid-cols-3">
        {LINKS.map((l) =>
        <li key={l.to}>
            <Link to={l.to} className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 transition-[border-color] duration-150 hover:border-line-strong">
              <span>
                <span className="block font-semibold text-ink">{l.label}</span>
                <span className="mt-0.5 block text-sm text-muted">{l.body}</span>
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-muted transition-transform duration-150 ease-out group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        )}
      </ul>
    </div>);

}