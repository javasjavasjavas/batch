import React, { useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: 'sm' | 'md';
  iconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  iconOnly,
  fullWidth,
  className
}: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={twMerge(
        'gap-0.5 rounded-lg border border-line bg-sunken/70 p-0.5',
        fullWidth ? 'flex w-full' : 'inline-flex',
        className
      )}>
      
      {options.map((option, i) => {
        const selected = option.value === value;
        const focusable = selected || i === 0 && !options.some((o) => o.value === value);
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={iconOnly ? option.label : undefined}
            title={iconOnly ? option.label : undefined}
            tabIndex={focusable ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={twMerge(
              'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-[background-color,color,box-shadow] duration-150 ease-out',
              size === 'sm' ? 'h-7 px-2.5 text-[13px]' : 'h-8 px-3 text-sm',
              iconOnly && (size === 'sm' ? 'w-8 px-0' : 'w-9 px-0'),
              fullWidth && 'flex-1',
              selected ? 'bg-lime text-ink shadow-[0_1px_2px_rgba(21,23,21,0.12)]' : 'text-muted hover:bg-white/80 hover:text-ink'
            )}>
            
            {option.icon}
            {!iconOnly && option.label}
          </button>);

      })}
    </div>);

}