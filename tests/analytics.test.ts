import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseConsent, pageParameters, safeReferrer, trackAction, trackPage, CONSENT_KEY, setAnalyticsConsent } from '../src/analytics/client';
afterEach(() => vi.unstubAllGlobals());
describe('analytics privacy boundaries', () => {
  it('does not reuse prototype consent or expired choices', () => {
    expect(parseConsent(JSON.stringify({measurement:true,decided:true}))).toBe('unknown');
    expect(parseConsent(JSON.stringify({choice:'granted',at:0}),181*86400000)).toBe('unknown');
    expect(parseConsent('{')).toBe('unknown');
    expect(parseConsent(JSON.stringify({choice:'granted',at:100}),99)).toBe('unknown');
    expect(parseConsent(JSON.stringify({choice:'denied',at:100}),101)).toBe('denied');
  });
  it('only sends known page paths, without query strings, hashes or unknown user text', () => {
    expect(pageParameters('/es/herramientas/comprimir-imagenes?filename=private.jpg#secret').page_location).toBe('https://batchimagekit.com/es/herramientas/comprimir-imagenes');
    expect(pageParameters('/client-private-name').page_path).toBe('/404');
    expect(pageParameters('/es/app/resize/results').tool_path).toBe('/app/resize/results');
    expect(pageParameters('/es/').site_language).toBe('es');
  });
  it('strips private paths and queries from referrers', () => {
    expect(safeReferrer('https://google.com/search?q=private')).toBe('https://google.com/');
    expect(safeReferrer('file:///private.png')).toBe('');
  });
  it('blocks all requests before permission and after revocation, and deduplicates pageviews', () => {
    const store = new Map<string,string>();
    const localStorage = {getItem:(k:string)=>store.get(k)||null,setItem:(k:string,v:string)=>store.set(k,v)};
    const location = {hostname:'batchimagekit.com',pathname:'/'};
    const append = vi.fn();
    const win = {location,localStorage} as any;
    vi.stubGlobal('window',win); vi.stubGlobal('location',location); vi.stubGlobal('localStorage',localStorage);
    vi.stubGlobal('document',{cookie:'',referrer:'https://google.com/search?q=private',createElement:()=>({}),head:{append}});
    trackPage('/'); trackAction('asset_download'); expect(append).not.toHaveBeenCalled();
    store.set(CONSENT_KEY,JSON.stringify({choice:'granted',at:Date.now()}));
    trackPage('/'); trackPage('/'); trackPage('/es/');
    expect(append).toHaveBeenCalledTimes(1);
    expect(win.dataLayer.filter((x:any)=>x[0]==='event' && x[1]==='page_view')).toHaveLength(2);
    setAnalyticsConsent('denied');
    const length=win.dataLayer.length;
    trackPage('/tools'); trackAction('asset_download');
    expect(win.dataLayer).toHaveLength(length);
    expect(win['ga-disable-G-9KF9E5Y7MW']).toBe(true);
  });
});
