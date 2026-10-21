import { useI18n } from '../../i18n/LocaleContext';
import { CheckIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const STEPS = ['Edit', 'Review', 'Process', 'Results'];

export function WorkflowSteps({ current, className }: {current: number;className?: string;}) {
  const { tr } = useI18n();
  return (
    <ol aria-label={tr("Workflow progress")} className={twMerge('items-center gap-1 text-[13px]', className)}>
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className="flex items-center gap-1" aria-current={active ? 'step' : undefined}>
            {i > 0 && <span className={twMerge('mx-1 h-px w-5', done || active ? 'bg-ink/40' : 'bg-line')} aria-hidden="true" />}
            <span
              className={twMerge(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
                active ? 'bg-lime text-ink' : done ? 'bg-ink text-white' : 'border border-line text-muted'
              )}
              aria-hidden="true">
              
              {done ? <CheckIcon className="h-3 w-3" strokeWidth={3} /> : i + 1}
            </span>
            <span className={twMerge(active ? 'font-medium text-ink' : 'text-muted')}>
              {tr(step)}
              {done && <span className="sr-only">{tr(" (done)")}</span>}
            </span>
          </li>);

      })}
    </ol>);

}