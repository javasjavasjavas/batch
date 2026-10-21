import { useI18n } from '../../i18n/LocaleContext';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from '../../i18n/router';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, MenuIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { ButtonLink } from '../ui/ButtonLink';
import { ToolsMenu } from './ToolsMenu';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';

const NAV = [
{ label: 'How it works', to: '/#how-it-works' },
{ label: 'Help', to: '/help' }];


const linkClass = ({ isActive }: {isActive: boolean;}) =>
twMerge(
  'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
  isActive ? 'text-ink' : 'text-muted hover:text-ink'
);

export function SiteHeader({ workspace = false }: { workspace?: boolean }) {
  const { tr } = useI18n();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-line bg-canvas">
      <div className={twMerge('mx-auto flex h-16 max-w-content items-center gap-6 px-5 sm:px-8', workspace && 'max-w-none sm:px-5')}>
        <Link to="/" aria-label={tr("Batch home")} className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label={tr("Main")} className="hidden items-center gap-0.5 md:flex">
          <ToolsMenu />
          {NAV.map((item) =>
          item.to.includes('#') ?
          <Link key={item.to} to={item.to} className={linkClass({ isActive: false })}>
                {tr(item.label)}
              </Link> :

          <NavLink key={item.to} to={item.to} className={linkClass}>
                {tr(item.label)}
              </NavLink>

          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          {!workspace && <ButtonLink to="/app" variant="primary" className="hidden sm:inline-flex">{tr("Batch workspace")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={tr(open ? 'Close menu' : 'Open menu')}
            onClick={() => setOpen((o) => !o)}>
            
            {open ? <XIcon className="h-5 w-5" aria-hidden="true" /> : <MenuIcon className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {open &&
        <motion.nav
          id="mobile-nav"
          aria-label={tr("Mobile")}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-x-0 top-16 border-b border-line bg-canvas px-5 pb-5 shadow-soft md:hidden">
          
            <ul className="divide-y divide-line">
              <li><ToolsMenu mobile /></li>
              {NAV.map((item) =>
            <li key={item.to}>
                  <Link to={item.to} className="flex h-14 items-center text-[17px] font-medium text-ink">
                    {tr(item.label)}
                  </Link>
                </li>
            )}
            </ul>
            {!workspace && <ButtonLink to="/app" variant="primary" size="lg" className="mt-3 w-full">{tr("Batch workspace")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>}
          </motion.nav>
        }
      </AnimatePresence>
    </header>);

}
