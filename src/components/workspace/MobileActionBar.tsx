import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { formatBytes, pluralize } from '../../utils/format';
import { TOOL_ORDER } from '../../utils/planning';
import { Button } from '../ui/Button';

export function MobileActionBar({ onOpenSettings }: {onOpenSettings: () => void;}) {
  const { workspacePath, workspaceTool, images, selectedIds, beginReview, enabled, errorCount } = useBatch();
  const navigate = useNavigate();
  const onCount = workspaceTool ? 1 : TOOL_ORDER.filter((t) => enabled[t]).length;
  const total = images.reduce((a, i) => a + (i.size ?? 0), 0);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 lg:hidden">
      <p className="tabular mb-2 text-[12px] text-muted">
        {images.length ? `${pluralize(images.length, 'image')} · ${formatBytes(total)}` : 'No images yet'}
        {errorCount > 0 && images.length > 0 && <span className="text-danger"> · {pluralize(errorCount, 'setting')} to fix</span>}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="lg" onClick={onOpenSettings} className="px-4">
          <SlidersHorizontalIcon className="h-4 w-4" aria-hidden="true" />
          Settings
          <span className="tabular rounded bg-lime-soft px-1.5 text-[12px] font-semibold text-lime-ink">{onCount}</span>
        </Button>
        <Button variant="accent" size="lg" className="flex-1" disabled={!images.length} onClick={() => { beginReview(); navigate(`${workspacePath}/review`); }}>
          Review batch
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {selectedIds.length > 0 && (
        <Button variant="secondary" className="mt-2 w-full" onClick={() => { beginReview(true); navigate(`${workspacePath}/review`); }}>
          Review selected ({selectedIds.length})
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>);

}
