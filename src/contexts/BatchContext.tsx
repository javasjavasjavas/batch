import { trackAction } from '../analytics/client';
import { useI18n } from '../i18n/LocaleContext';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from '../i18n/router';
import type { BatchSettings, EnabledTools, SettingsIssue, ToolId } from '../types/batch';
import type { RunState } from '../types/run';
import { DEFAULT_ENABLED, DEFAULT_SETTINGS } from '../data/defaultSettings';
import { useBatchImages } from '../hooks/useBatchImages';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePresets } from '../hooks/usePresets';
import { useRunEngine } from '../hooks/useRunEngine';
import { validateBatch } from '../utils/validation';
import { createRun, imagesForReview } from '../utils/runPlan';
import { toolFromPath, toolsForWorkspace, workspacePathFor } from '../utils/workspace';

type ImagesApi = ReturnType<typeof useBatchImages>;
type PresetsApi = ReturnType<typeof usePresets>;

const DEFAULT_TITLE = 'Untitled batch';

interface BatchContextValue extends Omit<ImagesApi, 'loadSample' | 'clearBatch'>, Omit<PresetsApi, 'setAppliedPresetId'> {
  title: string;
  setTitle: (title: string) => void;
  loadSample: (options?: {withUnreadable?: boolean;}) => void;
  clearBatch: () => void;
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  enabled: EnabledTools;
  setToolEnabled: (tool: ToolId, on: boolean) => void;
  workspaceTool: ToolId | null;
  workspacePath: string;
  settings: BatchSettings;
  updateSettings: <K extends ToolId>(tool: K, patch: Partial<BatchSettings[K]>) => void;
  resetSettings: () => void;
  applyPreset: (id: string) => boolean;
  dismissMissingPreset: () => void;
  presetModified: boolean;
  issues: SettingsIssue[];
  errorCount: number;
  reviewImages: ImagesApi['images'];
  reviewingSelected: boolean;
  beginReview: (onlySelected?: boolean) => void;
  run: RunState | null;
  startRun: () => boolean;
  pauseRun: () => void;
  resumeRun: () => void;
  cancelRun: () => void;
  retryFailed: () => void;
  restartRun: () => void;
  discardRun: () => void;
}

const BatchContext = createContext<BatchContextValue | null>(null);

export function BatchProvider({ children }: {children: React.ReactNode;}) {
  const { tr } = useI18n();
  const imagesApi = useBatchImages();
  const presetsApi = usePresets();
  const engine = useRunEngine();
  const { discard: discardEngine, start: startEngine } = engine;
  const [title, setTitle] = useState(() => tr(DEFAULT_TITLE));
  const [reviewIds, setReviewIds] = useState<string[] | null>(null);
  const { pathname } = useLocation();
  const workspaceTool = toolFromPath(pathname);
  const workspacePath = workspacePathFor(workspaceTool);
  const [batchActiveTool, setActiveTool] = useState<ToolId>('resize');
  const activeTool = workspaceTool || batchActiveTool;
  const [batchEnabled, setEnabled] = useLocalStorage<EnabledTools>('batch.enabled', DEFAULT_ENABLED);
  const batchSettings = useLocalStorage<BatchSettings>('batch.settings', DEFAULT_SETTINGS);
  const resizeSettings = useLocalStorage<BatchSettings>('batch.settings.resize', DEFAULT_SETTINGS);
  const compressSettings = useLocalStorage<BatchSettings>('batch.settings.compress', DEFAULT_SETTINGS);
  const convertSettings = useLocalStorage<BatchSettings>('batch.settings.convert', DEFAULT_SETTINGS);
  const renameSettings = useLocalStorage<BatchSettings>('batch.settings.rename', DEFAULT_SETTINGS);
  const [settings, setSettings] = workspaceTool
    ? { resize: resizeSettings, compress: compressSettings, convert: convertSettings, rename: renameSettings }[workspaceTool]
    : batchSettings;
  const enabled = useMemo(() => toolsForWorkspace(workspaceTool, batchEnabled), [workspaceTool, batchEnabled]);
  const runWorkspace = useRef(workspacePath);

  const { images } = imagesApi;
  const { setAppliedPresetId, presets, appliedPreset } = presetsApi;
  useEffect(() => { discardEngine(); setAppliedPresetId(null); setReviewIds(null); }, [workspacePath, discardEngine, setAppliedPresetId]);

  const loadSample = useCallback(
    (options?: {withUnreadable?: boolean;}) => {
      discardEngine();
      setReviewIds(null);
      imagesApi.loadSample(options);
      setTitle((t) => t === DEFAULT_TITLE || t === tr(DEFAULT_TITLE) ? tr('Spring product shoot') : t);
    },
    [imagesApi, discardEngine, tr]
  );

  const clearBatch = useCallback(() => {
    discardEngine();
    setReviewIds(null);
    imagesApi.clearBatch();
    setTitle(tr(DEFAULT_TITLE));
  }, [imagesApi, discardEngine]);

  const setToolEnabled = useCallback(
    (tool: ToolId, on: boolean) => {
      if (workspaceTool) return;
      discardEngine(); setEnabled((e) => ({ ...e, [tool]: on }));
    },
    [setEnabled, discardEngine, workspaceTool]
  );

  const updateSettings = useCallback(
    <K extends ToolId,>(tool: K, patch: Partial<BatchSettings[K]>) => {
      discardEngine();
      setSettings((s) => ({ ...s, [tool]: { ...s[tool], ...patch } }));
    },
    [setSettings, discardEngine]
  );

  const resetSettings = useCallback(() => {
    discardEngine();
    setSettings(DEFAULT_SETTINGS);
    setAppliedPresetId(null);
  }, [setSettings, setAppliedPresetId, discardEngine]);

  const applyPreset = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id);
      if (!preset) return false;
      discardEngine();
      setSettings({
        resize: { ...DEFAULT_SETTINGS.resize, ...preset.settings.resize },
        compress: { ...DEFAULT_SETTINGS.compress, ...preset.settings.compress },
        convert: { ...DEFAULT_SETTINGS.convert, ...preset.settings.convert },
        rename: { ...DEFAULT_SETTINGS.rename, ...preset.settings.rename }
      });
      if (!workspaceTool) setEnabled({ ...DEFAULT_ENABLED, ...preset.enabled });
      setAppliedPresetId(id);
      return true;
    },
    [presets, setSettings, setEnabled, setAppliedPresetId, discardEngine, workspaceTool]
  );

  const presetModified = useMemo(
    () =>
    appliedPreset !== null && (
    JSON.stringify(appliedPreset.settings) !== JSON.stringify(settings) ||
    JSON.stringify(appliedPreset.enabled) !== JSON.stringify(enabled)),
    [appliedPreset, settings, enabled]
  );

  const issues = useMemo(() => validateBatch(settings, enabled, images.length), [settings, enabled, images.length]);
  const errorCount = issues.filter((i) => i.level === 'error').length;
  const reviewImages = useMemo(() => imagesForReview(images, reviewIds), [images, reviewIds]);
  const beginReview = (onlySelected = false) => {
    discardEngine();
    setReviewIds(onlySelected ? [...imagesApi.selectedIds] : null);
  };

  const startRun = useCallback(() => {
    if (validateBatch(settings, enabled, reviewImages.length).some((issue) => issue.level === 'error')) return false;
    runWorkspace.current = workspacePath;
    startEngine(createRun(reviewImages, settings, enabled, workspaceTool));
    trackAction('batch_start');
    return true;
  }, [startEngine, reviewImages, settings, enabled, workspacePath, workspaceTool]);

  const value: BatchContextValue = {
    ...imagesApi,
    addFiles: (files) => { discardEngine(); return imagesApi.addFiles(files); },
    removeImages: (ids) => { discardEngine(); imagesApi.removeImages(ids); },
    moveImage: (id, direction) => { discardEngine(); imagesApi.moveImage(id, direction); },
    ...presetsApi,
    title,
    setTitle,
    loadSample,
    clearBatch,
    activeTool,
    setActiveTool,
    enabled,
    setToolEnabled,
    workspaceTool,
    workspacePath,
    settings,
    updateSettings,
    resetSettings,
    applyPreset,
    dismissMissingPreset: () => setAppliedPresetId(null),
    presetModified,
    issues,
    errorCount,
    reviewImages,
    reviewingSelected: reviewIds !== null,
    beginReview,
    run: runWorkspace.current === workspacePath ? engine.run : null,
    startRun,
    pauseRun: engine.pause,
    resumeRun: engine.resume,
    cancelRun: engine.cancel,
    retryFailed: engine.retry,
    restartRun: engine.restart,
    discardRun: engine.discard
  };

  return <BatchContext.Provider value={value}>{tr(children)}</BatchContext.Provider>;
}

export function useBatch(): BatchContextValue {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error('useBatch must be used within BatchProvider');
  return ctx;
}
