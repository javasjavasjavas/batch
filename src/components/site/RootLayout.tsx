import { Outlet } from '../../i18n/router';
import { CookieBanner } from './CookieBanner';
import { CookieDialog } from './CookieDialog';
import { OfflineNotice } from '../ui/OfflineNotice';
import { BatchProvider } from '../../contexts/BatchContext';
import { Seo } from './Seo';
import { AdSenseManager } from '../../advertising/AdSenseManager';
import { LocaleProvider } from '../../i18n/LocaleContext';
import { ToastProvider } from '../../contexts/ToastContext';

export function RootLayout() {
  return (
    <LocaleProvider><ToastProvider><BatchProvider>
      <Seo />
      <AdSenseManager />
      <Outlet />
      <OfflineNotice />
      <CookieBanner />
      <CookieDialog />
    </BatchProvider></ToastProvider></LocaleProvider>);

}
