import { RouterProvider, type RouteObject, type createBrowserRouter } from 'react-router-dom';
import { PrefsProvider } from './contexts/PrefsContext';
import { ToastProvider } from './contexts/ToastContext';
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

export const routes: RouteObject[] = [
{
  element: <RootLayout />,
  errorElement: <RouteError />,
  children: [
  {
    element: <SiteLayout />,
    children: [
    { path: '/', element: <Home /> },
    { path: '/tools', element: <ToolsDirectory /> },
    { path: '/app/steam', lazy: async () => ({ Component: (await import('./pages/SteamAssets')).SteamAssets }) },
    { path: '/tools/steam-assets', lazy: async () => ({ Component: (await import('./pages/SteamAssets')).SteamAssets }) },
    ...PLATFORM_PACKS.flatMap((pack) => [
      { path: `/app/${pack.id}`, lazy: async () => { const { PlatformAssets } = await import('./pages/PlatformAssets'); return { Component: () => <PlatformAssets platform={pack.id} /> }; } },
      { path: `/tools/${pack.id}-assets`, lazy: async () => { const { PlatformAssets } = await import('./pages/PlatformAssets'); return { Component: () => <PlatformAssets platform={pack.id} /> }; } },
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
    errorElement: <RouteError />,
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
      <ToastProvider>
          <MotionPrefs>
            <RouterProvider router={router} />
          </MotionPrefs>
      </ToastProvider>
    </PrefsProvider>);

}
