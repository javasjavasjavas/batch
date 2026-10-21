import { useI18n } from '../../i18n/LocaleContext';
import { Link2Icon, Link2OffIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { BackgroundMode, FitMode, ResizeUnit } from '../../types/batch';
import { useBatch } from '../../contexts/BatchContext';
import { RESIZE_PRESETS } from '../../data/defaultSettings';
import { fieldError } from '../../utils/validation';
import { Field, describedBy } from '../ui/Field';
import { Input } from '../ui/Input';
import { Segmented } from '../ui/Segmented';
import { RadioCards } from '../ui/RadioCards';
import { Toggle } from '../ui/Toggle';
import { ColorField } from './ColorField';

const numeric = (v: string) => v.replace(/[^\d]/g, '').slice(0, 5);

export function ResizeControls() {
  const { tr } = useI18n();
  const { settings, updateSettings, issues, enabled, setToolEnabled } = useBatch();
  const r = settings.resize;
  const set = (patch: Partial<typeof r>) => updateSettings('resize', patch);
  const widthError = fieldError(issues, 'resize', 'width');
  const heightError = fieldError(issues, 'resize', 'height');
  const percentError = fieldError(issues, 'resize', 'percent');
  const padError = fieldError(issues, 'resize', 'padColor');

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[13px] font-medium text-ink" id="resize-presets-label">{tr("Size presets")}</p>
        <div className="grid grid-cols-2 gap-1.5" role="group" aria-labelledby="resize-presets-label">
          {RESIZE_PRESETS.map((p) => {
            const active =
            r.unit === 'px' && r.width === p.width && r.height === p.height && r.lockAspect === p.lockAspect && (p.lockAspect || r.fit === p.fit);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => set({ unit: 'px', width: p.width, height: p.height, lockAspect: p.lockAspect, fit: p.fit })}
                className={twMerge(
                  'rounded-lg border px-3 py-2 text-left transition-[border-color,background-color] duration-150 ease-out',
                  active ? 'border-ink bg-lime-soft' : 'border-line bg-white hover:border-line-strong'
                )}>
                
                <span className="block text-[13px] font-medium text-ink">{tr(p.label)}</span>
                <span className="block text-[12px] text-muted">{tr(p.hint)}</span>
              </button>);

          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-ink">{tr("Resize by")}</p>
        <Segmented<ResizeUnit>
          label={tr("Resize by")}
          fullWidth
          value={r.unit}
          onChange={(unit) => set({ unit })}
          options={[
          { value: 'px', label: 'Pixels' },
          { value: 'percent', label: 'Percent' }]
          } />
        
      </div>

      {r.unit === 'px' ?
      <>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
            <Field label={tr(r.lockAspect ? 'Max width' : 'Width')} htmlFor="resize-width" error={widthError}>
              <Input
              id="resize-width"
              inputMode="numeric"
              unit="px"
              placeholder={tr(r.lockAspect ? 'Auto' : '')}
              value={r.width}
              invalid={!!widthError}
              aria-describedby={describedBy('resize-width', undefined, widthError)}
              onChange={(e) => set({ width: numeric(e.target.value) })} />
            
            </Field>
            <button
            type="button"
            aria-pressed={r.lockAspect}
            aria-label={tr("Keep original proportions")}
            title={tr(r.lockAspect ? 'Proportions kept' : 'Exact size')}
            onClick={() => set({ lockAspect: !r.lockAspect })}
            className={twMerge(
              'mt-[26px] flex h-10 w-10 items-center justify-center rounded-lg border transition-[background-color,border-color] duration-150 ease-out',
              r.lockAspect ? 'border-[#A9C82B] bg-lime text-ink' : 'border-line bg-white text-muted hover:border-line-strong'
            )}>
            
              {r.lockAspect ? <Link2Icon className="h-4 w-4" aria-hidden="true" /> : <Link2OffIcon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <Field label={tr(r.lockAspect ? 'Max height' : 'Height')} htmlFor="resize-height" error={heightError}>
              <Input
              id="resize-height"
              inputMode="numeric"
              unit="px"
              placeholder={tr(r.lockAspect ? 'Auto' : '')}
              value={r.height}
              invalid={!!heightError}
              aria-describedby={describedBy('resize-height', undefined, heightError)}
              onChange={(e) => set({ height: numeric(e.target.value) })} />
            
            </Field>
          </div>
          <p className="-mt-2 text-[12.5px] leading-snug text-muted">
            {tr(r.lockAspect ?
          'Proportions are kept. Each image fits inside this box. Leave one side empty to set only the other.' :
          'Every image gets exactly this size. Choose how images fill the frame.')}
          </p>

          {!r.lockAspect &&
        <div>
              <p className="mb-2 text-[13px] font-medium text-ink">{tr("Fit")}</p>
              <RadioCards<FitMode>
            label={tr("Fit")}
            value={r.fit}
            onChange={(fit) => set({ fit })}
            options={[
            { value: 'pad', label: 'Pad to fit', description: 'Keeps the whole image and adds a background around it.' },
            { value: 'cover', label: 'Crop to fill', description: 'Fills the frame. Edges may be trimmed.' }]
            } />
          
            </div>
        }
          {!r.lockAspect && r.fit === 'pad' && r.backgroundMode === 'original' &&
        <ColorField id="resize-pad" label={tr("Padding color")} value={r.padColor} onChange={(padColor) => set({ padColor })} error={padError} />
        }
        </> :

      <Field label={tr("Scale")} htmlFor="resize-percent" hint="Applied to both width and height." error={percentError}>
          <Input
          id="resize-percent"
          inputMode="numeric"
          unit="%"
          value={r.percent}
          invalid={!!percentError}
          aria-describedby={describedBy('resize-percent', 'Applied to both width and height.', percentError)}
          onChange={(e) => set({ percent: numeric(e.target.value) })} />
        
        </Field>
      }

      {(r.lockAspect || r.unit === 'percent') &&
      <Toggle
        label={tr("Enlarge smaller images")}
        description={tr("When off, images smaller than the target keep their size so they don’t blur.")}
        checked={r.allowUpscale}
        onChange={(allowUpscale) => set({ allowUpscale })} />

      }
      <div className="border-t border-line pt-5">
        <p className="mb-2 text-[13px] font-medium text-ink">{tr("Background")}</p>
        <RadioCards<BackgroundMode>
          label={tr("Background")}
          value={r.backgroundMode}
          onChange={(backgroundMode) => {
            set({ backgroundMode, ...(backgroundMode === 'extend' ? { unit: 'px', lockAspect: false, fit: 'pad', width: r.width || '1600', height: r.height || '1600' } : {}) });
            if (backgroundMode === 'transparent') {
              if (!enabled.convert || settings.convert.format === 'jpg') updateSettings('convert', { format: 'png' });
              if (!enabled.convert) setToolEnabled('convert', true);
            }
          }}
          options={[
            { value: 'original', label: 'Keep original', description: 'Keep the image background unchanged.' },
            { value: 'extend', label: 'Extend gradient', description: 'Continue a smooth studio background into the added space.' },
            { value: 'transparent', label: 'Remove background · AI', description: 'Cut out the product. Download with transparency.' },
            { value: 'color', label: 'Replace background · AI', description: 'Cut out the product and use a solid color.' }
          ]}
        />
        {r.backgroundMode === 'extend' && <p className="mt-2 text-[12.5px] leading-snug text-muted">{tr("Best for simple studio gradients with clear edges. Preserves the original photo; does not generate objects or scenery. Uses exact dimensions and Pad to fit.")}</p>}
        {(r.backgroundMode === 'transparent' || r.backgroundMode === 'color') && <p className="mt-2 text-[12.5px] leading-snug text-muted">{tr("AI runs on your device. First use downloads a 183 MB model, then your browser caches it. Fine details and shadows may need review. Use Compare after processing.")}</p>}
        {r.backgroundMode === 'color' && <div className="mt-3"><ColorField id="resize-background" label={tr("Background color")} value={r.padColor} onChange={(padColor) => set({ padColor })} error={padError} /></div>}
      </div>
    </div>);

}
