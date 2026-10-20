import { useEffect, useRef, useState } from 'react';
import { Outlet, useBlocker } from 'react-router-dom';
import { useBatch } from '../../contexts/BatchContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AppHeader } from './AppHeader';
import { PreferencesDialog } from './PreferencesDialog';

export function WorkspaceLayout() {
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { run, cancelRun } = useBatch();
  const runActive = run?.status === 'running' || run?.status === 'paused';
  const proceeding = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const skip = (nextLocation.state as {skipBlock?: boolean;} | null)?.skipBlock;
    return runActive && !skip && currentLocation.pathname.endsWith('/run') && nextLocation.pathname !== currentLocation.pathname;
  });

  useEffect(() => {
    if (!runActive) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [runActive]);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-canvas">
      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white">
        
        Skip to workspace
      </a>
      <AppHeader onOpenPreferences={() => setPrefsOpen(true)} />
      <main id="workspace-main" className="min-h-0 flex-1">
        <Outlet />
      </main>
      <PreferencesDialog open={prefsOpen} onClose={() => setPrefsOpen(false)} />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onClose={() => {
          if (!proceeding.current) blocker.reset?.();
          proceeding.current = false;
        }}
        onConfirm={() => {
          proceeding.current = true;
          cancelRun();
          blocker.proceed?.();
        }}
        title="Leave this run?"
        description="Leaving stops active processing. Completed outputs remain until you start a new run."
        confirmLabel="Leave and stop run"
        cancelLabel="Stay here"
        tone="danger" />
      
    </div>);

}
