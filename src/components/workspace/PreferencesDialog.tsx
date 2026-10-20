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
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>);

}

export function PreferencesDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { prefs, updatePrefs, resetPrefs } = usePrefs();
  const { presets, clearPresets } = useBatch();
  const { toast } = useToast();
  const [confirmPresets, setConfirmPresets] = useState(false);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title="Preferences"
        description="Saved in this browser. Images are never stored."
        size="md"
        footer={
        <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        }>
        
        <div className="divide-y divide-line">
          <PrefRow label="Default view" description="How images appear when you open the workspace.">
            <Segmented<ViewMode>
              label="Default view"
              value={prefs.view}
              onChange={(view) => updatePrefs({ view })}
              options={[
              { value: 'grid', label: 'Grid', icon: <LayoutGridIcon className="h-4 w-4" aria-hidden="true" /> },
              { value: 'list', label: 'List', icon: <ListIcon className="h-4 w-4" aria-hidden="true" /> }]
              } />
            
          </PrefRow>
          <PrefRow label="Density" description="Compact fits more images on screen.">
            <Segmented<Density>
              label="Density"
              value={prefs.density}
              onChange={(density) => updatePrefs({ density })}
              options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact', label: 'Compact' }]
              } />
            
          </PrefRow>
          <PrefRow label="Motion" description="Reduce removes animations and transitions.">
            <Segmented<MotionPref>
              label="Motion"
              value={prefs.motion}
              onChange={(motion) => updatePrefs({ motion })}
              options={[
              { value: 'system', label: 'Match system' },
              { value: 'reduce', label: 'Reduce' }]
              } />
            
          </PrefRow>
          <div className="py-4">
            <p className="text-sm font-medium text-ink">Saved data</p>
            <p className="mt-0.5 text-[13px] leading-snug text-muted">Remove what Batch remembers on this device.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  resetPrefs();
                  toast({ title: 'Preferences reset' });
                }}>
                
                Reset preferences
              </Button>
              <Button variant="danger-ghost" size="sm" disabled={!presets.length} onClick={() => setConfirmPresets(true)}>
                Delete saved presets{presets.length ? ` (${presets.length})` : ''}
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
        title="Delete all saved presets?"
        description={`${pluralize(presets.length, 'preset')} will be removed from this browser. Your current settings stay as they are.`}
        confirmLabel="Delete presets"
        tone="danger" />
      
    </>);

}