export type ToolId = 'resize' | 'compress' | 'convert' | 'rename';
export type ImageSource = 'local' | 'sample';
export type ImageStatus = 'loading' | 'ready' | 'unreadable';

export interface BatchImage {
  id: string;
  name: string;
  size: number | null;
  type: string;
  width: number | null;
  height: number | null;
  url: string | null;
  thumbnailUrl?: string | null;
  source: ImageSource;
  status: ImageStatus;
  lastModified: number | null;
  file?: File;
  animated?: boolean;
  error?: string;
}

export interface RejectedFile {
  name: string;
  reason: string;
}

export type ResizeUnit = 'px' | 'percent';
export type FitMode = 'cover' | 'pad';
export type OutputFormat = 'jpg' | 'png' | 'webp';
export type PngLevel = 'fast' | 'balanced' | 'smallest';
export type BackgroundMode = 'original' | 'extend' | 'transparent' | 'color';

export interface ResizeSettings {
  unit: ResizeUnit;
  width: string;
  height: string;
  percent: string;
  lockAspect: boolean;
  fit: FitMode;
  padColor: string;
  allowUpscale: boolean;
  backgroundMode: BackgroundMode;
}

export interface CompressSettings {
  quality: number;
  stripMetadata: boolean;
}

export interface ConvertSettings {
  format: OutputFormat;
  background: string;
  progressive: boolean;
  pngLevel: PngLevel;
  webpLossless: boolean;
}

export interface RenameSettings {
  pattern: string;
  prefix: string;
  suffix: string;
  start: string;
  padding: number;
  lowercase: boolean;
  hyphenate: boolean;
}

export interface BatchSettings {
  resize: ResizeSettings;
  compress: CompressSettings;
  convert: ConvertSettings;
  rename: RenameSettings;
}

export type EnabledTools = Record<ToolId, boolean>;

export interface SettingsIssue {
  id: string;
  tool: ToolId | 'batch';
  field?: string;
  level: 'error' | 'warning';
  message: string;
}

export interface Preset {
  id: string;
  name: string;
  settings: BatchSettings;
  enabled: EnabledTools;
  createdAt: number;
}
