import { useI18n } from '../../i18n/LocaleContext';
import { useNavigate, useRouteError } from '../../i18n/router';
import { HouseIcon, RotateCcwIcon, TriangleAlertIcon } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';

export function RouteError() {
  const { tr } = useI18n();
  const error = useRouteError();
  const navigate = useNavigate();
  const message = error instanceof Error ? error.message : 'Unknown error';

  return (
    <main className="flex min-h-screen w-full flex-col bg-canvas">
      <div className="px-5 py-5 sm:px-8">
        <Logo />
      </div>
      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-7 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-soft text-danger" aria-hidden="true">
            <TriangleAlertIcon className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">{tr("Something went wrong")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{tr("This part of Batch hit an unexpected problem. Your batch and settings are kept in this tab, so you can pick up where you left off.")}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="primary" onClick={() => navigate('/app', { replace: true })}>
              <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />{tr("Reload workspace")}</Button>
            <Button variant="secondary" onClick={() => navigate('/', { replace: true })}>
              <HouseIcon className="h-4 w-4" aria-hidden="true" />{tr("Go to home page")}</Button>
          </div>
          <details className="mt-6 text-left text-[13px] text-muted">
            <summary className="cursor-pointer rounded font-medium text-ink">{tr("Technical details")}</summary>
            <p className="mt-2 break-words rounded-lg bg-sunken p-3 font-mono text-[12px]">{tr(message)}</p>
          </details>
        </div>
      </div>
    </main>);

}