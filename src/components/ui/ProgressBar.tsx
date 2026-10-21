import { useI18n } from '../../i18n/LocaleContext';
import { twMerge } from 'tailwind-merge';

interface ProgressBarProps {
  value: number;
  label: string;
  tone?: 'ink' | 'lime' | 'danger' | 'muted';
  size?: 'sm' | 'lg';
  className?: string;
}

const TONES = {
  ink: 'bg-ink',
  lime: 'bg-[#A9C82B]',
  danger: 'bg-danger',
  muted: 'bg-line-strong'
};

export function ProgressBar({ value, label, tone = 'ink', size = 'sm', className }: ProgressBarProps) {
  const { tr } = useI18n();
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={tr(label)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={twMerge('w-full overflow-hidden rounded-full bg-sunken', size === 'lg' ? 'h-2.5' : 'h-1.5', className)}>
      
      <div
        className={twMerge('h-full rounded-full transition-[width] duration-150 ease-linear', TONES[tone])}
        style={{ width: `${pct}%` }} />
      
    </div>);

}