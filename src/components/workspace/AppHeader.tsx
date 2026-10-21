import { useLocation } from 'react-router-dom';
import { Settings2Icon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { pluralize } from '../../utils/format';
import { Button } from '../ui/Button';
import { BatchTitle } from './BatchTitle';
import { WorkflowSteps } from './WorkflowSteps';
import { TOOL_LABEL } from '../../utils/planning';
const STEP_BY_PATH: Record<string, number> = {
  'review': 1,
  'run': 2,
  'results': 3
};
export function AppHeader({
  onOpenPreferences


}: {onOpenPreferences: () => void;}) {
  const {
    images, workspaceTool
  } = useBatch();
  const {
    pathname
  } = useLocation();
  const step = STEP_BY_PATH[pathname.replace(/\/$/, '').split('/').pop() || ''] ?? 0;
  return <header aria-label="Batch controls" className="relative flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-3 sm:gap-3 sm:px-5">
      <span className="hidden shrink-0 text-[13px] font-semibold text-ink sm:block">{workspaceTool ? TOOL_LABEL[workspaceTool] : 'Workspace'}</span>
      <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
      <div className="flex min-w-0 items-center gap-2">
        <BatchTitle />
        <span className="tabular hidden shrink-0 rounded-md bg-sunken px-2 py-0.5 text-[12px] font-medium text-muted md:inline">
          {pluralize(images.length, 'image')}
        </span>
      </div>
      <WorkflowSteps current={step} className="absolute left-1/2 hidden -translate-x-1/2 2xl:flex" />
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={onOpenPreferences} aria-label="Preferences" title="Preferences">
          <Settings2Icon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </header>;
}
