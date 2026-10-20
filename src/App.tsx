import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PrefsProvider } from './contexts/PrefsContext';
import { ToastProvider } from './contexts/ToastContext';
import { MotionPrefs } from './components/ui/MotionPrefs';
import { RootLayout } from './components/site/RootLayout';
import { SiteLayout } from './components/site/SiteLayout';
import { RouteError } from './components/site/RouteError';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { Home } from './pages/Home';
import { ToolsDirectory } from './pages/ToolsDirectory';
import { ToolLanding } from './pages/ToolLanding';
import { Help } from './pages/Help';
import { HelpArticle } from './pages/HelpArticle';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { NotFound } from './pages/NotFound';
import { Editor } from './pages/workspace/Editor';
import { Review } from './pages/workspace/Review';
import { Processing } from './pages/workspace/Processing';
import { Results } from './pages/workspace/Results';

const router = createBrowserRouter([
{
  element: <RootLayout />,
  errorElement: <RouteError />,
  children: [
  {
    element: <SiteLayout />,
    children: [
    { path: '/', element: <Home /> },
    { path: '/tools', element: <ToolsDirectory /> },
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
    element: <WorkspaceLayout />,
    errorElement: <RouteError />,
    children: [
    { index: true, element: <Editor /> },
    { path: 'review', element: <Review /> },
    { path: 'run', element: <Processing /> },
    { path: 'results', element: <Results /> }]

  }))]

}]
);

export function App() {
  return (
    <PrefsProvider>
      <ToastProvider>
          <MotionPrefs>
            <RouterProvider router={router} />
          </MotionPrefs>
      </ToastProvider>
    </PrefsProvider>);

}
