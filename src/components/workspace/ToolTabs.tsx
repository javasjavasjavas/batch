import { useI18n } from '../../i18n/LocaleContext';
import React, { useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import type { ToolId } from '../../types/batch';
import { useBatch } from '../../contexts/BatchContext';
import { TOOL_LABEL, TOOL_ORDER } from '../../utils/planning';
import { ToolIcon } from '../ui/ToolIcon';

export function ToolTabs() {
  const { tr } = useI18n();
  const { activeTool, setActiveTool, enabled } = useBatch();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = TOOL_ORDER[(index + delta + TOOL_ORDER.length) % TOOL_ORDER.length];
    setActiveTool(next);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={tr("Tools")} className="grid shrink-0 grid-cols-4 border-b border-line">
      {TOOL_ORDER.map((tool: ToolId, i) => {
        const selected = tool === activeTool;
        return (
          <button
            key={tool}
            ref={(el) => {
              refs.current[tool] = el;
            }}
            type="button"
            role="tab"
            id={`tool-tab-${tool}`}
            aria-selected={selected}
            aria-controls="tool-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => setActiveTool(tool)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={twMerge(
              'relative flex flex-col items-center gap-1 py-3 text-[12.5px] font-medium transition-colors duration-150 ease-out',
              selected ? 'bg-lime-soft text-ink' : 'text-muted hover:bg-canvas hover:text-ink'
            )}>
            
            <span className="relative">
              <ToolIcon tool={tool} />
              {enabled[tool] &&
              <span className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full border border-white bg-[#8FB01C]" aria-hidden="true" />
              }
            </span>
            {tr(TOOL_LABEL[tool])}
            <span className="sr-only">{tr(enabled[tool] ? ', on' : ', off')}</span>
            {selected && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-ink" aria-hidden="true" />}
          </button>);

      })}
    </div>);

}