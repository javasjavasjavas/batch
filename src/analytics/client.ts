import settings from '../config/analytics.json';
import { metaForPath, normalizePath, pageForPath, WORKSPACE_PATHS, SITE_URL } from '../data/seo';
import { englishPath, localeForPath } from '../i18n/paths';

export const analyticsConfigured = settings.enabled && /^G-[A-Z0-9]+$/.test(settings.measurementId);
export const CONSENT_KEY = 'batch.analytics-consent.v1';
const SIX_MONTHS = 180 * 24 * 60 * 60 * 1000;
export type AnalyticsConsent = 'unknown' | 'granted' | 'denied';
let memoryConsent: AnalyticsConsent = 'unknown';
const listeners = new Set<() => void>();
let initialized = false;
let lastPage = '';
type TagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
const tagWindow = () => window as TagWindow;
const production = () => typeof window !== 'undefined' && ['batchimagekit.com', 'www.batchimagekit.com'].includes(window.location.hostname);

export function parseConsent(raw: string | null, now = Date.now()): AnalyticsConsent {
  try { const value = JSON.parse(raw || 'null'); return value && ['granted', 'denied'].includes(value.choice) && typeof value.at === 'number' && value.at <= now && now - value.at < SIX_MONTHS ? value.choice : 'unknown'; }
  catch { return 'unknown'; }
}
export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return 'unknown';
  try { return parseConsent(window.localStorage.getItem(CONSENT_KEY)); } catch { return memoryConsent; }
}
function disableCollection() {
  if (typeof window === 'undefined') return;
  Object.assign(window, { ['ga-disable-' + settings.measurementId]: true });
  if (initialized) tagWindow().gtag?.('consent', 'update', { analytics_storage: 'denied' });
  lastPage = '';
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0];
    if (name === '_ga' || name.startsWith('_ga_')) {
      for (const domain of ['', '; domain=' + location.hostname, '; domain=.batchimagekit.com']) document.cookie = name + '=; Max-Age=0; path=/' + domain;
    }
  }
}
export function setAnalyticsConsent(choice: 'granted' | 'denied') {
  memoryConsent = choice;
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, at: Date.now() })); } catch { /* Session-only choice if storage is blocked. */ }
  if (choice !== 'granted') disableCollection();
  listeners.forEach(listener => listener());
}
export function subscribeAnalytics(listener: () => void) {
  listeners.add(listener);
  const sync = () => { if (getAnalyticsConsent() !== 'granted') disableCollection(); listener(); };
  window.addEventListener('storage', sync);
  return () => { listeners.delete(listener); window.removeEventListener('storage', sync); };
}
export function pageParameters(path: string) {
  const normalized = normalizePath(path);
  const safePath = pageForPath(normalized)?.path || (WORKSPACE_PATHS.includes(normalized) ? normalized : '/404');
  return { page_location: SITE_URL + safePath, page_title: metaForPath(safePath).title, page_path: safePath, site_language: localeForPath(safePath), tool_path: englishPath(safePath) };
}
export function safeReferrer(referrer: string) {
  try { const url = new URL(referrer); return ['https:', 'http:'].includes(url.protocol) ? url.origin + '/' : ''; } catch { return ''; }
}
function start() {
  if (!analyticsConfigured || !production() || getAnalyticsConsent() !== 'granted') return false;
  Object.assign(window, { ['ga-disable-' + settings.measurementId]: false });
  const w = tagWindow();
  w.dataLayer ||= [];
  w.gtag ||= function () { w.dataLayer!.push(arguments); };
  if (!initialized) {
    w.gtag('consent', 'default', { analytics_storage: 'denied' });
    w.gtag('js', new Date());
    w.gtag('config', settings.measurementId, {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_expires: SIX_MONTHS / 1000, cookie_update: false,
      page_location: pageParameters(location.pathname).page_location,
      page_referrer: safeReferrer(document.referrer),
    });
    const script = document.createElement('script'); script.id = 'batch-analytics'; script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + settings.measurementId;
    document.head.append(script); initialized = true;
  }
  w.gtag('consent', 'update', { analytics_storage: 'granted' });
  return true;
}
export function trackPage(path: string) {
  if (!start()) return;
  const params = pageParameters(path);
  if (lastPage === params.page_path) return;
  tagWindow().gtag?.('event', 'page_view', { ...params, page_referrer: lastPage ? SITE_URL + lastPage : safeReferrer(document.referrer), send_to: settings.measurementId });
  lastPage = params.page_path;
}
// Events accept no user-provided strings, file names, image contents or form values.
export function trackAction(event: 'batch_start' | 'asset_download') {
  if (!start()) return;
  tagWindow().gtag?.('event', event, { ...pageParameters(location.pathname), page_referrer: safeReferrer(document.referrer), send_to: settings.measurementId });
}
