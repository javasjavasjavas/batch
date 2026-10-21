import { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { HeroCleanup } from '../steam/HeroCleanup';
import { AssetPreview } from './AssetPreview';
import { isScreenshot, type AssetJob, type PackSource } from '../../processing/platforms';
import type { AssetFrame } from '../../types/platform';

const control = 'mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm';
export function UploadInput({ label, multiple, onFiles }: { label: string; multiple?: boolean; onFiles: (files: File[]) => void }) {
  return <label className="relative inline-flex cursor-pointer items-center justify-center rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium hover:bg-canvas focus-within:ring-2 focus-within:ring-ink">{label}<input aria-label={label} type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" multiple={multiple} className="absolute inset-0 w-full cursor-pointer opacity-0" onChange={(event) => { onFiles(Array.from(event.target.files || [])); event.target.value = ''; }} /></label>;
}
export function AssetEditor({ job, logo, busy, onClose, onChange, onReplace, onApplyGroup }: { job: AssetJob; logo?: PackSource; busy: boolean; onClose: () => void; onChange: (frame: AssetFrame) => void; onReplace: (file: File) => Promise<void>; onApplyGroup: () => void }) {
  const [guides, setGuides] = useState(true);
  const screenshot = isScreenshot(job.asset), f = job.frame;
  const allowCaption = !['android-tablet', 'android-tv'].includes(job.asset.input || '');
  const patch = (part: Partial<AssetFrame>) => onChange({ ...f, ...part });
  const range = (key: 'x' | 'y' | 'zoom' | 'logoX' | 'logoY' | 'logoSize' | 'textY' | 'textSize', label: string, min = 0, max = 100, step = 1) => <label className="block text-xs font-medium">{label} <span className="text-muted">{f[key]}</span><input aria-label={label} type="range" min={min} max={max} step={step} value={f[key]} onChange={(e) => patch({ [key]: Number(e.target.value) })} className="mt-2 w-full accent-[#151715]" /></label>;
  return <Dialog open onClose={busy ? () => undefined : onClose} size="xl" title={`Adjust ${job.asset.name}`} description={`${job.width} × ${job.height} · ${job.source.file.name}`} footer={<div className="flex flex-wrap justify-end gap-2">{job.asset.repeat && <Button disabled={busy} onClick={onApplyGroup}>Apply layout to this size</Button>}<Button disabled={busy} variant="accent" onClick={onClose}>Done</Button></div>}>
    <div className="grid min-w-0 gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div><div className="overflow-hidden rounded-xl border border-line"><AssetPreview job={job} logo={logo} large guides={guides} /></div><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} />Show crop / placement guides</label><p className="mt-2 text-xs text-muted">Guides are not exported. Device layouts may vary. {job.asset.safeAreas?.map((a) => `${a.label}: ${a.official ? 'official guide' : 'illustrative placement'}.`).join(' ')}</p></div>
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        <UploadInput label={`Replace ${job.asset.name} image`} onFiles={(files) => { if (files[0]) void onReplace(files[0]); }} />
        {!screenshot ? <><label className="block text-xs font-medium">Fit<select className={control} value={f.fit} onChange={(e) => patch({ fit: e.target.value as AssetFrame['fit'] })}><option value="cover">Crop to fill</option><option value="contain">Fit entire image</option></select></label>{range('zoom', 'Image scale', 0.5, 3, 0.05)}</> : <><p className="text-xs text-muted">The complete screenshot stays visible, with its original proportions.</p>{allowCaption && <label className="block text-xs font-medium">Layout<select className={control} value={f.template} onChange={(e) => patch({ template: e.target.value as AssetFrame['template'] })}><option value="plain">Screenshot only</option><option value="caption">Screenshot + caption</option></select></label>}</>}
        <div className="grid grid-cols-2 gap-4">{range('x', 'Horizontal position')}{range('y', 'Vertical position')}</div>
        <div className="grid grid-cols-2 gap-4"><label className="text-xs font-medium">Background<input aria-label="Asset background" className="mt-2 block h-9 w-full" type="color" value={f.background} onChange={(e) => patch({ background: e.target.value })} /></label><label className="text-xs font-medium">Format<select aria-label="Asset format" className={control} value={f.format} onChange={(e) => patch({ format: e.target.value as 'png' | 'jpg' })}>{(job.asset.formats || [job.asset.format]).map((format) => <option key={format} value={format}>{format.toUpperCase()}</option>)}</select></label></div>
        {!job.asset.opaque && f.format === 'png' && <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={f.transparent} onChange={(e) => patch({ transparent: e.target.checked })} />Transparent padding</label>}
        {logo && !screenshot && !job.asset.cleanArtwork && <><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.logo} onChange={(e) => patch({ logo: e.target.checked })} />Overlay logo</label>{f.logo && <div className="space-y-3">{range('logoSize', 'Logo size', 5, 80)}<div className="grid grid-cols-2 gap-4">{range('logoX', 'Logo horizontal')}{range('logoY', 'Logo vertical')}</div></div>}</>}
        {!job.asset.cleanArtwork && (!screenshot || f.template === 'caption') && <div className="space-y-3"><label className="block text-xs font-medium">{screenshot ? 'Caption' : 'Text (optional)'}<textarea aria-label="Asset text" className={control} rows={2} maxLength={140} value={f.text} onChange={(e) => patch({ text: e.target.value })} /></label><div className="grid grid-cols-2 gap-4"><label className="text-xs">Text color<input aria-label="Text color" className="mt-2 block h-8 w-full" type="color" value={f.textColor} onChange={(e) => patch({ textColor: e.target.value })} /></label>{range('textSize', 'Text size', 3, 20)}</div>{!screenshot && range('textY', 'Text position', 10, 90)}</div>}
        {!screenshot && <HeroCleanup key={job.source.url} target={job.asset.name} source={job.source} onApply={onReplace} />}
      </fieldset>
    </div>
  </Dialog>;
}
