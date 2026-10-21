import { useI18n } from '../../i18n/LocaleContext';
import type { RunItem } from '../../types/run';
import { ImageThumb } from '../ui/ImageThumb';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';

export function RunItemRow({ item }: {item: RunItem;}) {
  const { tr } = useI18n();
  return (
    <li className="flex items-center gap-3 px-3 py-3 sm:px-4">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md">
        <ImageThumb src={item.url} alt={tr("")} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-medium text-ink">
            {item.name}
            <span className="font-normal text-muted">{tr(" → ")}{item.outputName}</span>
          </p>
          <StatusBadge status={item.status} />
        </div>
        {item.status === 'failed' ?
        <p className="mt-1 text-[12.5px] leading-snug text-danger">{tr(item.error)}</p> :

        <ProgressBar
          className="mt-2"
          value={item.status === 'complete' ? 1 : item.progress}
          label={`${item.name} progress`}
          tone={item.status === 'complete' ? 'lime' : item.status === 'queued' ? 'muted' : 'ink'} />

        }
        {item.status === 'active' && <p className="mt-1 text-[12px] text-muted" role="status">{tr(item.processingMessage || 'Decoding and encoding locally…')}</p>}
      </div>
    </li>);

}
