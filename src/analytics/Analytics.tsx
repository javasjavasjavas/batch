import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsConfigured, getAnalyticsConsent, setAnalyticsConsent, subscribeAnalytics, trackPage } from './client';
import { useI18n } from '../i18n/LocaleContext';
import { usePrefs } from '../contexts/PrefsContext';
import { Link } from '../i18n/router';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
const serverConsent = () => 'unknown' as const;
export const useAnalyticsConsent = () => useSyncExternalStore(subscribeAnalytics, getAnalyticsConsent, serverConsent);

export function Analytics() {
  const consent = useAnalyticsConsent();
  const { pathname } = useLocation();
  const { tr } = useI18n();
  const { cookieDialogOpen } = usePrefs();
  useEffect(() => { if (consent === 'granted') trackPage(pathname); }, [pathname, consent]);
  if (!analyticsConfigured || consent !== 'unknown' || cookieDialogOpen) return null;
  return <section aria-label={tr('Optional analytics')} className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-line bg-white p-5 shadow-pop">
    <h2 className="text-sm font-semibold">{tr('Help us improve Batch')}</h2>
    <p className="mt-2 text-sm leading-relaxed text-muted">{tr('May we use Google Analytics cookies to understand visits and tool usage? Images and file names are never included. You can change this in Cookie preferences.')} <Link to="/privacy" className="underline">{tr('Privacy')}</Link></p>
    <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setAnalyticsConsent('denied')}>{tr('Reject analytics')}</Button><Button variant="secondary" onClick={() => setAnalyticsConsent('granted')}>{tr('Allow analytics')}</Button></div>
  </section>;
}
export function AnalyticsPreference() {
  const consent = useAnalyticsConsent();
  const { tr } = useI18n();
  if (!analyticsConfigured) return null;
  return <div className="my-5 rounded-xl border border-line p-4"><Toggle checked={consent === 'granted'} onChange={value => setAnalyticsConsent(value ? 'granted' : 'denied')} label={tr('Google Analytics')} description={tr('Measure visits and downloads. No images or file names. Changes apply immediately.')} /></div>;
}
