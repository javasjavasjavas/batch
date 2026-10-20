import type { BatchImage, BatchSettings, EnabledTools, ToolId } from '../types/batch';
import type { RunItem, RunState } from '../types/run';
import { localDateStamp, plannedDimensions, plannedName, TOOL_LABEL, TOOL_ORDER, toolSummary, uniqueNames } from './planning';

export function createRun(images: BatchImage[], settings: BatchSettings, enabled: EnabledTools, workspaceTool: ToolId | null = null): RunState {
  const date = localDateStamp();
  const formats = images.map((img) => img.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg');
  const names = uniqueNames(images.map((img, i) => plannedName(img.name, i, settings, enabled, date, formats[i])));
  const items: RunItem[] = images.map((img, i) => {
    const dims = plannedDimensions(img.width, img.height, settings, enabled);
    return {
      id: `${img.id}-${crypto.randomUUID()}`, imageId: img.id, name: img.name, outputName: names[i],
      source: img.source, url: img.url, type: img.type, originalSize: img.size,
      width: img.width, height: img.height, plannedWidth: dims?.width ?? null, plannedHeight: dims?.height ?? null,
      outputFormat: enabled.convert ? settings.convert.format : formats[i], progress: 0, status: 'queued',
      error: null, unreadable: img.status === 'unreadable',
      file: img.file, animated: img.animated
    };
  });
  return { id: crypto.randomUUID(), status: 'running', items, stopReason: null,
    summary: TOOL_ORDER.filter((t) => enabled[t]).map((t) => `${workspaceTool && t === 'convert' && workspaceTool !== 'convert' ? 'Output' : TOOL_LABEL[t]}: ${toolSummary(t, settings)}`),
    settings: structuredClone(settings), enabled: { ...enabled }, startedDate: date };
}

export function countRunItems(run: RunState) {
  const counts = { queued: 0, active: 0, complete: 0, failed: 0, canceled: 0, total: run.items.length };
  run.items.forEach((item) => { counts[item.status]++; });
  return counts;
}

export function overallProgress(run: RunState): number {
  if (!run.items.length) return 0;
  const { complete, failed, canceled, total } = countRunItems(run);
  return (complete + failed + canceled) / total;
}
