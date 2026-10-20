import { useMemo, useState } from 'react';
import { SearchXIcon } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { AdSlot } from '../components/ui/AdSlot';
import { ToolCard } from '../components/site/ToolCard';

export function ToolsDirectory() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter((t) => [t.name, t.tagline, ...t.keywords].join(' ').toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="mx-auto max-w-content px-5 pb-20 sm:px-8">
      <header className="max-w-2xl pb-8 pt-12 sm:pt-16">
        <h1 className="text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[48px]">Tools</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">
          Four focused tools that work on whole batches. Use one, or combine them in the same run.
        </p>
      </header>

      <SearchInput
        id="tool-search"
        label="Search tools"
        value={query}
        onChange={setQuery}
        placeholder="Search by task, like “webp” or “thumbnail”"
        className="max-w-xl" />
      
      <p className="sr-only" role="status" aria-live="polite">
        {results.length === 1 ? '1 tool found' : `${results.length} tools found`}
      </p>

      <div className="mt-8">
        {results.length > 0 ?
        <ul className="grid gap-4 md:grid-cols-2">
            {results.map((tool) =>
          <li key={tool.id}>
                <ToolCard tool={tool} />
              </li>
          )}
          </ul> :

        <div className="rounded-2xl border border-dashed border-line-strong bg-white">
            <EmptyState
            icon={<SearchXIcon className="h-5 w-5" />}
            title={`No tools match “${query.trim()}”`}
            description="Try a task like resize, compress, webp, or rename. All four tools can also be combined in the workspace.">
            
              <Button variant="secondary" onClick={() => setQuery('')}>
                Show all tools
              </Button>
            </EmptyState>
          </div>
        }
      </div>

      <div className="mt-16">
        <AdSlot format="leaderboard" />
      </div>
    </div>);

}