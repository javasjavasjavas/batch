import { twMerge } from 'tailwind-merge';

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

/** Three cascading rounded squares: a stack of images moving through one workflow. */
export function Logo({ showWordmark = true, className, size = 'md' }: LogoProps) {
  const mark = size === 'sm' ? 'h-[22px] w-[22px]' : 'h-6 w-6';
  return (
    <span className={twMerge('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 24 24" className={mark} aria-hidden="true">
        <rect x="1.5" y="1.5" width="12" height="12" rx="3" fill="#D4F25C" />
        <rect x="6" y="6" width="12" height="12" rx="3" fill="none" stroke="#151715" strokeWidth="1.75" />
        <rect x="10.5" y="10.5" width="12" height="12" rx="3" fill="#151715" />
      </svg>
      {showWordmark &&
      <span className={twMerge('font-semibold tracking-[-0.03em] text-ink', size === 'sm' ? 'text-[17px]' : 'text-[19px]')}>
          Batch
        </span>
      }
    </span>);

}