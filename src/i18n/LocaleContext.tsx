import { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { localeForPath, type Locale } from './paths';
import { translate } from './translate';
const LocaleContext = createContext<Locale>('en');
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return <LocaleContext.Provider value={localeForPath(pathname)}>{children}</LocaleContext.Provider>;
}
export function useI18n() {
  const locale = useContext(LocaleContext);
  return useMemo(() => ({ locale, tr: <T,>(value: T) => translate(value, locale) }), [locale]);
}
