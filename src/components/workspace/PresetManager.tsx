import React, { useState } from 'react';
import { BookmarkIcon, PencilIcon, Trash2Icon, TriangleAlertIcon } from 'lucide-react';
import { useBatch } from '../../contexts/BatchContext';
import { useToast } from '../../contexts/ToastContext';
import { TOOL_LABEL, TOOL_ORDER } from '../../utils/planning';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { describedBy } from '../ui/Field';

export function PresetManager() {
  const {
    presets,
    savePreset,
    renamePreset,
    deletePreset,
    applyPreset,
    appliedPresetId,
    appliedPresetMissing,
    dismissMissingPreset,
    presetModified,
    settings,
    enabled,
    workspaceTool
  } = useBatch();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const validate = (value: string, exceptId?: string): string | null => {
    const v = value.trim();
    if (!v) return 'Give the preset a name.';
    if (v.length > 40) return 'Keep names to 40 characters or fewer.';
    if (presets.some((p) => p.id !== exceptId && p.name.toLowerCase() === v.toLowerCase())) return 'A preset with this name already exists.';
    return null;
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(name);
    setError(err);
    if (err) return;
    savePreset(name, settings, enabled);
    toast({ tone: 'success', title: `Preset “${name.trim()}” saved`, description: 'Stored in this browser.' });
    setName('');
  };

  const onRename = (id: string) => {
    const err = validate(editName, id);
    setEditError(err);
    if (err) return;
    renamePreset(id, editName);
    setEditingId(null);
    toast({ tone: 'success', title: 'Preset renamed' });
  };

  const onApply = (id: string, presetName: string) => {
    if (applyPreset(id)) toast({ tone: 'success', title: `Applied “${presetName}”` });else
    toast({ tone: 'error', title: 'That preset no longer exists', description: 'It may have been deleted in another tab.' });
  };

  return (
    <section aria-labelledby="presets-title" className="border-t border-line pt-6">
      <div className="flex items-center gap-2">
        <BookmarkIcon className="h-4 w-4 text-ink" strokeWidth={1.75} aria-hidden="true" />
        <h3 id="presets-title" className="text-[14px] font-semibold text-ink">
          Saved presets
        </h3>
      </div>
      <p className="mt-1 text-[12.5px] leading-snug text-muted">{workspaceTool ? 'Save settings for this tool and its output. Presets apply only to this workspace’s options.' : 'Save all four tools’ settings together and reuse them later.'}</p>

      {appliedPresetMissing &&
      <div role="status" className="mt-3 flex gap-2.5 rounded-lg bg-warning-soft p-3 text-[12.5px] leading-snug text-[#5C4A2A]">
          <TriangleAlertIcon className="mt-px h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <div className="flex-1">
            The preset you applied was deleted. Your current settings haven’t changed.
            <button type="button" onClick={dismissMissingPreset} className="ml-1 font-medium text-ink underline underline-offset-2">
              Dismiss
            </button>
          </div>
        </div>
      }

      <form onSubmit={onSave} className="mt-3 flex items-start gap-2" noValidate>
        <div className="min-w-0 flex-1">
          <label htmlFor="preset-name" className="sr-only">
            Preset name
          </label>
          <Input
            id="preset-name"
            value={name}
            placeholder="Name, e.g. Shop listing"
            invalid={!!error}
            aria-describedby={describedBy('preset-name', undefined, error ?? undefined)}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }} />
          
          {error &&
          <p id="preset-name-error" className="mt-1.5 text-[12.5px] text-danger">
              {error}
            </p>
          }
        </div>
        <Button type="submit" variant="secondary">
          Save
        </Button>
      </form>

      {presets.length === 0 ?
      <p className="mt-3 rounded-lg border border-dashed border-line-strong px-3 py-3 text-center text-[12.5px] text-muted">
          No presets yet.
        </p> :

      <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
          {presets.map((p) => {
          const tools = TOOL_ORDER.filter((t) => p.enabled[t]).map((t) => TOOL_LABEL[t]);
          const applied = p.id === appliedPresetId;
          if (editingId === p.id) {
            return (
              <li key={p.id} className="p-3">
                  <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onRename(p.id);
                  }}
                  noValidate>
                  
                    <label htmlFor={`rename-${p.id}`} className="sr-only">
                      New name for {p.name}
                    </label>
                    <Input
                    id={`rename-${p.id}`}
                    value={editName}
                    autoFocus
                    invalid={!!editError}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && (e.stopPropagation(), setEditingId(null))} />
                  
                    {editError && <p className="mt-1.5 text-[12.5px] text-danger">{editError}</p>}
                    <div className="mt-2 flex justify-end gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="primary" type="submit">
                        Save name
                      </Button>
                    </div>
                  </form>
                </li>);

          }
          if (confirmId === p.id) {
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 bg-danger-soft/60 p-3">
                  <p className="text-[13px] text-ink">Delete “{p.name}”?</p>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                      Keep
                    </Button>
                    <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      deletePreset(p.id);
                      setConfirmId(null);
                      toast({ title: `Preset “${p.name}” deleted` });
                    }}>
                    
                      Delete
                    </Button>
                  </div>
                </li>);

          }
          return (
            <li key={p.id} className="flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[13px] font-medium text-ink">
                    <span className="truncate">{p.name}</span>
                    {applied &&
                  <span className="shrink-0 rounded bg-lime-soft px-1.5 py-0.5 text-[11px] font-medium text-lime-ink">
                        {presetModified ? 'Applied · edited' : 'Applied'}
                      </span>
                  }
                  </p>
                  <p className="truncate text-[12px] text-muted">{workspaceTool ? `Applies to ${TOOL_LABEL[workspaceTool]} options` : tools.length ? tools.join(', ') : 'No tools on'}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => onApply(p.id, p.name)}>
                  Apply
                </Button>
                <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Rename ${p.name}`}
                onClick={() => {
                  setEditingId(p.id);
                  setEditName(p.name);
                  setEditError(null);
                }}>
                
                  <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button size="icon-sm" variant="danger-ghost" aria-label={`Delete ${p.name}`} onClick={() => setConfirmId(p.id)}>
                  <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </li>);

        })}
        </ul>
      }
    </section>);

}
