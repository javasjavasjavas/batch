import { useCallback, useState } from 'react';
import type { BatchSettings, EnabledTools, Preset } from '../types/batch';
import { makeId } from '../utils/files';
import { useLocalStorage } from './useLocalStorage';

export function usePresets() {
  const [presets, setPresets] = useLocalStorage<Preset[]>('batch.presets', []);
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);

  const savePreset = useCallback(
    (name: string, settings: BatchSettings, enabled: EnabledTools): Preset => {
      const preset: Preset = {
        id: makeId('preset'),
        name: name.trim(),
        settings: JSON.parse(JSON.stringify(settings)) as BatchSettings,
        enabled: { ...enabled },
        createdAt: Date.now()
      };
      setPresets((prev) => [...prev, preset]);
      setAppliedPresetId(preset.id);
      return preset;
    },
    [setPresets]
  );

  const renamePreset = useCallback(
    (id: string, name: string) => {
      setPresets((prev) => prev.map((p) => p.id === id ? { ...p, name: name.trim() } : p));
    },
    [setPresets]
  );

  const deletePreset = useCallback(
    (id: string) => {
      setPresets((prev) => prev.filter((p) => p.id !== id));
    },
    [setPresets]
  );

  const clearPresets = useCallback(() => {
    setPresets([]);
  }, [setPresets]);

  const appliedPreset = presets.find((p) => p.id === appliedPresetId) ?? null;

  return {
    presets,
    savePreset,
    renamePreset,
    deletePreset,
    clearPresets,
    appliedPresetId,
    setAppliedPresetId,
    appliedPreset,
    appliedPresetMissing: appliedPresetId !== null && appliedPreset === null
  };
}