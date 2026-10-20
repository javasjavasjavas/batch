import { Link, useLocation } from 'react-router-dom';
import { Settings2Icon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { pluralize } from '../../utils/format';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { BatchTitle } from './BatchTitle';
import { WorkflowSteps } from './WorkflowSteps';
import { ToolsMenu } from '../site/ToolsMenu';
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
  return <header className="relative flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-3 sm:gap-3 sm:px-4">
      <Link to="/" aria-label="Batch home" className="shrink-0 rounded-md p-1">
        <Logo size="sm" showWordmark={false} className="sm:hidden" />
        <Logo size="sm" className="hidden sm:inline-flex" />
      </Link>
      <ToolsMenu label={workspaceTool ? TOOL_LABEL[workspaceTool] : 'Batch workspace'} />
      <span className="hidden h-5 w-px bg-line sm:block" aria-hidden="true" />
      <div className="flex min-w-0 items-center gap-2">
        <BatchTitle />
        <span className="tabular hidden shrink-0 rounded-md bg-sunken px-2 py-0.5 text-[12px] font-medium text-muted md:inline">
          {pluralize(images.length, 'image')}
        </span>
      </div>
      <WorkflowSteps current={step} className="absolute left-1/2 hidden -translate-x-1/2 2xl:flex" />
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Link to="/help" className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-sunken hover:text-ink">
          <div className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">Help</span>
          <span className="sr-only md:hidden">Help</span>
        </Link>
        <Button variant="ghost" size="icon-sm" onClick={onOpenPreferences} aria-label="Preferences" title="Preferences">
          <Settings2Icon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </header>;
}
