import { ColorPicker } from '../ui/ColorPicker';
import { useI18n } from '../../i18n/LocaleContext';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { HeroCleanup } from '../steam/HeroCleanup';
import { AssetPreview } from './AssetPreview';
import { isScreenshot, type AssetJob, type PackSource } from '../../processing/platforms';
import type { AssetFrame } from '../../types/platform';

const control = 'mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm';
export function UploadInput({ label, multiple, onFiles }: { label: string; multiple?: boolean; onFiles: (files: File[]) => void }) {
  const { tr } = useI18n();
  return <label className="relative inline-flex cursor-pointer items-center justify-center rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium hover:bg-canvas focus-within:ring-2 focus-within:ring-ink">{tr(label)}<input aria-label={tr(label)} type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" multiple={multiple} className="absolute inset-0 w-full cursor-pointer opacity-0" onChange={(event) => { onFiles(Array.from(event.target.files || [])); event.target.value = ''; }} /></label>;
}
export function AssetEditor({ job, logo, busy, onClose, onChange, onReplace, onApplyGroup }: { job: AssetJob; logo?: PackSource; busy: boolean; onClose: () => void; onChange: (frame: AssetFrame) => void; onReplace: (file: File) => Promise<void>; onApplyGroup: () => void }) {
  const { tr } = useI18n();
  const [guides, setGuides] = useState(true);
  const screenshot = isScreenshot(job.asset), f = job.frame;
  const allowCaption = !['android-tablet', 'android-tv'].includes(job.asset.input || '');
  const patch = (part: Partial<AssetFrame>) => onChange({ ...f, ...part });
  const range = (key: 'x' | 'y' | 'zoom' | 'logoX' | 'logoY' | 'logoSize' | 'textY' | 'textSize', label: string, min = 0, max = 100, step = 1) => <label className="block text-xs font-medium">{tr(label)} <span className="text-muted">{tr(f[key])}</span><input aria-label={tr(label)} type="range" min={min} max={max} step={step} value={f[key]} onChange={(e) => patch({ [key]: Number(e.target.value) })} className="mt-2 w-full accent-[#151715]" /></label>;
  return <Dialog open onClose={busy ? () => undefined : onClose} size="xl" title={tr(`Adjust ${job.asset.name}`)} description={`${job.width} × ${job.height} · ${job.source.file.name}`} footer={<div className="flex flex-wrap justify-end gap-2">{job.asset.repeat && <Button disabled={busy} onClick={onApplyGroup}>{tr("Apply layout to this size")}</Button>}<Button disabled={busy} variant="accent" onClick={onClose}>{tr("Done")}</Button></div>}>
    <div className="grid min-w-0 gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div><div className="overflow-hidden rounded-xl border border-line"><AssetPreview job={job} logo={logo} large guides={guides} /></div><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} />{tr("Show crop / placement guides")}</label><p className="mt-2 text-xs text-muted">{tr("Guides are not exported. Device layouts may vary. ")}{job.asset.safeAreas?.map((a) => `${tr(a.label)}: ${tr(a.official ? 'official guide' : 'illustrative placement')}.`).join(' ')}</p></div>
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        <UploadInput label={tr(`Replace ${job.asset.name} image`)} onFiles={(files) => { if (files[0]) void onReplace(files[0]); }} />
        {!screenshot ? <><label className="block text-xs font-medium">{tr("Fit")}<select className={control} value={f.fit} onChange={(e) => patch({ fit: e.target.value as AssetFrame['fit'] })}><option value="cover">{tr("Crop to fill")}</option><option value="contain">{tr("Fit entire image")}</option></select></label>{tr(range('zoom', 'Image scale', 0.5, 3, 0.05))}</> : <><p className="text-xs text-muted">{tr("The complete screenshot stays visible, with its original proportions.")}</p>{allowCaption && <label className="block text-xs font-medium">{tr("Layout")}<select className={control} value={f.template} onChange={(e) => patch({ template: e.target.value as AssetFrame['template'] })}><option value="plain">{tr("Screenshot only")}</option><option value="caption">{tr("Screenshot + caption")}</option></select></label>}</>}
        <div className="grid grid-cols-2 gap-4">{tr(range('x', 'Horizontal position'))}{tr(range('y', 'Vertical position'))}</div>
        <div className="grid grid-cols-2 gap-4"><label className="text-xs font-medium">{tr("Background")}<ColorPicker label={tr("Asset background")} className="mt-2" value={f.background} onChange={hex => patch({ background: hex })} /></label><label className="text-xs font-medium">{tr("Format")}<select aria-label={tr("Asset format")} className={control} value={f.format} onChange={(e) => patch({ format: e.target.value as 'png' | 'jpg' })}>{(job.asset.formats || [job.asset.format]).map((format) => <option key={format} value={format}>{tr(format.toUpperCase())}</option>)}</select></label></div>
        {!job.asset.opaque && f.format === 'png' && <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={f.transparent} onChange={(e) => patch({ transparent: e.target.checked })} />{tr("Transparent padding")}</label>}
        {logo && !screenshot && !job.asset.cleanArtwork && <><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.logo} onChange={(e) => patch({ logo: e.target.checked })} />{tr("Overlay logo")}</label>{f.logo && <div className="space-y-3">{tr(range('logoSize', 'Logo size', 5, 80))}<div className="grid grid-cols-2 gap-4">{tr(range('logoX', 'Logo horizontal'))}{tr(range('logoY', 'Logo vertical'))}</div></div>}</>}
        {!job.asset.cleanArtwork && (!screenshot || f.template === 'caption') && <div className="space-y-3"><label className="block text-xs font-medium">{tr(screenshot ? 'Caption' : 'Text (optional)')}<textarea aria-label={tr("Asset text")} className={control} rows={2} maxLength={140} value={f.text} onChange={(e) => patch({ text: e.target.value })} /></label><div className="grid grid-cols-2 gap-4"><label className="text-xs">{tr("Text color")}<ColorPicker label={tr("Text color")} className="mt-2" value={f.textColor} onChange={hex => patch({ textColor: hex })} /></label>{tr(range('textSize', 'Text size', 3, 20))}</div>{tr(!screenshot && range('textY', 'Text position', 10, 90))}</div>}
        {!screenshot && <HeroCleanup key={job.source.url} target={job.asset.name} source={job.source} onApply={onReplace} />}
      </fieldset>
    </div>
  </Dialog>;
}
