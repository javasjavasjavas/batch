import { useCallback, useRef, useState } from 'react';
import type { RejectedFile } from '../types/batch';
import { useBatch } from '../contexts/BatchContext';
import { useToast } from '../contexts/ToastContext';
import { SUPPORTED_FORMATS_LABEL } from '../utils/files';
import { pluralize } from '../utils/format';

/** Adds files to the batch, reports rejections, and optionally runs a callback after success. */
export function useFileIntake(options?: {onAdded?: () => void;}) {
  const { addFiles } = useBatch();
  const { toast } = useToast();
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const onAddedRef = useRef(options?.onAdded);
  onAddedRef.current = options?.onAdded;

  const handleFiles = useCallback(
    (files: File[]) => {
      const result = addFiles(files);
      setRejected(result.rejected);
      if (result.added > 0) {
        toast({
          tone: 'success',
          title: `${pluralize(result.added, 'image')} added`,
          description: result.rejected.length ?
          `${pluralize(result.rejected.length, 'file')} skipped because the format isn’t supported.` :
          undefined
        });
        onAddedRef.current?.();
      } else if (result.rejected.length) {
        toast({ tone: 'error', title: 'No supported images found', description: `Batch accepts ${SUPPORTED_FORMATS_LABEL}.` });
      }
    },
    [addFiles, toast]
  );

  return { handleFiles, rejected, clearRejected: () => setRejected([]) };
}