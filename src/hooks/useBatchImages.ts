import { useCallback, useEffect, useRef, useState } from 'react';
import type { BatchImage, RejectedFile } from '../types/batch';
import { SAMPLE_IMAGES, UNREADABLE_SAMPLE } from '../data/sampleImages';
import { checkFile, makeId, readImageDimensions } from '../utils/files';
import { inspectFile, LIMITS, mimeFor } from '../processing/formats';
import { makeThumbnail } from '../processing/thumbnail';

export interface AddFilesResult {
  added: number;
  rejected: RejectedFile[];
}

export function useBatchImages() {
  const [images, setImages] = useState<BatchImage[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const urls = useRef(new Map<string, string>());
  const thumbnails = useRef(new Map<string, string>());

  useEffect(() => {
    const map = urls.current;
    const thumbnailMap = thumbnails.current;
    return () => {
      map.forEach((url) => URL.revokeObjectURL(url));
      map.clear();
      thumbnailMap.forEach(URL.revokeObjectURL);
      thumbnailMap.clear();
    };
  }, []);

  const revoke = useCallback((ids: string[]) => {
    ids.forEach((id) => {
      const url = urls.current.get(id);
      if (url) {
        URL.revokeObjectURL(url);
        urls.current.delete(id);
      }
      const thumbnail = thumbnails.current.get(id);
      if (thumbnail) { URL.revokeObjectURL(thumbnail); thumbnails.current.delete(id); }
    });
  }, []);

  const patchImage = useCallback((id: string, patch: Partial<BatchImage>) => {
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, ...patch } : img));
  }, []);

  const addFiles = useCallback(
    (files: File[]): AddFilesResult => {
      const accepted: BatchImage[] = [];
      const rejected: RejectedFile[] = [];
      let totalBytes = images.reduce((sum, image) => sum + (image.size || 0), 0);
      files.slice(0, Math.max(0, LIMITS.batchFiles - images.length)).forEach((file) => {
        const reason = checkFile(file);
        if (reason) {
          rejected.push({ name: file.name, reason });
          return;
        }
        if (totalBytes + file.size > LIMITS.batchBytes) {
          rejected.push({ name: file.name, reason: 'Batch exceeds the 300 MB source limit.' });
          return;
        }
        totalBytes += file.size;
        const id = makeId();
        const url = URL.createObjectURL(file);
        urls.current.set(id, url);
        accepted.push({
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          width: null,
          height: null,
          url,
          source: 'local',
          status: 'loading',
          lastModified: file.lastModified || null
          ,file
        });
      });
      if (accepted.length) {
        setImages((prev) => [...prev, ...accepted]);
        void (async () => {
          for (const img of accepted) {
            try {
              const { format, animated } = await inspectFile(img.file as File);
              const d = await readImageDimensions(img.url as string);
              if (d.width > LIMITS.dimension || d.height > LIMITS.dimension || d.width * d.height > LIMITS.pixels) throw new Error('Image exceeds the 10,000 px or 40 megapixel limit.');
              const thumbnailUrl = await makeThumbnail(img.file as File, d.width, d.height).catch(() => null);
              if (!urls.current.has(img.id)) { if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl); continue; }
              if (thumbnailUrl) thumbnails.current.set(img.id, thumbnailUrl);
              patchImage(img.id, { ...d, type: mimeFor(format), animated, thumbnailUrl, status: 'ready' });
            } catch (error) {
              patchImage(img.id, { status: 'unreadable', error: error instanceof Error ? error.message : 'Image could not be decoded.' });
            }
          }
        })();
      }
      if (files.length + images.length > LIMITS.batchFiles) rejected.push({ name: 'Additional files', reason: `A batch can contain up to ${LIMITS.batchFiles} images.` });
      return { added: accepted.length, rejected };
    },
    [patchImage, images]
  );

  const loadSample = useCallback((options?: {withUnreadable?: boolean;}) => {
    void Promise.allSettled(SAMPLE_IMAGES.map(async (sample) => {
      const response = await fetch(sample.url as string);
      if (!response.ok) throw new Error(`Sample ${sample.name} is unavailable.`);
      const blob = await response.blob();
      return new File([blob], sample.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    })).then((results) => {
      addFiles(results.filter((r): r is PromiseFulfilledResult<File> => r.status === 'fulfilled').map((r) => r.value));
      const failed = results.flatMap((r, i) => r.status === 'rejected' ? [{ ...SAMPLE_IMAGES[i], status: 'unreadable' as const, error: 'Bundled sample could not be loaded.', size: null, width: null, height: null, url: null }] : []);
      if (failed.length) setImages((prev) => [...prev, ...failed]);
      if (options?.withUnreadable) setImages((prev) => [...prev, UNREADABLE_SAMPLE]);
    });
  }, [addFiles]);

  const removeImages = useCallback(
    (ids: string[]) => {
      revoke(ids);
      const set = new Set(ids);
      setImages((prev) => prev.filter((i) => !set.has(i.id)));
      setSelectedIds((prev) => prev.filter((id) => !set.has(id)));
    },
    [revoke]
  );

  const clearBatch = useCallback(() => {
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current.clear();
    thumbnails.current.forEach(URL.revokeObjectURL);
    thumbnails.current.clear();
    setImages([]);
    setSelectedIds([]);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const selectAll = useCallback(() => setSelectedIds(images.map((i) => i.id)), [images]);
  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const moveImage = useCallback((id: string, direction: -1 | 1) => {
    setImages((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  return {
    images,
    selectedIds,
    addFiles,
    loadSample,
    removeImages,
    clearBatch,
    toggleSelect,
    selectAll,
    clearSelection,
    moveImage
  };
}
