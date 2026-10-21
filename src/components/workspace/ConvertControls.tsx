import { useI18n } from '../../i18n/LocaleContext';
import type { OutputFormat, PngLevel } from '../../types/batch';
import { useBatch } from '../../contexts/BatchContext';
import { fieldError } from '../../utils/validation';
import { FORMAT_LABEL } from '../../utils/planning';
import { RadioCards } from '../ui/RadioCards';
import { Segmented } from '../ui/Segmented';
import { Toggle } from '../ui/Toggle';
import { ColorField } from './ColorField';

export function ConvertControls() {
  const { tr } = useI18n();
  const { settings, updateSettings, issues, enabled } = useBatch();
  const c = settings.convert;
  const set = (patch: Partial<typeof c>) => updateSettings('convert', patch);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[13px] font-medium text-ink">{tr("Output format")}</p>
        <RadioCards<OutputFormat>
          label={tr("Output format")}
          value={c.format}
          onChange={(format) => set({ format })}
          options={[
          { value: 'webp', label: 'WebP', description: 'Smallest files for websites. Supports transparency.' },
          { value: 'jpg', label: 'JPG', description: 'Works almost everywhere. Best for photos.' },
          { value: 'png', label: 'PNG', description: 'Lossless with transparency. Larger files.' }]
          } />
        
      </div>

      <div className="space-y-4 border-t border-line pt-5">
        <p className="text-[13px] font-semibold text-ink">{tr(`${FORMAT_LABEL[c.format]} options`)}</p>
        {c.format === 'jpg' &&
        <>
            <ColorField
            id="convert-bg"
            label={tr("Fill for transparent areas")}
            hint="JPG can’t store transparency, so these areas get this color."
            value={c.background}
            onChange={(background) => set({ background })}
            error={fieldError(issues, 'convert', 'background')} />
          
            <Toggle
            label={tr("Progressive loading")}
            description={tr("Images appear in passes on slow connections.")}
            checked={c.progressive}
            onChange={(progressive) => set({ progressive })} />
          
          </>
        }
        {c.format === 'png' &&
        <div>
            <p className="mb-2 text-[13px] font-medium text-ink">{tr("Compression effort")}</p>
            <Segmented<PngLevel>
            label={tr("Compression effort")}
            fullWidth
            size="sm"
            value={c.pngLevel}
            onChange={(pngLevel) => set({ pngLevel })}
            options={[
            { value: 'fast', label: 'Fast' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'smallest', label: 'Smallest' }]
            } />
          
            <p className="mt-2 text-[12.5px] leading-snug text-muted">{tr("PNG stays lossless at every level. More effort gives smaller files but takes longer.")}</p>
          </div>
        }
        {c.format === 'webp' &&
        <>
            <Toggle
            label={tr("Lossless")}
            description={tr("Keeps every pixel. Files are larger than standard WebP.")}
            checked={c.webpLossless}
            onChange={(webpLossless) => set({ webpLossless })} />
          
            <p className="text-[12.5px] leading-snug text-muted">{tr("Transparent areas are preserved.")}</p>
          </>
        }
      </div>
      {!enabled.compress && c.format !== 'png' && !(c.format === 'webp' && c.webpLossless) &&
        <p className="text-[12.5px] text-muted">{tr("Encoding quality: 82. Use Compress or the Batch workspace to choose another quality.")}</p>}
    </div>);

}
