import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { MoveIcon, Trash2Icon } from 'lucide-react';
import { Button } from '../ui/Button';
import { moveHeroRegion, normalizeRegion, resizeHeroRegion, type HeroRegion, type HeroRegionHandle } from '../../processing/heroRegions';

const handles: { id: HeroRegionHandle; label: string; left: string; top: string; cursor: string }[] = [
  { id: 'nw', label: 'top left', left: '0%', top: '0%', cursor: 'nwse-resize' },
  { id: 'n', label: 'top', left: '50%', top: '0%', cursor: 'ns-resize' },
  { id: 'ne', label: 'top right', left: '100%', top: '0%', cursor: 'nesw-resize' },
  { id: 'e', label: 'right', left: '100%', top: '50%', cursor: 'ew-resize' },
  { id: 'se', label: 'bottom right', left: '100%', top: '100%', cursor: 'nwse-resize' },
  { id: 's', label: 'bottom', left: '50%', top: '100%', cursor: 'ns-resize' },
  { id: 'sw', label: 'bottom left', left: '0%', top: '100%', cursor: 'nesw-resize' },
  { id: 'w', label: 'left', left: '0%', top: '50%', cursor: 'ew-resize' },
];
type Drag = { pointerId: number; x: number; y: number; index: number; kind: 'draw' | 'move' | HeroRegionHandle; original?: HeroRegion };

export function HeroRegionEditor({ imageUrl, width, height, regions, disabled, onChange }: {
  imageUrl: string; width: number; height: number; regions: HeroRegion[]; disabled: boolean; onChange: (regions: HeroRegion[]) => void;
}) {
  const surface = useRef<HTMLDivElement>(null), drag = useRef<Drag | null>(null);
  const [selected, setSelected] = useState(0), [draft, setDraft] = useState<{ index: number; region: HeroRegion } | null>(null);
  const selectedIndex = Math.min(selected, regions.length - 1);
  const shown = draft ? (draft.index === regions.length ? [...regions, draft.region] : regions.map((r, i) => i === draft.index ? draft.region : r)) : regions;
  const active = shown[draft?.index ?? selectedIndex];
  const point = (event: PointerEvent) => {
    const bounds = surface.current!.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) };
  };
  const begin = (event: PointerEvent<HTMLElement>, index: number, kind: Drag['kind']) => {
    if (disabled || event.button !== 0 || !event.isPrimary || drag.current || (kind === 'draw' && regions.length >= 24)) return;
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.focus();
    const p = point(event);
    drag.current = { ...p, index, kind, pointerId: event.pointerId, original: regions[index] };
    setSelected(index); setDraft(null);
    surface.current!.setPointerCapture(event.pointerId);
  };
  const dragRegion = (event: PointerEvent) => {
    const start = drag.current!, p = point(event), dx = p.x - start.x, dy = p.y - start.y;
    return start.kind === 'draw' ? normalizeRegion(start.x, start.y, p.x, p.y)
      : start.kind === 'move' ? moveHeroRegion(start.original!, dx, dy)
        : resizeHeroRegion(start.original!, start.kind, dx, dy);
  };
  const replace = (index: number, region: HeroRegion) => {
    const previous = regions[index];
    if (previous && Object.keys(region).every((key) => Math.abs(region[key as keyof HeroRegion] - previous[key as keyof HeroRegion]) < 1e-9)) return;
    onChange(index === regions.length ? [...regions, region] : regions.map((r, i) => i === index ? region : r));
  };
  const remove = (index: number) => { onChange(regions.filter((_, i) => i !== index)); setSelected(Math.max(0, index - 1)); };
  const keyboard = (event: KeyboardEvent, index: number, handle?: HeroRegionHandle) => {
    if (disabled) return;
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); remove(index); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const step = event.shiftKey ? 10 : 1;
    const dx = (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0) / width;
    const dy = (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0) / height;
    replace(index, handle ? resizeHeroRegion(regions[index], handle, dx, dy) : moveHeroRegion(regions[index], dx, dy));
  };
  return <div className="space-y-3">
    <div className="flex min-h-8 flex-wrap items-center gap-3 text-xs text-muted">
      {regions.length ? <>
        <label className="flex items-center gap-2 font-medium text-ink">Selected area
          <select aria-label="Selected area" value={selectedIndex} disabled={disabled} onChange={(event) => setSelected(Number(event.target.value))} className="h-8 rounded-lg border border-line bg-white px-2 text-sm">
            {regions.map((_, i) => <option key={i} value={i}>Area {i + 1}</option>)}
          </select>
        </label>
        <Button size="sm" variant="ghost" disabled={disabled} onClick={() => remove(selectedIndex)}><Trash2Icon className="h-4 w-4" />Delete area</Button>
        {active && <span className="tabular-nums">{Math.round(active.width * width)} × {Math.round(active.height * height)} px</span>}
      </> : <span>Drag over the image to add an area.</span>}
    </div>
    <div className="p-3">
      <div ref={surface} role="group" aria-label="Text and logo removal areas" className={`relative mx-auto w-full touch-none select-none rounded-lg bg-canvas ${disabled ? '' : 'cursor-crosshair'}`}
        style={{ aspectRatio: `${width}/${height}`, maxWidth: `min(100%, ${460 * width / height}px)` }}
        onPointerDown={(event) => begin(event, regions.length, 'draw')}
        onPointerMove={(event) => { if (drag.current?.pointerId === event.pointerId) setDraft({ index: drag.current.index, region: dragRegion(event) }); }}
        onPointerUp={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return;
          const { index, kind } = drag.current, region = dragRegion(event);
          drag.current = null; setDraft(null);
          if (surface.current?.hasPointerCapture(event.pointerId)) surface.current.releasePointerCapture(event.pointerId);
          if (kind !== 'draw' || (region.width >= 0.01 && region.height >= 0.01)) replace(index, region);
        }}
        onPointerCancel={() => { drag.current = null; setDraft(null); }}
        onLostPointerCapture={() => { drag.current = null; setDraft(null); }}>
        <img draggable={false} src={imageUrl} alt="Hero artwork before removal" className="pointer-events-none absolute inset-0 h-full w-full rounded-lg" />
        {shown.map((region, i) => {
          const isSelected = i === (draft?.index ?? selectedIndex);
          return <div key={i} data-removal-area={i + 1} className="absolute" style={{ left: `${region.x * 100}%`, top: `${region.y * 100}%`, width: `${region.width * 100}%`, height: `${region.height * 100}%`, zIndex: isSelected ? 2 : 1 }}>
            <button type="button" aria-label={`Move area ${i + 1}`} aria-pressed={isSelected} disabled={disabled} onFocus={() => setSelected(i)} onClick={() => setSelected(i)} onPointerDown={(event) => begin(event, i, 'move')} onKeyDown={(event) => keyboard(event, i)}
              className={`absolute inset-0 h-full w-full cursor-move border-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-white ${isSelected ? 'border-lime bg-lime/20 shadow-[0_0_0_1px_rgba(0,0,0,0.6)]' : 'border-white/80 bg-white/10'}`}>
              <span className="pointer-events-none absolute left-1 top-1 flex items-center gap-1 rounded bg-ink/85 px-1.5 py-0.5 text-[10px] font-semibold text-white"><MoveIcon className="h-3 w-3" />{i + 1}</span>
            </button>
            {isSelected && !disabled && handles.map((handle) => <button type="button" key={handle.id} aria-label={`Resize area ${i + 1} ${handle.label}`} onPointerDown={(event) => begin(event, i, handle.id)} onKeyDown={(event) => keyboard(event, i, handle.id)}
              className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              style={{ left: handle.left, top: handle.top, cursor: handle.cursor }}>
              <span className="pointer-events-none h-3 w-3 rounded-[2px] border border-ink bg-lime shadow-sm" />
            </button>)}
          </div>;
        })}
      </div>
    </div>
    <p className="text-xs leading-relaxed text-muted">Drag an area to move it, or drag its handles to resize. Draw outside an area to add another. Use arrow keys for 1 px adjustments, or Shift + arrows for 10 px.</p>
  </div>;
}
