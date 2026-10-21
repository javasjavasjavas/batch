import { useI18n } from '../../i18n/LocaleContext';
import React, { useState } from 'react';
import { LayoutGridIcon, ListIcon } from 'lucide-react';
import type { Density, MotionPref, ViewMode } from '../../types/prefs';
import { usePrefs } from '../../contexts/PrefsContext';
import { useBatch } from '../../contexts/BatchContext';
import { useToast } from '../../contexts/ToastContext';
import { pluralize } from '../../utils/format';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { ConfirmDialog } from '../ui/ConfirmDialog';

function PrefRow({ label, description, children }: {label: string;description: string;children: React.ReactNode;}) {
  const { tr } = useI18n();
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{tr(label)}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted">{tr(description)}</p>
      </div>
      <div className="shrink-0">{tr(children)}</div>
    </div>);

}

export function PreferencesDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { tr } = useI18n();
  const { prefs, updatePrefs, resetPrefs } = usePrefs();
  const { presets, clearPresets } = useBatch();
  const { toast } = useToast();
  const [confirmPresets, setConfirmPresets] = useState(false);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={tr("Preferences")}
        description={tr("Saved in this browser. Images are never stored.")}
        size="md"
        footer={
        <Button variant="primary" onClick={onClose}>{tr("Done")}</Button>
        }>
        
        <div className="divide-y divide-line">
          <PrefRow label={tr("Default view")} description={tr("How images appear when you open the workspace.")}>
            <Segmented<ViewMode>
              label={tr("Default view")}
              value={prefs.view}
              onChange={(view) => updatePrefs({ view })}
              options={[
              { value: 'grid', label: 'Grid', icon: <LayoutGridIcon className="h-4 w-4" aria-hidden="true" /> },
              { value: 'list', label: 'List', icon: <ListIcon className="h-4 w-4" aria-hidden="true" /> }]
              } />
            
          </PrefRow>
          <PrefRow label={tr("Density")} description={tr("Compact fits more images on screen.")}>
            <Segmented<Density>
              label={tr("Density")}
              value={prefs.density}
              onChange={(density) => updatePrefs({ density })}
              options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' }]
              } />
            
          </PrefRow>
          <PrefRow label={tr("Motion")} description={tr("Reduce removes animations and transitions.")}>
            <Segmented<MotionPref>
              label={tr("Motion")}
              value={prefs.motion}
              onChange={(motion) => updatePrefs({ motion })}
              options={[
              { value: 'system', label: 'Match system' },
              { value: 'reduce', label: 'Reduce' }]
              } />
            
          </PrefRow>
          <div className="py-4">
            <p className="text-sm font-medium text-ink">{tr("Saved data")}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-muted">{tr("Remove what Batch remembers on this device.")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetPrefs();
                  toast({ title: 'Preferences reset' });
                }}>{tr("Reset preferences")}</Button>
              <Button variant="danger-ghost" size="sm" disabled={!presets.length} onClick={() => setConfirmPresets(true)}>{tr("Delete saved presets")}{tr(presets.length ? ` (${presets.length})` : '')}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
      <ConfirmDialog
        open={confirmPresets}
        onClose={() => setConfirmPresets(false)}
        onConfirm={() => {
          clearPresets();
          toast({ title: 'Saved presets deleted' });
        }}
        title={tr("Delete all saved presets?")}
        description={tr(`${pluralize(presets.length, 'preset')} will be removed from this browser. Your current settings stay as they are.`)}
        confirmLabel={tr("Delete presets")}
        tone="danger" />
      
    </>);

}