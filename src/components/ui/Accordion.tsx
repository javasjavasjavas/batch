import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface AccordionProps { items: { q: string; a: React.ReactNode }[]; className?: string; defaultOpen?: number | null }

/** Native disclosures keep answers in HTML and work before JavaScript loads. */
export function Accordion({ items, className, defaultOpen = null }: AccordionProps) {
  return <div className={twMerge('divide-y divide-line border-y border-line', className)}>
    {items.map((item, i) => <details key={item.q} open={defaultOpen === i ? true : undefined} className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
        <span>{item.q}</span><ChevronDownIcon className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="max-w-[62ch] pb-5 text-[14.5px] leading-relaxed text-muted">{item.a}</div>
    </details>)}
  </div>;
}
