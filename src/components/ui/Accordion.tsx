import React, { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface AccordionItem {
  q: string;
  a: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  defaultOpen?: number | null;
}

export function Accordion({ items, className, defaultOpen = null }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();
  return (
    <div className={twMerge('divide-y divide-line border-y border-line', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                id={`${baseId}-b${i}`}
                aria-expanded={isOpen}
                aria-controls={`${baseId}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-medium text-ink transition-colors duration-150 hover:text-[#3B3F3A]">
                
                {item.q}
                <ChevronDownIcon
                  className={twMerge('h-4 w-4 shrink-0 text-muted transition-transform duration-200 ease-out', isOpen && 'rotate-180')}
                  aria-hidden="true" />
                
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen &&
              <motion.div
                id={`${baseId}-p${i}`}
                role="region"
                aria-labelledby={`${baseId}-b${i}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden">
                
                  <div className="max-w-[62ch] pb-5 text-[14.5px] leading-relaxed text-muted">{item.a}</div>
                </motion.div>
              }
            </AnimatePresence>
          </div>);

      })}
    </div>);

}