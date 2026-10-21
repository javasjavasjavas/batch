import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon, LayersIcon, Gamepad2Icon } from 'lucide-react';
import { TOOLS } from '../../data/tools';
import { ToolIcon } from '../ui/ToolIcon';
import { PLATFORM_PACKS } from '../../data/platforms';
import { PlatformIcon } from '../platforms/PlatformIcon';

export function ToolsMenu({ label = 'Tools', mobile = false }: { label?: string; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const hovering = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    clearTimeout(closeTimer.current);
    return () => clearTimeout(closeTimer.current);
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return (
    <div ref={root} className="relative"
      onPointerEnter={(event) => {
        clearTimeout(closeTimer.current);
        if (!mobile && event.pointerType === 'mouse') { hovering.current = true; setOpen(true); }
      }}
      onPointerLeave={(event) => {
        if (!mobile && event.pointerType === 'mouse') {
          hovering.current = false;
          closeTimer.current = setTimeout(() => setOpen(false), 160);
        }
      }}
      onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls={menuId}
        className={mobile ? 'flex h-14 w-full items-center justify-between text-[17px] font-medium text-ink' : 'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-sunken'}
        onClick={() => setOpen((value) => hovering.current || !value)}>
        {label}<ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && <div id={menuId} className={mobile ? 'mb-3' : 'absolute left-0 top-full z-50 w-[min(680px,calc(100vw-180px))] pt-2'}>
        <div className="max-h-[75vh] overflow-y-auto rounded-xl border border-line bg-white p-3 shadow-pop"><div className="grid gap-3 md:grid-cols-[0.85fr_1.4fr]"><div>
        <Link to="/app" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-lime-soft">
          <LayersIcon className="h-4 w-4" aria-hidden="true" />
          <span><span className="block font-semibold">Batch workspace</span><span className="block text-[12px] text-muted">Combine multiple tools</span></span>
        </Link>
        <div className="my-1 border-t border-line" />
        {TOOLS.map((tool) => <Link key={tool.id} to={`/tools/${tool.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-canvas">
          <ToolIcon tool={tool.id} className="h-4 w-4" /><span>{tool.name}</span>
        </Link>)}
        <Link to="/tools/steam-assets" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-canvas"><Gamepad2Icon className="h-4 w-4" aria-hidden="true" /><span>Steam Asset Generator</span></Link>
        </div><div className="border-t border-line pt-3 md:border-l md:border-t-0 md:pl-3 md:pt-0"><p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted">Platform kits</p><div className="grid sm:grid-cols-2">{PLATFORM_PACKS.map((pack) => <Link key={pack.id} to={`/tools/${pack.id}-assets`} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-lime-soft"><PlatformIcon id={pack.id} className="h-4 w-4 shrink-0" /><span>{pack.name}</span></Link>)}</div></div></div>
        <Link to="/tools" className="mt-1 block border-t border-line px-3 pb-1 pt-3 text-[12px] text-muted hover:text-ink">Explore all tools</Link>
        </div>
      </div>}
    </div>
  );
}
