import { Link, useLocation } from 'react-router-dom';
import { localizedPath, localeForPath } from './paths';
export function LanguageSwitcher() {
  const location = useLocation();
  const locale = localeForPath(location.pathname);
  const url = location.pathname + location.search + location.hash;
  return <nav aria-label={locale === 'es' ? 'Idioma' : 'Language'} className="flex shrink-0 items-center gap-1 rounded-lg border border-line p-1 text-xs">
    {(['en', 'es'] as const).map(lang => <Link key={lang} to={localizedPath(url, lang)} lang={lang} hrefLang={lang}
      aria-current={locale === lang ? 'page' : undefined} state={location.state}
      className={`rounded px-2 py-1.5 ${locale === lang ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}>
      {lang === 'en' ? 'EN' : 'ES'}<span className="sr-only"> — {lang === 'en' ? 'English' : 'Español'}</span>
    </Link>)}
  </nav>;
}
