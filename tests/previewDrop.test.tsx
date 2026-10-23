import { describe, expect, it, vi } from 'vitest';
import { PreviewDropZone } from '../src/components/ui/PreviewDropZone';

// Exercise the actual input handlers without a browser file-dialog dependency.
vi.mock('react', async importOriginal => ({ ...await importOriginal<typeof import('react')>(), useRef: (value: unknown) => ({ current: value }), useState: (value: unknown) => [value, vi.fn()] }));
vi.mock('../src/i18n/LocaleContext', () => ({ useI18n: () => ({ locale: 'en' }) }));
function setup(single = false, disabled = false) {
  const onFiles = vi.fn(), onChoose = vi.fn();
  const node = PreviewDropZone({ children: null, onFiles, onChoose, single, disabled, busy: disabled, hasImage: false });
  return { handlers: node.props, onFiles, onChoose };
}
function drop(files: File[]) { return { preventDefault: vi.fn(), stopPropagation: vi.fn(), dataTransfer: { files } }; }
const a = { name: 'a.png' } as File, b = { name: 'b.jpg' } as File;
describe('Preview file drop', () => {
  it('passes all batch files to the existing validated loader and prevents navigation', () => {
    const { handlers, onFiles } = setup(); const event = drop([a, b]); handlers.onDrop(event);
    expect(onFiles).toHaveBeenCalledWith([a, b]); expect(event.preventDefault).toHaveBeenCalled(); expect(event.stopPropagation).toHaveBeenCalled();
  });
  it('uses one file for a logo or favicon', () => {
    const { handlers, onFiles } = setup(true); handlers.onDrop(drop([a, b])); expect(onFiles).toHaveBeenCalledWith([a]);
  });
  it('blocks drops while processing without navigating away', () => {
    const { handlers, onFiles } = setup(false, true); const event = drop([a]); handlers.onDrop(event);
    expect(onFiles).not.toHaveBeenCalled(); expect(event.preventDefault).toHaveBeenCalled();
  });
  it('ignores non-file drops', () => {
    const { handlers, onFiles } = setup(); handlers.onDrop(drop([])); expect(onFiles).not.toHaveBeenCalled();
  });
  it('opens the file chooser with keyboard and prevents space scrolling', () => {
    const { handlers, onChoose } = setup(); const event = { key: ' ', preventDefault: vi.fn() }; handlers.onKeyDown(event);
    expect(onChoose).toHaveBeenCalledOnce(); expect(event.preventDefault).toHaveBeenCalled();
    const blocked = setup(false, true); blocked.handlers.onKeyDown(event); expect(blocked.onChoose).not.toHaveBeenCalled();
  });
});
