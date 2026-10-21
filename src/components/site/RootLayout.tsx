import { Outlet } from 'react-router-dom';
import { CookieBanner } from './CookieBanner';
import { CookieDialog } from './CookieDialog';
import { OfflineNotice } from '../ui/OfflineNotice';
import { BatchProvider } from '../../contexts/BatchContext';
import { Seo } from './Seo';
import { AdSenseManager } from '../../advertising/AdSenseManager';

export function RootLayout() {
  return (
    <BatchProvider>
      <Seo />
      <AdSenseManager />
      <Outlet />
      <OfflineNotice />
      <CookieBanner />
      <CookieDialog />
    </BatchProvider>);

}
