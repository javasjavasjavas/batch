import { forwardRef, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { useI18n } from './LocaleContext';
import { englishPath, localizedPath, localeForPath } from './paths';
export * from 'react-router-dom';
function localTo(to: Router.To, locale: 'en' | 'es'): Router.To {
  return typeof to === 'string' ? localizedPath(to, locale) : { ...to, pathname: to.pathname ? localizedPath(to.pathname, locale) : to.pathname };
}
export const Link = forwardRef<HTMLAnchorElement, Router.LinkProps>(function Link(props, ref) {
  const { locale } = useI18n();
  return <Router.Link {...props} ref={ref} to={localTo(props.to, locale)} />;
});
export const NavLink = forwardRef<HTMLAnchorElement, Router.NavLinkProps>(function NavLink(props, ref) {
  const { locale } = useI18n();
  return <Router.NavLink {...props} ref={ref} to={localTo(props.to, locale)} />;
});
export function Navigate(props: Router.NavigateProps) {
  const { locale } = useI18n();
  return <Router.Navigate {...props} to={localTo(props.to, locale)} />;
}
export function useNavigate(): Router.NavigateFunction {
  const navigate = Router.useNavigate();
  const { locale } = useI18n();
  return useCallback((to: Router.To | number, options?: Router.NavigateOptions) => {
    if (typeof to === 'number') navigate(to); else navigate(localTo(to, locale), options);
  }, [navigate, locale]) as Router.NavigateFunction;
}
/** Business logic uses stable paths so changing language never resets a batch or run. */
export function useLocation() {
  const location = Router.useLocation();
  return { ...location, pathname: englishPath(location.pathname) };
}
export function useParams() {
  const params = Router.useParams();
  const location = Router.useLocation();
  return localeForPath(location.pathname) === 'es' && params.slug
    ? { ...params, slug: englishPath(location.pathname).split('/').pop() } : params;
}
