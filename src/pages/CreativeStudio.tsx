import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowRightIcon, DownloadIcon, ImagePlusIcon, ShieldCheckIcon, SparklesIcon, Trash2Icon } from 'lucide-react';
import { CREATIVE_TOOLS, type CreativeToolId } from '../data/creativeTools';
import { useI18n } from '../i18n/LocaleContext';
import { Link } from '../i18n/router';
import { Button } from '../components/ui/Button';
import { AdSlot } from '../components/ui/AdSlot';
import { downloadBlob } from '../processing/downloads';
import { LIMITS } from '../processing/formats';
import { canvasBlob, createStudioOutputs, loadStudioImage, renderStudio, screenshotDimensions, STUDIO_DEFAULTS, zipStudio, type StudioImage, type StudioOptions, type StudioOutput } from '../processing/creative';
import './CreativeStudio.css';
import { trackAction } from '../analytics/client';
import { BrandStudio } from './BrandStudio';

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId(); return <div className="studio-field"><label htmlFor={id}>{label}</label>{children(id)}</div>;
}
const positions = ['top-left', 'top-center', 'top-right', 'center-left', 'center-center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'];
const positionLabels = ['Top left', 'Top center', 'Top right', 'Center left', 'Center', 'Center right', 'Bottom left', 'Bottom center', 'Bottom right'];

export function CreativeStudio({ kind }: { kind: CreativeToolId }) {
  return kind === 'brand' ? <BrandStudio /> : <BasicStudio kind={kind} />;
}

function BasicStudio({ kind }: { kind: CreativeToolId }) {
  const { tr, locale } = useI18n();
  const tool = CREATIVE_TOOLS.find(t => t.id === kind)!;
  const single = kind === 'favicon' || kind === 'brand';
  const [images, setImages] = useState<StudioImage[]>([]);
  const [logo, setLogo] = useState<StudioImage>();
  const [selected, setSelected] = useState(0);
  const [options, setOptions] = useState<StudioOptions>(() => ({ ...STUDIO_DEFAULTS, name: tr('Your brand'), tagline: tr('Made with care.'), text: `© ${tr('Your brand')}` }));
  const [preview, setPreview] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [outputs, setOutputs] = useState<StudioOutput[]>([]);
  const [archive, setArchive] = useState<Blob>();
  const active = images[selected] || images[0];
  const files = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController>();
  const mounted = useRef(true);
  const retained = useRef({ images, logo }); retained.current = { images, logo };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; abort.current?.abort(); retained.current.images.forEach(i => URL.revokeObjectURL(i.url)); if (retained.current.logo) URL.revokeObjectURL(retained.current.logo.url); }; }, []);
  useEffect(() => { setOutputs([]); setArchive(undefined); }, [images, logo, options, locale]);
  useEffect(() => {
    let canceled = false, url = '';
    setPreview(''); setPreviewError(''); setPreviewing(!!active);
    if (!active) return;
    const timer = setTimeout(async () => {
      try {
        const c = await renderStudio(kind, active, options, logo, true);
        const blob = await canvasBlob(c); c.width = 1; c.height = 1;
        if (!canceled) { url = URL.createObjectURL(blob); setPreview(url); }
      } catch (e) { if (!canceled) setPreviewError(e instanceof Error ? e.message : 'Could not render the preview.'); }
      finally { if (!canceled) setPreviewing(false); }
    }, 180);
    return () => { canceled = true; clearTimeout(timer); if (url) URL.revokeObjectURL(url); };
  }, [kind, active, options, logo]);
  const update = <K extends keyof StudioOptions>(key: K, value: StudioOptions[K]) => setOptions(current => ({ ...current, [key]: value }));

  async function addFiles(list: File[], watermark = false) {
    if (busy || loading) return;
    setLoading(true); setError('');
    const loaded: StudioImage[] = [];
    try {
      const chosen = single || watermark ? list.slice(0, 1) : list;
      if (!single && !watermark && images.length + chosen.length > LIMITS.batchFiles) throw new Error('Add up to 100 images per batch.');
      if (chosen.reduce((n, file) => n + file.size, 0) + (!single && !watermark ? images.reduce((n, i) => n + i.file.size, 0) : 0) > LIMITS.batchBytes) throw new Error('The batch exceeds 300 MB. Try fewer images.');
      for (const file of chosen) loaded.push(await loadStudioImage(file));
      if (!mounted.current) { loaded.forEach(i => URL.revokeObjectURL(i.url)); return; }
      if (watermark) { if (logo) URL.revokeObjectURL(logo.url); setLogo(loaded[0]); }
      else if (single) { images.forEach(i => URL.revokeObjectURL(i.url)); setImages(loaded); setSelected(0); }
      else setImages(current => [...current, ...loaded]);
    } catch (e) { loaded.forEach(i => URL.revokeObjectURL(i.url)); if (mounted.current) setError(e instanceof Error ? e.message : 'Could not load the images.'); }
    finally { if (mounted.current) setLoading(false); }
  }
  async function sample() {
    try {
      if (kind === 'watermark') {
        const response = await fetch('/0f8e9c78-f8ec-47d6-858a-6c19973b8dfd.jpg');
        if (!response.ok) throw new Error('Could not load the example.');
        await addFiles([new File([await response.blob()], 'example-photo.jpg', { type: 'image/jpeg' })]);
      } else {
        const c = document.createElement('canvas'); c.width = kind === 'screenshot' ? 1100 : 512; c.height = kind === 'screenshot' ? 680 : 512;
        const ctx = c.getContext('2d')!;
        if (kind === 'screenshot') {
          ctx.fillStyle = '#fafaf7'; ctx.fillRect(0, 0, c.width, c.height); ctx.fillStyle = '#20251e'; ctx.font = 'bold 36px sans-serif'; ctx.fillText('Studio / Overview', 55, 75);
          ctx.fillStyle = '#d3f36a'; ctx.fillRect(55, 120, 990, 160); ctx.fillStyle = '#20251e'; ctx.font = '48px sans-serif'; ctx.fillText('A little more room for your ideas.', 85, 215);
          for (let i = 0; i < 3; i++) { ctx.fillStyle = '#eeece1'; ctx.fillRect(55 + i * 340, 320, 310, 280); ctx.fillStyle = '#747b6b'; ctx.fillRect(85 + i * 340, 355, 180, 14); ctx.fillStyle = '#ffffff'; ctx.fillRect(85 + i * 340, 400, 250, 160); }
        } else { ctx.fillStyle = '#20251e'; ctx.beginPath(); ctx.roundRect(40, 40, 432, 432, 95); ctx.fill(); ctx.fillStyle = '#d3f36a'; ctx.font = 'bold 280px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('B', 256, 270); }
        await addFiles([new File([await canvasBlob(c)], 'example.png', { type: 'image/png' })]);
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load the example.'); }
  }
  async function generate() {
    trackAction('batch_start');
    setBusy(true); setError(''); setOutputs([]); setArchive(undefined); setDone(0);
    const controller = new AbortController(); abort.current = controller;
    try {
      const generated = await createStudioOutputs(kind, images, options, logo, controller.signal, n => { if (mounted.current) setDone(n); }, locale);
      const zip = await zipStudio(generated, controller.signal);
      if (mounted.current && !controller.signal.aborted) { setOutputs(generated); setArchive(zip); }
    } catch (e) { if (mounted.current && !controller.signal.aborted) setError(e instanceof Error ? e.message : 'Export failed.'); }
    finally { if (mounted.current) setBusy(false); }
  }
  const textField = (label: string, key: 'name' | 'tagline' | 'text', limit = 60) => <Field label={tr(label)}>{id => <input id={id} maxLength={limit} value={options[key]} onChange={e => update(key, e.target.value)} />}</Field>;
  const colorField = (label: string, key: 'background' | 'secondary' | 'accent' | 'color') => <Field label={tr(label)}>{id => <div className="studio-color"><input id={id} type="color" value={options[key]} onChange={e => update(key, e.target.value)} /><span>{options[key].toUpperCase()}</span></div>}</Field>;
  const range = (label: string, key: 'padding' | 'opacity' | 'size' | 'margin' | 'rounded' | 'quality', min: number, max: number, unit = '') => <Field label={`${tr(label)} · ${options[key]}${unit}`}>{id => <input id={id} type="range" min={min} max={max} value={options[key]} onChange={e => update(key, Number(e.target.value))} />}</Field>;
  const toggle = (label: string, key: 'transparent' | 'frame' | 'shadow' | 'gradient') => <label className="studio-toggle"><input type="checkbox" checked={options[key]} onChange={e => update(key, e.target.checked)} />{tr(label)}</label>;
  const dims = active && (kind === 'screenshot' ? screenshotDimensions(active.width, active.height, options) : { width: active.width, height: active.height });

  return <div className="mx-auto max-w-content px-5 pb-20 sm:px-8">
    <header className="max-w-3xl py-12 sm:py-16"><Link to="/tools" className="text-sm text-muted hover:text-ink">{tr('All tools')} / {tr(tool.name)}</Link><h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{tr(tool.name)}</h1><p className="mt-4 text-xl font-medium">{tr(tool.intro)}</p><p className="mt-3 max-w-2xl leading-relaxed text-muted">{tr(tool.description)}</p><p className="mt-5 flex items-center gap-2 text-xs font-medium text-muted"><ShieldCheckIcon className="h-4 w-4" />{tr('Free. No account. Your images stay on your device.')}</p></header>
    <div className="studio-shell">
      <aside className="studio-controls">
        <h2 className="text-lg font-semibold">{tr('Make it yours')}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">{tr(single ? 'One logo · JPG, PNG, WebP or AVIF · up to 40 MB' : 'Up to 100 still images · 40 MB per file · 300 MB per batch')}</p>
        <input ref={files} className="sr-only" tabIndex={-1} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={!single} onChange={e => { const list = Array.from(e.target.files || []); e.target.value = ''; if (list.length) void addFiles(list); }} aria-label={tr('Choose source images')} />
        <div className="mt-5 grid gap-2"><Button variant="primary" disabled={busy || loading} onClick={() => files.current?.click()}><ImagePlusIcon className="h-4 w-4" />{tr(single ? 'Choose logo' : 'Add images')}</Button><Button variant="ghost" disabled={busy || loading} onClick={() => void sample()}><SparklesIcon className="h-4 w-4" />{tr('Try an example')}</Button></div>
        <fieldset disabled={busy || loading} className="mt-6 min-w-0 space-y-5">
          <legend className="sr-only">{tr('Output settings')}</legend>
          {single && <>{textField('Brand name', 'name', 48)}{kind === 'brand' && textField('Tagline', 'tagline', 80)}{colorField('Background', 'background')}{range('Logo padding', 'padding', 0, 160, ' / 512')}{kind === 'favicon' && toggle('Transparent favicon background', 'transparent')}</>}
          {kind === 'brand' && <>{colorField('Dark background', 'secondary')}{colorField('Accent color', 'accent')}</>}
          {(kind === 'brand' || kind === 'watermark') && <Field label={tr('Font style')}>{id => <select id={id} value={options.font} onChange={e => update('font', e.target.value as StudioOptions['font'])}><option value="sans-serif">{tr('Sans serif')}</option><option value="serif">{tr('Serif')}</option><option value="monospace">{tr('Monospace')}</option></select>}</Field>}
          {kind === 'watermark' && <><Field label={tr('Watermark type')}>{id => <select id={id} value={options.markType} onChange={e => update('markType', e.target.value as 'text' | 'logo')}><option value="text">{tr('Text')}</option><option value="logo">{tr('Logo')}</option></select>}</Field>{options.markType === 'text' ? <>{textField('Watermark text', 'text')}{colorField('Text color', 'color')}</> : <Field label={tr('Watermark logo')}>{id => <><input id={id} type="file" accept="image/png,image/webp,image/jpeg,image/avif" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void addFiles([file], true); }} />{logo && <p className="truncate text-xs">{logo.name}</p>}</>}</Field>}{range('Relative width', 'size', 5, 50, '%')}{range('Opacity', 'opacity', 5, 100, '%')}{range('Margin', 'margin', 0, 15, '%')}<Field label={tr('Position')}>{id => <select id={id} value={options.position} onChange={e => update('position', e.target.value)}>{positions.map((position, i) => <option key={position} value={position}>{tr(positionLabels[i])}</option>)}</select>}</Field>{options.format === 'jpg' && colorField('Background', 'background')}</>}
          {kind === 'screenshot' && <>{colorField('Background', 'background')}{toggle('Gradient background', 'gradient')}{options.gradient && colorField('Accent color', 'accent')}{range('Padding', 'padding', 16, 160, ' px')}{range('Corner radius', 'rounded', 0, 48, ' px')}{toggle('Browser frame', 'frame')}{toggle('Soft shadow', 'shadow')}</>}
          {!single && <><Field label={tr('Output format')}>{id => <select id={id} value={options.format} onChange={e => update('format', e.target.value as StudioOptions['format'])}><option value="png">PNG</option><option value="jpg">JPG</option><option value="webp">WebP</option></select>}</Field>{options.format !== 'png' && range('Quality', 'quality', 40, 100, '%')}</>}
        </fieldset>
      </aside>
      <section className="studio-main" aria-label={tr('Preview and downloads')}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{tr('Live preview')}</h2>{active && <span className="text-xs text-muted">{kind === 'favicon' ? '512 × 512' : kind === 'brand' ? '1600 × 1000' : `${dims?.width} × ${dims?.height}`} px</span>}</div>
        <div className="studio-preview" aria-busy={previewing}>
          {preview ? <img src={preview} alt={tr('Preview of your exported image')} /> : <div className="p-8 text-center"><ImagePlusIcon className="mx-auto mb-5 h-10 w-10 text-muted" /><p className="font-medium">{tr(previewError || (previewing ? 'Updating preview…' : 'Start with an image. Make it your own.'))}</p><p className="mt-2 text-sm text-muted">{!active && tr('Choose a file or try the example to explore the controls.')}</p></div>}
        </div>
        {kind === 'favicon' && preview && <div className="mt-5 flex flex-wrap items-center gap-5 rounded-xl border border-line bg-white p-4"><div className="flex items-center gap-2 rounded-t-lg border border-line px-4 py-2 text-xs"><img src={preview} width="16" height="16" alt="" />{options.name || tr('Your brand')}</div><img src={preview} width="32" height="32" alt={tr('32 pixel icon preview')} /><img src={preview} width="48" height="48" alt={tr('48 pixel icon preview')} /><p className="text-xs text-muted">{tr('Check readability at actual icon sizes.')}</p></div>}
        {!!images.length && <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{images.map((image, i) => <div className="relative shrink-0" key={image.id}><button disabled={busy} type="button" onClick={() => setSelected(i)} aria-pressed={active?.id === image.id} aria-label={image.name} className={`h-20 w-24 overflow-hidden rounded-lg border-2 bg-white p-1 ${active?.id === image.id ? 'border-ink' : 'border-line'}`}><img src={image.url} alt="" className="h-full w-full object-contain" /></button><button type="button" disabled={busy || loading} onClick={() => { URL.revokeObjectURL(image.url); setImages(current => current.filter(item => item.id !== image.id)); setSelected(0); }} aria-label={`${tr('Remove')} ${image.name}`} className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-white p-1.5 text-muted hover:text-danger"><Trash2Icon className="h-3 w-3" /></button></div>)}</div>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-danger-soft p-4 text-sm text-danger">{tr(error)}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-3"><Button size="lg" variant="accent" disabled={!images.length || loading || !!previewError} loading={busy} onClick={() => void generate()}><SparklesIcon className="h-4 w-4" />{tr('Generate files')}</Button>{busy && <Button onClick={() => abort.current?.abort()}>{tr('Cancel')}</Button>}<p role="status" className="text-xs text-muted">{busy ? `${tr('Processing')} ${done} / ${single ? 1 : images.length}` : loading ? tr('Loading images…') : `${images.length} ${tr(images.length === 1 ? 'image selected' : 'images selected')}`}</p></div>
        {archive && <div className="mt-6 rounded-xl border border-line bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-semibold">{tr('Your files are ready')}</h3><p className="mt-1 text-xs text-muted">{outputs.length} {tr(outputs.length === 1 ? 'file' : 'files')} · {(archive.size / 1000).toFixed(1)} KB</p></div><Button variant="primary" onClick={() => downloadBlob(archive, `${tool.slug}.zip`)}><DownloadIcon className="h-4 w-4" />{tr('Download ZIP')}</Button></div><details className="mt-4 text-sm"><summary className="cursor-pointer">{tr('Download individual files')}</summary><ul className="mt-3 max-h-64 space-y-1 overflow-auto">{outputs.map(output => <li key={output.name}><button className="max-w-full truncate py-2 text-left underline underline-offset-4" onClick={() => downloadBlob(output.blob, output.name)}>{output.name} · {(output.blob.size / 1000).toFixed(1)} KB</button></li>)}</ul></details></div>}
      </section>
    </div>
    <section className="py-14"><h2 className="text-2xl font-semibold">{tr('From image to finished kit')}</h2><ol className="mt-6 grid gap-4 md:grid-cols-3">{tool.steps.map((step, i) => <li key={step} className="rounded-xl border border-line bg-white p-6"><span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-lime text-sm font-semibold">{i + 1}</span><p className="text-sm leading-relaxed">{tr(step)}</p></li>)}</ol><p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">{tr(tool.note)}</p>{kind === 'favicon' && <p className="mt-3 text-xs text-muted"><a className="underline" href="https://developers.google.com/search/docs/appearance/favicon-in-search" target="_blank" rel="noreferrer">{tr('Google favicon guidelines')}</a> · <a className="underline" href="https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons" target="_blank" rel="noreferrer">{tr('Web app icon documentation')}</a></p>}</section>
    <AdSlot placement="directory" className="my-8" />
    <section><h2 className="text-xl font-semibold">{tr('Keep creating')}</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{CREATIVE_TOOLS.filter(t => t.id !== kind).map(t => <Link key={t.id} to={`/tools/${t.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-5 text-sm font-medium hover:border-ink">{tr(t.name)}<ArrowRightIcon className="h-4 w-4 shrink-0" /></Link>)}</div></section>
  </div>;
}
