import { useI18n } from '../../i18n/LocaleContext';
import { useNavigate } from '../../i18n/router';
import { ArrowRightIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { formatBytes, pluralize } from '../../utils/format';
import { TOOL_ORDER } from '../../utils/planning';
import { Button } from '../ui/Button';

export function MobileActionBar({ onOpenSettings }: {onOpenSettings: () => void;}) {
  const { tr } = useI18n();
  const { workspacePath, workspaceTool, images, selectedIds, beginReview, enabled, errorCount } = useBatch();
  const navigate = useNavigate();
  const onCount = workspaceTool ? 1 : TOOL_ORDER.filter((t) => enabled[t]).length;
  const total = images.reduce((a, i) => a + (i.size ?? 0), 0);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 lg:hidden">
      <p className="tabular mb-2 text-[12px] text-muted">
        {tr(images.length ? `${pluralize(images.length, 'image')} · ${formatBytes(total)}` : 'No images yet')}
        {errorCount > 0 && images.length > 0 && <span className="text-danger">{tr(" · ")}{tr(pluralize(errorCount, 'setting'))}{tr(" to fix")}</span>}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="lg" onClick={onOpenSettings} className="px-4">
          <SlidersHorizontalIcon className="h-4 w-4" aria-hidden="true" />{tr("Settings")}<span className="tabular rounded bg-lime-soft px-1.5 text-[12px] font-semibold text-lime-ink">{tr(onCount)}</span>
        </Button>
        <Button variant="accent" size="lg" className="flex-1" disabled={!images.length} onClick={() => { beginReview(); navigate(`${workspacePath}/review`); }}>{tr("Review batch")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {selectedIds.length > 0 && (
        <Button variant="secondary" className="mt-2 w-full" onClick={() => { beginReview(true); navigate(`${workspacePath}/review`); }}>{tr("Review selected (")}{tr(selectedIds.length)}{tr(")")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>);

}
