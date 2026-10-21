import { ArrowRightIcon } from 'lucide-react';
import type { ToolInfo } from '../../types/content';
import { ToolIcon } from '../ui/ToolIcon';
import { Button } from '../ui/Button';

interface SettingsPreviewCardProps {
  tool: ToolInfo;
  onOpen: () => void;
}

export function SettingsPreviewCard({ tool, onOpen }: SettingsPreviewCardProps) {
  return (
    <aside aria-label={`${tool.name} settings preview`} className="rounded-2xl border border-line bg-white shadow-soft">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime text-ink" aria-hidden="true">
          <ToolIcon tool={tool.id} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Settings you’ll start with</p>
          <p className="text-[13px] text-muted">All adjustable in the workspace</p>
        </div>
      </div>
      <dl className="divide-y divide-line px-5">
        {tool.settingsPreview.map((row) =>
        <div key={row.label} className="flex items-center justify-between gap-4 py-2">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="tabular text-sm font-medium text-ink">{row.value}</dd>
          </div>
        )}
      </dl>
      <div className="border-t border-line p-4">
        <Button variant="secondary" className="w-full" onClick={onOpen}>
          Open workspace with {tool.name.replace(/^Bulk /, '').toLowerCase()}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </aside>);

}
