import { twMerge } from 'tailwind-merge';

type AdFormat = 'leaderboard' | 'rectangle' | 'strip';

const FORMATS: Record<AdFormat, string> = {
  leaderboard: 'h-[100px] w-full max-w-[728px] sm:h-[90px]',
  rectangle: 'h-[250px] w-full max-w-[300px]',
  strip: 'h-[60px] w-full max-w-[468px]'
};

interface AdSlotProps {
  format?: AdFormat;
  className?: string;
}

/** Reserved, clearly labeled ad placement. No ad network is loaded in this prototype. */
export function AdSlot({ format = 'leaderboard', className }: AdSlotProps) {
  return (
    <aside aria-label="Advertisement" className={twMerge('flex w-full flex-col items-center gap-1.5', className)}>
      <span className="text-[11px] font-medium tracking-[0.02em] text-muted">Advertisement</span>
      <div
        className={twMerge(
          'flex items-center justify-center rounded-xl border border-dashed border-line-strong bg-[#EEEEE7]',
          FORMATS[format]
        )}>
        
        <span className="text-xs text-muted">Reserved ad space</span>
      </div>
    </aside>);

}