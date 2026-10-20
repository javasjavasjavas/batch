import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ScanTextIcon, SparklesIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { normalizeRegion, type HeroRegion } from '../../processing/heroRegions';
import type { SteamSource } from '../../processing/steam';

export function HeroCleanup({ source, onApply }: { source: SteamSource; onApply: (file: File) => Promise<void> }) {
  const [open, setOpen] = useState(false), [regions, setRegions] = useState<HeroRegion[]>([]);
  const [draft, setDraft] = useState<HeroRegion | null>(null), [status, setStatus] = useState('');
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<{ blob: Blob; url: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const active = useRef<AbortController | null>(null);
  const previewUrl = useRef<string | null>(null);
  const clearPreview = () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); previewUrl.current = null; setPreview(null); };
  const close = () => { active.current?.abort(); setOpen(false); setStatus(''); clearPreview(); };
  useEffect(() => () => { active.current?.abort(); if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, [source]);
  const detect = async () => {
    const controller = new AbortController(); active.current = controller;
    setStatus('Detecting text…'); setError(''); clearPreview();
    try {
      const { detectHeroText } = await import('../../processing/heroCleanup');
      const found = await detectHeroText(source, (message) => { if (!controller.signal.aborted) setStatus(message); }, controller.signal);
      if (controller.signal.aborted) return;
      setRegions(found);
      setNotice(found.length ? `Found ${found.length} possible text regions. Review the marks and add any logo symbol.` : 'No text detected. Decorative lettering and symbols may be missed. Draw over anything you want to remove.');
    } catch (cause) { if (!controller.signal.aborted) setError('Text detection was unavailable. You can still draw the areas to remove.'); }
    finally { if (!controller.signal.aborted) setStatus(''); }
  };
  const repair = async () => {
    const controller = new AbortController(); active.current = controller;
    setStatus('Preparing image repair…'); setError(''); clearPreview();
    try {
      const { repairHero } = await import('../../processing/heroCleanup');
      const blob = await repairHero(source, regions, (message) => { if (!controller.signal.aborted) setStatus(message); }, controller.signal);
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob); previewUrl.current = url; setPreview({ blob, url }); setShowOriginal(false);
    } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not repair the selected area.'); }
    finally { if (!controller.signal.aborted) setStatus(''); }
  };
  const point = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) };
  };
  return <>
    <Button className="w-full" variant="secondary" onClick={() => { setOpen(true); setRegions([]); setNotice(''); void detect(); }}><SparklesIcon className="h-4 w-4" />Remove text / logo</Button>
    <Dialog open={open} onClose={close} size="xl" title="Clean Library Hero" description="Detect text, then mark any remaining lettering or logo. Only the Library Hero will use the cleaned artwork." footer={<div className="flex flex-wrap justify-end gap-2">
      <Button onClick={close}>{status ? 'Cancel' : 'Close'}</Button>
      <Button variant="accent" disabled={!!status || !regions.length || !!preview} onClick={() => void repair()}><SparklesIcon className="h-4 w-4" />Remove selected areas</Button>
      {preview && <Button variant="primary" disabled={!!status} onClick={async () => { setStatus('Applying hero…'); try { await onApply(new File([preview.blob], 'library-hero-clean.png', { type: 'image/png' })); close(); } catch { setError('Could not apply this preview. Please retry.'); setStatus(''); } }}>Use for Library Hero</Button>}
    </div>}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={!!status} onClick={() => void detect()}><ScanTextIcon className="h-4 w-4" />Detect text</Button>
          <Button size="sm" disabled={!!status} onClick={() => { clearPreview(); setRegions([{ x: 0.32, y: 0.18, width: 0.36, height: 0.52 }]); }}>Mark center logo</Button>
          <Button size="sm" disabled={!!status || !regions.length} onClick={() => { clearPreview(); setRegions((r) => r.slice(0, -1)); }}>Undo mark</Button>
          <Button size="sm" disabled={!!status} onClick={() => { clearPreview(); setRegions([]); }}>Clear marks</Button>
          {preview && <Button size="sm" onClick={() => setShowOriginal((value) => !value)}>{showOriginal ? 'Show result' : 'Show original'}</Button>}
        </div>
        {status && <p role="status" className="text-sm text-muted">{status}</p>}
        {error && <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">{error}</p>}
        {notice && !preview && <p className="text-sm text-muted">{notice}</p>}
        <div role="img" aria-label="Hero removal selection. Drag over text or logo to mark it." className={`relative mx-auto w-full touch-none overflow-hidden rounded-lg bg-canvas ${!status && !preview ? 'cursor-crosshair' : ''}`} style={{ aspectRatio: `${source.width}/${source.height}`, maxWidth: `min(100%, ${460 * source.width / source.height}px)` }}
          onPointerDown={(event) => { if (status || preview || regions.length >= 24) return; origin.current = point(event); event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerMove={(event) => { if (!origin.current) return; const p = point(event); setDraft(normalizeRegion(origin.current.x, origin.current.y, p.x, p.y)); }}
          onPointerUp={(event) => { if (!origin.current) return; const p = point(event), r = normalizeRegion(origin.current.x, origin.current.y, p.x, p.y); origin.current = null; setDraft(null); if (r.width > 0.005 && r.height > 0.005) setRegions((values) => [...values, r]); }} onPointerCancel={() => { origin.current = null; setDraft(null); }}>
          <img draggable={false} src={preview && !showOriginal ? preview.url : source.url} alt={preview && !showOriginal ? 'Cleaned hero preview' : 'Hero artwork before removal'} className="absolute inset-0 h-full w-full select-none" />
          {!preview && [...regions, ...(draft ? [draft] : [])].map((r, i) => <div key={i} className="pointer-events-none absolute border-2 border-lime bg-lime/35" style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.width * 100}%`, height: `${r.height * 100}%` }} />)}
        </div>
        <p className="text-xs leading-relaxed text-muted">Drag to mark a rectangle, or use the buttons above. Include the full glow and outline. Recognition may miss stylized text and symbols. AI reconstructs the selected area and may soften detail; review the preview before applying. Processing stays on your device; the repair model downloads on first use.</p>
      </div>
    </Dialog>
  </>;
}
