import { useI18n } from '../../i18n/LocaleContext';
import { twMerge } from 'tailwind-merge';
import { Field, describedBy } from '../ui/Field';
import { Input } from '../ui/Input';
import { isHexColor } from '../../utils/validation';

const SWATCHES = [
{ label: 'White', value: '#FFFFFF' },
{ label: 'Warm white', value: '#F7F7F2' },
{ label: 'Black', value: '#151715' }];


interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
}

export function ColorField({ id, label, value, onChange, hint, error }: ColorFieldProps) {
  const { tr } = useI18n();
  return (
    <Field label={tr(label)} htmlFor={id} hint={hint} error={error}>
      <div className="flex items-center gap-2">
        <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-line" style={{ backgroundColor: isHexColor(value) ? value : '#FFFFFF' }}>
          <span className="sr-only">{tr("Pick ")}{tr(label.toLowerCase())}</span>
          <input
            type="color"
            value={isHexColor(value) ? value.toLowerCase() : '#ffffff'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          
        </label>
        <div className="min-w-0 flex-1">
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value.trim())}
            invalid={!!error}
            aria-describedby={describedBy(id, hint, error)}
            maxLength={7}
            spellCheck={false}
            className="font-mono uppercase" />
          
        </div>
        <div className="flex gap-1" role="group" aria-label={tr("Quick colors")}>
          {SWATCHES.map((s) =>
          <button
            key={s.value}
            type="button"
            aria-label={tr(s.label)}
            aria-pressed={value.toUpperCase() === s.value}
            title={tr(s.label)}
            onClick={() => onChange(s.value)}
            className={twMerge(
              'h-7 w-7 rounded-md border transition-[box-shadow] duration-150',
              value.toUpperCase() === s.value ? 'border-ink ring-2 ring-lime' : 'border-line hover:border-line-strong'
            )}
            style={{ backgroundColor: s.value }} />

          )}
        </div>
      </div>
    </Field>);

}