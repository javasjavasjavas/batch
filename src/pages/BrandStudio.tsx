import { PreviewDropZone } from '../components/ui/PreviewDropZone';
import { ColorPicker } from '../components/ui/ColorPicker';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowRightIcon, DownloadIcon, ImagePlusIcon, SparklesIcon } from 'lucide-react';
import { useI18n } from '../i18n/LocaleContext';
import { Link } from '../i18n/router';
import { Button } from '../components/ui/Button';
import { AdSlot } from '../components/ui/AdSlot';
import { canvasBlob, loadStudioImage, zipStudio, type StudioImage, type StudioOutput } from '../processing/creative';
import { BRAND_FONTS, brandFont, contrast, type BrandColor } from '../processing/brandAnalysis';
import { BRAND_VIEWS, brandRoles, exportBrand, prepareBrand, renderBrand, type BrandOptions, type BrandView, type PreparedBrand } from '../processing/brand';
import { brandCopy, type BrandUseCase } from '../processing/brandLayouts';
import { downloadBlob } from '../processing/downloads';
import { trackAction } from '../analytics/client';
import './CreativeStudio.css';
import './BrandStudio.css';

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) { const id = useId(); return <div className="studio-field"><label htmlFor={id}>{label}</label>{children(id)}</div>; }

export function BrandStudio() {
  const { tr, locale } = useI18n();
  const [source, setSource] = useState<StudioImage>();
  const [prepared, setPrepared] = useState<PreparedBrand>();
  const [options, setOptions] = useState<BrandOptions>(() => ({ name: '', tagline: '', colors: [], fontId: 'space', removeBackground: true, padding: 35, includeFont: true, headline: '', body: '', action: '', useCase: 'studio', printStyle: 'auto' }));
  const [view, setView] = useState<BrandView>('board');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');
  const [renderError, setRenderError] = useState('');
  const [progress, setProgress] = useState(0);
  const [outputs, setOutputs] = useState<StudioOutput[]>([]);
  const [archive, setArchive] = useState<Blob>();
  const input = useRef<HTMLInputElement>(null), controller = useRef<AbortController>();
  const alive = useRef(true), retained = useRef<StudioImage>(); retained.current = source;
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort(); if (retained.current) URL.revokeObjectURL(retained.current.url); }; }, []);
  useEffect(() => { setArchive(undefined); setOutputs([]); }, [prepared, options, locale]);
  useEffect(() => {
    let canceled = false, url = '';
    setPreview(''); setRenderError(''); setRendering(!!prepared);
    if (!prepared) return;
    const timer = setTimeout(async () => {
      try { const canvas = await renderBrand(prepared, options, view, locale); const blob = await canvasBlob(canvas); canvas.width = 1; if (!canceled) { url = URL.createObjectURL(blob); setPreview(url); } }
      catch (e) { if (!canceled) setRenderError(e instanceof Error ? e.message : 'Could not render the preview.'); }
      finally { if (!canceled) setRendering(false); }
    }, 160);
    return () => { canceled = true; clearTimeout(timer); if (url) URL.revokeObjectURL(url); };
  }, [prepared, options, view, locale]);
  const update = <K extends keyof BrandOptions>(key: K, value: BrandOptions[K]) => setOptions(o => ({ ...o, [key]: value }));
  async function addLogo(file: File, sampleName?: string) {
    if (loading || busy) return;
    setLoading(true); setError(''); let loaded: StudioImage | undefined;
    try {
      loaded = await loadStudioImage(file); const next = await prepareBrand(loaded);
      if (!alive.current) { URL.revokeObjectURL(loaded.url); return; }
      if (source) URL.revokeObjectURL(source.url);
      setSource(loaded); setPrepared(next); setOptions(o => ({ ...o, name: sampleName || o.name, colors: next.analysis.colors, fontId: next.analysis.fontId }));
    } catch (e) { if (loaded) URL.revokeObjectURL(loaded.url); if (alive.current) setError(e instanceof Error ? e.message : 'Could not load the images.'); }
    finally { if (alive.current) setLoading(false); }
  }
  async function demo(colorful: boolean) {
    const c = document.createElement('canvas'); c.width = 900; c.height = 600; const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 900, 600);
    if (colorful) { ctx.fillStyle = '#ef663e'; ctx.beginPath(); ctx.arc(450, 230, 120, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#6657c7'; ctx.beginPath(); ctx.arc(515, 230, 65, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#262345'; ctx.font = 'bold 68px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ORBIT', 450, 445); }
    else { ctx.fillStyle = '#131313'; ctx.fillRect(140, 220, 125, 125); ctx.font = 'bold 70px monospace'; ctx.fillText('NORTH', 305, 280); ctx.fillText('STUDIO', 305, 350); }
    await addLogo(new File([await canvasBlob(c)], colorful ? 'orbit.png' : 'north.png', { type: 'image/png' }), colorful ? 'Orbit' : 'North Studio');
  }
  function changeColor(index: number, value: string) { update('colors', options.colors.map((c, i) => i === index ? { hex: value, origin: 'custom' } : c)); }
  async function generate() {
    if (!prepared) return; setBusy(true); setError(''); setProgress(0); setArchive(undefined); setOutputs([]); trackAction('batch_start');
    const abort = new AbortController(); controller.current = abort;
    try { const files = await exportBrand(prepared, options, abort.signal, n => { if (alive.current) setProgress(n); }, locale); const zip = await zipStudio(files, abort.signal); if (alive.current && !abort.signal.aborted) { setOutputs(files); setArchive(zip); } }
    catch (e) { if (alive.current && !abort.signal.aborted) setError(e instanceof Error ? e.message : 'Export failed.'); }
    finally { if (alive.current) setBusy(false); }
  }
  const font = brandFont(options.fontId), roles = options.colors.length ? brandRoles(options.colors) : null;
  const ratio = roles ? contrast(roles.ink, roles.paper) : 0;
  const copy = brandCopy(options, locale);
  const originLabel = (color: BrandColor) => tr(color.origin === 'image' ? 'From your logo' : color.origin === 'suggested' ? 'Suggested companion' : 'Edited color');
  return <div className="mx-auto max-w-content px-5 pb-20 sm:px-8">
    <header className="max-w-3xl py-12 sm:py-16"><Link to="/tools" className="text-sm text-muted">{tr('All tools')} / {tr('Brand Kit Generator')}</Link><h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{tr('Your logo. A whole brand world.')}</h1><p className="mt-4 text-lg leading-relaxed text-muted">{tr('Discover a palette from your logo, a Google Fonts pairing and a set of branded applications. Everything is generated locally from your artwork.')}</p><p className="mt-4 text-xs font-medium text-muted">{tr('Free. No account. Your images stay on your device.')}</p></header>
    <div className="studio-shell brand-shell">
      <aside className="studio-controls">
        <h2 className="text-lg font-semibold">{tr('Make it yours')}</h2><p className="mt-2 text-xs leading-relaxed text-muted">{tr('One logo · JPG, PNG, WebP or AVIF · up to 40 MB')}</p>
        <input ref={input} className="sr-only" tabIndex={-1} type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-label={tr('Choose logo')} onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void addLogo(file); }} />
        <Button variant="primary" className="mt-5 w-full" disabled={loading || busy} onClick={() => input.current?.click()}><ImagePlusIcon className="h-4 w-4" />{tr(source ? 'Replace logo' : 'Choose logo')}</Button>
        <div className="mt-2 flex flex-wrap gap-2"><Button size="sm" disabled={loading || busy} onClick={() => void demo(false)}>{tr('Monochrome example')}</Button><Button size="sm" disabled={loading || busy} onClick={() => void demo(true)}>{tr('Color example')}</Button></div>
        {source && <div className="brand-source mt-5"><img src={source.url} alt={tr('Original logo')} /><span className="truncate text-xs text-muted">{source.name}</span></div>}
        <fieldset className="mt-6 min-w-0 space-y-5" disabled={busy || loading || !prepared}><legend className="sr-only">{tr('Brand settings')}</legend>
          <Field label={tr('Brand name')}>{id => <input id={id} maxLength={48} placeholder={tr('Your brand name')} value={options.name} onChange={e => update('name', e.target.value)} />}</Field>
          <Field label={tr('Tagline')}>{id => <input id={id} maxLength={80} placeholder={tr('Optional')} value={options.tagline} onChange={e => update('tagline', e.target.value)} />}</Field>
          <details className="brand-copy"><summary>{tr('Headlines & use cases')}</summary><div className="mt-4 space-y-4">
            <Field label={tr('Use case')}>{id => <select id={id} value={options.useCase} onChange={e => update('useCase', e.target.value as BrandUseCase)}><option value="studio">{tr('Creative studio')}</option><option value="shop">{tr('Shop & products')}</option><option value="cafe">{tr('Café & hospitality')}</option></select>}</Field>
            <Field label={tr('Headline')}>{id => <input id={id} maxLength={80} placeholder={copy.headline} value={options.headline} onChange={e => update('headline', e.target.value)} />}</Field>
            <Field label={tr('Body text')}>{id => <textarea id={id} maxLength={200} rows={3} placeholder={copy.body} value={options.body} onChange={e => update('body', e.target.value)} />}</Field>
            <Field label={tr('Button text')}>{id => <input id={id} maxLength={35} placeholder={copy.action} value={options.action} onChange={e => update('action', e.target.value)} />}</Field>
            <p className="text-xs leading-relaxed text-muted">{tr('Empty fields use editable sample copy for the selected use case. Your own text is kept when you change language.')}</p>
          </div></details>
          <div className="border-t border-line pt-5"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{tr('Your palette')}</h3><select aria-label={tr('Number of colors')} value={options.colors.length || 4} onChange={e => { const count = Number(e.target.value); update('colors', count === 3 ? options.colors.slice(0, 3) : [...options.colors, prepared!.analysis.colors[3]]); }} className="rounded border border-line bg-white p-1 text-xs"><option value="3">3</option><option value="4">4</option></select></div>
            <div className="mt-3 space-y-3">{options.colors.map((color, i) => <ColorPicker key={i} label={`${tr('Color')} ${i + 1}`} value={color.hex} onChange={hex => changeColor(i, hex)} description={originLabel(color)} swatches={options.colors.map(c => c.hex)} />)}</div>
            <Button size="sm" variant="ghost" className="mt-3" onClick={() => { if (prepared) { update('colors', prepared.analysis.colors); update('fontId', prepared.analysis.fontId); } }}>{tr('Restore suggestions')}</Button>
            {roles && <p className="mt-2 text-xs leading-relaxed text-muted">{tr('Light / dark contrast')}: {ratio.toFixed(2)}:1 · {tr(ratio >= 4.5 ? 'Suitable for normal text at these two colors.' : 'Use these colors decoratively; choose a stronger contrast for small text.')}</p>}
          </div>
          <div className="border-t border-line pt-5"><Field label={tr('Google Fonts pairing')}>{id => <select id={id} value={options.fontId} onChange={e => update('fontId', e.target.value)}>{BRAND_FONTS.map(f => <option key={f.id} value={f.id}>{f.name}{prepared?.analysis.fontId === f.id ? ` · ${tr('Suggested')}` : ''}</option>)}</select>}</Field>
            <p className="mt-3 text-xs leading-relaxed text-muted">{tr(options.fontId === prepared?.analysis.fontId ? prepared.analysis.reason : 'You chose this font instead of the automatic suggestion.')}</p><p className="mt-2 text-[11px] leading-relaxed text-muted">{tr('A visual pairing suggestion, not identification of the original typeface.')}</p>
            <a href={font.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs underline underline-offset-4">{tr('View on Google Fonts')} ↗</a>
            <label className="studio-toggle mt-4"><input type="checkbox" checked={options.includeFont} onChange={e => update('includeFont', e.target.checked)} />{tr('Include font files and license')}</label>
          </div>
          <div className="space-y-3 border-t border-line pt-5"><label className="studio-toggle"><input type="checkbox" checked={options.removeBackground} onChange={e => update('removeBackground', e.target.checked)} />{tr('Clean plain edge background')}</label><p className="text-xs leading-relaxed text-muted">{tr(prepared?.analysis.removed ? 'A flat background was detected. Turn this off to keep the original artwork.' : 'No plain edge background detected. Transparent artwork is preserved.')}</p>
          <Field label={`${tr('Logo spacing')} · ${options.padding}`} >{id => <input id={id} type="range" min="0" max="90" value={options.padding} onChange={e => update('padding', Number(e.target.value))} />}</Field></div>
          <Field label={tr('Mug & fabric ink')}>{id => <select id={id} value={options.printStyle} onChange={e => update('printStyle', e.target.value as BrandOptions['printStyle'])}><option value="auto">{tr('Automatic contrast')}</option><option value="original">{tr('Original colors')}</option><option value="mono">{tr('One brand ink')}</option></select>}</Field>
          <p className="text-xs leading-relaxed text-muted">{tr('Automatic mode uses a dark ink variant for very light logos on white products.')}</p>
        </fieldset>
      </aside>
      <section className="studio-main brand-main" aria-label={tr('Preview and downloads')}>
        <div className="brand-tabs" role="group" aria-label={tr('Brand applications')}>{BRAND_VIEWS.map(item => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}>{tr(item.label)}</button>)}</div>
        <PreviewDropZone className="brand-preview" onFiles={list => { if (list[0]) void addLogo(list[0]); }} onChoose={() => input.current?.click()} disabled={busy || loading} busy={rendering || loading} single hasImage={!!source}>{preview ? <img src={preview} draggable={false} alt={tr(BRAND_VIEWS.find(v => v.id === view)!.label)} /> : <div className="max-w-md p-5 text-center"><SparklesIcon className="mx-auto mb-5 h-10 w-10" /><h2 className="text-xl font-medium">{tr(loading ? 'Reading your logo…' : rendering ? 'Updating preview…' : renderError || 'Start with a logo, not a template.')}</h2><p className="mt-3 text-sm leading-relaxed text-muted">{!prepared && tr('Colors, typography suggestions, layouts and patterns adapt to the image you choose. Try both examples to see the difference.')}</p></div>}</PreviewDropZone>
        {prepared && <p className="mt-3 text-xs leading-relaxed text-muted">{tr('Photorealistic presentation mockups with AI-generated base scenes. Your logo is applied locally. Review the result before production.')}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-danger-soft p-4 text-sm text-danger">{tr(error)}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-3"><Button variant="accent" size="lg" disabled={!prepared || loading || !!renderError} loading={busy} onClick={() => void generate()}><SparklesIcon className="h-4 w-4" />{tr('Generate brand kit')}</Button>{busy && <Button onClick={() => controller.current?.abort()}>{tr('Cancel')}</Button>}<p className="text-xs text-muted" role="status">{busy ? `${tr('Preparing applications')} ${progress} / ${BRAND_VIEWS.length}` : prepared ? tr('Your logo stays on your device. Fonts are served locally.') : tr('Upload a logo to get started.')}</p></div>
        {archive && <div className="mt-6 rounded-xl border border-line bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-semibold">{tr('Your brand kit is ready')}</h3><p className="mt-1 text-xs text-muted">{outputs.length} {tr('files')} · {(archive.size / 1000000).toFixed(1)} MB</p></div><Button variant="primary" onClick={() => downloadBlob(archive, 'brand-kit.zip')}><DownloadIcon className="h-4 w-4" />{tr('Download ZIP')}</Button></div><details className="mt-4 text-sm"><summary className="cursor-pointer">{tr('Download individual files')}</summary><ul className="mt-3 max-h-72 overflow-auto">{outputs.map(output => <li key={output.name}><button className="max-w-full truncate py-2 text-left underline underline-offset-4" onClick={() => downloadBlob(output.blob, output.name.replace('fonts/', ''))}>{output.name}</button></li>)}</ul></details></div>}
      </section>
    </div>
    <section className="py-14"><h2 className="text-2xl font-semibold">{tr('Built from what makes your logo yours.')}</h2><div className="mt-6 grid gap-5 md:grid-cols-3">{[['Colors with a source', 'We sample visible logo colors and add restrained companion shades. Every swatch shows whether it was extracted, suggested or edited.'], ['Typography you can use', 'A local analysis of proportions, contrast and color suggests one of four Google Fonts. Change the choice and download the original font with its license.'], ['A connected visual set', 'Your logo becomes the pattern. Its proportions guide the layouts. Your palette flows through cards, a mug presentation, a social graphic and an avatar.']].map(([title, copy]) => <article key={title} className="rounded-xl border border-line bg-white p-6"><h3 className="font-semibold">{tr(title)}</h3><p className="mt-3 text-sm leading-relaxed text-muted">{tr(copy)}</p></article>)}</div></section>
    <AdSlot placement="directory" className="my-8" /><Link to="/tools/favicon-generator" className="inline-flex items-center gap-3 text-sm font-medium">{tr('Create favicons for this brand')}<ArrowRightIcon className="h-4 w-4" /></Link>
  </div>;
}
