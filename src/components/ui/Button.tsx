import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { LoaderCircleIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

const base =
'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium select-none transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:bg-[#2B2E2A]',
  accent: 'bg-lime text-ink hover:bg-lime-strong',
  secondary: 'border border-line bg-white text-ink hover:border-line-strong hover:bg-[#FBFBF8]',
  ghost: 'text-ink hover:bg-sunken',
  danger: 'bg-danger text-white hover:bg-[#9A1E14]',
  'danger-ghost': 'text-danger hover:bg-danger-soft'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8'
};

export function buttonClasses(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', className?: string) {
  return twMerge(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
{ variant = 'secondary', size = 'md', loading = false, className, children, disabled, type = 'button', ...rest },
ref)
{
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}>
      
      {loading && <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>);

});