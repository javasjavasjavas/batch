import { useMemo, useState } from 'react';
import { SearchXIcon, Gamepad2Icon, ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../data/tools';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { AdSlot } from '../components/ui/AdSlot';
import { ToolCard } from '../components/site/ToolCard';
import { PLATFORM_PACKS } from '../data/platforms';
import { PlatformIcon } from '../components/platforms/PlatformIcon';

export function ToolsDirectory() {
  const [query, setQuery] = useState('');
  const showSteam = !query.trim() || 'steam assets generator game capsule library icon screenshot'.includes(query.trim().toLowerCase());
  const packs = PLATFORM_PACKS.filter((pack) => [pack.name, pack.description, pack.category, ...pack.assets.map((asset) => asset.name)].join(' ').toLowerCase().includes(query.trim().toLowerCase()));

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
          Everyday image tools and complete graphic sets for games, creators, social networks, shops, and apps.
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
        {results.length + Number(showSteam) + packs.length} tools found
      </p>

      <div className="mt-8">
        {results.length > 0 || showSteam || packs.length > 0 ?
        <ul className="grid gap-4 md:grid-cols-2">
            {results.map((tool) =>
          <li key={tool.id}>
                <ToolCard tool={tool} />
              </li>
          )}
            {showSteam && <li><article className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 sm:p-7"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft"><Gamepad2Icon className="h-5 w-5" /></span><h2 className="mt-5 text-lg font-semibold"><Link to="/tools/steam-assets">Steam Asset Generator</Link></h2><p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">Turn your artwork into Steam capsules, library images and icons. Review every crop and export a named set with an asset guide.</p><Link to="/app/steam" className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white">Create Steam assets<ArrowRightIcon className="h-4 w-4" /></Link></article></li>}
            {packs.map((pack) => <li key={pack.id}><article className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 sm:p-7"><div className="flex items-center justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft"><PlatformIcon id={pack.id} /></span><span className="text-xs text-muted">{pack.category} · {pack.assets.length} presets</span></div><h2 className="mt-5 text-lg font-semibold"><Link to={`/tools/${pack.id}-assets`}>{pack.name} Asset Kit</Link></h2><p className="mt-1.5 flex-1 text-[14.5px] leading-relaxed text-muted">{pack.description}</p><Link to={`/app/${pack.id}`} className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white">Create {pack.name} assets<ArrowRightIcon className="h-4 w-4" /></Link></article></li>)}
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
