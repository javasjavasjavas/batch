import { useI18n } from '../../i18n/LocaleContext';
import React from 'react';
import { InfoIcon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { QUALITY_PRESETS } from '../../data/defaultSettings';
import { Segmented } from '../ui/Segmented';
import { Toggle } from '../ui/Toggle';

function describeQuality(q: number): {label: string;text: string;} {
  if (q >= 90) return { label: 'Near original', text: 'Keeps almost all detail. Files stay large, so this suits print or archiving.' };
  if (q >= 75) return { label: 'Recommended', text: 'Little visible difference at normal size, with much smaller files. A good default for the web.' };
  if (q >= 50) return { label: 'Smaller', text: 'Noticeably lighter files. Fine for thumbnails and previews; fine textures may soften.' };
  return { label: 'Very small', text: 'Expect visible blocks and banding, especially in skies and smooth gradients.' };
}

export function CompressControls() {
  const { tr } = useI18n();
  const { settings, updateSettings, enabled, images } = useBatch();
  const c = settings.compress;
  const band = describeQuality(c.quality);
  const pngOutput = enabled.convert ? settings.convert.format === 'png'
    : images.length > 0 && images.every((image) => image.type === 'image/png');
  const losslessWebp = enabled.convert && settings.convert.format === 'webp' && settings.convert.webpLossless;
  const qualityDisabled = pngOutput || losslessWebp;
  const qualityHelp = pngOutput
    ? 'PNG is lossless: quality does not change its pixels or size. Choose JPG or lossy WebP for adjustable quality.'
    : losslessWebp ? 'Lossless WebP keeps every pixel. Turn off Lossless to adjust quality and file size.' : '';

  return (
    <div className="space-y-5">
      <fieldset disabled={qualityDisabled} className={`min-w-0 space-y-5 ${qualityDisabled ? 'opacity-50' : ''}`}>
      <div>
        <div className="flex items-end justify-between">
          <label htmlFor="compress-quality" className="text-[13px] font-medium text-ink">{tr("Quality")}</label>
          <output htmlFor="compress-quality" className="tabular text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink">
            {tr(c.quality)}
          </output>
        </div>
        <input
          id="compress-quality"
          type="range"
          min={1}
          max={100}
          value={c.quality}
          onChange={(e) => updateSettings('compress', { quality: Number(e.target.value) })}
          aria-valuetext={`${c.quality}, ${band.label}`}
          aria-describedby="compress-quality-help"
          className="range mt-4"
          style={{ ['--fill' as string]: `${c.quality}%` } as React.CSSProperties} />
        
        <div className="mt-2 flex justify-between text-[12px] text-muted">
          <span>{tr("Smaller files")}</span>
          <span>{tr("More detail")}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-ink">{tr("Presets")}</p>
        <Segmented<string>
          label={tr("Quality presets")}
          size="sm"
          fullWidth
          value={String(c.quality)}
          onChange={(v) => updateSettings('compress', { quality: Number(v) })}
          options={QUALITY_PRESETS.map((p) => ({ value: String(p.value), label: p.label }))} />
        
      </div>
      </fieldset>

      <div id="compress-quality-help" className="rounded-xl bg-canvas p-3.5">
        <p className="text-[13px] font-semibold text-ink">{tr(qualityDisabled ? 'Lossless output' : band.label)}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted">{tr(qualityDisabled ? qualityHelp : band.text)}</p>
      </div>

      {!enabled.convert && images.some((image) => image.type === 'image/png') && !pngOutput &&
      <p className="flex gap-2 text-[12.5px] leading-snug text-muted">
          <InfoIcon className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />{tr("PNG files stay lossless. Quality affects only the JPG and lossy WebP files in this batch.")}</p>
      }

      <Toggle
        label={tr("Remove metadata")}
        description={tr("Re-encoding removes metadata. Keep this on for compression; Rename only preserves the original bytes and metadata.")}
        checked={c.stripMetadata}
        onChange={(stripMetadata) => updateSettings('compress', { stripMetadata })} />
      
    </div>);

}
