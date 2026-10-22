import { useEffect, useId, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { localizedPath, localeForPath } from './paths';
export function LanguageSwitcher() {
  const location = useLocation();
  const locale = localeForPath(location.pathname);
  const url = location.pathname + location.search + location.hash;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => setOpen(false), [location.key]);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  return <div ref={root} className="relative shrink-0"
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={event => {
      if (event.key === 'Escape' && open) {
        event.stopPropagation();
        setOpen(false);
        trigger.current?.focus();
      }
    }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls={menuId}
      aria-label={locale === 'es' ? 'Cambiar idioma: Español' : 'Change language: English'}
      onClick={() => setOpen(value => !value)}
      className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-md px-2 text-xs font-medium text-muted transition-colors hover:bg-lime-soft hover:text-ink">
      {locale.toUpperCase()}<ChevronDownIcon className="h-3 w-3" aria-hidden="true" />
    </button>
    <nav id={menuId} hidden={!open} aria-label={locale === 'es' ? 'Idioma' : 'Language'}
      className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-line bg-white p-1 shadow-soft">
      {(['en', 'es'] as const).map(lang => <Link key={lang} to={localizedPath(url, lang)} lang={lang} hrefLang={lang}
        aria-current={locale === lang ? 'page' : undefined} state={location.state} onClick={() => setOpen(false)}
        className={`flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm transition-colors hover:bg-lime-soft ${locale === lang ? 'font-medium text-ink' : 'text-muted'}`}>
        {lang === 'en' ? 'English' : 'Español'}
        {locale === lang && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
      </Link>)}
    </nav>
  </div>;
}
