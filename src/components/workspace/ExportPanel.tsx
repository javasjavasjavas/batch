import { FileArchiveIcon, DownloadIcon } from 'lucide-react';
import type { RunItem } from '../../types/run';
import { pluralize } from '../../utils/format';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ExportPanelProps {
  items: RunItem[];
  zipName: string;
  onZipNameChange: (value: string) => void;
  onDownloadAll: () => void;
  exportProgress?: number | null;
}

export function ExportPanel({ items, zipName, onZipNameChange, onDownloadAll, exportProgress }: ExportPanelProps) {
  const formats = Array.from(new Set(items.map((i) => i.outputFormat.toUpperCase()))).join(', ');
  const single = items.length === 1;
  const Icon = single ? DownloadIcon : FileArchiveIcon;
  return (
    <section aria-labelledby="export-title" className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2.5">
        <Icon className="h-[18px] w-[18px] text-ink" strokeWidth={1.75} aria-hidden="true" />
        <h2 id="export-title" className="text-[15px] font-semibold text-ink">
          Export
        </h2>
      </div>
      <dl className="mt-4 space-y-2 text-[13px]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Files</dt>
          <dd className="tabular font-medium text-ink">{pluralize(items.length, 'image')}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Format</dt>
          <dd className="font-medium text-ink">{formats || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{single ? 'File' : 'First file'}</dt>
          <dd className="truncate font-medium text-ink">{items[0]?.outputName ?? '—'}</dd>
        </div>
      </dl>
      {!single && <Field label="Archive name" htmlFor="zip-name" className="mt-4">
        <Input id="zip-name" value={zipName} unit=".zip" onChange={(e) => onZipNameChange(e.target.value)} className="pr-12" />
      </Field>}
      <Button variant="accent" size="lg" className="mt-4 w-full" disabled={!items.length} onClick={onDownloadAll}>
        {single ? 'Download image' : exportProgress === null || exportProgress === undefined ? 'Download all as ZIP' : `Cancel ZIP export (${exportProgress}%)`}
      </Button>
      <p className="mt-2 text-center text-[12px] text-muted">{single ? 'Downloads the image directly.' : 'The archive is built on your device.'}</p>
    </section>);

}
