import { useI18n } from '../../i18n/LocaleContext';
import { useId } from 'react';
import { twMerge } from 'tailwind-merge';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, description, disabled, hideLabel, className }: ToggleProps) {
  const { tr } = useI18n();
  const id = useId();
  return (
    <div className={twMerge('flex items-start justify-between gap-4', className)}>
      {!hideLabel &&
      <div className="min-w-0">
          <span id={`${id}-label`} className="text-sm font-medium text-ink">
            {tr(label)}
          </span>
          {description &&
        <p id={`${id}-desc`} className="mt-0.5 text-[13px] leading-snug text-muted">
              {tr(description)}
            </p>
        }
        </div>
      }
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={hideLabel ? undefined : `${id}-label`}
        aria-label={tr(hideLabel ? label : undefined)}
        aria-describedby={description && !hideLabel ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={twMerge(
          'relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'border-[#A9C82B] bg-lime' : 'border-line-strong bg-sunken'
        )}>
        
        <span
          className={twMerge(
            'h-[18px] w-[18px] rounded-full bg-white shadow-sm ring-1 ring-ink/10 transition-transform duration-200 ease-out',
            checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
          )} />
        
      </button>
    </div>);

}