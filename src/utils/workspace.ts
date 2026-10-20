import type { EnabledTools, ToolId } from '../types/batch';

export function toolFromPath(path: string): ToolId | null {
  return (path.match(/^\/app\/(resize|compress|convert|rename)(?:\/|$)/)?.[1] as ToolId) || null;
}

export function workspacePathFor(tool: ToolId | null): string {
  return tool ? `/app/${tool}` : '/app';
}

/** Output selection belongs to the standalone resize/compress workspace. */
export function toolsForWorkspace(tool: ToolId | null, batch: EnabledTools): EnabledTools {
  if (!tool) return batch;
  return {
    resize: tool === 'resize',
    compress: tool === 'compress',
    convert: tool !== 'rename',
    rename: tool === 'rename'
  };
}
