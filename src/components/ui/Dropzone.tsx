import { useRef } from 'react';
import { ArrowDownToLineIcon, FolderOpenIcon, ImagesIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { RejectedFile } from '../../types/batch';
import { useFileDrop } from '../../hooks/useFileDrop';
import { ACCEPT_ATTR, SUPPORTED_FORMATS_LABEL } from '../../utils/files';
import { Button } from './Button';

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  onSample?: () => void;
  title?: string;
  size?: 'hero' | 'large' | 'compact';
  rejected?: RejectedFile[];
  onDismissRejected?: () => void;
  className?: string;
}

export function Dropzone({
  onFiles,
  onSample,
  title = 'Drop images here',
  size = 'hero',
  rejected = [],
  onDismissRejected,
  className
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDragging, bind } = useFileDrop(onFiles);

  return (
    <div className={className}>
      <div
        {...bind}
        className={twMerge(
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-[background-color,border-color] duration-150 ease-out',
          size === 'compact' ? 'px-4 py-5' : size === 'hero' ? 'px-6 py-9 sm:px-10 sm:py-11' : 'px-6 py-12 sm:py-16',
          isDragging ? 'border-[#A9C82B] bg-lime-soft' : 'border-line-strong bg-white'
        )}>
        
        <div
          className={twMerge(
            'mb-3 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-150',
            isDragging ? 'border-[#A9C82B] bg-lime text-ink' : 'border-line bg-canvas text-ink',
            size === 'compact' && 'hidden'
          )}
          aria-hidden="true">
          
          {isDragging ? <ArrowDownToLineIcon className="h-5 w-5" /> : <FolderOpenIcon className="h-5 w-5" strokeWidth={1.75} />}
        </div>
        <p className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
          {isDragging ? 'Release to add your images' : title}
        </p>
        <p className="mt-1 text-sm text-muted">{isDragging ? 'They’ll stay on this device.' : 'or pick them from your device'}</p>
        <div className="mt-5 flex w-full flex-col items-stretch justify-center gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button variant="primary" size="lg" onClick={() => inputRef.current?.click()}>
            <FolderOpenIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            Choose images
          </Button>
          {onSample &&
          <Button variant="secondary" size="lg" onClick={onSample}>
              <ImagesIcon className="h-[18px] w-[18px]" aria-hidden="true" />
              Try a sample batch
            </Button>
          }
        </div>
        <p className="mt-4 text-[12.5px] text-muted">{SUPPORTED_FORMATS_LABEL} · No sign-up · Files stay on your device</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onFiles(files);
            e.target.value = '';
          }} />
        
      </div>
      {rejected.length > 0 &&
      <div role="alert" className="mt-3 rounded-xl border border-warning/25 bg-warning-soft p-3.5 text-left">
          <div className="flex items-start gap-2.5">
            <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <div className="min-w-0 flex-1 text-[13px]">
              <p className="font-medium text-ink">
                {rejected.length === 1 ? 'One file was skipped' : `${rejected.length} files were skipped`}
              </p>
              <ul className="mt-1 space-y-0.5 text-[#5C4A2A]">
                {rejected.slice(0, 3).map((r) =>
              <li key={r.name} className="break-words">
                    <span className="font-medium">{r.name}</span> — {r.reason}
                  </li>
              )}
                {rejected.length > 3 && <li>and {rejected.length - 3} more.</li>}
              </ul>
            </div>
            {onDismissRejected &&
          <button
            type="button"
            onClick={onDismissRejected}
            aria-label="Dismiss skipped files"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#5C4A2A] transition-colors duration-150 hover:bg-warning/10">
            
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
          }
          </div>
        </div>
      }
    </div>);

}
