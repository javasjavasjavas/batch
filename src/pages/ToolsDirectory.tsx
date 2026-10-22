import { useI18n } from '../i18n/LocaleContext';
import { searchText } from '../i18n/search';
import { useMemo, useState } from 'react';
import { SearchXIcon, Gamepad2Icon, ArrowRightIcon } from 'lucide-react';
import { Link } from '../i18n/router';
import { TOOLS } from '../data/tools';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { AdSlot } from '../components/ui/AdSlot';
import { ToolCard } from '../components/site/ToolCard';
import { PLATFORM_PACKS } from '../data/platforms';
import { PlatformIcon } from '../components/platforms/PlatformIcon';
import { CREATIVE_TOOLS } from '../data/creativeTools';
import { SparklesIcon } from 'lucide-react';

export function ToolsDirectory() {
  const { tr } = useI18n();
  const [query, setQuery] = useState('');
  const creative = CREATIVE_TOOLS.filter(tool => searchText([tool.name, tool.description, tr(tool.name), tr(tool.description)].join(' ')).includes(searchText(query)));
  const showSteam = !query.trim() || searchText('steam assets generator game capsule library icon screenshot generador recursos juego capsula biblioteca icono captura').includes(searchText(query));
  const packs = PLATFORM_PACKS.filter((pack) => { const parts = [pack.name, pack.description, pack.category, ...pack.assets.map((asset) => asset.name)]; return searchText([...parts, ...tr(parts)].join(' ')).includes(searchText(query)); });

  const results = useMemo(() => {
    const q = searchText(query);
    if (!q) return TOOLS;
    return TOOLS.filter((t) => { const parts = [t.name, t.tagline, ...t.keywords]; return searchText([...parts, ...tr(parts)].join(' ')).includes(q); });
  }, [query, tr]);

  return (
    <div className="mx-auto max-w-content px-5 pb-20 sm:px-8">
      <header className="max-w-2xl pb-8 pt-12 sm:pt-16">
        <h1 className="text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[48px]">{tr("Free online image tools")}</h1>
        <p className="mt-3 text-[17px] leading-relaxed text-muted">{tr("Everyday image tools and complete graphic sets for games, creators, social networks, shops, and apps.")}</p>
      </header>

      <SearchInput
        id="tool-search"
        label={tr("Search tools")}
        value={query}
        onChange={setQuery}
        placeholder={tr("Search by task, like “webp” or “thumbnail”")}
        className="max-w-xl" />
      
      <p className="sr-only" role="status" aria-live="polite">
        {tr(results.length + Number(showSteam) + packs.length + creative.length)}{tr(" tools found")}</p>

      <div className="mt-8">
        {results.length > 0 || showSteam || packs.length > 0 || creative.length > 0 ?
        <ul className="grid gap-4 md:grid-cols-2">
            {results.map((tool) =>
          <li key={tool.id}>
                <ToolCard tool={tool} />
              </li>
          )}
            {!query.trim() && <li className="empty:hidden md:col-span-2"><AdSlot placement="directory" className="my-8" /></li>}
            {creative.map(tool => <li key={tool.id}><article className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 sm:p-7"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft"><SparklesIcon className="h-5 w-5" /></span><h2 className="mt-5 text-lg font-semibold"><Link to={`/tools/${tool.slug}`}>{tr(tool.name)}</Link></h2><p className="mt-1.5 flex-1 text-[14.5px] leading-relaxed text-muted">{tr(tool.description)}</p><Link to={`/tools/${tool.slug}`} className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white">{tr('Open tool')}<ArrowRightIcon className="h-4 w-4" /></Link></article></li>)}
            {showSteam && <li><article className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 sm:p-7"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft"><Gamepad2Icon className="h-5 w-5" /></span><h2 className="mt-5 text-lg font-semibold"><Link to="/tools/steam-assets">{tr("Steam Asset Generator")}</Link></h2><p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{tr("Turn your artwork into Steam capsules, library images and icons. Review every crop and export a named set with an asset guide.")}</p><Link to="/tools/steam-assets" className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white">{tr("Create Steam assets")}<ArrowRightIcon className="h-4 w-4" /></Link></article></li>}
            {packs.map((pack) => <li key={pack.id}><article className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 sm:p-7"><div className="flex items-center justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft"><PlatformIcon id={pack.id} /></span><span className="text-xs text-muted">{tr(pack.category)}{tr(" · ")}{tr(pack.assets.length)}{tr(" presets")}</span></div><h2 className="mt-5 text-lg font-semibold"><Link to={`/tools/${pack.id}-assets`}>{tr(`${pack.name} Asset Kit`)}</Link></h2><p className="mt-1.5 flex-1 text-[14.5px] leading-relaxed text-muted">{tr(pack.description)}</p><Link to={`/tools/${pack.id}-assets`} className="mt-6 inline-flex items-center gap-2 self-start rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white">{tr(`Create ${pack.name} assets`)}<ArrowRightIcon className="h-4 w-4" /></Link></article></li>)}
          </ul> :

        <div className="rounded-2xl border border-dashed border-line-strong bg-white">
            <EmptyState
            icon={<SearchXIcon className="h-5 w-5" />}
            title={tr(`No tools match “${query.trim()}”`)}
            description={tr("Try a task like resize, compress, webp, or rename. All four tools can also be combined in the workspace.")}>
            
              <Button variant="secondary" onClick={() => setQuery('')}>{tr("Show all tools")}</Button>
            </EmptyState>
          </div>
        }
      </div>

    </div>);

}
