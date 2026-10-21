import { useI18n } from '../../i18n/LocaleContext';
import React, { useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface RadioCardOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioCardsProps<T extends string> {
  options: RadioCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function RadioCards<T extends string>({ options, value, onChange, label, columns = 1, className }: RadioCardsProps<T>) {
  const { tr } = useI18n();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={tr(label)}
      className={twMerge('grid gap-2', columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-1', className)}>
      
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={twMerge(
              'flex items-start gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color] duration-150 ease-out',
              selected ? 'border-ink bg-lime-soft' : 'border-line bg-white hover:border-line-strong'
            )}>
            
            <span
              className={twMerge(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px]',
                selected ? 'border-ink bg-white' : 'border-line-strong bg-white'
              )}
              aria-hidden="true">
              
              {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{tr(option.label)}</span>
              {option.description && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{tr(option.description)}</span>}
            </span>
          </button>);

      })}
    </div>);

}