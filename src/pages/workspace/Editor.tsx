import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ImagePlusIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import type { ViewMode } from '../../types/prefs';
import { useBatch } from '../../contexts/BatchContext';
import { usePrefs } from '../../contexts/PrefsContext';
import { useFileIntake } from '../../hooks/useFileIntake';
import { useFileDrop } from '../../hooks/useFileDrop';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { AdSlot } from '../../components/ui/AdSlot';
import { Dialog } from '../../components/ui/Dialog';
import { BatchToolbar } from '../../components/workspace/BatchToolbar';
import { ImageCollection } from '../../components/workspace/ImageCollection';
import { ImageDetailDialog } from '../../components/workspace/ImageDetailDialog';
import { SettingsPanel } from '../../components/workspace/SettingsPanel';
import { EmptyWorkspace } from '../../components/workspace/EmptyWorkspace';
import { MobileActionBar } from '../../components/workspace/MobileActionBar';
import { TOOL_LABEL } from '../../utils/planning';

export function Editor() {
  const { images, selectedIds, title, workspaceTool, workspacePath } = useBatch();
  const { prefs } = usePrefs();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<ViewMode>(prefs.view);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isLg = useMediaQuery('(min-width: 1024px)');
  const { handleFiles, rejected, clearRejected } = useFileIntake();
  const { isDragging, bind } = useFileDrop(handleFiles);

  useEffect(() => setView(prefs.view), [prefs.view]);

  useEffect(() => {
    if (params.get('panel') === 'settings') {
      if (!window.matchMedia('(min-width: 1024px)').matches) setSettingsOpen(true);
      const next = new URLSearchParams(params);
      next.delete('panel');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const hasImages = images.length > 0;

  return (
    <div className="flex h-full">
      <section aria-label="Batch" className="relative flex min-w-0 flex-1 flex-col" {...hasImages ? bind : {}}>
        {hasImages ?
        <>
            <h1 className="sr-only">{title}</h1>
            <BatchToolbar view={view} onViewChange={setView} onAddFiles={handleFiles} />
            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 pb-32 pt-4 sm:px-6 lg:pb-6">
              {rejected.length > 0 &&
            <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning-soft p-3 text-[13px]">
                  <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                  <div className="min-w-0 flex-1 text-[#5C4A2A]">
                    <p className="font-medium text-ink">
                      {rejected.length === 1 ? 'One file was skipped' : `${rejected.length} files were skipped`}
                    </p>
                    <ul className="mt-0.5">
                      {rejected.slice(0, 3).map((r) =>
                  <li key={r.name} className="break-words">
                          <span className="font-medium">{r.name}</span> — {r.reason}
                        </li>
                  )}
                      {rejected.length > 3 && <li>and {rejected.length - 3} more.</li>}
                    </ul>
                  </div>
                  <button
                type="button"
                onClick={clearRejected}
                aria-label="Dismiss skipped files"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-150 hover:bg-warning/10">
                
                    <XIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
            }
              <ImageCollection view={view} onOpen={setDetailId} />
            </div>
            {isDragging &&
          <div className="pointer-events-none absolute inset-3 z-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#A9C82B] bg-lime-soft/95">
                <ImagePlusIcon className="h-8 w-8 text-ink" strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-3 text-[17px] font-semibold text-ink">Drop to add to this batch</p>
                <p className="mt-1 text-sm text-muted">Images stay on your device.</p>
              </div>
          }
          </> :

        <div className={`scrollbar-thin min-h-0 flex-1 overflow-y-auto ${selectedIds.length ? 'pb-44' : 'pb-32'} lg:pb-0`}>
            <EmptyWorkspace onFiles={handleFiles} rejected={rejected} onDismissRejected={clearRejected} />
          </div>
        }
        <AdSlot placement="workspace" className="workspace-ad shrink-0 border-t border-line bg-canvas px-6 py-3" />
      </section>

      {isLg && <aside aria-label="Batch settings" className="hidden w-[340px] shrink-0 border-l border-line bg-white lg:flex lg:flex-col xl:w-[360px]">
        <SettingsPanel key={workspacePath} />
      </aside>}

      <MobileActionBar onOpenSettings={() => setSettingsOpen(true)} />

      <Dialog
        open={settingsOpen && !isLg}
        onClose={() => setSettingsOpen(false)}
        title={workspaceTool ? `${TOOL_LABEL[workspaceTool]} settings` : 'Batch settings'}
        variant="drawer"
        bodyClassName="flex flex-col overflow-hidden p-0 sm:px-0 pb-0">
        
        <SettingsPanel key={workspacePath} onReview={() => setSettingsOpen(false)} />
      </Dialog>

      <ImageDetailDialog
        imageId={detailId}
        onClose={() => setDetailId(null)}
        onNavigate={(id) => setDetailId(id)} />
      
    </div>);

}
