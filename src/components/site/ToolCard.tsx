import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, ArrowUpRightIcon } from 'lucide-react';
import type { ToolInfo } from '../../types/content';
import { ToolIcon } from '../ui/ToolIcon';
import { Button } from '../ui/Button';

interface ToolCardProps {
  tool: ToolInfo;
  variant?: 'full' | 'compact';
}

export function ToolCard({ tool, variant = 'full' }: ToolCardProps) {
  const navigate = useNavigate();

  if (variant === 'compact') {
    return (
      <Link
        to={`/tools/${tool.slug}`}
        className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-[border-color,box-shadow] duration-150 hover:border-line-strong hover:shadow-soft">
        
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-soft text-ink">
          <ToolIcon tool={tool.id} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-ink">{tool.name}</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-muted">{tool.tagline}</span>
        </span>
        <ArrowUpRightIcon
          className="h-4 w-4 shrink-0 text-muted transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
          aria-hidden="true" />
        
      </Link>);

  }

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 sm:p-7">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft text-ink" aria-hidden="true">
        <ToolIcon tool={tool.id} className="h-5 w-5" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-[-0.015em] text-ink">
        <Link to={`/tools/${tool.slug}`} className="rounded hover:underline hover:underline-offset-4">
          {tool.name}
        </Link>
      </h2>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{tool.tagline}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
        <Button
          variant="primary"
          onClick={() => {
            navigate(`/app/${tool.id}`);
          }}>
          
          Use in workspace
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Link
          to={`/tools/${tool.slug}`}
          className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink">
          
          How it works
        </Link>
      </div>
    </article>);

}