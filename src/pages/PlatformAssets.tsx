import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, CheckIcon, DownloadIcon, ImagePlusIcon, Settings2Icon, ShieldCheckIcon, XIcon } from 'lucide-react';
import { PLATFORM_PACKS } from '../data/platforms';
import type { AssetFrame, PlatformAsset, PlatformPack } from '../types/platform';
import { buildAssetJobs, normalizeFrame, packChecklist, platformZip, renderPlatformAsset, sourceRect, validateDimensions, type AssetJob, type CustomSizes, type PackOutput, type PackSource, type PackSources } from '../processing/platforms';
import { loadSteamSource } from '../processing/steam';
import { LIMITS } from '../processing/formats';
import { downloadBlob } from '../processing/downloads';
import { formatBytes, slugify } from '../utils/format';
import { Button } from '../components/ui/Button';
import { AssetPreview } from '../components/platforms/AssetPreview';
import { AssetEditor, UploadInput } from '../components/platforms/AssetEditor';
import { PlatformIcon } from '../components/platforms/PlatformIcon';
import { PlatformGuide } from '../components/site/PlatformGuide';
import { PLATFORM_SEARCH } from '../data/seo';
import { NotFound } from './NotFound';

const field = 'mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm';
const roleNames: Record<string, string> = { images: 'Content images', product: 'Product photos', iphone: 'iPhone screenshots', ipad: 'iPad screenshots', 'android-phone': 'Android phone screenshots', 'android-tablet': 'Android tablet screenshots', 'android-tv': 'Android TV screenshots' };

export function PlatformAssets({ platform }: { platform?: string }) {
  const params = useParams(); const id = platform || params.platform;
  const pack = PLATFORM_PACKS.find((item) => item.id === id);
  return pack ? <PackWorkspace key={pack.id} pack={pack} /> : <NotFound />;
}
function PackWorkspace({ pack: basePack }: { pack: PlatformPack }) {
  const [destination, setDestination] = useState('both');
  const [appKind, setAppKind] = useState('app');
  const pack = useMemo(() => basePack.id !== 'mobile' || destination === 'both' ? basePack : ({ ...basePack, assets: basePack.assets.filter((asset) => destination === 'apple' ? asset.id.startsWith('app-store-') : asset.id.startsWith('google-play-')) }), [basePack, destination]);
  const defaults = pack.assets.filter((a) => a.defaultSelected ?? a.requirement === 'Required').map((a) => a.id);
  const [sources, setSources] = useState<PackSources>({});
  const [selected, setSelected] = useState(defaults);
  const [frames, setFrames] = useState<Record<string, Partial<AssetFrame>>>({});
  const [sizes, setSizes] = useState<CustomSizes>({});
  const [name, setName] = useState(`my-${pack.id}-set`), [locale, setLocale] = useState('en-US');
  const [group, setGroup] = useState('All'), [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState(''), [error, setError] = useState('');
  const [outputs, setOutputs] = useState<PackOutput[]>([]), [failures, setFailures] = useState<string[]>([]);
  const [zip, setZip] = useState<Blob | null>(null), [isSample, setIsSample] = useState(false);
  const mounted = useRef(true), active = useRef<AbortController | null>(null), operation = useRef(false);
  const urls = useRef(new Set<string>());
  const busy = !!status;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; active.current?.abort(); urls.current.forEach(URL.revokeObjectURL); }; }, []);
  useEffect(() => {
    const live = new Set(Object.values(sources).flat().flatMap((source) => [source.url, source.originalUrl].filter(Boolean)));
    for (const url of urls.current) if (!live.has(url)) { URL.revokeObjectURL(url); urls.current.delete(url); }
  }, [sources]);
  const changed = () => { setOutputs([]); setZip(null); setFailures([]); setError(''); };
  const track = (source: PackSource) => { urls.current.add(source.url); if (source.originalUrl) urls.current.add(source.originalUrl); };
  const allJobs = useMemo(() => buildAssetJobs(pack, pack.assets.map((a) => a.id), sources, frames, sizes), [pack, sources, frames, sizes]);
  const jobs = allJobs.filter((job) => selected.includes(job.asset.id));
  const checklist = packChecklist(pack, selected, sources);
  const groups = Array.from(new Set(pack.assets.map((a) => a.group)));
  const roles = Array.from(new Set(pack.assets.filter((a) => a.repeat).map((a) => a.input!)));
  const editedJob = allJobs.find((job) => job.id === editing);
  const logo = sources.logo?.[0];
  const groupsOfRole = (role: string) => pack.assets.filter((a) => a.repeat && a.input === role);
  const updateFrame = (key: string, frame: Partial<AssetFrame>) => { changed(); setFrames((current) => ({ ...current, [key]: frame })); };
  const toggle = (id: string, enabled: boolean) => { changed(); setSelected((current) => enabled ? [...new Set([...current, id])] : current.filter((item) => item !== id)); };
  const upload = async (files: File[], key: string, forceAI = false, replaceId?: string): Promise<void> => {
    if (!files.length || operation.current) return;
    operation.current = true; setError(''); setStatus(key === 'logo' ? 'Preparing transparent logo…' : 'Reading images…');
    const pending: PackSource[] = [];
    try {
      const multi = roles.includes(key as typeof roles[number]) && !replaceId;
      const incoming = multi ? files : files.slice(0, 1);
      const maximum = Math.min(...groupsOfRole(key).map((a) => a.maxCount || 50), 50);
      if (multi && (sources[key]?.length || 0) + incoming.length > maximum) throw new Error(`Add up to ${maximum} images to ${roleNames[key] || key}.`);
      const oldSources = Object.values(sources).flat();
      if (oldSources.reduce((sum, source) => sum + source.file.size, 0) + incoming.reduce((sum, file) => sum + file.size, 0) > LIMITS.batchBytes) throw new Error('Keep the combined source files under 300 MB.');
      if (oldSources.length + incoming.length > 100) throw new Error('Use up to 100 source images in one set.');
      for (const file of incoming) {
        if (multi && [...(sources[key] || []), ...pending].some((s) => s.file.name === file.name && s.file.size === file.size && s.file.lastModified === file.lastModified)) throw new Error(`“${file.name}” is already in this group. Add a different image.`);
        const source = { ...await loadSteamSource(file, key === 'logo', (message) => { if (mounted.current) setStatus(message); }, forceAI), id: replaceId || crypto.randomUUID() };
        pending.push(source);
      }
      if (!mounted.current) { pending.forEach((s) => { URL.revokeObjectURL(s.url); if (s.originalUrl) URL.revokeObjectURL(s.originalUrl); }); return; }
      pending.forEach(track);
      setSources((current) => ({ ...current, [key]: replaceId ? (current[key] || []).map((s) => s.id === replaceId ? pending[0] : s) : multi ? [...(current[key] || []), ...pending] : pending }));
      if (multi) setSelected((ids) => { const templates = groupsOfRole(key); if (templates.some((a) => ids.includes(a.id))) return ids; const recommended = templates.filter((a) => a.defaultSelected); return [...new Set([...ids, ...(recommended.length ? recommended : templates).map((a) => a.id)])]; });
      changed(); setIsSample(false);
    } catch (cause) { pending.forEach((s) => { URL.revokeObjectURL(s.url); if (s.originalUrl) URL.revokeObjectURL(s.originalUrl); }); if (mounted.current) { const message = cause instanceof Error ? cause.message.replace('Steam assets', 'platform assets') : 'Could not read this image.'; setError(message); throw new Error(message); } }
    finally { operation.current = false; if (mounted.current) setStatus(''); }
  };
  const uploadQuietly = (files: File[], key: string, forceAI = false) => { void upload(files, key, forceAI).catch(() => undefined); };
  const removeSource = (key: string, id?: string) => {
    changed(); setSources((current) => { const next = { ...current }; if (id) next[key] = (next[key] || []).filter((s) => s.id !== id); else delete next[key]; return next; });
  };
  const moveSource = (key: string, index: number, direction: number) => {
    changed(); setSources((current) => { const next = [...current[key]], target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return { ...current, [key]: next }; });
  };
  const loadSample = async () => {
    if (operation.current) return; operation.current = true; setStatus('Loading sample artwork…'); setError('');
    try {
      const product = pack.category === 'Commerce';
      const path = product ? '/0f8e9c78-f8ec-47d6-858a-6c19973b8dfd.jpg' : '/samples/emberfall-clean-art.png';
      const response = await fetch(path); if (!response.ok) throw new Error('Sample unavailable.');
      const source: PackSource = { ...await loadSteamSource(new File([await response.blob()], product ? 'sample-sneaker.jpg' : 'sample-game-art.png', { type: product ? 'image/jpeg' : 'image/png' })), id: crypto.randomUUID() };
      if (!mounted.current) { URL.revokeObjectURL(source.url); return; }
      track(source); setSources((current) => ({ ...current, artwork: [source], ...(product ? { product: [source] } : {}) })); changed(); setIsSample(true);
    } catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : 'Sample unavailable.'); }
    finally { operation.current = false; if (mounted.current) setStatus(''); }
  };
  const removeBackground = async (source: PackSource, role: string) => {
    if (operation.current) return; operation.current = true; setStatus('Preparing background removal…'); setError('');
    try {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 3000 / Math.max(source.width, source.height)); canvas.width = Math.round(source.width * scale); canvas.height = Math.round(source.height * scale);
      const ctx = canvas.getContext('2d')!; ctx.drawImage(source.image, 0, 0, canvas.width, canvas.height);
      const { removeBackground: remove } = await import('../processing/background');
      const pixels = await remove(ctx.getImageData(0, 0, canvas.width, canvas.height), (message) => { if (mounted.current) setStatus(message); }); ctx.putImageData(pixels, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Could not encode background removal.')), 'image/png'));
      const clean: PackSource = { ...await loadSteamSource(new File([blob], source.file.name.replace(/\.[^.]+$/, '') + '-cutout.png', { type: 'image/png' })), id: source.id, originalUrl: source.originalUrl || source.url, backgroundRemoved: true };
      if (!mounted.current) { URL.revokeObjectURL(clean.url); return; }
      track(clean); setSources((current) => ({ ...current, [role]: current[role].map((s) => s.id === source.id ? clean : s) })); changed();
    } catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : 'Background removal failed.'); }
    finally { operation.current = false; if (mounted.current) setStatus(''); }
  };
  const generate = async () => {
    if (!jobs.length || operation.current) return;
    operation.current = true; const controller = new AbortController(); active.current = controller; changed();
    const results: PackOutput[] = [], errors: string[] = []; let bytes = 0;
    try {
      for (let i = 0; i < jobs.length; i++) {
        controller.signal.throwIfAborted(); if (!mounted.current) return;
        const job = jobs[i]; setStatus(`Preparing ${i + 1}/${jobs.length} · ${job.asset.name}`);
        try { const result = await renderPlatformAsset(pack, job, locale, controller.signal, logo); bytes += result.blob.size; if (bytes > LIMITS.zipBytes) throw new Error('The set exceeds 300 MB. Select fewer images.'); results.push(result); }
        catch (cause) { if (controller.signal.aborted) throw cause; if (bytes > LIMITS.zipBytes) throw cause; errors.push(`${job.asset.name}${job.asset.repeat ? ` #${job.index + 1}` : ''}: ${cause instanceof Error ? cause.message : 'Export failed.'}`); }
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      if (!results.length) throw new Error(errors.join(' '));
      let archive: Blob | null = null;
      if (results.length > 1) { setStatus('Packing files and asset guide…'); archive = await platformZip(pack, results, [...checklist, ...errors], controller.signal); }
      controller.signal.throwIfAborted();
      if (mounted.current) { setOutputs(results); setFailures(errors); setZip(archive); }
    } catch (cause) { if (mounted.current) setError(controller.signal.aborted ? 'Preparation canceled. Your images and settings are kept.' : cause instanceof Error ? cause.message : 'Could not prepare this set.'); }
    finally { operation.current = false; active.current = null; if (mounted.current) setStatus(''); }
  };
  const previewCard = (asset: PlatformAsset, job?: AssetJob) => {
    const included = selected.includes(asset.id), output = outputs.find((item) => item.job.id === job?.id);
    const size = sizes[asset.id] || asset;
    const warning = job ? validateDimensions(asset, job.width, job.height) : validateDimensions(asset, size.width, size.height);
    const zoom = job ? sourceRect(job.source.width, job.source.height, job.width, job.height, job.frame).scale : 1;
    return <article key={job?.id || asset.id} className={`min-w-0 overflow-hidden rounded-2xl border bg-white ${included ? 'border-line' : 'border-dashed border-line-strong'}`}>
      <div className="flex items-start gap-3 p-4"><input aria-label={`Include ${asset.name}${job && asset.repeat ? ` size for all ${roleNames[asset.input!]}` : ''}`} type="checkbox" checked={included} onChange={(e) => toggle(asset.id, e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#9bbb23]" /><div className="min-w-0 flex-1"><h3 className="font-semibold">{asset.name}{job && asset.repeat ? ` · ${job.index + 1}` : ''}</h3><p className="mt-1 text-xs text-muted">{job?.width || size.width} × {job?.height || size.height} · {(job?.frame.format || asset.format).toUpperCase()} · {asset.requirement}</p></div>{output && <CheckIcon className="h-5 w-5 shrink-0 text-[#69831a]" />}</div>
      <div className="h-48">{job ? <AssetPreview job={job} logo={logo} /> : <div className="flex h-full items-center justify-center bg-sunken px-5 text-center text-sm text-muted"><ImagePlusIcon className="mr-2 h-5 w-5" />{asset.repeat ? `Add ${roleNames[asset.input!] || 'photos'}` : 'Add artwork or replace this image'}</div>}</div>
      <div className="space-y-3 p-4"><p className="text-sm text-muted">{asset.description}</p>{asset.condition && <p className="rounded-lg bg-canvas p-2 text-xs text-muted">{asset.condition}</p>}
        {asset.customSize && <div className="grid grid-cols-2 gap-3">{(['width', 'height'] as const).map((axis) => <label key={axis} className="text-xs font-medium">{axis === 'width' ? 'Width' : 'Height'}<input aria-label={`${asset.name} ${axis}`} type="number" min="1" max={axis === 'width' ? asset.maxWidth || 10000 : asset.maxHeight || 10000} className={field} value={size[axis]} onChange={(e) => { changed(); setSizes((current) => ({ ...current, [asset.id]: { width: size.width, height: size.height, [axis]: Number(e.target.value) } })); }} /></label>)}</div>}
        {warning && <p className="text-xs text-danger">{warning}</p>}{job && zoom > 1.05 && <p className="text-xs text-warning">Upscaling {zoom.toFixed(1)}× · use a larger original for sharper results.</p>}
        <details className="text-xs text-muted"><summary className="cursor-pointer font-medium text-ink">Specs & placement notes</summary><p className="mt-2 leading-relaxed">{asset.sourceRule}</p>{asset.evidence === 'preset' && <p className="mt-2">This exact size is a Batch preset. The platform does not mandate these dimensions.</p>}<p className="mt-2 leading-relaxed">{asset.note}</p>{asset.maxBytes && <p className="mt-2">Maximum output: {formatBytes(asset.maxBytes)}. Checked after encoding.</p>}<a className="mt-2 inline-block underline" href={asset.source} target="_blank" rel="noreferrer">Official documentation ↗</a></details>
        <div className="flex flex-wrap gap-2">{job ? <Button size="sm" onClick={() => setEditing(job.id)}><Settings2Icon className="h-4 w-4" />Adjust</Button> : !asset.repeat && <UploadInput label={`Add ${asset.name} image`} onFiles={(files) => uploadQuietly(files, asset.id)} />}{output && <Button size="sm" variant="secondary" onClick={() => downloadBlob(output.blob, output.filename.split('/').pop()!)}><DownloadIcon className="h-4 w-4" />{formatBytes(output.blob.size)}</Button>}</div>
      </div>
    </article>;
  };
  return <div className="mx-auto max-w-content px-5 pb-14 pt-8 sm:px-8">
    <Link to="/tools" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeftIcon className="h-4 w-4" />All tools</Link>
    <header className="mb-7 mt-6 flex flex-wrap items-end justify-between gap-5"><div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full bg-lime-soft px-3 py-1.5 text-xs font-medium"><PlatformIcon id={pack.id} className="h-4 w-4" />{pack.name}</span><h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{PLATFORM_SEARCH[pack.id].heading}</h1><p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-muted">{pack.description}</p></div><span className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-muted"><ShieldCheckIcon className="h-4 w-4" />Sources reviewed {pack.checked}</span></header>
    {error && <div role="alert" className="mb-5 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">{error}</div>}
    <fieldset disabled={busy} className="min-w-0">
      {basePack.id === 'mobile' && <section className="mb-5 flex flex-wrap items-end gap-5 rounded-2xl border border-line bg-white p-5"><label className="text-sm font-medium">Publish to<select aria-label="App store destination" className={field} value={destination} onChange={(e) => { const value = e.target.value; changed(); setDestination(value); setGroup('All'); setEditing(null); setSelected(basePack.assets.filter((a) => (a.defaultSelected ?? a.requirement === 'Required') && (value === 'both' || (value === 'apple' ? a.id.startsWith('app-store-') : a.id.startsWith('google-play-')))).map((a) => a.id)); }}><option value="both">App Store + Google Play</option><option value="apple">Apple App Store</option><option value="google">Google Play</option></select></label><label className="text-sm font-medium">App type<select aria-label="App type" className={field} value={appKind} onChange={(e) => setAppKind(e.target.value)}><option value="app">App</option><option value="game">Game</option></select></label>{destination !== 'apple' && <p className="max-w-xl text-sm text-muted">Google Play: two screenshots is the basic listing minimum. For promotional consideration, add at least {appKind === 'game' ? 'three game' : 'four app'} phone screenshots. Your device sets below have their own requirements.</p>}</section>}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border-2 border-dashed border-line-strong bg-white p-6" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); uploadQuietly(Array.from(event.dataTransfer.files), pack.category === 'Commerce' ? 'product' : 'artwork'); }}>
          <div className="flex items-center gap-4">{sources.artwork?.[0] ? <img src={sources.artwork[0].url} alt="Main artwork" className="h-20 w-24 rounded-lg bg-canvas object-contain" /> : <ImagePlusIcon className="h-9 w-9 text-muted" />}<div><h2 className="text-lg font-semibold">1. Add your artwork</h2><p className="mt-1 text-sm text-muted">Start with a photo or design. Adjust each result below.</p></div></div>
          <div className="mt-5 flex flex-wrap gap-2"><UploadInput label={sources.artwork?.length ? 'Change artwork' : 'Choose artwork'} onFiles={(files) => uploadQuietly(files, 'artwork')} /><Button variant="ghost" onClick={() => void loadSample()}>Try sample artwork</Button></div><p className="mt-3 text-xs text-muted">JPG, PNG, WebP, AVIF or still GIF · 40 MB per file · processing on your device.</p>{isSample && <p className="mt-3 text-xs text-muted">Sample artwork for testing. {pack.id === 'mobile' && 'Upload actual app screenshots below; sample art is never used as a screenshot.'}</p>}
        </section>
        <section className="rounded-2xl border border-line bg-white p-6"><h2 className="text-lg font-semibold">2. Add your identity</h2><p className="mt-1 text-sm text-muted">Use a separate avatar / icon, and an optional logo to overlay on artwork.</p><div className="mt-4 flex flex-wrap gap-2"><UploadInput label="Upload avatar / icon" onFiles={(files) => uploadQuietly(files, 'icon')} /><UploadInput label="Upload logo" onFiles={(files) => uploadQuietly(files, 'logo')} /></div>
          {sources.icon?.[0] && <div className="mt-3 flex items-center gap-3"><img src={sources.icon[0].url} alt="Avatar or icon" className="h-12 w-12 rounded bg-canvas object-contain" /><p className="min-w-0 flex-1 truncate text-xs text-muted">{sources.icon[0].file.name}</p><Button size="icon-sm" variant="ghost" aria-label="Remove avatar" onClick={() => removeSource('icon')}><XIcon className="h-4 w-4" /></Button></div>}
          {logo ? <div className="mt-4"><div className="grid grid-cols-2 gap-3"><figure><img src={logo.originalUrl || logo.url} alt="Original logo" className="transparency-grid h-20 w-full rounded object-contain" /><figcaption className="mt-1 text-xs text-muted">Original</figcaption></figure><figure><img src={logo.url} alt="Transparent logo preview" className="transparency-grid h-20 w-full rounded object-contain" /><figcaption className="mt-1 text-xs text-muted">Transparent preview</figcaption></figure></div><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={() => uploadQuietly([logo.file], 'logo', true)}>Retry removal with AI</Button><Button size="sm" variant="ghost" onClick={() => removeSource('logo')}>Remove logo</Button></div></div> : <p className="mt-3 text-xs text-muted">Logo backgrounds are removed automatically. Review the preview before applying. Complex backgrounds may need a model download.</p>}
        </section>
      </div>
      {roles.length > 0 && <section className="mt-5 rounded-2xl border border-line bg-white p-5"><h2 className="text-lg font-semibold">{pack.category === 'Apps' ? '3. Add real screenshots by device' : pack.category === 'Commerce' ? '3. Add your product photos' : '3. Prepare multiple images'}</h2><p className="mt-1 text-sm text-muted">{pack.category === 'Apps' ? 'Choose the devices your app supports. Upload captures from that device, reorder them, and add captions in Adjust. Each device keeps its own set.' : pack.category === 'Commerce' ? 'Every selected product size is applied to each photo. Keep matching backgrounds and margins across your catalog.' : 'Use the main artwork for one image, or add a batch here to prepare posts, thumbnails and covers together.'}</p>
        <div className="mt-5 space-y-4">{roles.map((role) => { const templates = groupsOfRole(role), photos = sources[role] || []; const enabled = templates.some((a) => selected.includes(a.id)); return <details key={role} open={enabled} className="rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-semibold">{roleNames[role]} · {photos.length} added</summary><div className="mt-3 flex flex-wrap items-center gap-3"><UploadInput label={`Add ${roleNames[role]}`} multiple onFiles={(files) => uploadQuietly(files, role)} /><span className="text-xs text-muted">Up to {Math.min(...templates.map((a) => a.maxCount || 50))} images · {templates[0].minCount ? `${templates[0].minCount} minimum for this set` : 'one output per photo'}</span></div>{pack.category === 'Apps' && <div className="mt-3 flex flex-wrap gap-3">{templates.map((asset) => <label key={asset.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selected.includes(asset.id)} onChange={(e) => toggle(asset.id, e.target.checked)} />{asset.name}</label>)}</div>}
          {photos.length > 0 && <ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{photos.map((source, index) => <li key={source.id} className="min-w-0 rounded-lg border border-line p-3"><div className="flex gap-2"><img src={source.url} alt={`${roleNames[role]} ${index + 1}`} className="transparency-grid h-16 w-16 rounded object-contain" /><div className="min-w-0"><p className="truncate text-xs font-medium">{index + 1}. {source.file.name}</p><p className="mt-1 text-xs text-muted">{source.width} × {source.height}</p></div></div><div className="mt-2 flex gap-1"><Button size="icon-sm" variant="ghost" disabled={index === 0} aria-label={`Move ${source.file.name} earlier`} onClick={() => moveSource(role, index, -1)}><ArrowUpIcon className="h-4 w-4" /></Button><Button size="icon-sm" variant="ghost" disabled={index === photos.length - 1} aria-label={`Move ${source.file.name} later`} onClick={() => moveSource(role, index, 1)}><ArrowDownIcon className="h-4 w-4" /></Button><Button size="icon-sm" variant="ghost" aria-label={`Remove ${source.file.name}`} onClick={() => removeSource(role, source.id)}><XIcon className="h-4 w-4" /></Button></div>{role === 'product' && <Button size="sm" variant="secondary" onClick={() => void removeBackground(source, role)}>{source.backgroundRemoved ? 'Retry background removal' : 'Remove background · AI'}</Button>}{source.originalUrl && <details className="mt-2 text-xs"><summary className="cursor-pointer">View original</summary><img src={source.originalUrl} alt="Original before background removal" className="mt-2 max-h-24 object-contain" /></details>}</li>)}</ol>}
        </details>; })}</div>
      </section>}
      <div className="mt-5 flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-white p-5"><label className="min-w-40 flex-1 text-sm font-medium">Set name<input className={field} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></label>{pack.id === 'mobile' && <label className="text-sm font-medium">Language / locale<input aria-label="Export locale" className={`${field} max-w-40`} maxLength={25} value={locale} onChange={(e) => { changed(); setLocale(e.target.value); }} /><span className="mt-1 block text-xs text-muted">Folder label; captions stay as entered.</span></label>}<Button onClick={() => { changed(); setSelected(defaults); }}>Recommended set</Button><Button onClick={() => { changed(); setSelected([]); }}>Clear selection</Button></div>
      <details className="mt-4 rounded-xl border border-line p-4 text-sm"><summary className="cursor-pointer font-medium">Platform requirements & account conditions</summary><ul className="mt-3 list-disc space-y-2 pl-5 text-muted">{pack.notes.map((note) => <li key={note}>{note}</li>)}</ul></details>
      <div className="mb-5 mt-8 flex flex-wrap items-center gap-2" aria-label="Asset groups">{['All', ...groups].map((item) => <button key={item} type="button" aria-pressed={group === item} onClick={() => setGroup(item)} className={`rounded-full border px-4 py-2 text-sm ${group === item ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:bg-lime-soft'}`}>{item}</button>)}</div>
      {groups.filter((item) => group === 'All' || item === group).map((item) => <section key={item} aria-label={`${item} assets`} className="mb-8"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{item}</h2><Button size="sm" variant="ghost" onClick={() => { changed(); const ids = pack.assets.filter((a) => a.group === item).map((a) => a.id); setSelected((current) => [...new Set([...current, ...ids])]); }}>Select group</Button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{pack.assets.filter((a) => a.group === item).flatMap((asset) => { const list = allJobs.filter((job) => job.asset.id === asset.id); return list.length ? list.map((job) => previewCard(asset, job)) : [previewCard(asset)]; })}</div></section>)}
    </fieldset>
    {checklist.length > 0 && <details className="mb-5 rounded-xl border border-line bg-white p-4 text-sm"><summary className="cursor-pointer font-medium">Set checklist · {checklist.length} items to review</summary><ul className="mt-3 list-disc space-y-1 pl-5 text-muted">{checklist.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-3 text-xs text-muted">You can prepare a partial set. The ZIP guide records every missing or excluded item.</p></details>}
    {failures.length > 0 && <div role="alert" className="mb-5 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm"><p className="font-semibold">{failures.length} outputs could not be prepared</p><ul className="mt-2 list-disc pl-5">{failures.map((failure, i) => <li key={i}>{failure}</li>)}</ul><p className="mt-2">Successful files are available. Failed outputs are listed in the ZIP guide.</p></div>}
    <section className="sticky bottom-3 z-20 rounded-2xl border border-line bg-white p-4 shadow-pop sm:p-5" aria-label="Prepare and download platform assets"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{outputs.length ? `${outputs.length} ${outputs.length === 1 ? 'file' : 'files'} prepared${failures.length ? ' · partial set' : ''}` : `${jobs.length} ${jobs.length === 1 ? 'file' : 'files'} ready to prepare`}</h2><p className="mt-1 hidden text-xs text-muted sm:block">{outputs.length ? `${formatBytes(outputs.reduce((sum, output) => sum + output.blob.size, 0))} · dimensions, format and published file limits checked` : 'Review each crop. Prepare files to validate their format and size.'}</p></div><div className="flex flex-wrap gap-2">{active.current && <Button onClick={() => active.current?.abort()}>Cancel</Button>}{outputs.length > 0 ? <><Button disabled={busy} onClick={() => void generate()}>Prepare again</Button><Button variant="accent" disabled={busy || (outputs.length > 1 && !zip)} onClick={() => { const single = outputs[0]; downloadBlob(outputs.length === 1 ? single.blob : zip!, outputs.length === 1 ? single.filename.split('/').pop()! : `${slugify(name)}-${pack.id}-assets.zip`); }}><DownloadIcon className="h-4 w-4" />Download {outputs.length === 1 ? outputs[0].job.frame.format.toUpperCase() : failures.length ? 'available ZIP' : 'ZIP'}</Button></> : <Button variant="accent" size="lg" disabled={busy || !jobs.length} onClick={() => void generate()}>{busy ? 'Preparing…' : `Prepare ${jobs.length || ''} ${jobs.length === 1 ? 'file' : 'files'}`}</Button>}</div></div>{status && <p role="status" className="mt-3 text-sm text-muted">{status}</p>}{!busy && checklist.length > 0 && <p className="mt-2 text-xs text-warning">Partial set: {checklist.length} checklist items need attention.</p>}</section>
    <p className="mt-6 text-xs leading-relaxed text-muted">Each asset links to its official source. Batch presets and illustrative guides are labeled separately. Review visual content before publishing; exports do not guarantee platform approval. Batch is not affiliated with these platforms.</p>
    <PlatformGuide pack={pack} />
    {editedJob && <AssetEditor key={editedJob.id} job={editedJob} logo={logo} busy={busy} onClose={() => setEditing(null)} onChange={(frame) => updateFrame(editedJob.id, normalizeFrame(editedJob.asset, frame))} onReplace={async (file) => { await upload([file], editedJob.id); }} onApplyGroup={() => { changed(); setFrames((current) => { const next = { ...current, [editedJob.asset.id]: editedJob.frame }; allJobs.filter((j) => j.asset.id === editedJob.asset.id).forEach((j) => { delete next[j.id]; }); return next; }); }} />}
  </div>;
}
