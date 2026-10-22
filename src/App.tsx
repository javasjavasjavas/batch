import { RouterProvider, type RouteObject, type createBrowserRouter } from 'react-router-dom';
import { PrefsProvider } from './contexts/PrefsContext';
import { MotionPrefs } from './components/ui/MotionPrefs';
import { RootLayout } from './components/site/RootLayout';
import { SiteLayout } from './components/site/SiteLayout';
import { RouteError } from './components/site/RouteError';
import { NotFound } from './pages/NotFound';
import { PLATFORM_PACKS } from './data/platforms';
import { LocaleProvider } from './i18n/LocaleContext';
import { localizedPath } from './i18n/paths';
import { CREATIVE_TOOLS, type CreativeToolId } from './data/creativeTools';

function creativeLoader(kind: CreativeToolId) {
  let result: Promise<{ Component: () => JSX.Element }> | undefined;
  return () => result ??= import('./pages/CreativeStudio').then(({ CreativeStudio }) => ({ Component: () => <CreativeStudio kind={kind} /> }));
}

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
    { path: '/', handle: { module: 'src/pages/Home.tsx' }, lazy: async () => ({ Component: (await import('./pages/Home')).Home }) },
    { path: '/tools', handle: { module: 'src/pages/ToolsDirectory.tsx' }, lazy: async () => ({ Component: (await import('./pages/ToolsDirectory')).ToolsDirectory }) },
    ...CREATIVE_TOOLS.map(tool => ({ path: `/tools/${tool.slug}`, handle: { module: 'src/pages/CreativeStudio.tsx' }, lazy: creativeLoader(tool.id) })),
    { path: '/app/steam', handle: { module: 'src/pages/SteamAssets.tsx' }, lazy: async () => ({ Component: (await import('./pages/SteamAssets')).SteamAssets }) },
    { path: '/tools/steam-assets', handle: { module: 'src/pages/SteamAssets.tsx' }, lazy: async () => ({ Component: (await import('./pages/SteamAssets')).SteamAssets }) },
    ...PLATFORM_PACKS.flatMap((pack) => [
      { path: `/app/${pack.id}`, handle: { module: 'src/pages/PlatformAssets.tsx' }, lazy: platformLoader(pack.id) },
      { path: `/tools/${pack.id}-assets`, handle: { module: 'src/pages/PlatformAssets.tsx' }, lazy: platformLoader(pack.id) },
    ]),
    { path: '/tools/:slug', handle: { module: 'src/pages/ToolLanding.tsx' }, lazy: async () => ({ Component: (await import('./pages/ToolLanding')).ToolLanding }) },
    { path: '/help', handle: { module: 'src/pages/Help.tsx' }, lazy: async () => ({ Component: (await import('./pages/Help')).Help }) },
    { path: '/help/:slug', handle: { module: 'src/pages/HelpArticle.tsx' }, lazy: async () => ({ Component: (await import('./pages/HelpArticle')).HelpArticle }) },
    { path: '/about', handle: { module: 'src/pages/About.tsx' }, lazy: async () => ({ Component: (await import('./pages/About')).About }) },
    { path: '/privacy', handle: { module: 'src/pages/Privacy.tsx' }, lazy: async () => ({ Component: (await import('./pages/Privacy')).Privacy }) },
    { path: '/terms', handle: { module: 'src/pages/Terms.tsx' }, lazy: async () => ({ Component: (await import('./pages/Terms')).Terms }) },
    { path: '*', element: <NotFound /> }]

  },
  ...['/app', '/app/resize', '/app/compress', '/app/convert', '/app/rename'].map((path) => ({
    path,
    handle: { module: 'src/components/workspace/WorkspaceLayout.tsx' }, lazy: async () => ({ Component: (await import('./components/workspace/WorkspaceLayout')).WorkspaceLayout }),
    errorElement: <LocaleProvider><RouteError /></LocaleProvider>,
    children: [
    { index: true, handle: { module: 'src/pages/workspace/Editor.tsx' }, lazy: async () => ({ Component: (await import('./pages/workspace/Editor')).Editor }) },
    { path: 'review', handle: { module: 'src/pages/workspace/Review.tsx' }, lazy: async () => ({ Component: (await import('./pages/workspace/Review')).Review }) },
    { path: 'run', handle: { module: 'src/pages/workspace/Processing.tsx' }, lazy: async () => ({ Component: (await import('./pages/workspace/Processing')).Processing }) },
    { path: 'results', handle: { module: 'src/pages/workspace/Results.tsx' }, lazy: async () => ({ Component: (await import('./pages/workspace/Results')).Results }) }]

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
