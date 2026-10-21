import { useI18n } from '../../i18n/LocaleContext';
import React, { useState } from 'react';
import { useNavigate } from '../../i18n/router';
import { ArrowRightIcon, RotateCcwIcon } from 'lucide-react';
import type { ToolId } from '../../types/batch';
import { useBatch } from '../../contexts/BatchContext';
import { useToast } from '../../contexts/ToastContext';
import { TOOL_LABEL, TOOL_ORDER } from '../../utils/planning';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ToolTabs } from './ToolTabs';
import { ResizeControls } from './ResizeControls';
import { CompressControls } from './CompressControls';
import { ConvertControls } from './ConvertControls';
import { RenameControls } from './RenameControls';
import { PresetManager } from './PresetManager';
import { IssueList } from './IssueList';

const DESCRIPTIONS: Record<ToolId, string> = {
  resize: 'Change the pixel dimensions of every image.',
  compress: 'Reduce file size with one quality level.',
  convert: 'Choose one output format for the batch.',
  rename: 'Give every file a consistent name.'
};

const CONTROLS: Record<ToolId, React.ComponentType> = {
  resize: ResizeControls,
  compress: CompressControls,
  convert: ConvertControls,
  rename: RenameControls
};

export function SettingsPanel({ onReview }: {onReview?: () => void;}) {
  const { tr } = useI18n();
  const { workspacePath, workspaceTool, activeTool, enabled, setToolEnabled, images, selectedIds, beginReview, issues, resetSettings } = useBatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const Controls = CONTROLS[activeTool];
  const toolWarnings = issues.filter((i) => i.tool === activeTool && !i.field);
  const onTools = TOOL_ORDER.filter((t) => enabled[t]);
  const isOn = enabled[activeTool];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!workspaceTool && <ToolTabs />}
      <div
        id="tool-panel"
        role={workspaceTool ? 'region' : 'tabpanel'}
        aria-label={tr(workspaceTool ? `${TOOL_LABEL[workspaceTool]} settings` : undefined)}
        aria-labelledby={workspaceTool ? undefined : `tool-tab-${activeTool}`}
        className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5">
        
        <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{tr(TOOL_LABEL[activeTool])}</h2>
        <p className="mt-0.5 text-[13px] text-muted">{tr(DESCRIPTIONS[activeTool])}</p>

        {!workspaceTool && <div className="mt-4 rounded-xl border border-line bg-canvas p-3">
          <Toggle
            label={tr("Include in this batch")}
            description={tr(isOn ? 'These settings will be applied.' : 'Off. Settings are kept but not applied.')}
            checked={isOn}
            onChange={(on) => setToolEnabled(activeTool, on)} />
          
        </div>}

        <fieldset disabled={!isOn} className={`mt-5 min-w-0 ${!isOn ? 'opacity-50' : ''}`}>
          <Controls />
        </fieldset>

        {(workspaceTool === 'resize' || workspaceTool === 'compress') && <div className="mt-6 border-t border-line pt-5">
          <ConvertControls />
        </div>}

        <IssueList issues={toolWarnings} className="mt-5" />

        <div className="mt-8">
          <PresetManager />
        </div>
      </div>

      <div className="shrink-0 space-y-3 border-t border-line bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="text-[12.5px] text-muted">
          {workspaceTool ? <>{tr("Applying ")}<span className="font-medium text-ink">{tr(TOOL_LABEL[workspaceTool])}</span></> : onTools.length ?
          <>{tr("Applying ")}<span className="font-medium text-ink">{onTools.map((t) => tr(TOOL_LABEL[t])).join(' → ')}</span>
            </> :

          <span className="text-danger">{tr("No tools are on. Turn one on to plan the batch.")}</span>
          }
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(true)} aria-label={tr("Reset settings")}>
            <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />{tr("Reset")}</Button>
          <Button
            variant="accent"
            className="flex-1"
            disabled={images.length === 0}
            onClick={() => {
              beginReview();
              onReview?.();
              navigate(`${workspacePath}/review`);
            }}>{tr("Review batch")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {selectedIds.length > 0 && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              beginReview(true);
              onReview?.();
              navigate(`${workspacePath}/review`);
            }}>{tr("Review selected (")}{tr(selectedIds.length)}{tr(")")}<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
        {images.length === 0 && <p className="text-center text-[12px] text-muted">{tr("Add images to review the batch.")}</p>}
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetSettings();
          toast({ title: 'Settings reset to defaults' });
        }}
        title={tr("Reset all settings?")}
        description={tr(workspaceTool ? 'This workspace goes back to its default values. Saved presets aren’t affected.' : 'All four tools go back to their default values. Saved presets aren’t affected.')}
        confirmLabel={tr("Reset settings")} />
      
    </div>);

}
