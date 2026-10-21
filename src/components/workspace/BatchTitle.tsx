import { useI18n } from '../../i18n/LocaleContext';
import { useEffect, useRef, useState } from 'react';
import { PencilIcon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';

export function BatchTitle() {
  const { tr } = useI18n();
  const { title, setTitle } = useBatch();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(title);
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing, title]);

  const commit = () => {
    const v = draft.trim();
    if (v) setTitle(v.slice(0, 60));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="min-w-0 max-w-[260px] flex-1 sm:flex-none">
        <label htmlFor="batch-title" className="sr-only">{tr("Batch name")}</label>
        <input
          ref={inputRef}
          id="batch-title"
          value={draft}
          maxLength={60}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              e.stopPropagation();
              setEditing(false);
            }
          }}
          className="h-8 w-full rounded-md border border-ink bg-white px-2 text-sm font-medium text-ink focus:outline-none focus:ring-[3px] focus:ring-lime/70" />
        
      </div>);

  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label={tr(`Rename batch, currently ${title}`)}
      className="group flex h-8 min-w-0 max-w-[150px] items-center gap-1.5 rounded-md px-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-sunken sm:max-w-[240px]">
      
      <span className="truncate">{title}</span>
      <PencilIcon className="h-3.5 w-3.5 shrink-0 text-muted transition-colors duration-150 group-hover:text-ink" aria-hidden="true" />
    </button>);

}