import { useI18n } from '../../i18n/LocaleContext';
import { Link, useNavigate } from '../../i18n/router';
import { ArrowLeftIcon, ArrowRightIcon, ClipboardListIcon, PencilIcon, PlayIcon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { formatBytes, formatDimensions, pluralize } from '../../utils/format';
import { localDateStamp, plannedDimensions, plannedName, settingRows, TOOL_LABEL, TOOL_ORDER, uniqueNames } from '../../utils/planning';
import { EmptyState } from '../../components/ui/EmptyState';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Button } from '../../components/ui/Button';
import { ImageThumb } from '../../components/ui/ImageThumb';
import { ToolIcon } from '../../components/ui/ToolIcon';
import { IssueList } from '../../components/workspace/IssueList';
import { validateBatch } from '../../utils/validation';

export function Review() {
  const { tr } = useI18n();
  const { workspacePath, workspaceTool, reviewImages: images, images: batchImages, reviewingSelected, settings, enabled, startRun, title, setActiveTool } = useBatch();
  const navigate = useNavigate();
  const issues = validateBatch(settings, enabled, images.length);
  const errorCount = issues.filter((issue) => issue.level === 'error').length;

  if (!images.length) {
    return (
      <div className="h-full overflow-y-auto">
        <EmptyState
          headingLevel="h1"
          className="py-20"
          icon={<ClipboardListIcon className="h-5 w-5" />}
          title={tr("Nothing to review yet")}
          description={tr(reviewingSelected ? 'The selected images are no longer in the batch. Go back to editing and select images to review.' : 'Add images to your batch, choose settings, and come back here to check the plan.')}>
          
          <ButtonLink to={`${workspacePath}`} variant="primary">{tr("Back to editing")}</ButtonLink>
        </EmptyState>
      </div>);

  }

  const tools = TOOL_ORDER.filter((t) => enabled[t]);
  const total = images.reduce((a, i) => a + (i.size ?? 0), 0);
  const names = uniqueNames(images.map((img, i) => plannedName(img.name, i, settings, enabled, localDateStamp(), img.type.split('/')[1]?.replace('jpeg', 'jpg'))));
  const start = () => {
    if (startRun()) navigate(`${workspacePath}/run`);
  };
  const editTool = (tool: (typeof tools)[number]) => {
    setActiveTool(tool);
    navigate(`${workspacePath}?panel=settings`);
  };

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
        <Link to={`${workspacePath}`} className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted transition-colors duration-150 hover:text-ink">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />{tr("Back to editing")}</Link>
        <header className="mt-4">
          <span className="inline-flex items-center rounded-md bg-sunken px-2 py-1 text-[12px] font-medium text-muted">{tr("Planned settings · nothing processed yet")}</span>
          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">{tr("Review “")}{title}{tr("”")}</h1>
          <p className="tabular mt-1 text-[15px] text-muted">
            {tr(pluralize(images.length, 'image'))}{tr(" · ")}{tr(formatBytes(total))}{tr(" original")}{reviewingSelected && <span>{tr(" · Selected only (")}{tr(images.length)}{tr(" of ")}{tr(batchImages.length)}{tr(")")}</span>}
          </p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-labelledby="included-title" className="min-w-0">
            <h2 id="included-title" className="text-[15px] font-semibold text-ink">{tr("Included images")}</h2>
            <div className="mt-3 hidden grid-cols-[48px_minmax(0,1fr)_20px_minmax(0,1fr)] gap-3 px-4 text-[12px] font-medium text-muted md:grid" aria-hidden="true">
              <span />
              <span>{tr("Original")}</span>
              <span />
              <span>{tr("Planned")}</span>
            </div>
            <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {images.map((img, i) => {
                const dims = plannedDimensions(img.width, img.height, settings, enabled);
                return (
                  <li
                    key={img.id}
                    className="grid grid-cols-[48px_minmax(0,1fr)] gap-x-3 gap-y-1.5 px-3 py-3 sm:px-4 md:grid-cols-[48px_minmax(0,1fr)_20px_minmax(0,1fr)] md:items-center">
                    
                    <div className="row-span-2 h-12 w-12 overflow-hidden rounded-md md:row-span-1">
                      <ImageThumb src={img.thumbnailUrl || img.url} alt={tr("")} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{img.name}</p>
                      <p className="tabular truncate text-[12px] text-muted">
                        {tr(formatBytes(img.size))}{tr(" · ")}{tr(formatDimensions(img.width, img.height) ?? 'Dimensions unavailable')}
                      </p>
                    </div>
                    <ArrowRightIcon className="hidden h-4 w-4 text-muted md:block" aria-label={tr("planned as")} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        <span className="sr-only md:hidden">{tr("Planned: ")}</span>
                        {names[i]}
                      </p>
                      <p className={`tabular truncate text-[12px] ${img.status === 'unreadable' ? 'text-warning' : 'text-muted'}`}>
                        {tr(img.status === 'unreadable' ?
                        img.error || 'Can’t be read, so this image will fail' : img.animated && (enabled.resize || enabled.compress || enabled.convert) ?
                        'Animated image: use Rename only to keep every frame' : !enabled.convert && (enabled.resize || enabled.compress) && /image\/(gif|avif)/.test(img.type) ?
                        'Select JPG, PNG or WebP output to transform this format' :
                        `${dims ? `${dims.width} × ${dims.height}` : 'Size depends on settings'} · ${(enabled.convert ? settings.convert.format : img.type.split('/')[1]?.replace('jpeg', 'jpg') || 'unknown').toUpperCase()}`)}
                      </p>
                    </div>
                  </li>);

              })}
            </ul>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <section aria-labelledby="planned-title" className="rounded-2xl border border-line bg-white p-5">
              <h2 id="planned-title" className="text-[15px] font-semibold text-ink">{tr("Planned settings")}</h2>
              {tools.length === 0 ?
              <p className="mt-2 text-sm text-muted">{tr("No tools are on.")}</p> :

              <div className="mt-3 divide-y divide-line">
                  {tools.map((t) =>
                <div key={t} className="py-3 first:pt-1 last:pb-0">
                      <div className="flex items-center justify-between">
                        <p className="flex items-center gap-2 text-sm font-medium text-ink">
                          <ToolIcon tool={t} className="h-4 w-4" />
                          {tr(workspaceTool && t === 'convert' && workspaceTool !== 'convert' ? 'Output' : TOOL_LABEL[t])}
                        </p>
                        <Button size="sm" variant="ghost" onClick={() => editTool(t)} aria-label={tr(`Edit ${workspaceTool && t === 'convert' && workspaceTool !== 'convert' ? 'output' : TOOL_LABEL[t]} settings`)}>
                          <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />{tr("Edit")}</Button>
                      </div>
                      <dl className="mt-1.5 space-y-1">
                        {settingRows(t, settings).map((row) =>
                    <div key={row.label} className="flex justify-between gap-4 text-[13px]">
                            <dt className="text-muted">{tr(row.label)}</dt>
                            <dd className="tabular text-right font-medium text-ink">{tr(row.value)}</dd>
                          </div>
                    )}
                      </dl>
                    </div>
                )}
                </div>
              }
              <p className="mt-3 border-t border-line pt-3 text-[12px] leading-snug text-muted">
                {tr(enabled.resize || enabled.compress || enabled.convert ? 'Re-encoding removes camera, location, and other source metadata. Orientation is applied to pixels.' : 'Rename only keeps the original bytes and metadata unchanged.')}
              </p>
            </section>

            {issues.length > 0 &&
            <section aria-labelledby="issues-title" className="rounded-2xl border border-line bg-white p-5">
                <h2 id="issues-title" className="text-[15px] font-semibold text-ink">
                  {tr(errorCount ? `${pluralize(errorCount, 'issue')} to fix before running` : 'Worth checking')}
                </h2>
                <IssueList issues={issues} showTool className="mt-3" />
              </section>
            }

            <section aria-labelledby="run-title" className="rounded-2xl border border-line bg-white p-5">
              <h2 id="run-title" className="text-[15px] font-semibold text-ink">{tr("Ready to process")}</h2>
              <p className="mt-1 text-[13px] leading-snug text-muted">{tr("Images are processed locally. Originals stay unchanged.")}</p>
              
              <Button variant="accent" size="lg" className="mt-4 hidden w-full lg:inline-flex" disabled={errorCount > 0} onClick={start}>
                <PlayIcon className="h-4 w-4" aria-hidden="true" />{tr("Process images")}</Button>
              {errorCount > 0 && <p className="mt-2 text-center text-[12.5px] text-danger">{tr("Fix the issues above to continue.")}</p>}
              <ButtonLink to={`${workspacePath}`} variant="secondary" className="mt-2 w-full">{tr("Back to editing")}</ButtonLink>
            </section>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <Button variant="accent" size="lg" className="w-full" disabled={errorCount > 0} onClick={start}>
          <PlayIcon className="h-4 w-4" aria-hidden="true" />
          {tr(errorCount > 0 ? `Fix ${pluralize(errorCount, 'issue')} to continue` : 'Process images')}
        </Button>
      </div>
    </div>);

}
