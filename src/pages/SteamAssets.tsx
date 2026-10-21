import { useI18n } from '../i18n/LocaleContext';
import { SteamGuide } from '../components/site/PlatformGuide';
import { AdSlot } from '../components/ui/AdSlot';
import { useEffect, useRef, useState } from 'react';
import { DownloadIcon, Gamepad2Icon, ImagePlusIcon, UploadIcon, XIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { STEAM_ASSETS, STEAM_CHECKED, STEAM_DOCS, screenshotAsset, type SteamAsset } from '../data/steamAssets';
import { assetSize, DEFAULT_FRAME, fitRect, loadSteamSource, renderSteamAsset, steamZip, type SteamFrame, type SteamOutput, type SteamSource } from '../processing/steam';
import { downloadBlob } from '../processing/downloads';
import { LIMITS } from '../processing/formats';
import { slugify } from '../utils/format';
import { HeroCleanup } from '../components/steam/HeroCleanup';

const inputStyle = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm';
const defaultSelection = STEAM_ASSETS.filter((asset) => asset.requirement === 'Required').map((asset) => asset.id);
function Upload({ label, onFiles, multiple = false }: { label: string; onFiles: (files: File[]) => void; multiple?: boolean }) {
  const { tr } = useI18n();
  return <label className="relative inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium hover:bg-canvas focus-within:ring-2 focus-within:ring-ink">
    <UploadIcon className="h-4 w-4" aria-hidden="true" />{tr(label)}
    <input type="file" aria-label={tr(label)} accept="image/png,image/jpeg,image/webp,image/avif,image/gif" multiple={multiple} className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => { onFiles(Array.from(e.target.files || [])); e.target.value = ''; }} />
  </label>;
}

export function SteamAssets() {
  const { tr } = useI18n();
  const [sources, setSources] = useState<Record<string, SteamSource>>({});
  const [screenshots, setScreenshots] = useState<SteamSource[]>([]);
  const [selected, setSelected] = useState(defaultSelection);
  const [frames, setFrames] = useState<Record<string, SteamFrame>>({});
  const [background, setBackground] = useState('#151715');
  const [overlayLogo, setOverlayLogo] = useState(true);
  const [name, setName] = useState('my-game');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progress, setProgress] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<SteamOutput[]>([]);
  const urls = useRef(new Set<string>());
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const busy = loading || progress !== null;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; active.current?.abort(); urls.current.forEach(URL.revokeObjectURL); }; }, []);
  const release = (source?: SteamSource) => { if (source) for (const url of [source.url, source.originalUrl]) if (url) { URL.revokeObjectURL(url); urls.current.delete(url); } };
  const track = (source: SteamSource) => { urls.current.add(source.url); if (source.originalUrl) urls.current.add(source.originalUrl); };
  const changed = () => { setOutputs([]); setError(''); };
  const getSource = (asset: SteamAsset) => asset.group === 'Screenshots' ? screenshots[Number(asset.id.slice(-2)) - 1] : asset.logo ? sources.logo : sources[asset.id] || sources.artwork;
  const getFrame = (asset: SteamAsset) => frames[asset.id] || (asset.group === 'Screenshots' ? { ...DEFAULT_FRAME, fit: 'contain' as const } : DEFAULT_FRAME);
  const assets = [...STEAM_ASSETS, ...screenshots.map((_, index) => screenshotAsset(index))];
  const included = assets.filter((asset) => (asset.group === 'Screenshots' || selected.includes(asset.id)) && getSource(asset));
  const missing = STEAM_ASSETS.filter((asset) => asset.requirement === 'Required' && (!selected.includes(asset.id) || !getSource(asset))).map((asset) => asset.name);
  if (screenshots.length < 5) missing.push(`Gameplay screenshots (${screenshots.length}/5 minimum)`);

  const upload = async (files: File[], key: string, forceAI = false, cleanHero = false) => {
    if (!files.length || busy) return;
    setLoading(true); setLoadingMessage(key === 'logo' ? 'Preparing your logo…' : 'Reading image…'); setError('');
    const added: SteamSource[] = [];
    try {
      const incoming = key === 'screenshots' ? files : files.slice(0, 1);
      if (key === 'screenshots' && screenshots.length + incoming.length > 20) throw new Error('Add up to 20 gameplay screenshots per set.');
      const total = Object.entries(sources).reduce((sum, [id, source]) => sum + (id === key ? 0 : source.file.size), 0) + screenshots.reduce((sum, source) => sum + source.file.size, 0) + incoming.reduce((sum, file) => sum + file.size, 0);
      if (total > LIMITS.batchBytes) throw new Error('Keep the combined source files under 300 MB.');
      for (const file of incoming) added.push(await loadSteamSource(file, key === 'logo', (message) => { if (mounted.current) setLoadingMessage(message); }, forceAI));
      if (!mounted.current) { added.forEach(release); return; }
      added.forEach(track);
      if (key === 'screenshots') setScreenshots((current) => [...current, ...added]);
      else {
        added[0].heroCleaned = key === 'library-hero' && cleanHero;
        release(sources[key]);
        if (key === 'artwork') release(sources['library-hero']);
        setSources((current) => { const next = { ...current, [key]: added[0] }; if (key === 'artwork') delete next['library-hero']; return next; });
      }
      changed();
      return true;
    } catch (cause) { added.forEach(release); if (mounted.current) setError(cause instanceof Error ? cause.message : 'Could not read the image.'); }
    finally { if (mounted.current) { setLoading(false); setLoadingMessage(''); } }
  };

  const loadSample = async () => {
    if (busy) return;
    setLoading(true); setLoadingMessage('Loading sample artwork…'); setError('');
    const added: SteamSource[] = [];
    try {
      for (const filename of ['emberfall-key-art.png', 'emberfall-clean-art.png']) {
        const response = await fetch(`/samples/${filename}`); if (!response.ok) throw new Error('Sample unavailable');
        added.push(await loadSteamSource(new File([await response.blob()], filename, { type: 'image/png' })));
      }
      if (!mounted.current) { added.forEach(release); return; }
      added[1].heroCleaned = true; added.forEach(track);
      release(sources.artwork); release(sources['library-hero']);
      setSources((current) => ({ ...current, artwork: added[0], 'library-hero': added[1] }));
      setOverlayLogo(false); setName('emberfall'); changed();
    } catch { added.forEach(release); if (mounted.current) setError('Could not load the sample. Choose a local image.'); }
    finally { if (mounted.current) { setLoading(false); setLoadingMessage(''); } }
  };

  const generate = async () => {
    if (!included.length || busy) return;
    const controller = new AbortController(); active.current = controller; setError(''); setOutputs([]);
    const results: SteamOutput[] = [];
    try {
      for (let i = 0; i < included.length; i++) {
        if (controller.signal.aborted) throw new DOMException('Canceled', 'AbortError');
        const asset = included[i]; setProgress(`Preparing ${i + 1}/${included.length} · ${asset.name}`);
        const result = await renderSteamAsset(asset, getSource(asset), getFrame(asset), background, overlayLogo ? sources.logo : undefined);
        results.push(result);
        if (results.reduce((sum, output) => sum + output.blob.size, 0) > LIMITS.zipBytes) throw new Error('The generated files exceed 300 MB. Select fewer assets.');
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (controller.signal.aborted) throw new DOMException('Canceled', 'AbortError');
      setProgress('Building ZIP…');
      const zip = await steamZip(results, missing, controller.signal);
      if (!mounted.current || controller.signal.aborted) return;
      setOutputs(results); downloadBlob(zip, `${slugify(name) || 'my-game'}-steam-assets.zip`);
    } catch (cause) { if (mounted.current && !controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Export failed. Try again.'); }
    finally { if (mounted.current) setProgress(null); active.current = null; }
  };

  const renderCard = (asset: SteamAsset) => {
    const source = getSource(asset); const frame = getFrame(asset);
    const size = source ? assetSize(asset, source) : { width: asset.width, height: asset.height };
    const output = outputs.find((result) => result.asset.id === asset.id);
    const scale = source ? fitRect(source.width, source.height, size.width, size.height, frame).scale : 1;
    return <article key={asset.id} className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-start gap-3 border-b border-line px-5 py-4">
        {asset.group !== 'Screenshots' && <input type="checkbox" aria-label={tr(`Include ${asset.name}`)} checked={selected.includes(asset.id)} onChange={(e) => { changed(); setSelected((ids) => e.target.checked ? [...ids, asset.id] : ids.filter((id) => id !== asset.id)); }} className="mt-1 h-4 w-4 accent-[#9bbb23]" />}
        <div className="min-w-0 flex-1"><h3 className="font-semibold text-ink">{tr(asset.name)}</h3><p className="mt-1 text-xs text-muted">{tr(size.width)}{tr(" × ")}{tr(size.height)}{tr(" · ")}{tr(asset.format.toUpperCase())}{tr(" · ")}{tr(asset.requirement)}</p></div>
      </div>
      <div className="flex h-56 items-center justify-center bg-canvas p-5">
        <div className={`relative overflow-hidden ${asset.logo ? 'transparency-grid' : ''}`} style={{ aspectRatio: `${size.width}/${size.height}`, width: `min(100%, ${184 * size.width / size.height}px)`, backgroundColor: asset.logo ? undefined : background }}>
          {source ? <><img src={source.url} alt={tr(`${asset.name} preview`)} className="absolute inset-0 h-full w-full" style={{ objectFit: asset.logo ? 'contain' : frame.fit, objectPosition: `${frame.x}% ${frame.y}%` }} />
            {asset.brand && overlayLogo && sources.logo && <img src={sources.logo.url} alt={tr("")} className="absolute bottom-[10%] left-[10%] h-[30%] w-[80%] object-contain object-bottom" />}</> : <div className={`flex h-full min-h-24 min-w-36 items-center justify-center px-4 text-center text-sm ${asset.logo ? 'text-ink' : 'text-white/75'}`}>{tr(asset.logo ? 'Upload a logo with any background' : 'Add your artwork')}</div>}
        </div>
      </div>
      <div className="space-y-3 p-5">
        {asset.id === 'library-hero' && source && <>
          <p className={`rounded-lg p-2.5 text-xs ${source.heroCleaned ? 'bg-lime-soft text-ink' : 'bg-canvas text-muted'}`}>{tr(source.heroCleaned ? 'Clean hero artwork · text-free version applied. Review before exporting.' : 'Text or a logo in your artwork? Detect it and create a clean hero.')}</p>
          <HeroCleanup key={source.url} source={source} onApply={async (file) => { const applied = await upload([file], 'library-hero', false, true); if (!applied) throw new Error('Could not apply hero'); }} />
        </>}
        {asset.logo && <><Upload label={tr("Upload library logo")} onFiles={(files) => void upload(files, 'logo')} /><p className="text-xs text-muted">{tr("Background removed automatically. Preview the transparent result here.")}</p>{loading && <p role="status" className="text-xs text-muted">{tr(loadingMessage)}</p>}</>}
        <p className="text-sm text-muted">{tr(asset.description)}</p>
        <p className="text-xs leading-relaxed text-muted">{tr(asset.note)} <a href={asset.source} target="_blank" rel="noreferrer" className="underline underline-offset-2">{tr("Steamworks ↗")}</a></p>
        {source && scale > 1.01 && <p className="text-xs text-warning">{tr("Upscaling ")}{tr(scale.toFixed(1))}{tr("× — a larger source will look sharper.")}</p>}
        {!asset.logo && source && <>
          <label className="block text-xs font-medium">{tr("Fit")}<select aria-label={tr(`${asset.name} fit`)} value={frame.fit} className={`${inputStyle} mt-1`} onChange={(e) => { changed(); setFrames((values) => ({ ...values, [asset.id]: { ...frame, fit: e.target.value as SteamFrame['fit'] } })); }}><option value="cover">{tr("Crop to fill")}</option><option value="contain">{tr("Fit entire image")}</option></select></label>
          <div className="grid grid-cols-2 gap-4">{(['x', 'y'] as const).map((axis) => <label key={axis} className="text-xs text-muted">{tr(axis === 'x' ? 'Horizontal' : 'Vertical')}{tr(" position")}<input aria-label={tr(`${asset.name} ${axis === 'x' ? 'horizontal' : 'vertical'} position`)} type="range" min="0" max="100" value={frame[axis]} className="mt-2 w-full accent-[#151715]" onChange={(e) => { changed(); setFrames((values) => ({ ...values, [asset.id]: { ...frame, [axis]: Number(e.target.value) } })); }} /></label>)}</div>
        </>}
        {!asset.logo && asset.group !== 'Screenshots' && <div className="flex flex-wrap gap-2"><Upload label={tr(`Replace ${asset.name}`)} onFiles={(files) => void upload(files, asset.id)} />{sources[asset.id] && <Button size="sm" variant="ghost" onClick={() => { changed(); release(sources[asset.id]); setSources((current) => { const next = { ...current }; delete next[asset.id]; return next; }); }}>{tr("Use main artwork")}</Button>}</div>}
        {asset.group === 'Screenshots' && <Button variant="ghost" size="sm" onClick={() => { changed(); release(source); setScreenshots((shots) => shots.filter((s) => s !== source)); setFrames({}); }}><XIcon className="h-4 w-4" />{tr("Remove screenshot")}</Button>}
        {output && <Button variant="secondary" className="w-full" onClick={() => downloadBlob(output.blob, output.filename.split('/').pop()!)}><DownloadIcon className="h-4 w-4" />{tr("Download ")}{tr(asset.format.toUpperCase())}</Button>}
      </div>
    </article>;
  };

  return <div className="mx-auto max-w-content px-5 pb-16 pt-10 sm:px-8">
    <header className="mb-8 max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full bg-lime-soft px-3 py-1.5 text-xs font-medium"><Gamepad2Icon className="h-4 w-4" />{tr("Steam asset generator")}</span><h1 className="mt-4 text-[38px] font-semibold leading-tight tracking-[-0.04em] sm:text-[48px]">{tr("Steam capsule and")}<br />{tr("library asset generator")}</h1><p className="mt-3 text-[17px] leading-relaxed text-muted">{tr("Create store capsules, library artwork and icons at Steamworks sizes. Adjust each crop, then download a named ZIP with an asset guide.")}</p></header>
    {error && <div role="alert" className="mb-5 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">{tr(error)}</div>}
    <AdSlot placement="platform-primary" className="my-10" />
    <fieldset disabled={busy} className="min-w-0">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border-2 border-dashed border-line-strong bg-white p-6" aria-labelledby="steam-art-title" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (!busy) void upload(Array.from(e.dataTransfer.files), 'artwork'); }}>
          <div className="flex items-center gap-4">{sources.artwork ? <img src={sources.artwork.url} alt={tr("Main artwork")} className="h-20 w-24 rounded-lg object-contain bg-canvas" /> : <ImagePlusIcon className="h-10 w-10 text-muted" />}<div><h2 id="steam-art-title" className="font-semibold">{tr("1. Add your main artwork")}</h2><p className="mt-1 text-sm text-muted">{tr("Any aspect ratio. JPG, PNG, WebP, AVIF or still GIF.")}</p>{sources.artwork && <p className="mt-1 text-xs text-muted">{sources.artwork.file.name}{tr(" · ")}{tr(sources.artwork.width)}{tr(" × ")}{tr(sources.artwork.height)}</p>}</div></div>
          <div className="mt-5 flex flex-wrap gap-2"><Upload label={tr(sources.artwork ? 'Change artwork' : 'Choose artwork')} onFiles={(files) => void upload(files, 'artwork')} /><Button variant="ghost" onClick={() => void loadSample()}>{tr("Try sample artwork")}</Button></div>
          <p className="mt-3 text-xs text-muted">{tr("Drop a file here · 40 MB per file · processed on your device. Emberfall is fictional sample artwork with a centered title. Its Library Hero uses a separate version without text or a logo.")}</p>
        </section>
        <section className="rounded-2xl border border-line bg-white p-6"><h2 className="font-semibold">{tr("2. Complete the set")}</h2><p className="mt-1 text-sm text-muted">{tr("Upload your logo with or without a background, plus real gameplay captures. Opaque logo backgrounds are removed automatically.")}</p><div className="mt-4 flex flex-wrap gap-2"><Upload label={tr("Add logo")} onFiles={(files) => void upload(files, 'logo')} /><Upload label={tr("Add gameplay screenshots")} multiple onFiles={(files) => void upload(files, 'screenshots')} /></div><p className="mt-3 text-xs text-muted">{tr("Solid backgrounds work best. Complex backgrounds use an on-device model downloaded on first use.")}</p>
          {loading && <p role="status" className="mt-3 text-sm text-muted">{tr(loadingMessage || 'Reading image…')}</p>}
          {sources.logo && <div className="mt-4 rounded-xl border border-line p-3">
            <div className="grid grid-cols-2 gap-3">
              <figure><figcaption className="mb-2 text-xs font-semibold">{tr("Original")}</figcaption><img src={sources.logo.originalUrl || sources.logo.url} alt={tr("Original uploaded logo")} className="transparency-grid h-28 w-full rounded-lg object-contain" /></figure>
              <figure><figcaption className="mb-2 text-xs font-semibold">{tr("Transparent preview")}</figcaption><img src={sources.logo.url} alt={tr("Logo with transparent background")} className="transparency-grid h-28 w-full rounded-lg object-contain" /></figure>
            </div>
            <p className="mt-3 text-xs text-muted">{tr(sources.logo.backgroundRemoved ? 'Background removed automatically. Check the lettering and edges before exporting.' : 'Your logo already has transparency. It has been preserved.')}</p>
            <Button className="mt-3" variant="secondary" size="sm" onClick={() => void upload([sources.logo.file], 'logo', true)}>{tr("Retry with AI")}</Button>
          </div>}
          <p className="mt-3 text-xs text-muted">{tr("Logo: ")}{sources.logo ? sources.logo.file.name : tr('not added')}{tr(" · Gameplay: ")}{tr(screenshots.length)}{tr("/5 minimum")}</p>{sources.logo && <div className="mt-3 flex flex-wrap items-center gap-4"><label className="flex gap-2 text-sm"><input type="checkbox" checked={overlayLogo} onChange={(e) => { changed(); setOverlayLogo(e.target.checked); }} />{tr("Add logo to capsules")}</label><Button variant="ghost" size="sm" onClick={() => { changed(); release(sources.logo); setSources((current) => { const next = { ...current }; delete next.logo; return next; }); }}>{tr("Remove logo")}</Button></div>}</section>
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-5 rounded-2xl border border-line bg-white p-5"><label className="flex-1 text-sm font-medium">{tr("Set name")}<input className={`${inputStyle} mt-1 min-w-40`} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} /></label><label className="text-sm font-medium">{tr("Padding / JPG background")}<input type="color" aria-label={tr("Padding background")} value={background} onChange={(e) => { changed(); setBackground(e.target.value); }} className="mt-1 block h-10 w-20 cursor-pointer rounded border border-line" /></label><Button variant="secondary" onClick={() => { changed(); setSelected(defaultSelection); }}>{tr("Required assets")}</Button><Button variant="secondary" onClick={() => { changed(); setSelected(STEAM_ASSETS.map((asset) => asset.id)); }}>{tr("Include extras")}</Button></div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{tr("Capsules need a readable game name; the Library Hero needs artwork without text. Replace an individual source below when necessary. Resizing does not add missing detail or remove lettering.")}</p>
      {(['Store', 'Library', 'Icons', 'Extras', 'Screenshots'] as const).map((group) => <section key={group} className="mt-10" aria-label={tr(`${group} assets`)}><h2 className="mb-4 text-2xl font-semibold tracking-tight">{tr(group)}{group === 'Extras' && <span className="ml-3 text-sm font-normal text-muted">{tr("Optional or specific to bundles and events")}</span>}</h2><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{assets.filter((asset) => asset.group === group).map(renderCard)}</div>{group === 'Screenshots' && !screenshots.length && <div className="rounded-xl border border-dashed border-line-strong p-5 text-sm text-muted">{tr("Upload at least five real gameplay captures above. Each gets a separate 1920 × 1080 JPG; key art is never duplicated as fake screenshots.")}</div>}</section>)}
    </fieldset>
    {missing.length > 0 && <details className="mt-6 rounded-xl border border-line bg-white p-4 text-sm"><summary className="cursor-pointer font-medium">{tr("Release checklist · ")}{tr(missing.length)}{tr(" items missing or excluded")}</summary><ul className="mt-3 list-disc space-y-1 pl-5 text-muted">{missing.map((item) => <li key={item}>{tr(item)}</li>)}</ul></details>}
    <section className="sticky bottom-3 z-20 mt-8 rounded-2xl border border-line bg-white p-5 shadow-pop" aria-label={tr("Export Steam assets")}><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold">{tr(outputs.length ? `${outputs.length} assets generated` : `${included.length} assets ready to generate`)}</h2><p className="mt-1 hidden text-xs text-muted sm:block">{tr("ZIP includes descriptive filenames, dimensions, descriptions and source links.")}</p></div><div className="flex gap-2">{progress && <Button variant="secondary" onClick={() => active.current?.abort()}>{tr("Cancel")}</Button>}<Button variant="accent" size="lg" disabled={busy || !included.length} onClick={() => void generate()}><DownloadIcon className="h-4 w-4" />{tr(loading ? 'Reading image…' : progress || 'Generate & download ZIP')}</Button></div></div>{missing.length > 0 && <p className="mt-3 text-xs leading-relaxed text-warning"><span className="sm:hidden">{tr(missing.length)}{tr(" required items missing or excluded. See the checklist above.")}</span><span className="hidden sm:inline">{tr("Incomplete release set — missing or excluded: ")}{missing.map(item => tr(item)).join(', ')}{tr(". You can export the available assets now.")}</span></p>}<span className="sr-only" role="status">{tr(progress || (outputs.length ? 'ZIP ready to download' : ''))}</span></section>
    <p className="mt-8 text-xs leading-relaxed text-muted">{tr("Specifications checked ")}{tr(STEAM_CHECKED)}{tr(". ")}<a href={STEAM_DOCS} target="_blank" rel="noreferrer" className="underline">{tr("Official Steamworks requirements ↗")}</a>{tr(" · Review content and templates before uploading. macOS releases also need a separate ICNS icon. Steam creates the documented half-size library images. Batch is not affiliated with Valve.")}</p>
      <SteamGuide />
      <AdSlot placement="platform-secondary" className="my-12" />
  </div>;
}
