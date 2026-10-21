import { useI18n } from '../../i18n/LocaleContext';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useBlocker } from '../../i18n/router';
import { useBatch } from '../../contexts/BatchContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AppHeader } from './AppHeader';
import { PreferencesDialog } from './PreferencesDialog';
import { SiteHeader } from '../site/SiteHeader';
import { englishPath } from '../../i18n/paths';

export function WorkspaceLayout() {
  const { tr } = useI18n();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { run, cancelRun } = useBatch();
  const runActive = run?.status === 'running' || run?.status === 'paused';
  const proceeding = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const skip = (nextLocation.state as {skipBlock?: boolean;} | null)?.skipBlock;
    return runActive && !skip && currentLocation.pathname.endsWith('/run') && englishPath(nextLocation.pathname) !== englishPath(currentLocation.pathname);
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
    <div className="fixed inset-0 flex h-[100dvh] w-full flex-col overflow-clip bg-canvas">
      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[80] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white">{tr("Skip to workspace")}</a>
      <SiteHeader workspace />
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
        title={tr("Leave this run?")}
        description={tr("Leaving stops active processing. Completed outputs remain until you start a new run.")}
        confirmLabel={tr("Leave and stop run")}
        cancelLabel={tr("Stay here")}
        tone="danger" />
      
    </div>);

}
