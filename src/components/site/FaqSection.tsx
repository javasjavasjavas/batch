import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { FaqItem } from '../../types/content';
import { Accordion } from '../ui/Accordion';

interface FaqSectionProps {
  title: string;
  intro?: string;
  items: FaqItem[];
  id?: string;
}

export function FaqSection({ title, intro, items, id }: FaqSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id ?? 'faq'}-title`} className="grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <div>
        <h2 id={`${id ?? 'faq'}-title`} className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-ink">
          {title}
        </h2>
        {intro && <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">{intro}</p>}
        <Link
          to="/help"
          className="mt-5 inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink underline-offset-4 hover:underline">
          
          Visit the help center
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <Accordion items={items} />
    </section>);

}