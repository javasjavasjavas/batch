import { RouterProvider, type RouteObject, type createBrowserRouter } from 'react-router-dom';
import { PrefsProvider } from './contexts/PrefsContext';
import { MotionPrefs } from './components/ui/MotionPrefs';
import { RootLayout } from './components/site/RootLayout';
import { SiteLayout } from './components/site/SiteLayout';
import { RouteError } from './components/site/RouteError';
import { Home } from './pages/Home';
import { ToolsDirectory } from './pages/ToolsDirectory';
import { ToolLanding } from './pages/ToolLanding';
import { Help } from './pages/Help';
import { HelpArticle } from './pages/HelpArticle';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { NotFound } from './pages/NotFound';
import { PLATFORM_PACKS } from './data/platforms';
import { LocaleProvider } from './i18n/LocaleContext';
import { localizedPath } from './i18n/paths';

// Reuse the component identity across locale routes so a language change preserves kit state.
function platformLoader(platform: string) {
  let result: Promise<{ Component: () => JSX.Element }> | undefined;
  return () => result ??= import('./pages/PlatformAssets').then(({ PlatformAssets }) => ({ Component: () => <PlatformAssets platform={platform} /> }));
}

export const routes: RouteObject[] = [
{
  element: <RootLayout />,
  errorElement: <LocaleProvider><RouteError /></LocaleProvider>,
  children: [
  {
    element: <SiteLayout />,
    children: [
    { path: '/', element: <Home /> },
    { path: '/tools', element: <ToolsDirectory /> },
    { path: '/app/steam', lazy: async () => ({ Component: (await import('./pages/SteamAssets')).SteamAssets }) },
    { path: '/tools/steam-assets', lazy: async () => ({ Component: (await import('./pages/SteamAssets')).SteamAssets }) },
    ...PLATFORM_PACKS.flatMap((pack) => [
      { path: `/app/${pack.id}`, lazy: platformLoader(pack.id) },
      { path: `/tools/${pack.id}-assets`, lazy: platformLoader(pack.id) },
    ]),
    { path: '/tools/:slug', element: <ToolLanding /> },
    { path: '/help', element: <Help /> },
    { path: '/help/:slug', element: <HelpArticle /> },
    { path: '/about', element: <About /> },
    { path: '/privacy', element: <Privacy /> },
    { path: '/terms', element: <Terms /> },
    { path: '*', element: <NotFound /> }]

  },
  ...['/app', '/app/resize', '/app/compress', '/app/convert', '/app/rename'].map((path) => ({
    path,
    lazy: async () => ({ Component: (await import('./components/workspace/WorkspaceLayout')).WorkspaceLayout }),
    errorElement: <LocaleProvider><RouteError /></LocaleProvider>,
    children: [
    { index: true, lazy: async () => ({ Component: (await import('./pages/workspace/Editor')).Editor }) },
    { path: 'review', lazy: async () => ({ Component: (await import('./pages/workspace/Review')).Review }) },
    { path: 'run', lazy: async () => ({ Component: (await import('./pages/workspace/Processing')).Processing }) },
    { path: 'results', lazy: async () => ({ Component: (await import('./pages/workspace/Results')).Results }) }]

  }))]

}];

export function App({ router }: { router: ReturnType<typeof createBrowserRouter> }) {
  return (
    <PrefsProvider>
          <MotionPrefs>
            <RouterProvider router={router} />
          </MotionPrefs>
    </PrefsProvider>);

}

// Both languages share the root provider, keeping in-memory files and processing alive.
const rootChildren = routes[0].children!;
function spanishRoute(route: RouteObject): RouteObject {
  return { ...route, ...(route.path && route.path !== '*' ? { path: localizedPath(route.path, 'es') } : {}),
    ...(route.children ? { children: route.children.map(child => child.path?.startsWith('/') ? spanishRoute(child) : child) } : {}),
  } as RouteObject;
}
const publicRoutes = rootChildren[0].children!;
publicRoutes.splice(publicRoutes.length - 1, 0, ...publicRoutes.filter(route => route.path !== '*').map(spanishRoute));
rootChildren.push(...rootChildren.slice(1).map(spanishRoute));
