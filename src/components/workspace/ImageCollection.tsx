import { twMerge } from 'tailwind-merge';
import type { ViewMode } from '../../types/prefs';
import { useBatch } from '../../contexts/BatchContext';
import { usePrefs } from '../../contexts/PrefsContext';
import { plannedName } from '../../utils/planning';
import { ImageCard } from './ImageCard';
import { ImageRow, ROW_GRID } from './ImageRow';

interface ImageCollectionProps {
  view: ViewMode;
  onOpen: (id: string) => void;
}

export function ImageCollection({ view, onOpen }: ImageCollectionProps) {
  const { images, selectedIds, toggleSelect, moveImage, settings, enabled } = useBatch();
  const { prefs } = usePrefs();
  const compact = prefs.density === 'compact';

  const items = images.map((image, index) => {
    const planned = plannedName(image.name, index, settings, enabled);
    return {
      image,
      index,
      total: images.length,
      selected: selectedIds.includes(image.id),
      planned: planned !== image.name ? planned : null,
      compact,
      onToggle: () => toggleSelect(image.id),
      onOpen: () => onOpen(image.id),
      onMove: (d: -1 | 1) => moveImage(image.id, d)
    };
  });

  if (view === 'list') {
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className={twMerge('hidden gap-3 border-b border-line bg-canvas px-4 py-2 text-[12px] font-medium text-muted md:grid', ROW_GRID)} aria-hidden="true">
          <span />
          <span />
          <span>Name</span>
          <span>Type</span>
          <span>Dimensions</span>
          <span>Size</span>
          <span className="w-24" />
        </div>
        <ul className="divide-y divide-line" aria-label="Images in batch">
          {items.map((p) =>
          <ImageRow key={p.image.id} {...p} />
          )}
        </ul>
      </div>);

  }

  return (
    <ul
      aria-label="Images in batch"
      className={twMerge('grid', compact ? 'gap-2' : 'gap-3')}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 124 : 158}px, 1fr))` }}>
      
      {items.map((p) =>
      <ImageCard key={p.image.id} {...p} />
      )}
    </ul>);

}