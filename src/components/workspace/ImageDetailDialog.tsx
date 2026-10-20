import { useEffect } from 'react';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, Trash2Icon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { formatBytes, formatDate, formatDimensions, formatTypeLabel } from '../../utils/format';
import { plannedDimensions, plannedName, TOOL_LABEL, TOOL_ORDER, toolSummary } from '../../utils/planning';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ImageThumb } from '../ui/ImageThumb';

interface ImageDetailDialogProps {
  imageId: string | null;
  onClose: () => void;
  onNavigate: (id: string | null) => void;
}

function Row({ label, value }: {label: string;value: string | null;}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="shrink-0 text-[13px] text-muted">{label}</dt>
      <dd className={`tabular min-w-0 break-words text-right text-[13px] ${value ? 'font-medium text-ink' : 'text-muted'}`}>{value ?? 'Not available'}</dd>
    </div>);

}

export function ImageDetailDialog({ imageId, onClose, onNavigate }: ImageDetailDialogProps) {
  const { images, selectedIds, toggleSelect, removeImages, settings, enabled } = useBatch();
  const index = images.findIndex((i) => i.id === imageId);
  const image = index >= 0 ? images[index] : null;
  const prev = index > 0 ? images[index - 1] : null;
  const next = index >= 0 && index < images.length - 1 ? images[index + 1] : null;

  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && prev) onNavigate(prev.id);
      if (e.key === 'ArrowRight' && next) onNavigate(next.id);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [image, prev, next, onNavigate]);

  const selected = image ? selectedIds.includes(image.id) : false;
  const dims = image ? plannedDimensions(image.width, image.height, settings, enabled) : null;
  const onTools = TOOL_ORDER.filter((t) => enabled[t]);

  return (
    <Dialog
      open={!!image}
      onClose={onClose}
      title={image?.name ?? ''}
      description={image ? `Image ${index + 1} of ${images.length}` : undefined}
      size="xl"
      footer={
      image &&
      <>
            <div className="mr-auto flex items-center gap-1">
              <Button variant="secondary" size="icon" disabled={!prev} onClick={() => prev && onNavigate(prev.id)} aria-label="Previous image">
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button variant="secondary" size="icon" disabled={!next} onClick={() => next && onNavigate(next.id)} aria-label="Next image">
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <Button
          variant="danger-ghost"
          onClick={() => {
            const fallback = next ?? prev;
            removeImages([image.id]);
            onNavigate(fallback ? fallback.id : null);
          }}>
          
              <Trash2Icon className="h-4 w-4" aria-hidden="true" />
              Remove
            </Button>
            <Button variant={selected ? 'accent' : 'secondary'} onClick={() => toggleSelect(image.id)} aria-pressed={selected}>
              {selected && <CheckIcon className="h-4 w-4" aria-hidden="true" />}
              {selected ? 'Selected' : 'Select'}
            </Button>
          </>

      }>
      
      {image &&
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-line">
            <ImageThumb src={image.url} alt={image.name} showLabel eager />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-ink">Original</h3>
            <dl className="mt-1 divide-y divide-line">
              <Row label="Format" value={formatTypeLabel(image.type, image.name)} />
              <Row label="File size" value={image.size != null ? formatBytes(image.size) : null} />
              <Row label="Dimensions" value={image.status === 'loading' ? 'Reading…' : formatDimensions(image.width, image.height)} />
              <Row label="Last modified" value={formatDate(image.lastModified)} />
              <Row label="Source" value={image.source === 'local' ? 'Your device' : 'Sample set'} />
            </dl>
            <div className="mt-5 flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-ink">Planned</h3>
              <span className="rounded bg-sunken px-1.5 py-0.5 text-[11px] font-medium text-muted">Not processed</span>
            </div>
            <dl className="mt-1 divide-y divide-line">
              <Row label="Output name" value={plannedName(image.name, index, settings, enabled)} />
              <Row
              label="Output size"
              value={dims ? `${dims.width} × ${dims.height}` : image.width ? 'Complete resize settings' : 'Original size unknown'} />
            
              {onTools.map((t) =>
            <Row key={t} label={TOOL_LABEL[t]} value={toolSummary(t, settings)} />
            )}
            </dl>
            {image.status === 'unreadable' &&
          <p className="mt-4 rounded-lg bg-warning-soft p-3 text-[12.5px] leading-snug text-[#5C4A2A]">
                This file couldn’t be read by your browser. It will fail in a run. Try re-exporting it as JPG or PNG.
              </p>
          }
          </div>
        </div>
      }
    </Dialog>);

}