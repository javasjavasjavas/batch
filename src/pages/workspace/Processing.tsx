import { useI18n } from '../../i18n/LocaleContext';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '../../i18n/router';
import { ActivityIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { countRunItems, overallProgress } from '../../utils/runPlan';
import { pluralize } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RunItemRow } from '../../components/workspace/RunItemRow';
import { StoppedView } from '../../components/workspace/StoppedView';

export function Processing() {
  const { tr } = useI18n();
  const { workspacePath, run, pauseRun, resumeRun, cancelRun } = useBatch();
  const navigate = useNavigate();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const pausedForConfirm = useRef(false);
  const status = run?.status;

  useEffect(() => {
    if (status === 'complete') navigate(`${workspacePath}/results`, { replace: true, state: { skipBlock: true } });
  }, [status, navigate, workspacePath]);

  if (!run) {
    return (
      <div className="h-full overflow-y-auto">
        <EmptyState
          headingLevel="h1"
          className="py-20"
          icon={<ActivityIcon className="h-5 w-5" />}
          title={tr("No run in progress")}
          description={tr("Review your batch to start processing.")}>
          
          <ButtonLink to={`${workspacePath}/review`} variant="primary">{tr("Review batch")}</ButtonLink>
          <ButtonLink to={`${workspacePath}`} variant="secondary">{tr("Back to editing")}</ButtonLink>
        </EmptyState>
      </div>);

  }

  if (run.status === 'failed' || run.status === 'canceled') return <StoppedView run={run} />;
  if (run.status === 'complete') return null;

  const progress = overallProgress(run);
  const counts = countRunItems(run);
  const paused = run.status === 'paused';

  const openCancel = () => {
    pausedForConfirm.current = run.status === 'running';
    if (pausedForConfirm.current) pauseRun();
    setConfirmCancel(true);
  };

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <header className="mt-2">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">
            {tr(paused ? 'Paused' : `Processing ${pluralize(run.items.length, 'image')}`)}
          </h1>
          <p className="tabular mt-1 text-[15px] text-muted" aria-live="polite">
            {tr(counts.complete)}{tr(" of ")}{tr(counts.total)}{tr(" done")}{counts.failed > 0 && tr(` · ${counts.failed} failed`)}
            {tr(paused && (counts.active ? ' · Pausing after the current image' : ' · Resume when you’re ready'))}
          </p>
          <div className="mt-5 flex items-center gap-4">
            <ProgressBar size="lg" value={progress} label={tr("Overall progress")} tone={paused ? 'muted' : 'ink'} />
            <span className="tabular w-12 shrink-0 text-right text-sm font-semibold text-ink">{tr(Math.round(progress * 100))}{tr("%")}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {paused ?
            <Button variant="primary" onClick={resumeRun}>
                <PlayIcon className="h-4 w-4" aria-hidden="true" />{tr("Resume")}</Button> :

            <Button variant="secondary" onClick={pauseRun}>
                <PauseIcon className="h-4 w-4" aria-hidden="true" />{tr("Pause")}</Button>
            }
            <Button variant="ghost" onClick={openCancel}>{tr("Cancel run")}</Button>
          </div>
        </header>

        {run.summary.length > 0 &&
        <ul className="mt-8 flex flex-wrap gap-1.5" aria-label={tr("Settings for this run")}>
            {run.summary.map((s) =>
          <li key={s} className="rounded-md bg-sunken px-2 py-1 text-[12px] text-muted">
                {s.split(': ').map((part, index) => index === 1 && s.startsWith('Rename:') ? part : tr(part)).join(': ')}
              </li>
          )}
          </ul>
        }

        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white" aria-label={tr("Images in this run")}>
          {run.items.map((item) =>
          <RunItemRow key={item.id} item={item} />
          )}
        </ul>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => {
          setConfirmCancel(false);
          if (pausedForConfirm.current) resumeRun();
          pausedForConfirm.current = false;
        }}
        onConfirm={() => {
          pausedForConfirm.current = false;
          cancelRun();
        }}
        title={tr("Cancel this run?")}
        description={tr("Queued work stops. Images already completed remain available to download.")}
        confirmLabel={tr("Cancel run")}
        cancelLabel={tr("Keep going")}
        tone="danger" />
      
    </div>);

}
