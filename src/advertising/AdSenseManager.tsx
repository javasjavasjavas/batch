import { useEffect } from 'react';
import { useLocation } from '../i18n/router';
import { consentReady, isAdHost } from './config';
import { loadAdSense } from './loader';

export function AdSenseManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (consentReady && isAdHost(window.location.hostname)) {
      // Google's published CMP is delivered by the SDK. Local prototype consent
      // is never used as permission to serve Google ads. The CMP also needs to
      // work on direct visits to Privacy; AdSlot separately excludes legal pages.
      void loadAdSense().catch(() => undefined);
    }
  }, [pathname]);
  return null;
}
