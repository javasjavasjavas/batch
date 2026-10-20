import { describe, expect, it } from 'vitest';
import { toolFromPath, toolsForWorkspace, workspacePathFor } from '../src/utils/workspace';
import { DEFAULT_ENABLED } from '../src/data/defaultSettings';

describe('standalone workspace isolation', () => {
  it('keeps the tool identity throughout review, processing and results', () => {
    for (const tool of ['resize', 'compress', 'convert', 'rename'] as const) {
      for (const step of ['', '/review', '/run', '/results']) {
        expect(toolFromPath(`/app/${tool}${step}`)).toBe(tool);
        expect(workspacePathFor(toolFromPath(`/app/${tool}${step}`))).toBe(`/app/${tool}`);
      }
    }
    expect(toolFromPath('/app/review')).toBeNull();
  });

  it('ignores other enabled batch operations while allowing output selection', () => {
    const allOn = { resize: true, compress: true, convert: true, rename: true };
    expect(toolsForWorkspace('compress', allOn)).toEqual({ resize: false, compress: true, convert: true, rename: false });
    expect(toolsForWorkspace('resize', allOn)).toEqual({ resize: true, compress: false, convert: true, rename: false });
    expect(toolsForWorkspace('rename', allOn)).toEqual({ resize: false, compress: false, convert: false, rename: true });
    expect(toolsForWorkspace('convert', allOn)).toEqual({ resize: false, compress: false, convert: true, rename: false });
    expect(toolsForWorkspace(null, DEFAULT_ENABLED)).toEqual(DEFAULT_ENABLED);
  });
});
