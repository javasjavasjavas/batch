import { Columns2Icon, DownloadIcon } from 'lucide-react';
import type { RunItem } from '../../types/run';
import { formatBytes } from '../../utils/format';
import { ImageThumb } from '../ui/ImageThumb';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface ResultItemProps {
  item: RunItem;
  onCompare: () => void;
  onDownload: () => void;
}

export function ResultItem({ item, onCompare, onDownload }: ResultItemProps) {
  const dims = item.plannedWidth && item.plannedHeight ? `${item.plannedWidth} × ${item.plannedHeight}` : 'Size unknown';
  return (
    <li className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 gap-y-2 px-3 py-3 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center sm:px-4">
      <button type="button" onClick={onCompare} className="row-span-2 h-14 w-14 overflow-hidden rounded-md sm:row-span-1" aria-label={`Compare ${item.outputName}`}>
        <ImageThumb src={item.outputUrl || item.url} alt="" />
      </button>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink">{item.outputName}</p>
          <StatusBadge status="complete" className="hidden sm:inline-flex" />
        </div>
        <p className="truncate text-[12px] text-muted">from {item.name}</p>
        <p className="tabular mt-0.5 text-[12.5px] text-ink">
          {dims} · {item.outputFormat.toUpperCase()}
          {' · '}{formatBytes(item.originalSize)} → {formatBytes(item.outputSize ?? null)}
          {item.originalSize && item.outputSize !== undefined ? ` (${item.outputSize > item.originalSize ? '+' : ''}${Math.round((item.outputSize / item.originalSize - 1) * 100)}%)` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="secondary" onClick={onCompare}>
          <Columns2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          Compare
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onDownload} aria-label={`Download ${item.outputName}`}>
          <DownloadIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </li>);

}
