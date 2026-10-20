import type { BatchSettings, EnabledTools, ImageSource } from './batch';

export type RunStatus = 'running' | 'paused' | 'complete' | 'failed' | 'canceled';
export type RunItemStatus = 'queued' | 'active' | 'complete' | 'failed' | 'canceled';

export interface RunItem {
  id: string;
  imageId: string;
  name: string;
  outputName: string;
  source: ImageSource;
  url: string | null;
  type: string;
  originalSize: number | null;
  width: number | null;
  height: number | null;
  plannedWidth: number | null;
  plannedHeight: number | null;
  outputFormat: string;
  progress: number;
  status: RunItemStatus;
  error: string | null;
  unreadable: boolean;
  file?: File;
  output?: Blob;
  outputUrl?: string;
  outputSize?: number;
  animated?: boolean;
  processingMessage?: string;
}

export interface RunState {
  id: string;
  status: RunStatus;
  items: RunItem[];
  stopReason: string | null;
  summary: string[];
  settings: BatchSettings;
  enabled: EnabledTools;
  startedDate: string;
}
