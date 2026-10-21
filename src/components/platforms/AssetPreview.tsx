import { useI18n } from '../../i18n/LocaleContext';
import { useEffect, useRef, useState } from 'react';
import { drawAsset, type AssetJob, type PackSource } from '../../processing/platforms';

export function AssetPreview({ job, logo, guides = true, large = false }: { job: AssetJob; logo?: PackSource; guides?: boolean; large?: boolean }) {
  const { tr } = useI18n();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!canvas.current) return;
    try { drawAsset(canvas.current, job, logo, large ? 1000 : 480); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Preview unavailable'); }
  }, [job, logo, large]);
  const ratio = job.width / job.height;
  return <div className="flex h-full min-h-32 items-center justify-center overflow-hidden bg-sunken p-4">
    <div className="transparency-grid relative overflow-hidden" style={{ aspectRatio: `${job.width}/${job.height}`, width: `min(100%, ${(large ? 420 : 160) * ratio}px)` }}>
      <canvas ref={canvas} aria-label={tr(`${job.asset.name} preview`)} className="block h-full w-full" />
      {guides && job.asset.circle && <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-dashed border-white/90 shadow-[0_0_0_200px_rgba(0,0,0,0.28)]" />}
      {guides && job.asset.safeAreas?.map((area, i) => <div key={i} title={tr(`${area.label}${area.official ? ' · official guide' : ' · illustrative'}`)} className={`pointer-events-none absolute border border-dashed ${area.kind === 'avoid' ? 'border-red-400 bg-red-400/20' : 'border-lime bg-lime/10'}`} style={{ left: `${area.x * 100}%`, top: `${area.y * 100}%`, width: `${area.width * 100}%`, height: `${area.height * 100}%` }}>
        {large && <span className="absolute left-0 top-0 bg-ink/80 px-1 text-[10px] text-white">{tr(area.label)}</span>}
      </div>)}
    </div>
    {error && <p role="alert" className="text-sm text-danger">{tr(error)}</p>}
  </div>;
}
