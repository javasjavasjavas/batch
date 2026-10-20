import { useCallback, useEffect, useRef, useState } from 'react';
import type { RunState } from '../types/run';
import { processFile, type ProcessResult } from '../processing/codec';
import type { InputFormat } from '../processing/formats';

export function useRunEngine() {
  const [run, setRun] = useState<RunState | null>(null);
  const worker = useRef<Worker | null>(null);
  const busy = useRef<string | null>(null);
  const generation = useRef(0);
  const urls = useRef(new Set<string>());

  const clearUrls = useCallback(() => { urls.current.forEach(URL.revokeObjectURL); urls.current.clear(); }, []);
  const abort = useCallback(() => { generation.current++; worker.current?.terminate(); worker.current = null; busy.current = null; }, []);

  useEffect(() => {
    if (!run || run.status !== 'running' || busy.current) return;
    const item = run.items.find((i) => i.status === 'queued');
    if (!item) {
      if (run.items.every((i) => i.status === 'complete' || i.status === 'failed' || i.status === 'canceled')) {
        worker.current?.terminate(); worker.current = null;
        setRun((r) => r?.id === run.id ? { ...r, status: 'complete' } : r);
      }
      return;
    }
    const runId = run.id, token = generation.current;
    busy.current = item.id;
    setRun((r) => r?.id === runId ? { ...r, items: r.items.map((i) => i.id === item.id ? { ...i, status: 'active' } : i) } : r);
    const finish = (result?: ProcessResult, error?: string) => {
      if (token !== generation.current || busy.current !== item.id) return;
      busy.current = null;
      const outputUrl = result ? URL.createObjectURL(result.blob) : undefined;
      if (outputUrl) urls.current.add(outputUrl);
      setRun((r) => r?.id === runId && r.status !== 'canceled' ? {
        ...r, items: r.items.map((i) => i.id === item.id ? {
          ...i, status: result ? 'complete' : 'failed', progress: result ? 1 : 0,
          error: result ? null : error || 'Processing failed.', output: result?.blob, outputUrl,
          outputSize: result?.blob.size, plannedWidth: result?.width || i.width, plannedHeight: result?.height || i.height,
          outputFormat: result?.format || i.outputFormat
        } : i)
      } : r);
    };
    let lastMessage = '';
    const report = (message: string) => {
      if (token !== generation.current || message === lastMessage) return;
      lastMessage = message;
      setRun((r) => r?.id === runId ? { ...r, items: r.items.map((i) => i.id === item.id ? { ...i, processingMessage: message } : i) } : r);
    };
    if (!item.file) { finish(undefined, 'Source file is unavailable. Add it again.'); return; }
    if (item.unreadable) { finish(undefined, 'This image could not be decoded.'); return; }
    const input = item.type.split('/')[1]?.replace('jpeg', 'jpg') as InputFormat;
    if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
      try {
        const w = worker.current || new Worker(new URL('../processing/image.worker.ts', import.meta.url), { type: 'module' });
        worker.current = w;
        w.onmessage = (event: MessageEvent<{id: string; result?: ProcessResult; error?: string; message?: string}>) => {
          if (event.data.id !== item.id) return;
          if (event.data.message) report(event.data.message);
          else finish(event.data.result, event.data.error);
        };
        w.onerror = (event) => { w.terminate(); worker.current = null; finish(undefined, event.message || 'Worker failed.'); };
        w.postMessage({ id: item.id, file: item.file, input, animated: Boolean(item.animated), settings: run.settings, enabled: run.enabled });
      } catch (error) { finish(undefined, error instanceof Error ? error.message : String(error)); }
    } else {
      void processFile(item.file, input, Boolean(item.animated), run.settings, run.enabled, report).then((result) => finish(result)).catch((error) => finish(undefined, error instanceof Error ? error.message : String(error)));
    }
  }, [run]);

  useEffect(() => () => { abort(); clearUrls(); }, [abort, clearUrls]);
  const start = useCallback((next: RunState) => { abort(); clearUrls(); setRun(next); }, [abort, clearUrls]);
  const pause = useCallback(() => setRun((r) => r?.status === 'running' ? { ...r, status: 'paused' } : r), []);
  const resume = useCallback(() => setRun((r) => r?.status === 'paused' ? { ...r, status: 'running' } : r), []);
  const cancel = useCallback(() => { abort(); setRun((r) => r ? { ...r, status: 'canceled', items: r.items.map((i) => i.status === 'queued' || i.status === 'active' ? { ...i, status: 'canceled' } : i) } : r); }, [abort]);
  const retry = useCallback(() => setRun((r) => r ? { ...r, status: 'running', items: r.items.map((i) => i.status === 'failed' ? { ...i, status: 'queued', error: null } : i) } : r), []);
  const restart = useCallback(() => { abort(); clearUrls(); setRun((r) => r ? { ...r, id: crypto.randomUUID(), status: 'running', items: r.items.map((i) => ({ ...i, status: 'queued', error: null, output: undefined, outputUrl: undefined, outputSize: undefined })) } : r); }, [abort, clearUrls]);
  const discard = useCallback(() => { abort(); clearUrls(); setRun(null); }, [abort, clearUrls]);
  return { run, start, pause, resume, cancel, retry, restart, discard };
}
