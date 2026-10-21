import { useI18n } from '../../i18n/LocaleContext';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  tone?: 'neutral' | 'error';
  className?: string;
  headingLevel?: 'h1' | 'h2' | 'h3';
}

export function EmptyState({ icon, title, description, children, tone = 'neutral', className, headingLevel = 'h2' }: EmptyStateProps) {
  const { tr } = useI18n();
  const Heading = headingLevel;
  return (
    <div className={twMerge('mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center', className)}>
      <div
        className={twMerge(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-xl border',
          tone === 'error' ? 'border-danger/20 bg-danger-soft text-danger' : 'border-line bg-white text-ink'
        )}
        aria-hidden="true">
        
        {tr(icon)}
      </div>
      <Heading className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{tr(title)}</Heading>
      {description && <div className="mt-1.5 text-sm leading-relaxed text-muted">{tr(description)}</div>}
      {children && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{tr(children)}</div>}
    </div>);

}