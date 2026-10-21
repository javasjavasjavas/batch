import { useI18n } from '../../i18n/LocaleContext';
import { useRef, useState } from 'react';
import { LayoutGridIcon, ListIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import type { ViewMode } from '../../types/prefs';
import { useBatch } from '../../contexts/BatchContext';
import { useToast } from '../../contexts/ToastContext';
import { ACCEPT_ATTR } from '../../utils/files';
import { formatBytes, pluralize } from '../../utils/format';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SelectCheckbox } from './SelectCheckbox';

interface BatchToolbarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onAddFiles: (files: File[]) => void;
}

export function BatchToolbar({ view, onViewChange, onAddFiles }: BatchToolbarProps) {
  const { tr } = useI18n();
  const { images, selectedIds, selectAll, clearSelection, removeImages, clearBatch } = useBatch();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const total = images.reduce((acc, i) => acc + (i.size ?? 0), 0);
  const count = selectedIds.length;
  const all = count > 0 && count === images.length;
  const state: boolean | 'mixed' = all ? true : count > 0 ? 'mixed' : false;

  const removeSelected = () => {
    removeImages(selectedIds);
    toast({ title: `${pluralize(count, 'image')} removed` });
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-canvas px-4 py-2.5 sm:px-6">
      <div className="flex min-h-[36px] min-w-0 flex-1 items-center gap-3">
        <SelectCheckbox checked={state} onChange={all ? clearSelection : selectAll} label={tr(all ? 'Clear selection' : 'Select all images')} />
        <p className="tabular truncate text-sm text-ink" aria-live="polite">
          {count > 0 ?
          <span className="font-medium">{tr(count)}{tr(" selected")}</span> :

          <>
              <span className="font-medium">{tr(pluralize(images.length, 'image'))}</span>
              <span className="text-muted">{tr(" · ")}{tr(formatBytes(total))}{tr(" total")}</span>
            </>
          }
        </p>
        {count > 0 ?
        <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{tr("Clear selection")}</span>
              <span className="sm:hidden">{tr("Clear")}</span>
            </Button>
            <Button size="sm" variant="danger-ghost" onClick={removeSelected}>
              <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />{tr("Remove")}</Button>
          </div> :

        <p className="hidden text-[12.5px] text-muted xl:block">{tr("Select images to review or remove them together.")}</p>
        }
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />{tr("Add images")}</Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirmClear(true)} className="hidden sm:inline-flex">{tr("Clear batch")}</Button>
        <Segmented<ViewMode>
          label={tr("View")}
          size="sm"
          iconOnly
          value={view}
          onChange={onViewChange}
          options={[
          { value: 'grid', label: 'Grid view', icon: <LayoutGridIcon className="h-4 w-4" aria-hidden="true" /> },
          { value: 'list', label: 'List view', icon: <ListIcon className="h-4 w-4" aria-hidden="true" /> }]
          } />
        
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onAddFiles(files);
            e.target.value = '';
          }} />
        
      </div>
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearBatch();
          toast({ title: 'Batch cleared' });
        }}
        title={tr("Clear this batch?")}
        description={tr(`All ${pluralize(images.length, 'image')} will be removed from the workspace. Your settings and presets are kept. Original files on your device aren’t affected.`)}
        confirmLabel={tr("Clear batch")}
        tone="danger" />
      
    </div>);

}
