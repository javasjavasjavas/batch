import { ArrowDownIcon, ArrowUpIcon, Maximize2Icon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { formatBytes, formatDimensions, formatTypeLabel } from '../../utils/format';
import { ImageThumb } from '../ui/ImageThumb';
import { Button } from '../ui/Button';
import { SelectCheckbox } from './SelectCheckbox';
import { ImageItemProps, imageMeta } from './ImageCard';

export const ROW_GRID = 'grid-cols-[22px_48px_minmax(0,1fr)_auto] md:grid-cols-[22px_48px_minmax(0,1fr)_64px_112px_84px_auto]';

export function ImageRow({ image, index, total, selected, planned, compact, onToggle, onOpen, onMove }: ImageItemProps) {
  const dims = formatDimensions(image.width, image.height);
  return (
    <li
      className={twMerge(
        'grid items-center gap-3 px-3 transition-colors duration-150 sm:px-4',
        ROW_GRID,
        compact ? 'py-1.5' : 'py-2.5',
        selected ? 'bg-lime-soft' : 'bg-white'
      )}>
      
      <SelectCheckbox checked={selected} onChange={onToggle} label={`Select ${image.name}`} />
      <button type="button" onClick={onOpen} aria-label={`Open details for ${image.name}`} className={twMerge('overflow-hidden rounded-md', compact ? 'h-9 w-9' : 'h-12 w-12')}>
        <ImageThumb src={image.thumbnailUrl || image.url} alt={image.name} />
      </button>
      <div className="min-w-0">
        <button type="button" onClick={onOpen} className="block max-w-full truncate rounded text-left text-sm font-medium text-ink hover:underline hover:underline-offset-2">
          {image.name}
        </button>
        {planned &&
        <p className="truncate text-[12px] text-lime-ink">
            <span className="sr-only">Planned name: </span>→ {planned}
          </p>
        }
        <p className={twMerge('tabular truncate text-[12px] md:hidden', image.status === 'unreadable' ? 'text-warning' : 'text-muted')}>
          {imageMeta(image)}
        </p>
      </div>
      <span className="hidden text-[13px] text-muted md:block">{formatTypeLabel(image.type, image.name)}</span>
      <span className={twMerge('tabular hidden text-[13px] md:block', dims ? 'text-ink' : 'text-muted')}>
        {image.status === 'loading' ? 'Reading…' : dims ?? 'Unavailable'}
      </span>
      <span className="tabular hidden text-[13px] text-ink md:block">{formatBytes(image.size)}</span>
      <div className="flex items-center">
        <Button variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${image.name} up`}>
          <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled={index === total - 1} onClick={() => onMove(1)} aria-label={`Move ${image.name} down`}>
          <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex" onClick={onOpen} aria-label={`Open details for ${image.name}`}>
          <Maximize2Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </li>);

}
