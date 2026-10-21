import { useI18n } from '../../i18n/LocaleContext';
import { useEffect, useRef, useState } from 'react';
import { ScanTextIcon, SparklesIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { type HeroRegion } from '../../processing/heroRegions';
import { HeroRegionEditor } from './HeroRegionEditor';
import type { SteamSource } from '../../processing/steam';

export function HeroCleanup({ source, onApply, target = 'Library Hero' }: { source: SteamSource; onApply: (file: File) => Promise<void>; target?: string }) {
  const { tr } = useI18n();
  const [open, setOpen] = useState(false), [regions, setRegions] = useState<HeroRegion[]>([]);
  const [history, setHistory] = useState<HeroRegion[][]>([]), [status, setStatus] = useState('');
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<{ blob: Blob; url: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const active = useRef<AbortController | null>(null);
  const previewUrl = useRef<string | null>(null);
  const clearPreview = () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); previewUrl.current = null; setPreview(null); };
  const changeRegions = (next: HeroRegion[]) => { clearPreview(); setHistory((values) => [...values.slice(-49), regions]); setRegions(next); };
  const undo = () => { if (!history.length) return; clearPreview(); setRegions(history[history.length - 1]); setHistory((values) => values.slice(0, -1)); };
  const close = () => { active.current?.abort(); setOpen(false); setStatus(''); clearPreview(); };
  useEffect(() => () => { active.current?.abort(); if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, [source]);
  const detect = async () => {
    const controller = new AbortController(); active.current = controller;
    setStatus('Detecting text…'); setError(''); clearPreview();
    try {
      const { detectHeroText } = await import('../../processing/heroCleanup');
      const found = await detectHeroText(source, (message) => { if (!controller.signal.aborted) setStatus(message); }, controller.signal);
      if (controller.signal.aborted) return;
      setRegions(found); setHistory([]);
      setNotice(found.length ? 'Text detection complete. Move or resize the areas to cover the full lettering and any logo symbol.' : 'No text detected. Decorative lettering and symbols may be missed. Draw over anything you want to remove.');
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
  return <>
    <Button className="w-full" variant="secondary" onClick={() => { setOpen(true); setRegions([]); setHistory([]); setNotice(''); void detect(); }}><SparklesIcon className="h-4 w-4" />{tr("Remove text / logo")}</Button>
    <Dialog open={open} onClose={close} size="xl" title={tr(`Clean ${target}`)} description={tr(`Detect text, then adjust the areas to remove. Only ${target} will use the cleaned artwork.`)} footer={<div className="flex flex-wrap justify-end gap-2">
      <Button onClick={close}>{tr(status ? 'Cancel' : 'Close')}</Button>
      <Button variant="accent" disabled={!!status || !regions.length || !!preview} onClick={() => void repair()}><SparklesIcon className="h-4 w-4" />{tr("Remove selected areas")}</Button>
      {preview && <Button variant="primary" disabled={!!status} onClick={async () => { setStatus('Applying artwork…'); try { await onApply(new File([preview.blob], 'clean-artwork.png', { type: 'image/png' })); close(); } catch { setError('Could not apply this preview. Please retry.'); setStatus(''); } }}>{tr("Use for ")}{tr(target)}</Button>}
    </div>}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={!!status} onClick={() => void detect()}><ScanTextIcon className="h-4 w-4" />{tr("Detect text")}</Button>
          <Button size="sm" disabled={!!status} onClick={() => changeRegions([{ x: 0.32, y: 0.18, width: 0.36, height: 0.52 }])}>{tr("Mark center logo")}</Button>
          <Button size="sm" disabled={!!status || !history.length} onClick={undo}>{tr("Undo adjustment")}</Button>
          <Button size="sm" disabled={!!status || !regions.length} onClick={() => changeRegions([])}>{tr("Clear marks")}</Button>
          {preview && <><Button size="sm" disabled={!!status} onClick={() => setShowOriginal((value) => !value)}>{tr(showOriginal ? 'Show result' : 'Show original')}</Button><Button size="sm" disabled={!!status} onClick={clearPreview}>{tr("Edit areas")}</Button></>}
        </div>
        {status && <p role="status" className="text-sm text-muted">{tr(status)}</p>}
        {error && <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">{tr(error)}</p>}
        {notice && !preview && <p className="text-sm text-muted">{tr(notice)}</p>}
        {preview ? <div className="relative mx-auto w-full overflow-hidden rounded-lg bg-canvas" style={{ aspectRatio: `${source.width}/${source.height}`, maxWidth: `min(100%, ${460 * source.width / source.height}px)` }}>
          <img draggable={false} src={showOriginal ? source.url : preview.url} alt={tr(showOriginal ? 'Hero artwork before removal' : 'Cleaned hero preview')} className="absolute inset-0 h-full w-full" />
        </div> : <HeroRegionEditor imageUrl={source.url} width={source.width} height={source.height} regions={regions} disabled={!!status} onChange={changeRegions} />}
        <p className="text-xs leading-relaxed text-muted">{tr("Include the full glow and outline. Recognition may miss stylized text and symbols. AI reconstructs the selected area and may soften detail; review the preview before applying. Processing stays on your device; the repair model downloads on first use.")}</p>
      </div>
    </Dialog>
  </>;
}
