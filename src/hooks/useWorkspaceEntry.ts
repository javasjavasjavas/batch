import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ToolId } from '../types/batch';
import { useBatch } from '../contexts/BatchContext';
import { useToast } from '../contexts/ToastContext';
import { useFileIntake } from './useFileIntake';

/** Entry points from public pages into the workspace, optionally preselecting a tool. */
export function useWorkspaceEntry(tool?: ToolId) {
  const navigate = useNavigate();
  const { loadSample } = useBatch();
  const { toast } = useToast();

  const openWorkspace = useCallback(() => {
    navigate(tool ? `/app/${tool}` : '/app');
  }, [tool, navigate]);

  const intake = useFileIntake({ onAdded: openWorkspace });

  const openSample = useCallback(() => {
    loadSample();
    toast({ tone: 'success', title: 'Sample batch loading', description: 'Adding eight bundled product photos.' });
    openWorkspace();
  }, [loadSample, toast, openWorkspace]);

  return { ...intake, openSample, openWorkspace };
}
