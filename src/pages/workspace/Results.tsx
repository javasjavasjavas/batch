import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CircleCheckIcon, CircleXIcon, ImagesIcon, PackageOpenIcon, RotateCcwIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { useToast } from '../../contexts/ToastContext';
import { countRunItems } from '../../utils/runPlan';
import { formatBytes, pluralize, slugify } from '../../utils/format';
import { Button } from '../../components/ui/Button';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { AdSlot } from '../../components/ui/AdSlot';
import { ResultItem } from '../../components/workspace/ResultItem';
import { ExportPanel } from '../../components/workspace/ExportPanel';
import { CompareDialog } from '../../components/workspace/CompareDialog';
import { downloadBlob, makeZip } from '../../processing/downloads';

export function Results() {
  const { workspacePath, run, retryFailed, discardRun, clearBatch, title, images } = useBatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [compareId, setCompareId] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const exportAbort = useRef<AbortController | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const [zipName, setZipName] = useState(slugify(title));

  useEffect(() => setZipName(slugify(title)), [title]);

  if (run && (run.status === 'running' || run.status === 'paused')) return <Navigate to={`${workspacePath}/run`} replace />;
  if (!run || (run.status !== 'complete' && run.status !== 'canceled')) {
    return (
      <div className="h-full overflow-y-auto">
        <EmptyState
          headingLevel="h1"
          className="py-20"
          icon={<PackageOpenIcon className="h-5 w-5" />}
          title="No results yet"
          description="Results appear here after a run finishes.">
          
          <ButtonLink to={`${workspacePath}/review`} variant="primary">
            Review batch
          </ButtonLink>
          <ButtonLink to={`${workspacePath}`} variant="secondary">
            Back to editing
          </ButtonLink>
        </EmptyState>
      </div>);

  }

  const counts = countRunItems(run);
  const done = run.items.filter((i) => i.status === 'complete');
  const failed = run.items.filter((i) => i.status === 'failed');
  const totalOriginal = done.reduce((a, i) => a + (i.originalSize ?? 0), 0);
  const totalOutput = done.reduce((a, i) => a + (i.outputSize ?? 0), 0);

  const startNew = () => {
    clearBatch();
    discardRun();
    navigate(`${workspacePath}`);
  };

  const downloadOne = (item: (typeof done)[number]) => {
    if (item.output) downloadBlob(item.output, item.outputName);
  };
  const exportAll = async () => {
    if (done.length === 1) { downloadOne(done[0]); return; }
    if (exportAbort.current) { exportAbort.current.abort(); return; }
    const controller = new AbortController();
    exportAbort.current = controller; setExportProgress(0);
    try {
      const zip = await makeZip(done, controller.signal, (count, total) => setExportProgress(Math.round(count / total * 100)));
      downloadBlob(zip, `${slugify(zipName) || 'batch'}.zip`);
      toast({ tone: 'success', title: 'ZIP ready', description: `${done.length} images included.` });
    } catch (error) {
      if (!controller.signal.aborted) toast({ tone: 'error', title: 'ZIP export failed', description: error instanceof Error ? error.message : 'Try again.' });
    } finally { exportAbort.current = null; setExportProgress(null); }
  };

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:pt-10">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-info-soft px-2 py-1 text-[12px] font-medium text-info">Processed locally</span>
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[34px]">
          {failed.length || run.status === 'canceled' ? `${done.length} of ${counts.total} images ready` : 'Batch complete'}
        </h1>
        <p className="mt-1 max-w-[60ch] text-[15px] text-muted">
          {run.status === 'canceled' ? 'Remaining work was canceled. Completed images can still be downloaded.' : failed.length ?
          'Some images couldn’t be processed. Retry them, or adjust settings and run again.' :
          'Your images are ready to download.'}
        </p>

        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Status counts">
          <li className="flex items-center gap-1.5 text-ink">
            <CircleCheckIcon className="h-4 w-4 text-[#6E8A12]" aria-hidden="true" />
            <span className="tabular font-semibold">{done.length}</span> complete
          </li>
          <li className={`flex items-center gap-1.5 ${failed.length ? 'text-danger' : 'text-muted'}`}>
            <CircleXIcon className="h-4 w-4" aria-hidden="true" />
            <span className="tabular font-semibold">{failed.length}</span> failed
          </li>
          <li className="flex items-center gap-1.5 text-muted">
            <ImagesIcon className="h-4 w-4" aria-hidden="true" />
            <span className="tabular font-semibold text-ink">{counts.total}</span> in batch
          </li>
          {counts.canceled > 0 && <li className="text-muted"><span className="tabular font-semibold">{counts.canceled}</span> canceled</li>}
        </ul>
        {done.length > 0 &&
        <p className="tabular mt-3 text-[13px] text-muted">
            {formatBytes(totalOriginal)} → <span className="font-medium text-ink">{formatBytes(totalOutput)}</span>
            {totalOriginal > 0 && ` (${totalOutput > totalOriginal ? '+' : ''}${Math.round((totalOutput / totalOriginal - 1) * 100)}%)`}
          </p>
        }

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            {failed.length > 0 &&
            <section aria-labelledby="failed-title" className="rounded-2xl border border-danger/20 bg-danger-soft p-5">
                <h2 id="failed-title" className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <CircleXIcon className="h-4 w-4 text-danger" aria-hidden="true" />
                  {pluralize(failed.length, 'image')} failed
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {failed.map((item) =>
                <li key={item.id} className="rounded-lg bg-white/70 px-3 py-2.5">
                      <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                      <p className="mt-0.5 text-[13px] leading-snug text-[#7A2A21]">{item.error}</p>
                    </li>
                )}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                  variant="primary"
                  onClick={() => {
                    retryFailed();
                    navigate(`${workspacePath}/run`);
                  }}>
                  
                    <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
                    Retry failed ({failed.length})
                  </Button>
                  <Button variant="secondary" onClick={() => navigate(`${workspacePath}?panel=settings`)}>
                    <SlidersHorizontalIcon className="h-4 w-4" aria-hidden="true" />
                    Adjust settings
                  </Button>
                </div>
              </section>
            }

            <section aria-labelledby="done-title">
              <h2 id="done-title" className="text-[15px] font-semibold text-ink">
                Completed images
              </h2>
              {done.length ?
              <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
                  {done.map((item) =>
                <ResultItem key={item.id} item={item} onCompare={() => setCompareId(item.id)} onDownload={() => downloadOne(item)} />
                )}
                </ul> :

              <p className="mt-3 rounded-2xl border border-dashed border-line-strong bg-white p-6 text-center text-sm text-muted">
                  No images completed in this run.
                </p>
              }
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <ExportPanel items={done} zipName={zipName} onZipNameChange={setZipName} onDownloadAll={exportAll} exportProgress={exportProgress} />
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink to={`${workspacePath}`} variant="secondary">
                Edit settings
              </ButtonLink>
              <Button variant="ghost" onClick={() => images.length ? setConfirmNew(true) : startNew()}>
                Start a new batch
              </Button>
            </div>
            <div className="pt-4">
              <AdSlot format="rectangle" className="mx-auto" />
            </div>
          </aside>
        </div>
      </div>

      <CompareDialog items={done} itemId={compareId} onClose={() => setCompareId(null)} onNavigate={setCompareId} />

      <ConfirmDialog
        open={confirmNew}
        onClose={() => setConfirmNew(false)}
        onConfirm={startNew}
        title="Start a new batch?"
        description={`This removes the ${pluralize(images.length, 'image')} in your workspace. Settings and presets are kept.`}
        confirmLabel="Start new batch"
        tone="danger" />
      
    </div>);

}
