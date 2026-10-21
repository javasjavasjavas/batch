import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { AD_FORMATS, AD_SIZE_CSS, advertising, advertisingReady, isAdHost, isAdRoute, validAdUnit, type AdPlacement } from '../../advertising/config';
import { loadAdSense } from '../../advertising/loader';

interface AdSlotProps { placement: AdPlacement; className?: string; }

/** Preview locally with ?ads=preview; never requests ads on development hosts. */
export function AdSlot(props: AdSlotProps) {
  const { pathname, search } = useLocation();
  const preview = import.meta.env.DEV && new URLSearchParams(search).get('ads') === 'preview';
  const enabled = advertisingReady && validAdUnit(advertising.units[props.placement]) && isAdRoute(pathname);
  if (!preview && !enabled) return null;
  return <AdUnit key={`${pathname}:${props.placement}`} {...props} preview={preview} />;
}

function AdUnit({ placement, className, preview }: AdSlotProps & { preview: boolean }) {
  const node = useRef<HTMLModElement>(null);
  const shell = useRef<HTMLElement>(null);
  const requested = useRef(false);
  const [failed, setFailed] = useState(false);
  const [size, setSize] = useState('');
  const format = AD_FORMATS[placement];

  useEffect(() => {
    const element = node.current;
    const container = shell.current;
    if (!element || !container) return;
    if (!preview && !isAdHost(window.location.hostname)) { setFailed(true); return; }
    let cancelled = false;
    let nearViewport = false;
    const check = () => {
      if (cancelled) return;
      const rect = element.getBoundingClientRect();
      if (preview) { setSize(`${Math.round(rect.width)} × ${Math.round(rect.height)}`); return; }
      if (!nearViewport || requested.current || rect.width <= 0 || rect.height <= 0
        || rect.width > container.getBoundingClientRect().width) return;
      void loadAdSense().then(() => {
        const currentRect = element.getBoundingClientRect();
        if (cancelled || requested.current || !element.isConnected || !nearViewport
          || currentRect.width <= 0 || currentRect.height <= 0 || currentRect.width > container.getBoundingClientRect().width) return;
        requested.current = true;
        try { (window.adsbygoogle ||= []).push({}); } catch { setFailed(true); }
      }).catch(() => { if (!cancelled) setFailed(true); });
    };
    const resize = new ResizeObserver(check);
    resize.observe(element);
    resize.observe(container);
    const intersection = new IntersectionObserver(([entry]) => { nearViewport = entry.isIntersecting; check(); }, { rootMargin: '200px' });
    intersection.observe(container);
    check();
    return () => { cancelled = true; resize.disconnect(); intersection.disconnect(); };
  }, [preview, placement]);

  if (failed) return null;
  return <aside ref={shell} aria-label="Advertisements" data-ad-placement={placement} className={twMerge('batch-ad-space', className)}>
    <style>{AD_SIZE_CSS}</style>
    <span className="text-[11px] text-muted">Advertisements</span>
    <ins ref={node} className={`${preview ? 'batch-ad-preview' : 'adsbygoogle'} batch-ad-${format}`}
      style={{ display: 'block', textDecoration: 'none' }}
      data-ad-client={preview ? undefined : advertising.publisherId}
      data-ad-slot={preview ? undefined : advertising.units[placement]}>
      {preview && <span>{placement}<br /><strong>{size}</strong><small>Layout preview · no live ads</small></span>}
    </ins>
  </aside>;
}
