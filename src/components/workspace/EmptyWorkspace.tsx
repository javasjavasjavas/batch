import type { RejectedFile } from '../../types/batch';
import { useBatch } from '../../contexts/BatchContext';
import { useToast } from '../../contexts/ToastContext';
import { Dropzone } from '../ui/Dropzone';
import { TOOL_LABEL } from '../../utils/planning';

interface EmptyWorkspaceProps {
  onFiles: (files: File[]) => void;
  rejected: RejectedFile[];
  onDismissRejected: () => void;
}

const NEXT = [
{ title: 'Check your images', body: 'See each file’s size and dimensions as it’s read.' },
{ title: 'Choose tools', body: 'Turn on Resize, Compress, Convert, or Rename in the settings panel.' },
{ title: 'Review the plan', body: 'Confirm planned names and sizes before running.' }];


export function EmptyWorkspace({ onFiles, rejected, onDismissRejected }: EmptyWorkspaceProps) {
  const { loadSample, workspaceTool } = useBatch();
  const steps = NEXT.map((step, i) => workspaceTool && i === 1
    ? { title: `${TOOL_LABEL[workspaceTool]} settings`, body: workspaceTool === 'rename' ? 'Choose the filename pattern. Original file contents stay unchanged.' : 'Set up this tool and choose your output options.' }
    : step);
  const { toast } = useToast();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">{workspaceTool ? `${TOOL_LABEL[workspaceTool]} images` : 'Start a batch'}</h1>
      <p className="mt-1.5 text-[15px] text-muted">Add the images you want to prepare. They stay on this device.</p>
      <Dropzone
        className="mt-6"
        size="large"
        onFiles={onFiles}
        rejected={rejected}
        onDismissRejected={onDismissRejected}
        onSample={() => {
          loadSample();
          toast({ tone: 'success', title: 'Sample batch loading', description: 'Adding eight bundled product photos.' });
        }} />
      
      <div className="mt-10">
        <h2 className="text-[13px] font-semibold text-ink">What happens next</h2>
        <ol className="mt-3 grid gap-5 sm:grid-cols-3">
          {steps.map((s, i) =>
          <li key={s.title} className="flex gap-3 sm:flex-col sm:gap-2">
              <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-white text-[12px] font-semibold text-ink">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{s.title}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{s.body}</p>
              </div>
            </li>
          )}
        </ol>
      </div>
    </div>);

}
