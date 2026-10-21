import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import { routes } from './App';
import { PrefsProvider } from './contexts/PrefsContext';
import { MotionPrefs } from './components/ui/MotionPrefs';
export { SEO_PAGES, WORKSPACE_PATHS, TOOL_ALIASES, SITE_URL, metaForPath, structuredData } from './data/seo';

export async function render(path: string) {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`https://batchimagekit.com${path}`));
  if (context instanceof Response) throw new Error(`Unexpected redirect rendering ${path}`);
  if (context.errors) throw new Error(`Route failed for ${path}: ${JSON.stringify(context.errors)}`);
  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToString(<PrefsProvider><MotionPrefs><StaticRouterProvider router={router} context={context} hydrate={false} /></MotionPrefs></PrefsProvider>);
}
