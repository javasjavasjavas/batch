import { Outlet } from 'react-router-dom';
import { CookieBanner } from './CookieBanner';
import { CookieDialog } from './CookieDialog';
import { OfflineNotice } from '../ui/OfflineNotice';
import { BatchProvider } from '../../contexts/BatchContext';
import { Seo } from './Seo';

export function RootLayout() {
  return (
    <BatchProvider>
      <Seo />
      <Outlet />
      <OfflineNotice />
      <CookieBanner />
      <CookieDialog />
    </BatchProvider>);

}
