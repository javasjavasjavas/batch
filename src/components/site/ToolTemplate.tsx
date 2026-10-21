import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import type { ToolInfo } from '../../types/content';
import { TOOLS } from '../../data/tools';
import { useWorkspaceEntry } from '../../hooks/useWorkspaceEntry';
import { Dropzone } from '../ui/Dropzone';
import { AdSlot } from '../ui/AdSlot';
import { SettingsPreviewCard } from './SettingsPreviewCard';
import { StepList } from './StepList';
import { FaqSection } from './FaqSection';
import { ToolCard } from './ToolCard';
import { WORKFLOW_GUIDES, GUIDE_TOOLS } from '../../data/workflowGuides';

export function ToolTemplate({ tool }: {tool: ToolInfo;}) {
  const { handleFiles, rejected, clearRejected, openSample, openWorkspace } = useWorkspaceEntry(tool.id);
  const related = TOOLS.filter((t) => t.id !== tool.id);

  return (
    <div className="mx-auto max-w-content px-5 sm:px-8">
      <nav aria-label="Breadcrumb" className="pt-8">
        <ol className="flex items-center gap-1.5 text-[13px] text-muted">
          <li>
            <Link to="/tools" className="rounded hover:text-ink">
              Tools
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="text-ink">
            {tool.name}
          </li>
        </ol>
      </nav>

      <section className="grid gap-10 pb-16 pt-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pt-8">
        <div>
          <h1 className="max-w-[18ch] text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[48px]">
            {tool.title}
          </h1>
          <p className="mt-4 max-w-[58ch] text-[16.5px] leading-relaxed text-muted">{tool.lede}</p>
          <Dropzone
            className="mt-8"
            title={tool.dropTitle}
            onFiles={handleFiles}
            onSample={openSample}
            rejected={rejected}
            onDismissRejected={clearRejected} />
          
        </div>
        <div className="lg:pt-2">
          <SettingsPreviewCard tool={tool} onOpen={openWorkspace} />
          <div className="mt-6 space-y-5">
            {tool.notes.map((note) =>
            <div key={note.title} className="border-l-2 border-lime pl-4">
                <h2 className="text-[15px] font-semibold text-ink">{note.title}</h2>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{note.body}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="tool-steps" className="pb-16">
        <h2 id="tool-steps" className="mb-6 text-[28px] font-semibold tracking-[-0.025em] text-ink">
          How it works
        </h2>
        <StepList steps={tool.steps} />
      </section>

      <div className="pb-16">
        <AdSlot format="leaderboard" />
      </div>

      <div className="pb-16">
        <FaqSection id="tool-faq" title={`${tool.name} questions`} items={tool.faqs} />
      </div>

      <section aria-labelledby="related-tools" className="border-t border-line py-14">
        <nav aria-label="Image preparation guides" className="mb-8"><h2 className="text-lg font-semibold">Practical image guides</h2><ul className="mt-3 space-y-2">{WORKFLOW_GUIDES.filter((guide) => GUIDE_TOOLS[guide.slug]?.includes(tool.slug)).map((guide) => <li key={guide.slug}><Link className="text-sm underline underline-offset-4" to={`/help/${guide.slug}`}>{guide.title}</Link></li>)}<li><Link className="text-sm underline underline-offset-4" to="/help/choosing-output-settings">Choose size, quality, format and filename settings</Link></li></ul></nav>
        <h2 id="related-tools" className="text-lg font-semibold tracking-[-0.015em] text-ink">
          Related tools
        </h2>
        <p className="mt-1 text-sm text-muted">All tools work together in one batch.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {related.map((t) =>
          <ToolCard key={t.id} tool={t} variant="compact" />
          )}
        </div>
      </section>
    </div>);

}
