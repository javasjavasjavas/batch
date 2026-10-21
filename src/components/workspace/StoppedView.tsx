import { useI18n } from '../../i18n/LocaleContext';
import { useNavigate } from '../../i18n/router';
import { CircleSlashIcon, RotateCcwIcon, TriangleAlertIcon } from 'lucide-react';
import type { RunState } from '../../types/run';
import { useBatch } from '../../contexts/BatchContext';
import { countRunItems } from '../../utils/runPlan';
import { Button } from '../ui/Button';

export function StoppedView({ run }: {run: RunState;}) {
  const { tr } = useI18n();
  const { workspacePath, restartRun } = useBatch();
  const navigate = useNavigate();
  const counts = countRunItems(run);
  const failed = run.status === 'failed';

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${failed ? 'bg-danger-soft text-danger' : 'bg-sunken text-ink'}`}
            aria-hidden="true">
            
            {failed ? <TriangleAlertIcon className="h-5 w-5" /> : <CircleSlashIcon className="h-5 w-5" />}
          </div>
          <p className="mt-5 text-[12.5px] font-medium text-muted">{tr("Batch run")}</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.025em] text-ink">{tr(failed ? 'The run stopped' : 'Run canceled')}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {tr(failed ?
            run.stopReason :
            'You canceled the remaining work. Completed images are still available until you start another run.')}
          </p>
          <p className="tabular mt-4 text-sm text-ink">
            {tr(counts.complete)}{tr(" of ")}{tr(counts.total)}{tr(" images had finished")}{counts.failed > 0 && tr(`, ${counts.failed} failed`)}{tr(".")}</p>

          {failed &&
          <div className="mt-5 rounded-xl bg-canvas p-4 text-[13.5px] leading-relaxed text-muted">
              <p className="font-medium text-ink">{tr("What usually helps")}</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                <li>{tr("Lower the output size, or split very large images into a separate batch.")}</li>
                <li>{tr("Close other heavy tabs to free up memory, then restart.")}</li>
              </ul>
            </div>
          }

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button variant="accent" size="lg" onClick={restartRun}>
              <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />{tr("Restart run")}</Button>
            {counts.complete > 0 && <Button variant="secondary" size="lg" onClick={() => navigate(`${workspacePath}/results`, { state: { skipBlock: true } })}>{tr("View completed images")}</Button>}
            <Button variant="secondary" size="lg" onClick={() => navigate(`${workspacePath}?panel=settings`)}>{tr("Adjust settings")}</Button>
            <Button variant="ghost" size="lg" onClick={() => navigate(`${workspacePath}`)}>{tr("Return to the batch")}</Button>
          </div>
        </div>
      </div>
    </div>);

}
