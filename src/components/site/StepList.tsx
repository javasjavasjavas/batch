import type { ToolStep } from '../../types/content';
import type { LucideIcon } from 'lucide-react';

/** Sequential steps: the numbers carry meaning because order matters. */
export function StepList({ steps }: {steps: (ToolStep & { icon?: LucideIcon })[];}) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
      {steps.map(({ icon: Icon, ...step }, i) =>
      <li key={step.title} className="flex flex-col bg-white p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
          <span className="tabular flex h-8 w-8 items-center justify-center rounded-full bg-lime text-sm font-semibold text-ink">
            {i + 1}
          </span>
            {Icon && <Icon className="h-6 w-6 text-ink" strokeWidth={1.75} aria-hidden="true" />}
          </div>
          <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.01em] text-ink">{step.title}</h3>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{step.body}</p>
        </li>
      )}
    </ol>);

}
