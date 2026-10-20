import { ChevronLeftIcon, ChevronRightIcon, CornerDownRightIcon, LoaderCircleIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { BatchImage } from '../../types/batch';
import { formatBytes, formatDimensions } from '../../utils/format';
import { ImageThumb } from '../ui/ImageThumb';
import { SelectCheckbox } from './SelectCheckbox';

export interface ImageItemProps {
  image: BatchImage;
  index: number;
  total: number;
  selected: boolean;
  planned: string | null;
  compact: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onMove: (direction: -1 | 1) => void;
}

export function imageMeta(image: BatchImage): string {
  if (image.status === 'loading') return `${formatBytes(image.size)} · Reading…`;
  if (image.status === 'unreadable') return `${formatBytes(image.size)} · Preview unavailable`;
  return [formatBytes(image.size), formatDimensions(image.width, image.height) ?? 'Dimensions unavailable'].join(' · ');
}

const moveBtn =
'flex h-7 w-7 items-center justify-center rounded-md border border-line bg-white/95 text-ink shadow-sm transition-colors duration-150 hover:bg-white disabled:opacity-40';

export function ImageCard({ image, index, total, selected, planned, compact, onToggle, onOpen, onMove }: ImageItemProps) {
  return (
    <li className="group relative">
      <div
        className={twMerge(
          'relative h-full rounded-xl border p-1.5 transition-[border-color,background-color,box-shadow] duration-150 ease-out',
          selected ? 'border-[#A9C82B] bg-lime-soft shadow-[0_0_0_1px_#A9C82B]' : 'border-line bg-white hover:border-line-strong'
        )}>
        
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open details for ${image.name}`}
          className="relative block aspect-square w-full overflow-hidden rounded-lg">
          
          <ImageThumb src={image.thumbnailUrl || image.url} alt={image.name} showLabel={!compact} />
          {image.status === 'loading' &&
          <span className="absolute inset-0 flex items-center justify-center bg-white/50">
              <LoaderCircleIcon className="h-5 w-5 animate-spin text-muted" aria-hidden="true" />
            </span>
          }
        </button>
        <SelectCheckbox
          checked={selected}
          onChange={onToggle}
          label={`Select ${image.name}`}
          className="absolute left-3 top-3 shadow-sm" />
        
        <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
          <button type="button" className={moveBtn} disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${image.name} earlier`}>
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" className={moveBtn} disabled={index === total - 1} onClick={() => onMove(1)} aria-label={`Move ${image.name} later`}>
            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className={compact ? 'px-1 pb-0.5 pt-2' : 'px-1.5 pb-1 pt-2.5'}>
          <p className="truncate text-[13px] font-medium text-ink" title={image.name}>
            {image.name}
          </p>
          <p className={twMerge('tabular mt-0.5 truncate text-[12px]', image.status === 'unreadable' ? 'text-warning' : 'text-muted')}>
            {imageMeta(image)}
          </p>
          {planned && !compact &&
          <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-lime-ink" title={`Planned name: ${planned}`}>
              <CornerDownRightIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="sr-only">Planned name: </span>
              <span className="truncate">{planned}</span>
            </p>
          }
        </div>
      </div>
    </li>);

}
