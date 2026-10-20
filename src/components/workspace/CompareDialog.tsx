import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type { RunItem } from '../../types/run';
import { formatBytes, formatDimensions, formatTypeLabel } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ImageThumb } from '../ui/ImageThumb';

interface CompareDialogProps {
  items: RunItem[];
  itemId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export function CompareDialog({ items, itemId, onClose, onNavigate }: CompareDialogProps) {
  const index = items.findIndex((i) => i.id === itemId);
  const item = index >= 0 ? items[index] : null;
  const prev = index > 0 ? items[index - 1] : null;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;

  const w = item?.plannedWidth ?? item?.width ?? 4;
  const h = item?.plannedHeight ?? item?.height ?? 3;
  const plannedRatio = `${w} / ${h}`;
  const plannedIsWide = w / h >= 4 / 3;

  return (
    <Dialog
      open={!!item}
      onClose={onClose}
      title={item?.outputName ?? ''}
      description="Original and processed output"
      size="xl"
      footer={
      item &&
      <>
            <p className="tabular mr-auto text-[13px] text-muted">
              {index + 1} of {items.length}
            </p>
            <Button variant="secondary" disabled={!prev} onClick={() => prev && onNavigate(prev.id)}>
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <Button variant="secondary" disabled={!next} onClick={() => next && onNavigate(next.id)}>
              Next
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>

      }>
      
      {item &&
      <>
          <div className="grid gap-5 md:grid-cols-2">
            <figure>
              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-line bg-canvas p-4">
                <ImageThumb src={item.url} alt={`Original: ${item.name}`} fit="contain" className="bg-transparent" showLabel eager />
              </div>
              <figcaption className="mt-3">
                <p className="text-[13px] font-semibold text-ink">Original</p>
                <p className="tabular text-[13px] text-muted">
                  {item.name} · {formatDimensions(item.width, item.height) ?? 'Size unknown'} · {formatBytes(item.originalSize)}
                </p>
              </figcaption>
            </figure>
            <figure>
              <div className="relative flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-line-strong bg-canvas p-4">
                <div className={`overflow-hidden rounded-md border border-line bg-white ${plannedIsWide ? 'h-auto w-full' : 'h-full w-auto'}`} style={{ aspectRatio: plannedRatio }}>
                  <ImageThumb src={item.outputUrl ?? null} alt={`Processed: ${item.outputName}`} fit="contain" className="transparency-grid" eager />
                </div>
              </div>
              <figcaption className="mt-3">
                <p className="text-[13px] font-semibold text-ink">Processed output</p>
                <p className="tabular text-[13px] text-muted">
                  {item.outputName} · {item.plannedWidth && item.plannedHeight ? `${item.plannedWidth} × ${item.plannedHeight}` : 'Size unknown'} ·{' '}
                  {formatTypeLabel('', `x.${item.outputFormat}`)}
                  {' · '}{formatBytes(item.outputSize ?? null)}
                </p>
              </figcaption>
            </figure>
          </div>
        </>
      }
    </Dialog>);

}
