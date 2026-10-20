import { useRef } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { fieldError } from '../../utils/validation';
import { plannedName } from '../../utils/planning';
import { Field, describedBy } from '../ui/Field';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';

const TOKENS = [
{ token: '{n}', label: 'Number' },
{ token: '{name}', label: 'Original name' },
{ token: '{date}', label: 'Date' }];


const EXAMPLES = ['IMG_2041.jpg', 'IMG_2042.jpg', 'Product shot final.png'];
const PREVIEW_COUNT = 5;

export function RenameControls() {
  const { settings, updateSettings, issues, images, enabled } = useBatch();
  const r = settings.rename;
  const set = (patch: Partial<typeof r>) => updateSettings('rename', patch);
  const patternRef = useRef<HTMLInputElement>(null);
  const previewEnabled = { ...enabled, rename: true };

  const insertToken = (token: string) => {
    const el = patternRef.current;
    const start = el?.selectionStart ?? r.pattern.length;
    const end = el?.selectionEnd ?? r.pattern.length;
    const next = r.pattern.slice(0, start) + token + r.pattern.slice(end);
    set({ pattern: next });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const sourceNames = images.length ? images.map((i) => i.name) : EXAMPLES;
  const preview = sourceNames.slice(0, PREVIEW_COUNT).map((name, i) => ({ from: name, to: plannedName(name, i, settings, previewEnabled) }));
  const patternError = fieldError(issues, 'rename', 'pattern');
  const prefixError = fieldError(issues, 'rename', 'prefix');
  const suffixError = fieldError(issues, 'rename', 'suffix');
  const startError = fieldError(issues, 'rename', 'start');
  const patternHint = 'Use {n} for a number, {name} for the original name.';

  return (
    <div className="space-y-5">
      <div>
        <Field label="Pattern" htmlFor="rename-pattern" hint={patternHint} error={patternError}>
          <Input
            ref={patternRef}
            id="rename-pattern"
            value={r.pattern}
            invalid={!!patternError}
            spellCheck={false}
            aria-describedby={describedBy('rename-pattern', patternHint, patternError)}
            onChange={(e) => set({ pattern: e.target.value })}
            className="font-mono text-[13px]" />
          
        </Field>
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Insert placeholder">
          {TOKENS.map((t) =>
          <button
            key={t.token}
            type="button"
            onClick={() => insertToken(t.token)}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-line bg-white px-2 text-[12px] text-muted transition-[border-color,color] duration-150 hover:border-line-strong hover:text-ink">
            
              <code className="font-mono text-ink">{t.token}</code>
              {t.label}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prefix" htmlFor="rename-prefix" error={prefixError}>
          <Input id="rename-prefix" value={r.prefix} placeholder="None" invalid={!!prefixError} aria-describedby={describedBy('rename-prefix', undefined, prefixError)} onChange={(e) => set({ prefix: e.target.value })} />
        </Field>
        <Field label="Suffix" htmlFor="rename-suffix" error={suffixError}>
          <Input id="rename-suffix" value={r.suffix} placeholder="None" invalid={!!suffixError} aria-describedby={describedBy('rename-suffix', undefined, suffixError)} onChange={(e) => set({ suffix: e.target.value })} />
        </Field>
        <Field label="Starting number" htmlFor="rename-start" error={startError}>
          <Input
            id="rename-start"
            inputMode="numeric"
            value={r.start}
            invalid={!!startError}
            aria-describedby={describedBy('rename-start', undefined, startError)}
            onChange={(e) => set({ start: e.target.value.replace(/[^\d]/g, '').slice(0, 7) })} />
          
        </Field>
        <Field label="Number padding" htmlFor="rename-padding">
          <select
            id="rename-padding"
            value={r.padding}
            onChange={(e) => set({ padding: Number(e.target.value) })}
            className="tabular h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink transition-[border-color,box-shadow] duration-150 hover:border-line-strong focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-lime/70">
            
            {[1, 2, 3, 4, 5].map((n) =>
            <option key={n} value={n}>
                {n} {n === 1 ? 'digit' : 'digits'} ({'1'.padStart(n, '0')})
              </option>
            )}
          </select>
        </Field>
      </div>

      <div className="space-y-4">
        <Toggle label="Lowercase" description="Product Shot.jpg becomes product shot.jpg" checked={r.lowercase} onChange={(lowercase) => set({ lowercase })} />
        <Toggle label="Spaces to hyphens" description="Tidy names for web addresses." checked={r.hyphenate} onChange={(hyphenate) => set({ hyphenate })} />
      </div>

      <div className="rounded-xl border border-line">
        <div className="flex items-baseline justify-between border-b border-line px-3.5 py-2.5">
          <p className="text-[13px] font-semibold text-ink">Planned names</p>
          <p className="text-[12px] text-muted">
            {images.length ? `First ${Math.min(PREVIEW_COUNT, images.length)} of ${images.length}` : 'Example files'}
          </p>
        </div>
        <ol className="divide-y divide-line" aria-live="polite">
          {preview.map((p) =>
          <li key={p.from} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)] items-center gap-2 px-3.5 py-2 text-[12.5px]">
              <span className="truncate text-muted" title={p.from}>
                {p.from}
              </span>
              <ArrowRightIcon className="h-3 w-3 text-muted" aria-label="becomes" />
              <span className="truncate font-medium text-ink" title={p.to}>
                {p.to}
              </span>
            </li>
          )}
        </ol>
        {images.length > PREVIEW_COUNT &&
        <p className="border-t border-line px-3.5 py-2 text-[12px] text-muted">The full list appears on the review screen.</p>
        }
      </div>
    </div>);

}