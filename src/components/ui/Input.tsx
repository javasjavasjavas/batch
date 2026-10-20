import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  unit?: string;
  invalid?: boolean;
  leading?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
{ unit, invalid, leading, className, ...rest },
ref)
{
  return (
    <div className="relative">
      {leading &&
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">{leading}</span>
      }
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={twMerge(
          'h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-[#8E9389] transition-[border-color,box-shadow] duration-150 ease-out focus:outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:bg-sunken disabled:text-muted',
          invalid ?
          'border-danger focus:border-danger focus:ring-danger/15' :
          'border-line hover:border-line-strong focus:border-ink focus:ring-lime/70',
          unit && 'pr-10',
          leading && 'pl-9',
          'tabular',
          className
        )}
        {...rest} />
      
      {unit &&
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[13px] text-muted">{unit}</span>
      }
    </div>);

});