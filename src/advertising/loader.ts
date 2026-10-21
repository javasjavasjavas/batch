import { advertising, advertisingReady, isAdHost } from './config';

declare global {
  interface Window { adsbygoogle?: Record<string, unknown>[]; googlefc?: { showRevocationMessage?: () => void }; }
}
let loading: Promise<void> | undefined;
/** One SDK per document. No timers, refreshes, image data or filenames. */
export function loadAdSense(): Promise<void> {
  if (!advertisingReady || !isAdHost(window.location.hostname)) return Promise.reject(new Error('Ads are not enabled'));
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'batch-adsense';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${advertising.publisherId}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('AdSense unavailable'));
    document.head.appendChild(script);
  });
  return loading;
}
