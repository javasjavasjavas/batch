import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import { useI18n } from '../../i18n/LocaleContext';
import './ColorPicker.css';

const valid = (hex: string) => /^#[\da-f]{6}$/i.test(hex);
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const clamp = (n: number) => Math.max(0, Math.min(100, n));
function toHSV(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const h = !d ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, max ? d / max * 100 : 0, max * 100];
}
function toHex([h, s, v]: [number, number, number]) {
  const c = v / 100 * s / 100, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v / 100 - c;
  const rgb = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + rgb.map(n => Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
const defaults = ['#FFFFFF', '#F7F7F2', '#151715', '#D3F36A', '#EF663E', '#6657C7', '#4478D4', '#35856B'];

interface Props {
  value: string;
  onChange: (color: string) => void;
  label: string;
  id?: string;
  description?: string;
  swatches?: string[];
  className?: string;
  describedBy?: string;
  invalid?: boolean;
}

export function ColorPicker({ value, onChange, label, id, description, swatches = defaults, className = '', describedBy, invalid }: Props) {
  const { locale } = useI18n();
  const es = locale === 'es';
  const uid = useId(), panelId = `${uid}-panel`;
  const color = valid(value) ? value.toUpperCase() : '#FFFFFF';
  const [open, setOpen] = useState(false), [hsv, setHsv] = useState(() => toHSV(color));
  const [draft, setDraft] = useState(color), [hexError, setHexError] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const trigger = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null);
  const original = useRef(color), last = useRef(color);
  useEffect(() => {
    if (color !== last.current) { setHsv(toHSV(color)); setDraft(color); setHexError(false); last.current = color; }
  }, [color]);
  function apply(next: [number, number, number]) {
    const hex = toHex(next); last.current = hex; setHsv(next); setDraft(hex); setHexError(false); onChange(hex);
  }
  function choose(hex: string) { last.current = hex; setHsv(toHSV(hex)); setDraft(hex); setHexError(false); onChange(hex); }
  function close() { setOpen(false); trigger.current?.focus(); }
  useBrowserLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = trigger.current?.getBoundingClientRect(), p = panel.current;
      if (!r || !p) return;
      setPosition({ left: Math.max(12, Math.min(r.left, window.innerWidth - p.offsetWidth - 12)), top: Math.max(12, Math.min(r.bottom + 8, window.innerHeight - p.offsetHeight - 12)) });
    };
    place(); panel.current?.querySelector<HTMLElement>('[data-color-area]')?.focus({ preventScroll: true });
    const outside = (e: Event) => { if (!panel.current?.contains(e.target as Node) && !trigger.current?.contains(e.target as Node)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
    document.addEventListener('pointerdown', outside); document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape, true);
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside); document.removeEventListener('keydown', escape, true); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open]);
  function point(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    apply([hsv[0], clamp((e.clientX - r.left) / r.width * 100), clamp(100 - (e.clientY - r.top) / r.height * 100)]);
  }
  function commitHex() {
    let next = draft.trim().replace(/^#/, '');
    if (/^[\da-f]{3}$/i.test(next)) next = [...next].map(c => c + c).join('');
    if (valid('#' + next)) { choose(('#' + next).toUpperCase()); return true; }
    setHexError(true); return false;
  }
  return <>
    <button ref={trigger} id={id} type="button" className={`color-picker-trigger ${className}`} aria-label={`${label}: ${value}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? panelId : undefined} aria-describedby={describedBy} aria-invalid={invalid || undefined} onClick={() => { if (open) close(); else { original.current = color; setDraft(color); setHexError(false); setOpen(true); } }}>
      <span className="color-picker-chip" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="color-picker-value"><span>{value.toUpperCase()}</span>{description && <small>{description}</small>}</span>
      <ChevronDownIcon size={14} aria-hidden="true" />
    </button>
    {open && createPortal(<div ref={panel} id={panelId} role="dialog" aria-label={label} className="color-picker-panel" style={position}>
      <div className="color-picker-heading"><span>{label}</span><button type="button" aria-label={es ? 'Cerrar selector de color' : 'Close color picker'} onClick={close}><XIcon size={16} /></button></div>
      <div data-color-area role="slider" tabIndex={0} aria-label={es ? 'Saturación y brillo' : 'Saturation and brightness'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hsv[1])} aria-valuetext={`${Math.round(hsv[1])}% / ${Math.round(hsv[2])}%`} aria-describedby={`${uid}-keys`} className="color-picker-area" style={{ backgroundColor: `hsl(${hsv[0]}, 100%, 50%)` }} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.focus(); point(e); }} onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) point(e); }} onKeyDown={e => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        e.preventDefault(); const step = e.shiftKey ? 10 : 1;
        apply([hsv[0], clamp(hsv[1] + (e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0)), clamp(hsv[2] + (e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0))]);
      }}><span className="color-picker-cursor" style={{ left: `${hsv[1]}%`, top: `${100 - hsv[2]}%`, backgroundColor: color }} /></div>
      <span id={`${uid}-keys`} className="sr-only">{es ? 'Usá izquierda y derecha para saturación; arriba y abajo para brillo.' : 'Use left and right for saturation; up and down for brightness.'}</span>
      <div className="color-picker-hue-label"><label htmlFor={`${uid}-hue`}>{es ? 'Tono' : 'Hue'}</label><span>{Math.round(hsv[0])}°</span></div>
      <input id={`${uid}-hue`} className="color-picker-hue" type="range" min="0" max="359" value={hsv[0]} onChange={e => apply([Number(e.target.value), hsv[1], hsv[2]])} />
      <div className="color-picker-hex"><span className="color-picker-chip" style={{ backgroundColor: color }} /><label htmlFor={`${uid}-hex`}>HEX</label><input id={`${uid}-hex`} aria-invalid={hexError} aria-describedby={hexError ? `${uid}-error` : undefined} value={draft} maxLength={7} spellCheck={false} autoComplete="off" onChange={e => { const v = e.target.value; setDraft(v); setHexError(false); const hex = v.startsWith('#') ? v : '#' + v; if (valid(hex)) { last.current = hex.toUpperCase(); setHsv(toHSV(hex)); onChange(hex.toUpperCase()); } }} onBlur={commitHex} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (commitHex()) close(); } }} /></div>
      {hexError && <p id={`${uid}-error`} className="color-picker-error">{es ? 'Ingresá un HEX válido, como #D3F36A.' : 'Enter a valid HEX, like #D3F36A.'}</p>}
      <div className="color-picker-presets" role="group" aria-label={es ? 'Colores rápidos' : 'Quick colors'}>{[...new Set(swatches.filter(valid).map(c => c.toUpperCase()))].slice(0, 8).map(c => <button key={c} type="button" aria-label={c} aria-pressed={c === color} title={c} style={{ backgroundColor: c }} onClick={() => choose(c)}>{c === color && <CheckIcon size={14} style={{ color: toHSV(c)[2] > 65 && toHSV(c)[1] < 60 ? '#151715' : '#fff' }} />}</button>)}</div>
      <div className="color-picker-footer"><button type="button" onClick={() => { choose(original.current); close(); }}>{es ? 'Restablecer' : 'Reset'}</button><button type="button" onClick={() => { if (commitHex()) close(); }}>{es ? 'Listo' : 'Done'}<CheckIcon size={14} /></button></div>
    </div>, trigger.current?.closest('[role="dialog"]') || document.body)}
  </>;
}
