import { useI18n } from '../../i18n/LocaleContext';
import React from 'react';
import { CircleAlertIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  aside?: React.ReactNode;
}

export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

export function Field({ label, htmlFor, hint, error, children, className, aside }: FieldProps) {
  const { tr } = useI18n();
  return (
    <div className={twMerge('min-w-0', className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
          {tr(label)}
        </label>
        {tr(aside)}
      </div>
      {tr(children)}
      {error ?
      <p id={`${htmlFor}-error`} className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-danger">
          <CircleAlertIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {tr(error)}
        </p> :

      hint &&
      <p id={`${htmlFor}-hint`} className="mt-1.5 text-[12.5px] leading-snug text-muted">
            {tr(hint)}
          </p>

      }
    </div>);

}