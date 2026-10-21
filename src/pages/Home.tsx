import { useI18n } from '../i18n/LocaleContext';
import { Link } from '../i18n/router';
import { ArrowRightIcon, CpuIcon, EyeOffIcon, MonitorSmartphoneIcon, FolderUpIcon, SlidersHorizontalIcon, ClipboardCheckIcon, Gamepad2Icon } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { HOME_FAQS } from '../data/homeFaqs';
import { useWorkspaceEntry } from '../hooks/useWorkspaceEntry';
import { TOOL_LABEL } from '../utils/planning';
import { Dropzone } from '../components/ui/Dropzone';
import { AdSlot } from '../components/ui/AdSlot';
import { ToolIcon } from '../components/ui/ToolIcon';
import { BatchShowcase } from '../components/site/BatchShowcase';
import { StepList } from '../components/site/StepList';
import { FaqSection } from '../components/site/FaqSection';

const STEPS = [
{ icon: FolderUpIcon, title: 'Add a batch', body: 'Drop in a folder’s worth of photos, or choose them from your device. Each one is measured as it arrives.' },
{ icon: SlidersHorizontalIcon, title: 'Set it up once', body: 'Pick a size, quality, format, and naming pattern. Every image in the batch follows the same plan.' },
{ icon: ClipboardCheckIcon, title: 'Review, then run', body: 'Check planned names and sizes for every file, fix anything flagged, and run the whole batch together.' }];


const LOCAL_POINTS = [
{
  icon: EyeOffIcon,
  title: 'No uploads',
  body: 'Images are read by your browser. They aren’t sent to a server, so private photos stay private.'
},
{
  icon: CpuIcon,
  title: 'Your device does the work',
  body: 'Speed depends on your device. Batch accepts up to 100 images and 300 MB of source files per batch.'
},
{
  icon: MonitorSmartphoneIcon,
  title: 'Clear about limits',
  body: 'Formats your browser can’t read, like HEIC, are flagged before you start rather than failing halfway.'
}];


export function Home() {
  const { tr } = useI18n();
  const { handleFiles, rejected, clearRejected, openSample } = useWorkspaceEntry();

  return (
    <>
      <section className="home-hero mx-auto grid max-w-content gap-x-10 gap-y-5 px-5 pb-8 pt-8 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-x-12">
        <div className="home-hero-main">
          <h1 className="text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[46px]">{tr("Free bulk")}<br />{tr("image tools.")}<br />{tr("All in one place.")}</h1>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-muted">{tr("Resize, compress, convert, and rename a whole batch of images with one set of settings. Free, no account, and designed to keep your files on your device.")}</p>
          <Dropzone size="compact" className="home-hero-upload mt-5" onFiles={handleFiles} onSample={openSample} rejected={rejected} onDismissRejected={clearRejected} />
        </div>
        <div className="home-hero-tools">
          <p className="text-[13px] text-muted">{tr("Or start with one tool")}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {TOOLS.map((tool) =>
            <li key={tool.id}>
                <Link to={`/tools/${tool.slug}`}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink transition-[border-color,background-color] duration-150 hover:border-line-strong hover:bg-lime-soft">
                  
                    <ToolIcon tool={tool.id} className="h-4 w-4" />
                    {tr(TOOL_LABEL[tool.id])}
                </Link>
              </li>
            )}
            <li><Link to="/tools/steam-assets" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink hover:bg-lime-soft"><Gamepad2Icon className="h-4 w-4" />{tr("Steam assets")}</Link></li>
            <li><Link to="/tools" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-lime-soft px-3 text-sm font-medium text-ink hover:bg-lime">{tr("Platform kits")}<ArrowRightIcon className="h-4 w-4" /></Link></li>
          </ul>
        </div>
        <AdSlot placement="home-primary" className="home-hero-ad" />
        <div className="home-hero-showcase mt-5 lg:mt-0 lg:pt-2">
          <BatchShowcase />
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 border-t border-line bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-content px-5 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 id="how-title" className="text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[36px]">{tr("Three steps, up to 100 images")}</h2>
              <p className="mt-2 max-w-[52ch] text-[15.5px] leading-relaxed text-muted">{tr("Batch is built for the moment you have forty photos and one set of requirements.")}</p>
            </div>
            <Link to="/app" className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-ink underline-offset-4 hover:underline">{tr("Open the workspace")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <StepList steps={STEPS} />
        </div>
      </section>

      <AdSlot placement="home-secondary" className="mx-auto my-12 max-w-content px-5 sm:px-8" />

      <section aria-labelledby="local-title" className="mx-auto max-w-content px-5 pb-20 sm:px-8">
        <div className="grid gap-10 rounded-2xl bg-ink p-7 text-white sm:p-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:p-12">
          <div>
            <h2 id="local-title" className="text-[28px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">{tr("Designed to keep your images on your device")}</h2>
            <p className="mt-4 max-w-[44ch] text-[15.5px] leading-relaxed text-white/70">{tr("Batch is built around local processing: your browser reads and prepares each file, and nothing needs to be uploaded. Processing and ZIP creation happen locally in your browser.")}</p>
            <Link
              to="/help/local-processing-and-browser-limits"
              className="mt-6 inline-flex items-center gap-1.5 rounded text-sm font-medium text-lime underline-offset-4 hover:underline">{tr("How local processing works")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
            {LOCAL_POINTS.map(({ icon: Icon, title, body }) =>
            <div key={title} className="flex gap-4 bg-ink p-5">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-lime" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <dt className="text-[15px] font-semibold">{tr(title)}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-white/65">{tr(body)}</dd>
                </div>
              </div>
            )}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-content px-5 pb-24 sm:px-8">
        <FaqSection id="home-faq" title={tr("Questions, answered")} intro={tr("The short version of how Batch works.")} items={HOME_FAQS} />
      </div>
    </>);

}
